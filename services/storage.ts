import { Message, User, ChatSession } from '../types';

const API_URL = '/api';

class AtlasDatabase {
  private async authFetch(endpoint: string, options: any = {}) {
    const token = localStorage.getItem('ATLAS_TOKEN');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers
    };

    const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw { status: res.status, ...data };
    }
    return await res.json();
  }

  // --- AUTHENTICATION ---
  async loginUser(email: string, password: string): Promise<any> {
    const data = await this.authFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.token) localStorage.setItem('ATLAS_TOKEN', data.token);
    return data;
  }

  // --- CHAT HISTORY (DATABASE BACKED) ---
  async getAllSessions(userId?: string): Promise<ChatSession[]> {
    try {
      const data = await this.authFetch('/history');
      return (data || []).map((h: any) => ({
        id: h.id.toString(),
        moduleId: 'chat',
        title: h.title,
        userId: h.user_id,
        lastUpdated: new Date(h.updated_at),
        preview: 'Mission context restored...'
      }));
    } catch (e) {
      console.warn("History Load Failed:", e);
      return [];
    }
  }

  async getChatHistory(chatId: string): Promise<Message[]> {
    try {
      const data = await this.authFetch(`/history/${chatId}`);
      return (data || []).map((msg: any) => ({
        role: msg.role === 'model' ? 'model' : 'user',
        content: msg.text || msg.content,
        type: 'text',
        timestamp: new Date(msg.created_at || Date.now())
      }));
    } catch (e) {
      return [];
    }
  }

  async saveChatHistory(chatId: string | null, messages: Message[]): Promise<void> {
    if (messages.length < 2) return;
    const lastAI = messages[messages.length - 1];
    const lastUser = messages[messages.length - 2];

    if (lastAI.role === 'model' && lastUser.role === 'user') {
      await this.saveChat(chatId || undefined, lastUser.content, lastAI.content);
    }
  }

  async saveChat(chatId: string | undefined, userMessage: string, aiMessage: string): Promise<string> {
    const data = await this.authFetch('/save-chat', {
      method: 'POST',
      body: JSON.stringify({
        chatId: chatId && chatId !== 'new' ? chatId : undefined,
        userMessage,
        aiMessage
      })
    });
    return data.chatId.toString();
  }

  // --- AUXILIARY MODULES (LOCAL PERSISTENCE) ---
  async getNotebook() {
    const val = localStorage.getItem('atlas_notebook_cells');
    return val ? JSON.parse(val) : [];
  }

  async saveNotebook(cells: any[]) {
    localStorage.setItem('atlas_notebook_cells', JSON.stringify(cells));
  }

  async purgeAll() {
    localStorage.clear();
    // In a real scenario, we might want to tell the server to purge too
  }

  async saveUser(user: User) {
    localStorage.setItem('ATLAS_USER_SESSION', JSON.stringify(user));
  }

  async getAllUsers(): Promise<User[]> {
    const user = localStorage.getItem('ATLAS_USER_SESSION');
    return user ? [JSON.parse(user)] : [];
  }

  async createSession(id: string, moduleId: string, title: string, userId?: string) {
    // For non-chat modules, we can keep them local or eventually move to server
    const sessions = await this.getAllSessions();
    const newSession = { id, moduleId, title, userId, lastUpdated: new Date(), preview: '' };
    localStorage.setItem(`atlas_local_session_${id}`, JSON.stringify(newSession));
  }

  async updateSessionPreview(id: string, preview: string) {
    // Placeholder to satisfy build
  }

  async deleteSession(id: string) {
    // Placeholder to satisfy build
  }

  async renameSession(id: string, title: string) {
    // Placeholder to satisfy build
  }

  async init(): Promise<void> {
    return Promise.resolve();
  }

  async saveSettings(key: string, value: any): Promise<void> {
    localStorage.setItem(`atlas_setting_${key}`, JSON.stringify(value));
  }
  async getSettings(key: string): Promise<any> {
    const val = localStorage.getItem(`atlas_setting_${key}`);
    return val ? JSON.parse(val) : null;
  }
}

export const db = new AtlasDatabase();
