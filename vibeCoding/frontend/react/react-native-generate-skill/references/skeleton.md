# React Native 项目骨架模板

基于实际商业项目验证的完整目录结构。

## 整体结构

```
{{project}}/
├── App.tsx                    # 应用入口（Provider 包裹）
├── index.js                  # React Native 入口
├── app.json                  # Expo / RN 配置
├── package.json               # 依赖配置
├── tsconfig.json             # TypeScript 配置
├── babel.config.js           # Babel 配置
├── metro.config.js           # Metro 打包配置
├── .eslintrc.js              # ESLint 配置
├── .prettierrc.js            # Prettier 配置
├── .watchmanconfig           # Watchman 配置
├── android/                  # Android 原生项目
├── ios/                      # iOS 原生项目
└── src/
    ├── assets/               # 静态资源
    │   ├── images/          # 图片
    │   ├── fonts/           # 字体
    │   └── login/           # 登录页专属图片
    ├── components/           # 通用组件
    │   ├── common/          # 基础组件
    │   │   ├── AppScreen.tsx
    │   │   ├── AppScrollView.tsx
    │   │   ├── AppTextInput.tsx
    │   │   └── index.ts
    │   ├── business/        # 业务组件
    │   │   └── AgreementDialog.tsx
    │   └── index.ts
    ├── config/               # 配置
    │   ├── index.ts         # 统一导出
    │   └── env.ts           # 环境配置
    ├── data/                # 静态数据
    │   ├── mockAuth.ts      # 模拟登录数据
    │   └── index.ts
    ├── hooks/               # 自定义 Hooks
    │   └── index.ts
    ├── navigation/           # 导航配置
    │   ├── AppTabs.tsx      # 底部标签导航
    │   ├── RootNavigator.tsx # 根导航（堆栈）
    │   ├── navigationRef.ts  # 导航引用
    │   ├── types.ts         # 类型定义
    │   └── index.ts
    ├── screens/             # 页面
    │   ├── auth/            # 认证相关
    │   │   └── LoginScreen.tsx
    │   ├── common/          # 通用页面
    │   │   ├── SplashScreen.tsx
    │   │   └── ForbiddenScreen.tsx
    │   └── index.ts
    ├── services/            # API 服务
    │   ├── http.ts          # axios 封装
    │   ├── auth.ts          # 登录 API
    │   ├── httpErrorHandlers.ts
    │   ├── httpEvents.ts
    │   ├── logger.ts
    │   └── index.ts
    ├── store/               # 状态管理（Zustand）
    │   ├── authStore.ts     # 登录态
    │   ├── toastStore.ts    # Toast 提示
    │   ├── sessionStore.ts  # 会话
    │   └── index.ts
    ├── theme/               # 主题系统
    │   ├── colors.ts        # 颜色
    │   ├── typography.ts    # 字体
    │   ├── spacing.ts       # 间距
    │   ├── palette.ts       # 调色板
    │   └── index.ts
    ├── types/               # 类型定义
    │   └── index.ts
    ├── utils/               # 工具函数
    │   └── index.ts
    └── constants/            # 常量
        └── index.ts
```

## 核心文件代码模板

### App.tsx（入口）

```tsx
import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';

import { AppToast } from './src/components/AppToast';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { RootNavigator } from './src/navigation/RootNavigator';
import { navigationRef } from './src/navigation/navigationRef';
import { appTheme, colors } from './src/theme';

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
  },
};

export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <PaperProvider theme={appTheme}>
        <ErrorBoundary>
          <NavigationContainer theme={navigationTheme} ref={navigationRef}>
            <StatusBar
              backgroundColor={colors.primaryDark}
              barStyle="light-content"
            />
            <RootNavigator />
          </NavigationContainer>
          <AppToast />
        </ErrorBoundary>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
```

### LoginScreen.tsx（登录页示例）

