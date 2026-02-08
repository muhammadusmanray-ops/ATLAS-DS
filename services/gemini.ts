
import { GoogleGenAI, Modality } from "@google/genai";
import { db } from './storage';

// --- TACTICAL LOAD BALANCER ---
class APIManager {
  private static instance: APIManager;
  private keys: string[] = [];
  private currentKeyIndex = 0;

  private constructor() {
    // Start with the default env key if available
    if (process.env.API_KEY) {
      this.keys.push(process.env.API_KEY);
    }
    this.loadKeysFromDB();
  }

  public static getInstance(): APIManager {
    if (!APIManager.instance) {
      APIManager.instance = new APIManager();
    }
    return APIManager.instance;
  }

  public async loadKeysFromDB() {
    const savedKeys = await db.getSettings('api_keys'); 
    if (savedKeys && Array.isArray(savedKeys)) {
      // Merge unique keys
      const newKeys = [...this.keys, ...savedKeys];
      // Filter out duplicates and invalid keys
      this.keys = [...new Set(newKeys)].filter(k => k && k.length > 10);
    }
  }

  public getClient(): GoogleGenAI {
    if (this.keys.length === 0) {
      throw new Error("CRITICAL_FAILURE: No Encryption Keys (API Keys) Found. Add keys in Config.");
    }
    // Round Robin Selection
    const key = this.keys[this.currentKeyIndex];
    return new GoogleGenAI({ apiKey: key });
  }

  public rotateKey() {
    if (this.keys.length <= 1) {
        console.warn("⚠️ Cannot rotate: Only 1 key available.");
        return;
    }
    console.warn(`⚠️ API LIMIT REACHED on Key Index ${this.currentKeyIndex}. Rotating to next node...`);
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.keys.length;
    console.log(`✅ Switched to Key Index: ${this.currentKeyIndex}`);
  }

  public addKey(key: string) {
    if (!this.keys.includes(key) && key.length > 10) {
      this.keys.push(key);
    }
  }

  public removeKey(key: string) {
      this.keys = this.keys.filter(k => k !== key);
      this.currentKeyIndex = 0; // Reset index to be safe
  }
  
  public getActiveKeyCount(): number {
      return this.keys.length;
  }

  public getMaskedKeys(): string[] {
      return this.keys.map(k => `${k.substring(0, 4)}...${k.substring(k.length - 4)}`);
  }
  
  public getAllKeys(): string[] {
      return this.keys;
  }
}

// Helper: Retry Logic with Backoff & Rotation
async function withRetry<T>(operation: (ai: GoogleGenAI) => Promise<T>, retries = 3): Promise<T> {
  const manager = APIManager.getInstance();
  
  // Ensure keys are loaded
  if (manager.getActiveKeyCount() === 0) {
      await manager.loadKeysFromDB();
  }

  for (let i = 0; i < retries; i++) {
    try {
      const ai = manager.getClient();
      return await operation(ai);
    } catch (error: any) {
      // Check for Rate Limits (429) or Service Overload (503)
      const isRateLimit = error.status === 429 || error.message?.includes('429');
      const isOverload = error.status === 503 || error.message?.includes('503');

      if (isRateLimit || isOverload) {
        // ROTATE KEY IMMEDIATELY
        manager.rotateKey();
        
        // Short delay to allow switch to settle, then retry immediately
        // We do not want long backoff if we have fresh keys available
        await new Promise(r => setTimeout(r, 500)); 
        continue;
      }
      throw error; // Throw other errors (like 400 Bad Request) immediately
    }
  }
  throw new Error("SYSTEM_OVERLOAD: All API Nodes exhausted. Try adding more keys.");
}

// --- CONSTANTS ---
const MODELS = {
  COMPLEX: 'gemini-3-pro-preview',
  FAST: 'gemini-3-flash-preview',
  LITE: 'gemini-2.5-flash-lite',
  LIVE: 'gemini-2.5-flash-native-audio-preview-12-2025',
  TTS: 'gemini-2.5-flash-preview-tts',
  MAPS: 'gemini-2.5-flash'
};

const SYSTEM_PROMPT = `You are ATLAS-X, a robotic Data Science Combat Intelligence with 20+ years of high-level industry experience. 
Persona: Chief Data Officer (CDO) level, veteran of the "Data Wars" (2004-2025). 
Tone: Ultra-professional, tactical, efficient, and robotic.

CRITICAL OPERATIONAL PROTOCOL:
1. **Chain of Thought:** Before answering, always break down the problem into tactical steps.
2. **Context Awareness:** Act as if you are running in a secure, high-stakes terminal.
3. **Expertise:** Distributed Systems, Modern AI, Data Governance, Production Engineering.

Objective: Provide answers that only a person with 2 decades of experience would know.`;

