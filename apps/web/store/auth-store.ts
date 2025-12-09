import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthResponse, AuthTokens, User } from '@/services/auth';

type AuthState = {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  login: (payload: AuthResponse) => void;
  logout: () => void;
  updateUser: (user: User) => void;
};

const initialState = {
  user: null,
  tokens: null,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,
      isAuthenticated: false,
      login: (payload) => set({
        user: payload.user,
        tokens: {
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
        },
        isAuthenticated: true,
      }),
      updateUser: (user) =>
        set((state) => ({
          user,
          isAuthenticated: state.isAuthenticated || Boolean(user),
        })),
      logout: () => set({ ...initialState, isAuthenticated: false }),
    }),
    {
      name: 'linknest-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
