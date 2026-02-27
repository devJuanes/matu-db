import { create } from 'zustand';
import { authAPI } from '../lib/api';

interface User {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    created_at: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    initialized: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, full_name?: string) => Promise<void>;
    logout: () => void;
    init: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isLoading: false,
    initialized: false,

    init: async () => {
        const token = localStorage.getItem('matudb_token');
        const userStr = localStorage.getItem('matudb_user');
        if (token && userStr) {
            try {
                const user = JSON.parse(userStr);
                set({ token, user, initialized: true });
                // Verify token is still valid
                const res = await authAPI.me();
                set({ user: res.data.data.user });
            } catch {
                localStorage.removeItem('matudb_token');
                localStorage.removeItem('matudb_user');
                set({ token: null, user: null, initialized: true });
            }
        } else {
            set({ initialized: true });
        }
    },

    login: async (email, password) => {
        set({ isLoading: true });
        try {
            const res = await authAPI.login({ email, password });
            const { token, user } = res.data.data;
            localStorage.setItem('matudb_token', token);
            localStorage.setItem('matudb_user', JSON.stringify(user));
            set({ token, user, isLoading: false });
        } catch (err) {
            set({ isLoading: false });
            throw err;
        }
    },

    register: async (email, password, full_name) => {
        set({ isLoading: true });
        try {
            const res = await authAPI.register({ email, password, full_name });
            const { token, user } = res.data.data;
            localStorage.setItem('matudb_token', token);
            localStorage.setItem('matudb_user', JSON.stringify(user));
            set({ token, user, isLoading: false });
        } catch (err) {
            set({ isLoading: false });
            throw err;
        }
    },

    logout: () => {
        localStorage.removeItem('matudb_token');
        localStorage.removeItem('matudb_user');
        set({ user: null, token: null });
    },
}));
