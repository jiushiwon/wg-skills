# React Native 状态管理

基于 Zustand 5.x + AsyncStorage 持久化的状态管理方案。

## 方案选择

| 方案 | 适用场景 | 复杂度 |
|------|----------|--------|
| Zustand | 中小型应用，简单状态 | 低 |
| Redux Toolkit | 大型复杂应用 | 中 |
| React Context | 少量全局状态 | 低 |

推荐使用 **Zustand**：API 简洁、体积小、TypeScript 支持好。

## 核心 Store

### store/authStore.ts（登录态管理）

```ts
import { create } from 'zustand';
import { persist, createJSONStorage } from '@react-native-async-storage/async-storage';
import type { StateStorage } from 'zustand/middleware';

const asyncStorageAdapter: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await AsyncStorage.getItem(name)) ?? null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await AsyncStorage.setItem(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await AsyncStorage.removeItem(name);
  },
};

interface User {
  id: string;
  username: string;
  nickname?: string;
  avatar?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  hydrated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      hydrated: false,

      login: async (username: string, password: string) => {
        // TODO: 调用实际登录 API
        // const res = await auth.login(username, password);
        // set({ token: res.token, user: res.user });

        // 模拟登录
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockToken = 'mock-token-' + Date.now();
        const mockUser: User = {
          id: '1',
          username,
          nickname: username,
        };
        set({ token: mockToken, user: mockUser });
      },

      logout: () => {
        set({ token: null, user: null });
      },

      setHydrated: (hydrated: boolean) => {
        set({ hydrated });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => asyncStorageAdapter),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
```

### store/toastStore.ts（Toast 提示）

```ts
import { create } from 'zustand';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  show: (message: string, type?: Toast['type'], duration?: number) => void;
  hide: (id: string) => void;
  hideAll: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  show: (message: string, type: Toast['type'] = 'info', duration = 2000) => {
    const id = Date.now().toString();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type, duration }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, duration);
  },

  hide: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  hideAll: () => {
    set({ toasts: [] });
  },
}));
```

### store/sessionStore.ts（会话管理）

```ts
import { create } from 'zustand';

interface SessionState {
  isExpired: boolean;
  showExpiredDialog: boolean;
  setExpired: (expired: boolean) => void;
  showDialog: () => void;
  hideDialog: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  isExpired: false,
  showExpiredDialog: false,

  setExpired: (expired: boolean) => {
    set({ isExpired: expired });
    if (expired) {
      set({ showExpiredDialog: true });
    }
  },

  showDialog: () => set({ showExpiredDialog: true }),
  hideDialog: () => set({ showExpiredDialog: false }),
}));
```

### store/index.ts（统一导出）

```ts
export { useAuthStore } from './authStore';
export { useToastStore } from './toastStore';
export { useSessionStore } from './sessionStore';
```

## 组件实现

### components/AppToast.tsx（Toast 组件）

```ts
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToastStore } from '../store/toastStore';
import { colors, fontSize, radius } from '../theme';

export function AppToast(): React.JSX.Element {
  const toasts = useToastStore((state) => state.toasts);
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) return <></>;

  return (
    <View style={[styles.container, { top: insets.top + 20 }]}>
      {toasts.map((toast) => (
        <View
          key={toast.id}
          style={[
            styles.toast,
            toast.type === 'success' && styles.success,
            toast.type === 'error' && styles.error,
          ]}>
          <Text style={styles.message}>{toast.message}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 9999,
    gap: 8,
  },
  toast: {
    backgroundColor: colors.text,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radius.md,
  },
  success: { backgroundColor: colors.success },
  error: { backgroundColor: colors.error },
  message: {
    color: '#fff',
    fontSize: fontSize.body,
    textAlign: 'center',
  },
});
```

## 使用示例

### 登录页使用

```ts
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';

export function LoginScreen(): React.JSX.Element {
  const login = useAuthStore((state) => state.login);
  const showToast = useToastStore((state) => state.show);

  const handleLogin = async () => {
    try {
      await login(username, password);
      showToast('登录成功', 'success');
    } catch {
      showToast('登录失败', 'error');
    }
  };

  return <View>...</View>;
}
```

### 路由守卫

```ts
// RootNavigator.tsx
const token = useAuthStore((state) => state.token);
const hydrated = useAuthStore((state) => state.hydrated);

// 仅在 hydration 完成后才判断登录态
if (!hydrated) {
  return <Loading />;
}

return token ? <AppTabs /> : <LoginScreen />;
```

## 常见问题

- **Persist 不生效**：确保 AsyncStorage 已安装，检查 adapter 配置
- **Hydration 延迟**：在 RootNavigator 中处理未 hydration 状态，避免闪烁
- **状态不同步**：Zustand 推荐直接使用 `useStore.getState()` 在非组件中访问状态
