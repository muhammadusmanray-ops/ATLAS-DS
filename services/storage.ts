
import { Message, User, NotebookCell } from '../types';

const DB_NAME = 'AtlasDB';
const DB_VERSION = 1;
const STORES = {
  CHATS: 'chats',
  USERS: 'users',
  NOTEBOOKS: 'notebooks',
  SETTINGS: 'settings'
};

class AtlasDatabase {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject("Database Error: Failed to open AtlasDB");

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        // Create Object Stores if they don't exist
        if (!db.objectStoreNames.contains(STORES.CHATS)) db.createObjectStore(STORES.CHATS, { keyPath: 'id', autoIncrement: true });
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

  // --- CHAT OPERATIONS ---
  async saveChatHistory(messages: Message[]): Promise<void> {
    return this.transaction(STORES.CHATS, 'readwrite', (store) => {
      store.put({ id: 'current_session', messages, timestamp: new Date() });
    });
  }

  async getChatHistory(): Promise<Message[]> {
    return new Promise(async (resolve) => {
      if (!this.db) await this.init();
      const tx = this.db!.transaction(STORES.CHATS, 'readonly');
      const store = tx.objectStore(STORES.CHATS);
      const request = store.get('current_session');
      
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
    if (!this.db) return;
    const stores = [STORES.CHATS, STORES.USERS, STORES.NOTEBOOKS, STORES.SETTINGS];
    const tx = this.db.transaction(stores, 'readwrite');
    stores.forEach(s => tx.objectStore(s).clear());
    console.log("ATLAS_DB: SYSTEM PURGE COMPLETE");
  }
}

export const db = new AtlasDatabase();
