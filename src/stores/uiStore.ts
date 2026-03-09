import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface UIState {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const getInitialTheme = (): Theme => {
    const saved = localStorage.getItem('matu-theme') as Theme;
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const useUIStore = create<UIState>((set) => ({
    theme: getInitialTheme(),
    setTheme: (theme) => {
        localStorage.setItem('matu-theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
        set({ theme });
    },
    toggleTheme: () => {
        set((state) => {
            const newTheme = state.theme === 'light' ? 'dark' : 'light';
            localStorage.setItem('matu-theme', newTheme);
            document.documentElement.setAttribute('data-theme', newTheme);
            return { theme: newTheme };
        });
    },
}));
