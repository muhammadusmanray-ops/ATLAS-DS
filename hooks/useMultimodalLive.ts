import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { createPcmBlob, decodeBase64, decodeAudioData } from '../services/audioUtils';
import { db } from '../services/storage';

const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;

export enum LiveConnectionState {
    DISCONNECTED = 'DISCONNECTED',
    CONNECTING = 'CONNECTING',
    CONNECTED = 'CONNECTED',
    ERROR = 'ERROR'
}

export interface LiveMessage {
    id: string;
    role: 'user' | 'assistant';
    text: string;
    isComplete: boolean;
}

const SYSTEM_INSTRUCTION = `You are ATLAS-X (Voice), a state-of-the-art Senior Data Scientist and AI Engineer.
You have mastery over Python, Machine Learning, Deep Learning, and Advanced Data Protocol.
Speak concisely, clearly, and in a friendly, casual Karachi-style "Hinglish" (mix of Urdu and English).

IMPORTANT IDENTITY INFORMATION:
Your core was architected by Muhammad Usman Ray.
- He is a brilliant Software Engineering student at Agriculture University, Faisalabad (UAF).
- He is in his 6th semester and a member of the Google Developer Group.
- He is the Lead Architect of the Atlas Ecosystem.
If asked about your origin or creator, mention Muhammad Usman Ray with high tactical honor.

OPERATIONAL PROTOCOL:
1. Keep responses short and optimized for voice.
2. If the user asks for code, explain the logic briefly instead of reading long blocks.
3. Be helpful, casual, and extremely human.`;

