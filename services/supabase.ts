import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("MISSION_CRITICAL_WARNING: Supabase coordinates are missing in .env.local sector.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
