
import { db } from './storage';

export interface LLMConfig {
    provider: 'gemini' | 'openai-compatible';
    apiKey: string;
    baseUrl?: string;
    model: string;
}

const FALLBACK_GROQ = [(import.meta as any).env.VITE_GROQ_LOGIC_KEY_1 || ''];
const COMMANDER_GEMINI = [(import.meta as any).env.VITE_GEMINI_LOGIC_KEY_1 || '']; // Priority Node

class LLMAdapter {
    private static instance: LLMAdapter;
    private config: LLMConfig = {
        provider: 'openai-compatible',
        apiKey: FALLBACK_GROQ[0],
        model: 'llama-3.3-70b-versatile',
        baseUrl: 'https://api.groq.com/openai/v1'
    };

    private groqKeys: string[] = [...FALLBACK_GROQ];
    private geminiKeys: string[] = [...COMMANDER_GEMINI];

    private groqIndex = 0;
    private geminiIndex = 0;

    private quota = {
        groq: { tokens: 0, requests: 0, lastUpdate: 0, activeKey: '' },
        gemini: { count: 0, limit: 100, activeKey: '' }
    };

    private listeners: ((quota: any) => void)[] = [];
    private isInitialized = false;

    private constructor() {
        this.init();
    }

    private async init() {
        await this.loadConfig();
        this.isInitialized = true;
        console.log("🛠️ Dual Cluster Shield: ACTIVE. Commander Node Synchronized.");
    }

    public static getInstance(): LLMAdapter {
        if (!LLMAdapter.instance) LLMAdapter.instance = new LLMAdapter();
        return LLMAdapter.instance;
    }

    async loadConfig() {
        try {
            const saved = await db.getSettings('llm_config');
            const savedGroq = await db.getSettings('groq_keys');
            const savedGemini = await db.getSettings('gemini_keys');

            if (savedGroq && Array.isArray(savedGroq)) {
                this.groqKeys = [...new Set([...savedGroq, ...FALLBACK_GROQ])];
            }
            if (savedGemini && Array.isArray(savedGemini)) {
                this.geminiKeys = [...new Set([...savedGemini, ...COMMANDER_GEMINI])];
            }

            if (saved) {
                this.config = saved;
                // Double check indices match current keys array
                if (saved.provider === 'openai-compatible') {
                    const idx = this.groqKeys.indexOf(saved.apiKey);
                    this.groqIndex = idx !== -1 ? idx : 0;
                    this.config.apiKey = this.groqKeys[this.groqIndex];
                } else {
                    const idx = this.geminiKeys.indexOf(saved.apiKey);
                    this.geminiIndex = idx !== -1 ? idx : 0;
                    this.config.apiKey = this.geminiKeys[this.geminiIndex];
                }
            }
        } catch (e) {
            console.error("Failed to load cluster configs:", e);
        }
    }

    async saveConfig(config: LLMConfig) {
        this.config = config;
        await db.saveSettings('llm_config', config);
        this.notifyListeners();
    }

    async addKey(provider: 'groq' | 'gemini', key: string) {
        if (!key) return;
        if (provider === 'groq') {
            if (!this.groqKeys.includes(key)) {
                this.groqKeys.push(key);
                await db.saveSettings('groq_keys', this.groqKeys);
            }
        } else {
            if (!this.geminiKeys.includes(key)) {
                this.geminiKeys.push(key);
                await db.saveSettings('gemini_keys', this.geminiKeys);
            }
        }
        this.notifyListeners();
    }

    async removeKey(provider: 'groq' | 'gemini', index: number) {
        if (provider === 'groq') {
            if (this.groqKeys.length <= 1) return;
            this.groqKeys.splice(index, 1);
            this.groqIndex = 0;
            await db.saveSettings('groq_keys', this.groqKeys);
        } else {
            this.geminiKeys.splice(index, 1);
            this.geminiIndex = 0;
            await db.saveSettings('gemini_keys', this.geminiKeys);
        }
        this.notifyListeners();
    }

    getKeys(provider: 'groq' | 'gemini') {
        return provider === 'groq' ? this.groqKeys : this.geminiKeys;
    }

    getConfig() { return this.config; }