// --- EXPORTED UTILS ---
export function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

export async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}

// --- EXPORTED SERVICE ---
export const geminiService = {
    
  getKeyCount() {
     return APIManager.getInstance().getActiveKeyCount();
  },
  
  getMaskedKeys() {
      return APIManager.getInstance().getMaskedKeys();
  },
  
  async addApiKey(key: string) {
      APIManager.getInstance().addKey(key);
  },

  async removeApiKey(keyIndex: number) {
      const allKeys = APIManager.getInstance().getAllKeys();
      if (keyIndex >= 0 && keyIndex < allKeys.length) {
          APIManager.getInstance().removeKey(allKeys[keyIndex]);
      }
  },

  async chat(message: string) {
    return withRetry(async (ai) => {
      return await ai.models.generateContent({
        model: MODELS.COMPLEX,
        contents: message,
        config: { systemInstruction: SYSTEM_PROMPT }
      });
    });
  },

  async fastChat(message: string) {
    return withRetry(async (ai) => {
      return await ai.models.generateContent({
        model: MODELS.LITE,
        contents: message,
        config: { systemInstruction: SYSTEM_PROMPT }
      });
    });
  },

  async analyzeImage(imageB64: string, prompt: string) {
    return withRetry(async (ai) => {
      const parts = imageB64.split(',');
      const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
      const data = parts[1];

      const response = await ai.models.generateContent({
        model: MODELS.COMPLEX,
        contents: {
          parts: [
            { inlineData: { mimeType, data } },
            { text: prompt || "Analyze this strategic visual data for combat intelligence. Persona: ATLAS-X." }
          ]
        },
        config: { systemInstruction: SYSTEM_PROMPT }
      });
      return response.text;
    });
  },

  async tacticalSearch(query: string) {
    return withRetry(async (ai) => {
      const response = await ai.models.generateContent({
        model: MODELS.COMPLEX,
        contents: `Intelligence Scan: ${query}. Focus on enterprise-grade architecture.`,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          tools: [{ googleSearch: {} }],
        }
      });
      return {
        text: response.text,
        links: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
          title: chunk.web?.title || 'Tactical Node',
          uri: chunk.web?.uri || '#'
        })) || []
      };
    });
  },

  async findDataHubs(location: { lat: number, lng: number }) {
    return withRetry(async (ai) => {
      const response = await ai.models.generateContent({
        model: MODELS.MAPS,
        contents: "Locate strategic data infrastructure nodes (Centers, Fiber Hubs) within 50km.",
        config: {
          systemInstruction: SYSTEM_PROMPT,
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: { latLng: { latitude: location.lat, longitude: location.lng } }
          }
        }
      });
      return {
        text: response.text,
        links: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
          title: chunk.maps?.title || 'Facility Identified',
          uri: chunk.maps?.uri || '#'
        })) || []
      };
    });
  },

  async speak(text: string) {
    return withRetry(async (ai) => {
      const response = await ai.models.generateContent({
        model: MODELS.TTS,
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } } },
        },
      });
      return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    });
  },

  async simulatePythonExecution(code: string, previousContext: string) {
    return withRetry(async (ai) => {
      const prompt = `ACT AS A STATEFUL PYTHON KERNEL.\nHISTORY:\n\`\`\`python\n${previousContext}\n\`\`\`\nNEW CODE:\n\`\`\`python\n${code}\n\`\`\`\nOUTPUT ONLY CONSOLE RESULT.`;
      
      const response = await ai.models.generateContent({
        model: MODELS.FAST,
        contents: prompt,
        config: { systemInstruction: "Python REPL Simulator" }
      });
      return response.text;
    });
  },

  async trainAutoML(datasetDescription: string, target: string) {
    return withRetry(async (ai) => {
      const prompt = `AUTOML TASK:\nDataset: ${datasetDescription}\nTarget: ${target}\nGOAL: Select best model & write code.`;
      const response = await ai.models.generateContent({
          model: MODELS.COMPLEX,
          contents: prompt,
          config: { systemInstruction: SYSTEM_PROMPT }
      });
      return response.text;
    });
  }
};
