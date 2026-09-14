// 用户 Store（Zustand）

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, LoginRequest, LoginResponse } from '@/types/user';

interface UserState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isLoggedIn: boolean;
  login: (req: LoginRequest) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      isLoggedIn: false,

      login: async (req: LoginRequest) => {
        // TODO: 调用实际登录 API
        // const res = await authApi.login(req);
        // set({ token: res.token, refreshToken: res.refreshToken, user: res.user, isLoggedIn: true });

        // 模拟登录
        const mockUser: User = {
          id: '1',
          username: req.username,
          nickname: req.username,
          role: 'admin',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set({
          token: 'mock-token-' + Date.now(),
          refreshToken: 'mock-refresh-' + Date.now(),
          user: mockUser,
          isLoggedIn: true,
        });
      },

      logout: () => {
        set({ token: null, refreshToken: null, user: null, isLoggedIn: false });
      },

      setUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);