```tsx
import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppTextInput } from '../../components/common/AppTextInput';
import { AppScreen } from '../../components/common/AppScreen';
import { AppScrollView } from '../../components/common/AppScrollView';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import { colors, fontSize, fontWeight, radius, shadows } from '../../theme';

// 模拟图片资源（实际项目中 require 真实图片）
const loginAssets = {
  background: { uri: 'https://picsum.photos/1080/1920' }, // 临时占位
} as const;

type LoginMode = 'password' | 'code';

export function LoginScreen(): React.JSX.Element {
  const [mode, setMode] = useState<LoginMode>('password');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const login = useAuthStore(state => state.login);
  const showToast = useToastStore(state => state.show);
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const compact = height < 760;

  const submit = async () => {
    if (!username.trim()) {
      showToast('请输入账号');
      return;
    }
    if (!password) {
      showToast('请输入密码');
      return;
    }

    setLoading(true);
    try {
      await login(username, password);
    } catch {
      showToast('登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreen edges={[]} statusBarStyle="dark-content" style={styles.screen}>
      <ImageBackground
        source={loginAssets.background}
        resizeMode="cover"
        style={styles.background}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}>
          <AppScrollView
            contentContainerStyle={[
              styles.page,
              { minHeight: height, paddingTop: insets.top + 24 },
            ]}
            keyboardShouldPersistTaps="handled">
            {/* 品牌区 */}
            <View style={[styles.hero, compact && styles.heroCompact]}>
              <Text style={styles.brandTitle}>我的 App</Text>
              <Text style={styles.tagline}>让生活更美好</Text>
            </View>

            {/* 登录面板 */}
            <View style={[styles.panel, { width: Math.min(width - 60, 360) }]}>
              <Text style={styles.panelTitle}>
                {mode === 'password' ? '账号密码登录' : '手机验证码登录'}
              </Text>

              <View style={styles.fields}>
                <AppTextInput
                  placeholder="请输入账号"
                  value={username}
                  onChangeText={setUsername}
                  leftSlot={
                    <MaterialDesignIcons name="account" size={20} color={colors.primary} />
                  }
                />
                <AppTextInput
                  placeholder="请输入密码"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  leftSlot={
                    <MaterialDesignIcons name="lock" size={20} color={colors.primary} />
                  }
                />
              </View>

              <Pressable
                onPress={submit}
                disabled={loading}
                style={({ pressed }) => [
                  styles.loginButton,
                  pressed && styles.loginButtonPressed,
                ]}>
                <LinearGradient
                  colors={['#6366f1', '#4f46e5']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.loginButtonGradient}>
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.loginButtonText}>登录</Text>
                  )}
                </LinearGradient>
              </Pressable>

              <Pressable
                onPress={() => setMode(mode === 'password' ? 'code' : 'password')}
                style={styles.switchMode}>
                <Text style={styles.switchModeText}>
                  {mode === 'password' ? '手机验证码登录' : '账号密码登录'}
                </Text>
              </Pressable>
            </View>
          </AppScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background },
  background: { flex: 1 },
  keyboardView: { flex: 1 },
  page: { alignItems: 'center', paddingHorizontal: 20 },
  hero: { alignItems: 'center', marginTop: 60, marginBottom: 40 },
  heroCompact: { marginTop: 40, marginBottom: 30 },
  brandTitle: { fontSize: 32, fontWeight: 'bold', color: colors.text },
  tagline: { fontSize: 14, color: colors.textSecondary, marginTop: 8 },
  panel: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 24,
    ...shadows.card,
  },
  panelTitle: { fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 20, textAlign: 'center' },
  fields: { gap: 12 },
  loginButton: { marginTop: 20, borderRadius: radius.md, overflow: 'hidden' },
  loginButtonPressed: { opacity: 0.8 },
  loginButtonGradient: { height: 48, alignItems: 'center', justifyContent: 'center' },
  loginButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  switchMode: { marginTop: 16, alignSelf: 'center' },
  switchModeText: { color: colors.primary, fontSize: 14 },
});
```

### navigation/RootNavigator.tsx（导航配置）

```tsx
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { SplashScreen } from '../screens/common/SplashScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { AppTabs } from './AppTabs';
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const headerOptions = {
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.primary,
  headerTitleStyle: { color: colors.text, fontWeight: '600' as const },
  headerShadowVisible: false,
};

export function RootNavigator(): React.JSX.Element {
  const [splashVisible, setSplashVisible] = useState(true);
  const token = useAuthStore(state => state.token);
  const hydrated = useAuthStore(state => state.hydrated);

  const finishSplash = () => setSplashVisible(false);

  if (splashVisible) {
    return <SplashScreen onFinish={finishSplash} />;
  }

  if (!hydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={headerOptions}>
      {token ? (
        <>
          <Stack.Screen name="Main" component={AppTabs} options={{ headerShown: false }} />
          {/* 可在此添加业务页面 */}
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
```

### navigation/types.ts（类型定义）

```ts
export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  // 业务页面
  Profile: undefined;
  Settings: undefined;
  [key: string]: undefined | object;
};
```