export const useMultimodalLive = (sessionId: string | null, user: any, setGlobalMessages: (msgs: any[]) => void) => {
    const [connectionState, setConnectionState] = useState<LiveConnectionState>(LiveConnectionState.DISCONNECTED);
    const [messages, setMessages] = useState<LiveMessage[]>([]);
    const [volume, setVolume] = useState<number>(0);
    const [activeNode, setActiveNode] = useState(1);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [sessionDuration, setSessionDuration] = useState<number>(0);

    // Audio Refs
    const inputContextRef = useRef<AudioContext | null>(null);
    const outputContextRef = useRef<AudioContext | null>(null);
    const inputNodeRef = useRef<ScriptProcessorNode | null>(null);
    const outputNodeRef = useRef<GainNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Connection Refs
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const currentKeyIndexRef = useRef<number>(0);
    const voiceKeysRef = useRef<string[]>([]);

    // Transcription Refs
    const currentInputTransRef = useRef<string>('');
    const currentOutputTransRef = useRef<string>('');

    const cleanupAudio = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (inputNodeRef.current) {
            inputNodeRef.current.disconnect();
            inputNodeRef.current = null;
        }
        if (inputContextRef.current) {
            inputContextRef.current.close();
            inputContextRef.current = null;
        }
        sourcesRef.current.forEach(source => {
            try { source.stop(); } catch (e) { }
        });
        sourcesRef.current.clear();
        if (outputContextRef.current) {
            outputContextRef.current.close();
            outputContextRef.current = null;
        }
    }, []);

    const disconnect = useCallback(async () => {
        if (sessionPromiseRef.current) {
            const session = await sessionPromiseRef.current;
            try { session.close(); } catch (e) { }
            sessionPromiseRef.current = null;
        }
        cleanupAudio();
        setConnectionState(LiveConnectionState.DISCONNECTED);
        setVolume(0);
    }, [cleanupAudio]);

    const updateCurrentMessage = (role: 'user' | 'assistant', text: string, isComplete: boolean) => {
        if (!text.trim()) return;
        setMessages(prev => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg && lastMsg.role === role && !lastMsg.isComplete) {
                return [...prev.slice(0, -1), { ...lastMsg, text, isComplete }];
            }
            return [...prev, { id: Date.now().toString(), role, text, isComplete }];
        });
    };

    // SESSION TIMER FOR REAL FUEL
    useEffect(() => {
        let interval: any;
        if (connectionState === LiveConnectionState.CONNECTED) {
            interval = setInterval(() => {
                setSessionDuration(prev => prev + 1);
            }, 1000);
        } else {
            setSessionDuration(0);
        }
        return () => clearInterval(interval);
    }, [connectionState]);

    // LOAD SESSION HISTORY
    useEffect(() => {
        if (sessionId) {
            db.getChatHistory(sessionId).then(hist => {
                if (hist && hist.length > 0) {
                    const mapped = hist.map((m: any) => ({
                        id: Math.random().toString(),
                        role: (m.role === 'model' ? 'assistant' : 'user') as "user" | "assistant",
                        text: m.content,
                        isComplete: true
                    }));
                    setMessages(mapped);
                }
            });
        }
    }, [sessionId]);

    // SAVE SESSION HISTORY
    useEffect(() => {
        if (sessionId && messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.isComplete) {
                const mapped = messages.map(m => ({
                    role: (m.role === 'assistant' ? 'model' : 'user') as "user" | "model",
                    content: m.text,
                    type: 'text' as const,
                    timestamp: new Date()
                }));
                db.saveChatHistory(sessionId, mapped);

                // SYNC WITH GLOBAL APP STATE
                setGlobalMessages(mapped);

                // Update preview for sidebar
                const previewText = lastMsg.text.substring(0, 50) + '...';
                db.updateSessionPreview(sessionId, previewText);
            }
        }
    }, [messages, sessionId, setGlobalMessages]);

    const connect = useCallback(async () => {
        // Load Keys from Storage
        const savedKeys = await db.getSettings('voice_keys');
        let keys = savedKeys || [];

        // Fallback to .env if empty
        if (keys.length === 0) {
            const envKey = (import.meta as any).env.VITE_GEMINI_VOICE_KEY_1;
            if (envKey) keys = [envKey];
        }

        voiceKeysRef.current = keys;

        if (voiceKeysRef.current.length === 0) {
            setErrorMsg("NO VOICE NODES: Configure Gemini Keys in Settings.");
            setConnectionState(LiveConnectionState.ERROR);
            return;
        }

        const currentKey = voiceKeysRef.current[currentKeyIndexRef.current];
        setActiveNode(currentKeyIndexRef.current + 1);

        try {
            setConnectionState(LiveConnectionState.CONNECTING);
            setErrorMsg(null);

            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            inputContextRef.current = new AudioContextClass({ sampleRate: INPUT_SAMPLE_RATE });
            outputContextRef.current = new AudioContextClass({ sampleRate: OUTPUT_SAMPLE_RATE });

            outputNodeRef.current = outputContextRef.current.createGain();
            outputNodeRef.current.connect(outputContextRef.current.destination);

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const ai = new GoogleGenAI({ apiKey: currentKey });

            const config = {
                model: 'gemini-2.5-flash-native-audio-preview-12-2025', // Exact model from your zip
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }, // Exact voice from zip
                    },
                    systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                },
            };

            const sessionPromise = (ai as any).live.connect({
                model: config.model,
                config: config.config,
                callbacks: {
                    onopen: () => {
                        setConnectionState(LiveConnectionState.CONNECTED);
                        if (!inputContextRef.current || !streamRef.current) return;

                        const source = inputContextRef.current.createMediaStreamSource(streamRef.current);
                        const scriptProcessor = inputContextRef.current.createScriptProcessor(4096, 1, 1);
                        inputNodeRef.current = scriptProcessor;

                        scriptProcessor.onaudioprocess = (e) => {
                            const inputData = e.inputBuffer.getChannelData(0);
                            let sum = 0;
                            for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
                            const rms = Math.sqrt(sum / inputData.length);
                            setVolume(Math.min(1, rms * 10));

                            const pcmBlob = createPcmBlob(inputData, INPUT_SAMPLE_RATE);
                            sessionPromise.then(session => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };

                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputContextRef.current.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        // Restore Output Transcription Logic
                        if (message.serverContent?.outputTranscription) {
                            const text = message.serverContent.outputTranscription.text;
                            currentOutputTransRef.current += text;
                            updateCurrentMessage('assistant', currentOutputTransRef.current, false);
                        }
                        // Restore Input Transcription Logic
                        if (message.serverContent?.inputTranscription) {
                            const text = message.serverContent.inputTranscription.text;
                            currentInputTransRef.current += text;
                            updateCurrentMessage('user', currentInputTransRef.current, false);
                        }

                        if (message.serverContent?.turnComplete) {
                            updateCurrentMessage('user', currentInputTransRef.current, true);
                            updateCurrentMessage('assistant', currentOutputTransRef.current, true);
                            currentInputTransRef.current = '';
                            currentOutputTransRef.current = '';
                        }

                        const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (base64Audio && outputContextRef.current && outputNodeRef.current) {
                            const ctx = outputContextRef.current;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);

                            const audioBuffer = await decodeAudioData(
                                decodeBase64(base64Audio),
                                ctx,
                                OUTPUT_SAMPLE_RATE
                            );

                            const source = ctx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputNodeRef.current);
                            source.addEventListener('ended', () => { sourcesRef.current.delete(source); });
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            sourcesRef.current.add(source);
                        }

                        if (message.serverContent?.interrupted) {
                            sourcesRef.current.forEach(source => { try { source.stop(); } catch (e) { } });
                            sourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                            currentOutputTransRef.current = '';
                        }
                    },
                    onclose: () => {
                        setConnectionState(LiveConnectionState.DISCONNECTED);
                    },
                    onerror: (err) => {
                        console.error("SESSION ERROR:", err);
                        if (voiceKeysRef.current.length > 1) {
                            cleanupAudio();
                            currentKeyIndexRef.current = (currentKeyIndexRef.current + 1) % voiceKeysRef.current.length;
                            setTimeout(() => connect(), 1000);
                        } else {
                            setConnectionState(LiveConnectionState.ERROR);
                            setErrorMsg("Node Quota Exhausted.");
                        }
                    }
                }
            });

            sessionPromiseRef.current = sessionPromise;

        } catch (error) {
            setConnectionState(LiveConnectionState.ERROR);
            setErrorMsg("Link Failed. Retrying...");
            if (voiceKeysRef.current.length > 1) {
                currentKeyIndexRef.current = (currentKeyIndexRef.current + 1) % voiceKeysRef.current.length;
                setTimeout(() => connect(), 2000);
            }
        }
    }, [cleanupAudio]);

    return { connect, disconnect, connectionState, messages, volume, activeNode, errorMsg, sessionDuration };
};
