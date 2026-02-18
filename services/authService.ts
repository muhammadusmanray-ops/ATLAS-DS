import { User } from '../types';
import { supabase } from './supabase';

export const authService = {
    // Get currently logged in user
    getCurrentUser: async (): Promise<User | null> => {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error || !user) return null;

            return {
                id: user.id,
                email: user.email || '',
                name: user.user_metadata?.name || user.email?.split('@')[0],
                avatar: user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
                rank: user.user_metadata?.rank || 'Commander',
                verified: !!user.email_confirmed_at,
                provider: 'email'
            };
        } catch {
            return null;
        }
    },

    // Register a new user (with Email Confirmation)
    register: async (email: string, password: string): Promise<User> => {
        const { data, error } = await supabase.auth.signUp({
            email: email.toLowerCase().trim(),
            password,
            options: {
                data: {
                    name: email.split('@')[0],
                    rank: 'Commander'
                }
            }
        });

        if (error) throw new Error(error.message);
        if (!data.user) throw new Error('Registration failed');

        return {
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata?.name,
            verified: !!data.user.email_confirmed_at,
            provider: 'email'
        };
    },

    // Login with email and password
    login: async (email: string, password: string): Promise<User> => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.toLowerCase().trim(),
            password
        });

        if (error) throw new Error(error.message);
        if (!data.user) throw new Error('Login failed');

        return {
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata?.name,
            avatar: data.user.user_metadata?.avatar_url,
            rank: data.user.user_metadata?.rank,
            verified: !!data.user.email_confirmed_at,
            provider: 'email'
        };
    },

    logout: async () => {
        await supabase.auth.signOut();
    }
};
