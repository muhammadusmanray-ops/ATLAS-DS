import { User } from '../types';

const API_URL = '/api/auth';

export const authService = {
    // Get currently logged in user
    getCurrentUser: async (): Promise<User | null> => {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) return null;

            const res = await fetch(`${API_URL}/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                localStorage.removeItem('auth_token');
                return null;
            }

            return await res.json();
        } catch {
            return null;
        }
    },

    // Register a new user
    register: async (email: string, password: string): Promise<User> => {
        const res = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');
        return data.user;
    },

    // Login with email and password
    login: async (email: string, password: string): Promise<User> => {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');

        if (data.token) localStorage.setItem('auth_token', data.token);
        return data.user;
    },

    logout: () => {
        localStorage.removeItem('auth_token');
    }
};
