# 技术栈：React Native

跨端原生 App（iOS + Android）。React 语法，Native 渲染。

---

## 项目结构

```
project/
├── src/
│   ├── App.tsx
│   ├── screens/                # 页面
│   │   ├── HomeScreen.tsx
│   │   ├── DetailScreen.tsx
│   │   └── DashboardScreen.tsx
│   ├── components/             # 组件
│   │   ├── ui/                # 基础组件
│   │   └── features/          # 业务组件
│   ├── navigation/             # 路由
│   │   ├── RootNavigator.tsx
│   │   ├── MainTabNavigator.tsx
│   │   └── types.ts
│   ├── theme/                  # 设计 Token
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── index.ts
│   ├── hooks/
│   ├── stores/                 # Zustand / Redux
│   ├── api/                    # 接口
│   └── utils/
├── ios/                        # iOS 原生工程
├── android/                    # Android 原生工程
├── assets/                     # 静态资源
├── app.json
├── babel.config.js
├── metro.config.js
├── tsconfig.json
└── package.json
```

## 初始化

```bash
npx @react-native-community/cli@latest init MyApp --version latest
cd MyApp
npm install @react-navigation/native @react-navigation/native-stack \
  @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context \
  zustand react-native-reanimated react-native-gesture-handler
```

## 设计 Token

```ts
// src/theme/colors.ts
export const colors = {
  light: {
    primary: '#c45c48',
    primaryHover: '#a84a3a',
    primaryForeground: '#fafaf5',
    secondary: '#d4a574',
    surface: '#fafaf5',
    surfaceTinted: '#f5f1e8',
    surfaceElevated: '#ffffff',
    onSurface: '#1a1a1a',
    onSurfaceMuted: '#6b6b6b',
    border: '#e5e5e0',
    error: '#ef4444',
    success: '#4ade80',
    warning: '#fbbf24',
  },
  dark: {
    primary: '#d4a574',
    primaryHover: '#e0b584',
    primaryForeground: '#1a1a1a',
    // ...
  },
} as const;
```

```ts
// src/theme/spacing.ts
export const spacing = {
  0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20,
  6: 24, 8: 32, 10: 40, 12: 48, 16: 64,
  20: 80, 24: 96,
};

export const radius = {
  sm: 4, md: 8, lg: 12, xl: 16, '2xl': 24, full: 9999,
};

export const fontSize = {
  xs: 12, sm: 14, base: 16, lg: 20, xl: 24,
  '2xl': 32, '3xl': 40, '4xl': 56,
};

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};
```

```ts
// src/theme/useTheme.ts
import { useColorScheme } from 'react-native';
import { colors } from './colors';

export function useTheme() {
  const scheme = useColorScheme();
  return {
    colors: scheme === 'dark' ? colors.dark : colors.light,
    scheme: scheme ?? 'light',
  };
}
```

## 基础组件

```tsx
// src/components/ui/Button.tsx
import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { spacing, radius, fontSize, fontWeight } from '@/theme/spacing';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
}

export function Button({ title, onPress, variant = 'primary', size = 'md', loading, disabled }: Props) {
  const { colors } = useTheme();

  const sizeStyles = {
    sm: { height: 36, paddingHorizontal: 12, fontSize: 14 },
    md: { height: 44, paddingHorizontal: 16, fontSize: 15 },
    lg: { height: 52, paddingHorizontal: 24, fontSize: 17 },
  }[size];

  const variantStyles = {
    primary: { bg: colors.primary, fg: colors.primaryForeground },
    secondary: { bg: colors.surfaceTinted, fg: colors.onSurface },
    ghost: { bg: 'transparent', fg: colors.onSurface },
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: variantStyles.bg,
          height: sizeStyles.height,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.fg} />
      ) : (
        <Text style={{ color: variantStyles.fg, fontSize: sizeStyles.fontSize, fontWeight: '600' }}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing[2],
  },
});
```

## 页面

```tsx
// src/screens/HomeScreen.tsx
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/useTheme';
import { spacing, fontSize, fontWeight } from '@/theme/spacing';
import { Button } from '@/components/ui/Button';

export function HomeScreen() {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: colors.onSurface }]}>
          让设计 <Text style={{ fontStyle: 'italic' }}>重新</Text> 有趣
        </Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceMuted }]}>
          把 6 周的工作量压缩到 6 分钟。
        </Text>
        <View style={styles.ctas}>
          <Button title="立即开始" size="lg" onPress={() => {}} />
          <Button title="观看演示" size="lg" variant="ghost" onPress={() => {}} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing[6],
    paddingVertical: spacing[16],
  },
  title: {
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.bold,
    letterSpacing: -0.02,
    lineHeight: fontSize['4xl'] * 1.1,
  },
  subtitle: {
    fontSize: fontSize.lg,
    marginTop: spacing[4],
    lineHeight: fontSize.lg * 1.5,
  },
  ctas: {
    flexDirection: 'row',
    gap: spacing[4],
    marginTop: spacing[8],
  },
});
```

## 路由

```tsx
// src/navigation/RootNavigator.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '@/screens/HomeScreen';
import { DetailScreen } from '@/screens/DetailScreen';
import { useTheme } from '@/theme/useTheme';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const { colors, scheme } = useTheme();
  return (
    <NavigationContainer
      theme={{
        dark: scheme === 'dark',
        colors: {
          primary: colors.primary,
          background: colors.surface,
          card: colors.surfaceElevated,
          text: colors.onSurface,
          border: colors.border,
          notification: colors.error,
        },
        fonts: {
          regular: { fontFamily: 'System', fontWeight: '400' },
          medium: { fontFamily: 'System', fontWeight: '500' },
          bold: { fontFamily: 'System', fontWeight: '700' },
          heavy: { fontFamily: 'System', fontWeight: '900' },
        },
      }}
    >
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Detail" component={DetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

## 平台特定代码

```tsx
import { Platform } from 'react-native';

const shadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  android: {
    elevation: 4,
  },
});
```

## 关键约定

- **平台特定**：`Platform.OS === 'ios' | 'android'`
- **样式**：StyleSheet.create
- **单位**：pt（iOS）/ dp（Android），React Native 用 dp
- **图片**：`<Image source={...}>` 或 `expo-image`
- **动画**：Reanimated 3
- **列表**：FlatList 虚拟化

## 适用场景

- ✅ 跨端 App（iOS + Android）
- ✅ 已有 Web React 经验
- ❌ 不适合纯 Web / 小程序
- ❌ 性能关键场景用 Swift / Kotlin

## 优化建议

- **图片**：expo-image / FastImage
- **列表**：FlatList + getItemLayout
- **动画**：Reanimated 3（主线程）
- **bundle**：Hermes 引擎（默认）
- **启动**：原生 splash + 骨架屏
- **状态**：Zustand 轻量

## 验证清单

- [ ] 平台特定代码（iOS / Android）
- [ ] 安全区 SafeAreaView
- [ ] 触摸目标 ≥44pt
- [ ] 字号 ≥12pt
- [ ] 性能（FPS 监控）
- [ ] 减弱动效模式
- [ ] 暗色模式支持
- [ ] 没有 AI slop
