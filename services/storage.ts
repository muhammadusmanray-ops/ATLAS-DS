import { Message, User, ChatSession, NotebookCell } from '../types';

const DB_NAME = 'AtlasDB';
const DB_VERSION = 2;
const STORES = {
  CHATS: 'chats',
  SESSIONS: 'sessions',
  USERS: 'users',
  NOTEBOOKS: 'notebooks',
  SETTINGS: 'settings'
};

class AtlasDatabase {
  private db: IDBDatabase | null = null;

  // Cloud Sync Helpers
  private getDbConfig() {
    const saved = localStorage.getItem('atlas_active_db_config');
    return saved ? JSON.parse(saved) : null;
  }

  // GLOBAL HISTORY: Get all sessions regardless of module
  async getAllSessions(userId?: string): Promise<ChatSession[]> {
    return new Promise(async (resolve) => {
      if (!this.db) await this.init();
      const tx = this.db!.transaction(STORES.SESSIONS, 'readonly');
      const store = tx.objectStore(STORES.SESSIONS);
      const request = store.getAll();

      request.onsuccess = () => {
        const temp = request.result || [];
        const filtered = temp.filter((s: any) => s.userId === userId);
        resolve(filtered.sort((a: ChatSession, b: ChatSession) => b.lastUpdated.getTime() - a.lastUpdated.getTime()));
      };
    });
  }

