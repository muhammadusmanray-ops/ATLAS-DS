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

  async loginUser(email: string, password: string): Promise<any> {
    const data = await this.authFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.token) localStorage.setItem('ATLAS_TOKEN', data.token);
    return data;
  }

  async getAllSessions(): Promise<ChatSession[]> {
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

  // Legacy/Stubs
  async init(): Promise<void> { return Promise.resolve(); }
  async saveUser(user: User): Promise<void> { /* Handled via token */ }
  async getAllUsers(): Promise<User[]> { return []; }
  async deleteSession(id: string) { /* Backend implementation needed */ }
  async renameSession(id: string, title: string) { /* Backend implementation needed */ }
}

export const db = new AtlasDatabase();
