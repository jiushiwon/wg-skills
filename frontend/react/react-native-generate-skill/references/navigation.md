# React Native 导航配置

基于 React Navigation 7.x 的完整导航架构。

## 架构概览

```
App
├── NavigationContainer          # 导航容器
│   └── RootNavigator (Stack)    # 根导航（根据登录态切换）
│       ├── LoginScreen          # 登录页（未登录）
│       └── Main (Tabs)         # 底部导航（已登录）
│           ├── HomeScreen       # 首页
│           ├── MineScreen       # 我的
│           └── [更多业务Tab]
└── Providers
    ├── SafeAreaProvider         # 安全区域
    └── PaperProvider           # UI 主题
```

## 核心文件

### navigation/types.ts（类型定义）

```ts
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

// 底部 Tab 参数
export type BottomTabParamList = {
  Home: undefined;
  Mine: undefined;
  Settings: undefined;
};

// 根堆栈参数
export type RootStackParamList = {
  Login: undefined;
  Main: NavigatorScreenParams<BottomTabParamList>;
  Home: undefined;
  Mine: undefined;
  Profile: undefined;
  Settings: undefined;
};

// 屏幕 Props 类型
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type BottomTabScreenProps<T extends keyof BottomTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<BottomTabParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;
```

### navigation/navigationRef.ts（导航引用）

```ts
import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

// 常用导航操作
export const navigate = (name: keyof RootStackParamList, params?: object) => {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
};

export const goBack = () => {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
};

export const reset = (routeName: keyof RootStackParamList) => {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name: routeName }],
    });
  }
};
```

### navigation/RootNavigator.tsx（根导航）

```ts
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { SplashScreen } from '../screens/common/SplashScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { AppTabs } from './AppTabs';
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const screenOptions = {
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.primary,
  headerTitleStyle: { color: colors.text, fontWeight: '600' as const },
  headerShadowVisible: false,
};

export function RootNavigator(): React.JSX.Element {
  const [splashVisible, setSplashVisible] = useState(true);
  const token = useAuthStore(state => state.token);
  const hydrated = useAuthStore(state => state.hydrated);

  // 模拟启动页
  useEffect(() => {
    const timer = setTimeout(() => setSplashVisible(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (splashVisible) {
    return <SplashScreen />;
  }

  //hydration 完成后才能判断登录态
  if (!hydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {token ? (
        <Stack.Screen
          name="Main"
          component={AppTabs}
          options={{ headerShown: false }}
        />
      ) : (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
```

### navigation/AppTabs.tsx（底部标签导航）

```ts
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialIcons from '@react-native-vector-icons/material-design-icons';

import { HomeScreen } from '../screens/home/HomeScreen';
import { MineScreen } from '../screens/mine/MineScreen';
import { colors } from '../theme';
import type { BottomTabParamList, BottomTabScreenProps } from './types';

const Tab = createBottomTabNavigator<BottomTabParamList>();

export function AppTabs(): React.JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
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

// 使用示例：在业务页面中使用
// type Props = BottomTabScreenProps<'Home'>;
```

### navigation/index.ts（统一导出）

```ts
export { RootNavigator } from './RootNavigator';
export { AppTabs } from './AppTabs';
export { navigationRef, navigate, goBack, reset } from './navigationRef';
export type { RootStackParamList, BottomTabParamList } from './types';
export type {
  RootStackScreenProps,
  BottomTabScreenProps,
} from './types';
```

## 页面使用示例

### 登录页跳转到首页

```ts
import { useAuthStore } from '../store/authStore';
import { navigate } from '../navigation/navigationRef';

const handleLoginSuccess = () => {
  navigate('Main');
};
```

### Tab 内页面跳转到其他页面

```ts
import type { BottomTabScreenProps } from '../navigation/types';

type Props = BottomTabScreenProps<'Home'>;

export function HomeScreen({ navigation }: Props): React.JSX.Element {
  const handlePress = () => {
    navigation.navigate('Profile');
  };

  return (
    <View>
      <Text>首页</Text>
      <Button onPress={handlePress}>查看个人资料</Button>
    </View>
  );
}
```

## 主题配置

```ts
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { colors } from '../theme';

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.primary,
  },
};

// 使用
<NavigationContainer theme={navigationTheme}>
  <RootNavigator />
</NavigationContainer>
```

## 常见问题

- **导航类型报错**：确保 types.ts 中定义了所有路由名称
- **跳转后状态不更新**：在 RootNavigator 中根据 token 动态渲染
- **底部 Tab 不显示**：检查 Tab.Navigator 是否在 Stack.Navigator 内部正确嵌套