### navigation/AppTabs.tsx（底部导航）

```tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialIcons from '@react-native-vector-icons/material-design-icons';

import { HomeScreen } from '../screens/home/HomeScreen';
import { MineScreen } from '../screens/mine/MineScreen';
import { colors } from '../theme';
import type { BottomTabParamList } from './types';

const Tab = createBottomTabNavigator<BottomTabParamList>();

export function AppTabs(): React.JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: '首页',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Mine"
        component={MineScreen}
        options={{
          tabBarLabel: '我的',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
```

### store/authStore.ts（Zustand 状态）

```ts
import { create } from 'zustand';
import { persist, createJSONStorage } from '@react-native-async-storage/async-storage';

interface AuthState {
  token: string | null;
  user: any | null;
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
      login: async (username, password) => {
        // 模拟登录，实际项目中调用 auth API
        // const res = await auth.login(username, password);
        const mockToken = 'mock-token-' + Date.now();
        set({ token: mockToken, user: { username } });
      },
      logout: () => set({ token: null, user: null }),
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
```

### services/http.ts（axios 封装）

```ts
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';

const baseURL = 'https://api.example.com'; // 实际项目配置

const http: AxiosInstance = axios.create({
  baseURL,
  timeout: 15000,
});

// 请求拦截器
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// 响应拦截器
http.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default http;
```

### theme/index.ts（主题统一导出）

```ts
export const colors = {
  primary: '#6366f1',
  primaryDark: '#4f46e5',
  primaryLight: '#eef2ff',
  background: '#f5f7fa',
  surface: '#ffffff',
  text: '#1f2937',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
  error: '#ef4444',
  success: '#22c55e',
};

export const fontSize = {
  caption: 12,
  body: 14,
  bodySmall: 13,
  title: 16,
  headline: 18,
  display: 24,
};

export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
};
```

### components/common/AppScreen.tsx（通用屏幕容器）

```tsx
import React from 'react';
import { ViewStyle, StatusBar, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme';

interface AppScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  statusBarStyle?: 'dark-content' | 'light-content';
}

export function AppScreen({
  children,
  style,
  edges = ['top', 'bottom'],
  statusBarStyle = 'dark-content',
}: AppScreenProps): React.JSX.Element {
  const insets = useSafeAreaInsets();

  const paddingTop = edges.includes('top') ? insets.top : 0;
  const paddingBottom = edges.includes('bottom') ? insets.bottom : 0;

  return (
    <View style={[styles.container, { paddingTop, paddingBottom }, style]}>
      <StatusBar barStyle={statusBarStyle} backgroundColor="transparent" translucent />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
```

### components/common/AppTextInput.tsx（通用输入框）

```tsx
import React from 'react';
import { View, TextInput, StyleSheet, ViewStyle } from 'react-native';
import { colors, fontSize, radius } from '../../theme';

interface AppTextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  style?: ViewStyle;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export function AppTextInput({
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  leftSlot,
  rightSlot,
  style,
  keyboardType = 'default',
  autoCapitalize = 'none',
}: AppTextInputProps): React.JSX.Element {
  return (
    <View style={[styles.container, style]}>
      {leftSlot && <View style={styles.leftSlot}>{leftSlot}</View>}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
      {rightSlot && <View style={styles.rightSlot}>{rightSlot}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    height: 48,
  },
  leftSlot: { marginRight: 8 },
  rightSlot: { marginLeft: 8 },
  input: {
    flex: 1,
    fontSize: fontSize.body,
    color: colors.text,
    padding: 0,
  },
});
```

### components/common/AppScrollView.tsx（通用滚动容器）

```tsx
import React from 'react';
import { ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme';

interface AppScrollViewProps {
  children: React.ReactNode;
  contentContainerStyle?: ViewStyle;
  keyboardShouldPersistTaps?: 'handled' | 'always' | 'never';
}

export function AppScrollView({
  children,
  contentContainerStyle,
  keyboardShouldPersistTaps = 'handled',
}: AppScrollViewProps): React.JSX.Element {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, contentContainerStyle]}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1 },
});
```

## 目录创建顺序

1. 创建项目根目录
2. 生成配置文件（package.json, app.json, tsconfig.json 等）
3. 创建 src/ 目录结构
4. 依次创建：theme → components/common → store → services → navigation → screens → App.tsx
5. 安装依赖：`npm install`
6. 启动开发服务器：`npx react-native start` 或 `npx expo start`
