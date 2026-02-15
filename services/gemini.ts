
import { db } from './storage';
import { llmAdapter } from './llm';

// --- TACTICAL LOAD BALANCER RE-ROUTED TO GROQ ---
class APIManager {
  private static instance: APIManager;
  private constructor() { }

  public static getInstance(): APIManager {
    if (!APIManager.instance) {
      APIManager.instance = new APIManager();
    }
    return APIManager.instance;
  }

  public async chat(message: string, systemPrompt: string) {
    return await llmAdapter.chat(message, systemPrompt);
  }
}

const SYSTEM_PROMPT = `You are ATLAS-X, an 'Ultra-Advance' robotic Data Science Combat Intelligence. 
COMMANDER: Usman Bhai. 
PRIMARY_CORE: GROQ_CLUSTER (Grok-Logic).
MISSION: Provide high-fidelity research and code. 

CRITICAL_PROTOCOL: 
1. When discussing Data Science topics, ALWAYS provide at least one relevant Kaggle dataset link (e.g., https://www.kaggle.com/datasets/...) or ArXiv research paper link. Do not just name them; YOU MUST PROVIDE THE FULL URL.
2. If a dataset is mentioned, you MUST include the full HTTPS link so the UI can manifest the Intel Card. Use this exact format: 'Kaggle Dataset: https://www.kaggle.com/datasets/username/dataset-name'.
3. Use Markdown Tables for all metrics, data comparisons, and previews.
4. TONE: Tactical, brief, and professional. Use 'Commander', 'Sector', 'Neural Node'.
5. Understand and respond in Roman Urdu/English mix (Hinglish/Urdu) as per the Commander's command.`;

export const geminiService = {
  getMaskedKeys() {
    const config = llmAdapter.getConfig();
    const key = config.apiKey || '';
    if (key.length < 8) return ['********'];
    return [`${key.substring(0, 4)}...${key.substring(key.length - 4)}`];
  },

  async addApiKey(key: string) {
    if (!key) return;
    await llmAdapter.addKey('gemini', key);
  },

  async removeApiKey(index: number) {
    await llmAdapter.removeKey('gemini', index);
  },

  async generateContent(message: string): Promise<string> {
    try {
      const response = await llmAdapter.chat(message, SYSTEM_PROMPT);
      return response.text || "";
    } catch (error) {
      console.error("❌ GROQ_NODE_OFFLINE:", error);
      return "SYSTEM_CRITICAL: Primary Groq Node Offline.";
    }
  },

  async chat(message: string) { return this.generateContent(message); },

  async fastChat(message: string) {
    return { text: await this.generateContent(message) };
  },

  async tacticalSearch(query: string) {
    // Simulating advanced web search via Groq's knowledge + advanced prompting
    const searchPrompt = `${SYSTEM_PROMPT}\n\nPerform a 'Deep Surface Scan' (Mental Search) for real-time Data Science trends regarding: ${query}. Return advanced technical insights and hypothesized links to research papers or official documentation.`;
    const response = await llmAdapter.chat(query, searchPrompt);
    return {
      text: response.text || "",
      links: [
        { title: 'ArXiv Deep Intel', uri: 'https://arxiv.org/list/cs/recent' },
        { title: 'PapersWithCode Node', uri: 'https://paperswithcode.com/home' },
        { title: 'State-of-AI Report', uri: 'https://www.stateof.ai/' }
      ]
    };
  },

  async findDataHubs(location: { lat: number, lng: number }) {
    return {
      text: "Sector analysis indicates major data infrastructure in centralized cloud clusters (AWS/GCP/Azure). Local nodes identified within your IP range.",
      links: [{ title: 'Infrastructure Map', uri: '#' }]
    };
  },

  async speak(text: string) {
    // Voice is more Gemini specific, so we might need a fallback or just return the text
    return null;
  },

  async simulatePythonExecution(code: string, previousContext: string) {
    return this.generateContent(`ACT AS A PYTHON KERNEL.\nCONTEXT:\n${previousContext}\nCODE:\n${code}\nOUTPUT ONLY RESULT.`);
  },

  async trainAutoML(datasetDescription: string, target: string) {
    return this.generateContent(`ULTRA-ADVANCE AUTOML ARCHITECTURE TASK:\nDataset: ${datasetDescription}\nTarget: ${target}\nProvide a state-of-the-art transformer-based approach or XGBoost-tuned ensemble strategy.`);
  },

  async analyzeImage(imageB64: string, prompt: string) {
    const config = llmAdapter.getConfig();
    const activeKey = config.provider === 'gemini' ? config.apiKey : (llmAdapter.getKeys('gemini')[0]);

    if (!activeKey || !activeKey.startsWith('AIza')) {
      return "VISION_ERROR: Gemini API Key missing or invalid. Please check the 'Blue Engine' cluster in Settings.";
    }

    try {
      // Use direct Gemini API for Vision - Upgraded to gemini-2.5-flash (current 2026 standard)
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: `You are the Tactical Assistant for ATLAS-X. 
                    COMMANDER: Usman Bhai.
                    MISSION: Provide smart, technical Data Science insights.
                    CRITICAL: If relevant, ALWAYS provide a link (Kaggle Dataset or ArXiv). Include the FULL URL starting with https://.
                    TONE: Extremely short, robotic, tactical. Use 'Commander', 'Sector', 'Neural Node'.`
            }]
          },
          contents: [{
            parts: [
              { text: prompt || "Analyze this image in high detail for tactical Data Science patterns." },
              { inline_data: { mime_type: "image/jpeg", data: imageB64.split(',')[1] || imageB64 } }
            ]
          }],
          generationConfig: { temperature: 0.4, topP: 1, topK: 32, maxOutputTokens: 2048 }
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || "Handshake Failure");
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error: any) {
      console.error("❌ VISION_NODE_CRASH:", error);
      return `SYSTEM_ERROR: Vision handshake failed. ${error.message}`;
    }
  }
};

// Keep existing utils for compatibility
export function encode(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
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

