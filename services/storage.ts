import { Message, User, ChatSession, NotebookCell } from '../types';

const API_URL = '/api';

class AtlasDatabase {
  private db: IDBDatabase | null = null;

  // --- AUTHENTICATION (NEW BACKEND) ---
  async loginUser(email: string, password: string): Promise<any> {
    const config = localStorage.getItem('atlas_db_config'); // Get DB config if needed
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, config: config ? JSON.parse(config) : {} })
    });
    const data = await res.json();
    if (!res.ok) throw { status: res.status, ...data };
    return data;
  }

  async verifyUser(email: string, code: string): Promise<any> {
    const config = localStorage.getItem('atlas_db_config');
    const res = await fetch(`${API_URL}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, config: config ? JSON.parse(config) : {} })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  }

  // --- HISTORY (NEW BACKEND) ---
  async fetchHistory(email: string): Promise<any[]> {
    const config = localStorage.getItem('atlas_db_config');
    const query = new URLSearchParams({ email, config: config || '{}' }).toString();
    const res = await fetch(`${API_URL}/history?${query}`);
    const data = await res.json();
    return data.history || [];
  }

  async fetchChatMessages(chatId: string): Promise<Message[]> {
    const config = localStorage.getItem('atlas_db_config');
    const query = new URLSearchParams({ config: config || '{}' }).toString();
    const res = await fetch(`${API_URL}/history/${chatId}?${query}`);
    const data = await res.json();

    // Map backend format to frontend types
    return (data.messages || []).map((msg: any) => ({
      id: msg.id || Math.random().toString(),
      role: msg.role === 'model' ? 'assistant' : 'user',
      content: msg.content,
      timestamp: new Date(msg.created_at || Date.now())
    }));
  }

  async saveChat(email: string, chatId: string | undefined, userMessage: string, aiMessage: string): Promise<string> {
    const config = localStorage.getItem('atlas_db_config');
    const res = await fetch(`${API_URL}/save-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        chatId: chatId === 'new' ? undefined : chatId,
        userMessage,
        aiMessage,
        config: config ? JSON.parse(config) : {}
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.chatId;
  }


  // --- LEGACY INDEXEDDB (Kept for Offline Support/Settings) ---
  // ... (Keeping minimal IndexedDB for local settings/notebooks if needed) ...

  async init(): Promise<void> {
    console.log("ATLAS_DB: API Mode Active (IndexedDB Standby)");
    return Promise.resolve();
  }

  // Helper for settings (still local)
  async saveSettings(key: string, value: any): Promise<void> {
    localStorage.setItem(`atlas_setting_${key}`, JSON.stringify(value));
  }

  async getSettings(key: string): Promise<any> {
    const val = localStorage.getItem(`atlas_setting_${key}`);
    return val ? JSON.parse(val) : null;
  }
}

export const db = new AtlasDatabase();
