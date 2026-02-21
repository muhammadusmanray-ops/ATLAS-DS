/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("MISSION_CRITICAL_WARNING: Supabase coordinates are missing in .env.local sector.");
}

// ULTRA-SAFE INITIALIZATION
let supabaseInstance: any;

try {
    const safeUrl = supabaseUrl && supabaseUrl.startsWith('http') ? supabaseUrl : 'https://placeholder.supabase.co';
    const safeKey = supabaseAnonKey || 'placeholder-key';
    supabaseInstance = createClient(safeUrl, safeKey);
} catch (e) {
    console.error("SUPABASE_INIT_CRITICAL_VOID:", e);
    // Return a dummy object to prevent "undefined" crashes in other files
    supabaseInstance = { auth: { getUser: () => Promise.resolve({ data: { user: null }, error: null }), onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }) } };
}

export const supabase = supabaseInstance;