  private async cloudRequest(endpoint: string, body: any) {
    const config = this.getDbConfig();
    if (!config) return null;
    try {
      const res = await fetch(`/api/history/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, ...body })
      });
      return await res.json();
    } catch (e) {
      console.warn('Cloud Sync Failed:', e);
      return null;
    }
  }

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject("Database Error: Failed to open AtlasDB");

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        // Create Object Stores if they don't exist
        if (!db.objectStoreNames.contains(STORES.CHATS)) db.createObjectStore(STORES.CHATS, { keyPath: 'id' });
        if (!db.objectStoreNames.contains(STORES.SESSIONS)) {
          const sessionStore = db.createObjectStore(STORES.SESSIONS, { keyPath: 'id' });
          sessionStore.createIndex('moduleId', 'moduleId', { unique: false });
        }
        if (!db.objectStoreNames.contains(STORES.USERS)) db.createObjectStore(STORES.USERS, { keyPath: 'id' });
        if (!db.objectStoreNames.contains(STORES.NOTEBOOKS)) db.createObjectStore(STORES.NOTEBOOKS, { keyPath: 'id' });
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        console.log("ATLAS_DB: Connection Established (IndexedDB)");
        resolve();
      };
    });
  }

  // Generic Helper to run transactions
  private async transaction(storeName: string, mode: IDBTransactionMode, callback: (store: IDBObjectStore) => void): Promise<any> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(storeName, mode);
      const store = tx.objectStore(storeName);

      tx.oncomplete = () => resolve('OK');
      tx.onerror = () => reject(tx.error);

      callback(store);
    });
  }

  // --- SESSION OPERATIONS ---

  async getSessions(moduleId: string): Promise<any[]> {
    // Try Cloud First
    const cloudSessions = await this.cloudRequest('load-sessions', { moduleId });
    if (cloudSessions && Array.isArray(cloudSessions)) {
      // Map cloud field names to local field names if different
      return cloudSessions.map((s: any) => ({
        id: s.id,
        moduleId: s.module_id,
        title: s.title,
        lastUpdated: new Date(s.last_updated),
        preview: s.preview
      }));
    }

    // Fallback to Local
    return new Promise(async (resolve) => {
      if (!this.db) await this.init();
      const tx = this.db!.transaction(STORES.SESSIONS, 'readonly');
      const store = tx.objectStore(STORES.SESSIONS);
      const index = store.index('moduleId');
      const request = index.getAll(moduleId);

      request.onsuccess = () => {
        // Sort by lastUpdated desc
        const sessions = request.result || [];
        resolve(sessions.sort((a, b) => b.lastUpdated - a.lastUpdated));
      };
    });
  }

  async createSession(id: string, moduleId: string, title: string, userId?: string): Promise<void> {
    const preview = 'New Mission Initialized...';
    // Sync to Cloud
    await this.cloudRequest('save', { sessionId: id, moduleId, title, userId, messages: [], preview });

    return this.transaction(STORES.SESSIONS, 'readwrite', (store) => {
      store.put({
        id,
        moduleId,
        title,
        userId,
        lastUpdated: new Date(),
        preview
      });
    });
  }

  async updateSessionPreview(id: string, preview: string): Promise<void> {
    if (!this.db) await this.init();
    const tx = this.db!.transaction(STORES.SESSIONS, 'readwrite');
    const store = tx.objectStore(STORES.SESSIONS);

    return new Promise((resolve) => {
      const req = store.get(id);
      req.onsuccess = async () => {
        const data = req.result;
        if (data) {
          data.preview = preview;
          data.lastUpdated = new Date();
          store.put(data);
        }
        resolve();
      };
    });
  }

  async renameSession(id: string, title: string): Promise<void> {
    if (!this.db) await this.init();
    const tx = this.db!.transaction(STORES.SESSIONS, 'readwrite');
    const store = tx.objectStore(STORES.SESSIONS);

    return new Promise((resolve) => {
      const req = store.get(id);
      req.onsuccess = () => {
        const data = req.result;
        if (data) {
          data.title = title;
          data.lastUpdated = new Date();
          store.put(data);
        }
        resolve();
      };
    });
  }


  async deleteSession(id: string): Promise<void> {
    if (!this.db) await this.init();
    const tx = this.db!.transaction([STORES.SESSIONS, STORES.CHATS], 'readwrite');
    tx.objectStore(STORES.SESSIONS).delete(id);
    tx.objectStore(STORES.CHATS).delete(id);
    return new Promise(resolve => {
      tx.oncomplete = () => resolve();
    });
  }

  // --- CHAT OPERATIONS ---
  async saveChatHistory(sessionId: string, messages: Message[]): Promise<void> {
    // Sync to Cloud
    // We need moduleId and title which are in the session store
    if (this.db) {
      const tx = this.db.transaction(STORES.SESSIONS, 'readonly');
      const req = tx.objectStore(STORES.SESSIONS).get(sessionId);
      req.onsuccess = () => {
        const session = req.result;
        if (session) {
          this.cloudRequest('save', {
            sessionId,
            moduleId: session.moduleId,
            title: session.title,
            messages,
            preview: messages[messages.length - 1]?.content.substring(0, 50) || ''
          });
        }
      };
    }

    return this.transaction(STORES.CHATS, 'readwrite', (store) => {
      store.put({ id: sessionId, messages });
    });
  }

  async getChatHistory(sessionId: string): Promise<Message[]> {
    // Try Cloud First
    const cloudMessages = await this.cloudRequest('load-chat', { sessionId });
    if (cloudMessages && Array.isArray(cloudMessages)) {
      return cloudMessages.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      }));
    }

    return new Promise(async (resolve) => {
      if (!this.db) await this.init();
      const tx = this.db!.transaction(STORES.CHATS, 'readonly');
      const store = tx.objectStore(STORES.CHATS);
      const request = store.get(sessionId);

      request.onsuccess = () => {
        resolve(request.result?.messages || []);
      };
    });
  }

  // --- USER OPERATIONS ---
  async saveUser(user: User): Promise<void> {
    return this.transaction(STORES.USERS, 'readwrite', (store) => {
      store.put(user);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return new Promise(async (resolve) => {
      if (!this.db) await this.init();
      const tx = this.db!.transaction(STORES.USERS, 'readonly');
      const store = tx.objectStore(STORES.USERS);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getAllUsers(): Promise<User[]> {
    return new Promise(async (resolve) => {
      if (!this.db) await this.init();
      const tx = this.db!.transaction(STORES.USERS, 'readonly');
      const store = tx.objectStore(STORES.USERS);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
    });
  }


  // --- NOTEBOOK OPERATIONS ---
  async saveNotebook(cells: NotebookCell[]): Promise<void> {
    return this.transaction(STORES.NOTEBOOKS, 'readwrite', (store) => {
      store.put({ id: 'active_notebook', cells });
    });
  }

  async getNotebook(): Promise<NotebookCell[]> {
    return new Promise(async (resolve) => {
      if (!this.db) await this.init();
      const tx = this.db!.transaction(STORES.NOTEBOOKS, 'readonly');
      const store = tx.objectStore(STORES.NOTEBOOKS);
      const request = store.get('active_notebook');
      request.onsuccess = () => resolve(request.result?.cells || []);
    });
  }

  // --- SETTINGS OPERATIONS ---
  async saveSettings(key: string, value: any): Promise<void> {
    return this.transaction(STORES.SETTINGS, 'readwrite', (store) => {
      store.put({ key, value });
    });
  }

  async getSettings(key: string): Promise<any> {
    return new Promise(async (resolve) => {
      if (!this.db) await this.init();
      const tx = this.db!.transaction(STORES.SETTINGS, 'readonly');
      const store = tx.objectStore(STORES.SETTINGS);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result?.value);
    });
  }

  // --- DANGER ZONE ---
  async purgeAll(): Promise<void> {
    if (!this.db) await this.init();
    const stores = [STORES.CHATS, STORES.USERS, STORES.NOTEBOOKS, STORES.SETTINGS, STORES.SESSIONS];
    const tx = this.db!.transaction(stores, 'readwrite');
    stores.forEach(s => tx.objectStore(s).clear());

    // Also clear cloud-related flags in localStorage
    localStorage.removeItem('atlas_active_db_config');
    localStorage.removeItem('atlas_db_vault');
    localStorage.removeItem('ATLAS_USER_SESSION');
    localStorage.removeItem('atlas_security_audit');

    console.log("ATLAS_DB: COMPREHENSIVE SYSTEM PURGE COMPLETE");
  }
}

export const db = new AtlasDatabase();