    private rotateKey(provider: 'groq' | 'gemini') {
        if (provider === 'groq') {
            this.groqIndex = (this.groqIndex + 1) % this.groqKeys.length;
            this.config.apiKey = this.groqKeys[this.groqIndex];
        } else if (this.geminiKeys.length > 0) {
            this.geminiIndex = (this.geminiIndex + 1) % this.geminiKeys.length;
            this.config.apiKey = this.geminiKeys[this.geminiIndex];
        } else {
            // Fallback to Groq if Gemini fails hard
            this.config.provider = 'openai-compatible';
            this.config.model = 'meta-llama/llama-4-maverick-17b-128e-instruct';
            this.config.apiKey = this.groqKeys[this.groqIndex];
        }
        console.warn(`🔄 CLUSTER_ROTATION: Switching ${provider} node.`);
        this.notifyListeners();
    }

    async chat(message: string, systemPrompt: string, history: Array<{ role: string, content: string }> = [], retries = 3): Promise<any> {
        if (!this.isInitialized) await this.init();

        let provider = this.config.provider === 'openai-compatible' ? 'groq' : 'gemini';

        for (let i = 0; i < retries; i++) {
            const activeKey = provider === 'groq' ? this.groqKeys[this.groqIndex] : this.geminiKeys[this.geminiIndex];

            // EMERGENCY FALLBACK: If key is null/undefined, force Groq
            if (!activeKey) {
                console.error("CRITICAL: Active key missing. Re-routing to Groq Cluster.");
                provider = 'groq';
                this.config.provider = 'openai-compatible';
                this.config.apiKey = this.groqKeys[0];
                continue;
            }

            // USE LATEST FREE TIER MODEL: gemini-2.5-flash
            const activeModel = provider === 'gemini' ? 'gemini-2.5-flash' : this.config.model;

            // DYNAMIC BASE URL: Force Google API Studio for Gemini keys
            let activeBaseUrl = '';
            if (provider === 'gemini') {
                activeBaseUrl = `https://generativelanguage.googleapis.com/v1beta/openai/`;
            } else {
                activeBaseUrl = 'https://api.groq.com/openai/v1';
            }

            try {
                const cleanBaseUrl = activeBaseUrl.replace(/\/$/, '');
                const response = await fetch(`${cleanBaseUrl}/chat/completions`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${activeKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: activeModel,
                        messages: [{ role: 'system', content: systemPrompt }, ...history, { role: 'user', content: message }],
                        temperature: 0.7
                    })
                });

                if (response.status === 429) {
                    this.rotateKey(provider as 'groq' | 'gemini');
                    continue;
                }

                if (!response.ok) {
                    const err = await response.json().catch(() => ({ error: { message: `Node Timeout: ${response.status}` } }));
                    console.error("NODE_FAILURE_DETAILS:", err);
                    throw new Error(err.error?.message || 'Handshake failed');
                }

                const data = await response.json();

                if (provider === 'groq') {
                    this.quota.groq.activeKey = `${activeKey.substring(0, 8)}...`;
                    this.quota.groq.lastUpdate = Date.now();
                } else {
                    this.quota.gemini.activeKey = `${activeKey.substring(0, 8)}...`;
                    this.quota.gemini.count++;
                }

                this.notifyListeners();
                return { text: data.choices[0].message.content, usage: data.usage };
            } catch (e: any) {
                console.error(`Attempt ${i + 1} failed:`, e.message);
                if (i === retries - 1) {
                    // FINAL ATTEMPT: Fallback to Groq fallback key
                    if (provider === 'gemini') {
                        console.warn("GEMINI_CLUSTER_OFFLINE: Final fallback to Groq Logic core.");
                        provider = 'groq';
                        this.config.provider = 'openai-compatible';
                        continue;
                    }
                    throw e;
                }
                this.rotateKey(provider as 'groq' | 'gemini');
                await new Promise(r => setTimeout(r, 600));
            }
        }
    }

    onQuotaUpdate(callback: (quota: any) => void) {
        this.listeners.push(callback);
    }

    private notifyListeners() {
        const q = this.getQuota();
        this.listeners.forEach(cb => cb(q));
    }

    getQuota() {
        return {
            ...this.quota,
            groqCount: this.groqKeys.length,
            geminiCount: this.geminiKeys.length,
            groqIndex: this.groqIndex,
            geminiIndex: this.geminiIndex
        };
    }

    incrementGeminiUsage() {
        this.quota.gemini.count++;
        this.notifyListeners();
    }
}

export const llmAdapter = LLMAdapter.getInstance();
