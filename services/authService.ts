import { User } from '../types';

/**
 * Real Auth Service
 * Connects to the Vercel Backend API (/api/auth)
 */

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

    // Check if an email is already registered
    checkUserExists: async (email: string): Promise<boolean> => {
        const res = await fetch(`${API_URL}/check-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        if (!res.ok) throw new Error('Network error');
        const data = await res.json();
        return data.exists;
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

        // Save token (if returned)
        if (data.token) localStorage.setItem('auth_token', data.token);

        return data.user;
    },

    // Login with email and password
    login: async (email: string, password: string): Promise<User | any> => {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        // Handle Success OR OTP Requirement (Both are 200 OK now)
        if (res.ok) {
            if (data.needsVerification) {
                return { needsVerification: true, email: data.email };
            }

            // Full Login Success
            if (data.token) {
                localStorage.setItem('auth_token', data.token);
                localStorage.setItem('ATLAS_TOKEN', data.token);
            }
            return data.user;
        }

        throw new Error(data.error || 'Authentication Failed');
    },

    // Google Login (Send token to backend)
    googleLogin: async (credential: string): Promise<User> => {
        const res = await fetch(`${API_URL}/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: credential })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Google login failed');

        // Save token
        if (data.token) {
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('ATLAS_TOKEN', data.token); // Compat
        }
        return data.user;
    },

    // Verify OTP
    verifyOtp: async (email: string, code: string): Promise<User> => {
        const res = await fetch(`${API_URL}/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Verification failed');
        if (data.token) {
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('ATLAS_TOKEN', data.token); // Compat
        }
        return data.user;
    },

    // Logout
    logout: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('ATLAS_TOKEN');
        localStorage.removeItem('ATLAS_USER_SESSION');
    }
};
