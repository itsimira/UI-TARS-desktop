import { create } from 'zustand';
import { User } from '@ui-tars/shared/types';

interface UserState {
  loading: boolean;
  error: Error | null;
  user: User | null;
  token: string | null;

  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;

  logout: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  loading: true,
  error: null,
  user: null,
  token: null,

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  logout: async () => {
    return window.api.auth.logout().then(() => {
      set({ user: null, token: null });
    });
  },
}));
