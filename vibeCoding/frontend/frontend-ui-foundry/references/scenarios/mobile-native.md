# 场景：原生移动（Mobile Native）

iOS / Android 原生 App，跨端框架（React Native / Flutter / uniapp）。**平台规范优先**。

---

## 适用

- iOS App（Swift / SwiftUI / React Native）
- Android App（Kotlin / Jetpack Compose / React Native）
- 跨端：uniapp / Taro / Flutter
- 小程序（用平台规范）

## 不适用

- 移动优先 Web（用 `mobile-responsive`）
- 桌面工具（用 `admin-dashboard`）
- 金融/支付关键应用（参考 `fintech-app` 的额外安全规范）

---

## 平台规范

### iOS Human Interface Guidelines

| 元素 | 规范 |
|------|------|
| 触摸目标 | ≥44×44pt |
| 字号（默认） | 17pt body / 11pt caption2 |
| 圆角 | 10-12pt（卡片）、连续圆角（squircle） |
| 状态栏 | 顶部 47pt（含 notch） |
| Home Indicator | 底部 34pt |
| 字体 | SF Pro |
| 动画 | spring physics / `dampingFraction: 0.8` |
| Tab Bar | 底部，高度 49pt + safe area |

### Material Design 3

| 元素 | 规范 |
|------|------|
| 触摸目标 | ≥48×48dp |
| 字号（默认） | 16sp body / 11sp label |
| 圆角 | 12-28dp（动态形状） |
| 状态栏 | 24dp |
| 导航栏 | 56dp / 64dp（中等/大） |
| 字体 | Roboto Flex / 系统 |
| 动画 | emphasized / standard / expressive |
| Bottom Nav | 80dp 高度 |

### 跨端策略

- **iOS 风**：用 SF Pro / 平台色，圆角偏大（12-16pt），手势密集
- **Android 风**：用 Roboto / Material 3 token，elevation 阴影，FAB
- **品牌一致**：自定义品牌色 + 平台原生组件混搭

---

## 核心组件

| 组件 | iOS | Android |
|------|-----|---------|
| **Navigation** | UINavigationController | Navigation Component |
| **Tab Bar** | UITabBar（底部 49pt） | BottomNavigationView（顶部/底部 80dp） |
| **List** | UITableView / UICollectionView | RecyclerView / LazyColumn |
| **Action Sheet** | UIActionSheet（底部） | BottomSheetDialogFragment |
| **Alert** | UIAlertController | MaterialAlertDialog |
| **Picker** | UIPickerView / Wheel | Material Date/Time Picker |
| **Toast / Snackbar** | 无原生（用 banner） | Snackbar（底部 4s 自动消失） |
| **FAB** | 无原生 | FloatingActionButton |
| **Pull to Refresh** | UIRefreshControl | SwipeRefreshLayout |
| **Search Bar** | UISearchController | SearchView / SearchBar |

---

## iOS 布局示例

```swift
// SwiftUI 示例
struct HomeView: View {
    var body: some View {
        NavigationStack {
            ScrollView {
                LazyVStack(spacing: 16) {
                    ForEach(items) { item in
                        ItemCard(item: item)
                            .padding(.horizontal, 16)
                    }
                }
                .padding(.top, 8)
            }
            .navigationTitle("首页")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button(action: add) {
                        Image(systemName: "plus")
                    }
                }
            }
        }
    }
}
```

```css
/* iOS 移动 Web 模拟 */
:root {
  --safe-area-top: env(safe-area-inset-top, 47px);
  --safe-area-bottom: env(safe-area-inset-bottom, 34px);
  --tab-bar-height: 49px;
}

.ios-status-bar {
  height: var(--safe-area-top);
  background: var(--color-surface-elevated);
}

.ios-content {
  padding: 16px;
  padding-bottom: calc(var(--tab-bar-height) + var(--safe-area-bottom) + 16px);
}

.ios-tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: calc(var(--tab-bar-height) + var(--safe-area-bottom));
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: saturate(180%) blur(20px);
  border-top: 0.5px solid var(--color-border);
  padding-bottom: var(--safe-area-bottom);
  display: flex;
  justify-content: space-around;
}

.ios-tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-size: 10pt;
  color: var(--color-on-surface-muted);
  min-height: 49px;  /* 触摸目标 */
}

.ios-tab-item.active {
  color: var(--color-primary);
}

.ios-tab-item.active .tab-icon {
  /* iOS tab 选中时图标本身变色，无背景 */
}
```

---

## Android Material 3 布局示例

```kotlin
// Jetpack Compose
@Composable
fun HomeScreen() {
    Scaffold(
        topBar = { TopAppBar(title = { Text("首页") }) },
        bottomBar = { BottomNavigation { ... } },
        floatingActionButton = {
            FloatingActionButton(onClick = { /* 添加 */ }) {
                Icon(Icons.Default.Add, "添加")
            }
        }
    ) { padding ->
        LazyColumn(modifier = Modifier.padding(padding)) {
            items(items) { item ->
                ItemCard(item = item, modifier = Modifier.padding(16.dp))
            }
        }
    }
}
```

```css
/* Material 3 移动 Web 模拟 */
:root {
  --md-status-bar: 24dp;  /* 24px */
  --md-nav-bar: 64dp;     /* 64px */
  --md-bottom-nav: 80dp;  /* 80px */
  --md-elevation-1: 0 1px 2px rgba(0,0,0,0.30), 0 1px 3px 1px rgba(0,0,0,0.15);
  --md-elevation-2: 0 1px 2px rgba(0,0,0,0.30), 0 2px 6px 2px rgba(0,0,0,0.15);
  --md-elevation-3: 0 1px 3px rgba(0,0,0,0.30), 0 4px 8px 3px rgba(0,0,0,0.15);
}

.md-top-app-bar {
  height: 64px;
  background: var(--color-surface);
  box-shadow: var(--md-elevation-1);
  display: flex;
  align-items: center;
  padding: 0 16px;
}

.md-fab {
  position: fixed;
  right: 16px;
  bottom: calc(80px + 16px);
  width: 56px;
  height: 56px;
  border-radius: 16px;  /* M3 FAB 圆角 */
  background: var(--color-primary-container);
  color: var(--color-on-primary-container);
  box-shadow: var(--md-elevation-3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.md-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: var(--color-surface);
  box-shadow: var(--md-elevation-2);
}
```

---

## 跨端最佳实践（uniapp / RN）

### uniapp 示例

```vue
<template>
  <view class="page">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }" />
    <view class="top-bar">
      <text class="title">首页</text>
    </view>
    <scroll-view class="content" scroll-y>
      <view class="card" v-for="item in items" :key="item.id">
        {{ item.name }}
      </view>
    </scroll-view>
    <view class="tab-bar safe-area-bottom">
      <view class="tab-item active">首页</view>
      <view class="tab-item">我的</view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      statusBarHeight: uni.getSystemInfoSync().statusBarHeight,
      items: [],
    };
  },
  // 平台特定样式
  // #ifdef MP-WEIXIN
  // #endif
};
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--color-surface);
}
.top-bar {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.content {
  height: calc(100vh - 44px - 50px - env(safe-area-inset-bottom));
  padding: 16px;
}
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: var(--color-surface-elevated);
  display: flex;
  border-top: 1px solid var(--color-border);
}
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
```

### React Native 示例

```tsx
import { SafeAreaView, Platform } from 'react-native';

const TabBar = () => (
  <SafeAreaView
    edges={['bottom']}
    style={{
      flexDirection: 'row',
      backgroundColor: '#fff',
      borderTopWidth: Platform.OS === 'ios' ? 0.5 : 1,
      borderTopColor: '#e5e5e5',
    }}
  >
    <TabItem icon="home" label="首页" active />
    <TabItem icon="user" label="我的" />
  </SafeAreaView>
);
```

---

## 关键 Token 偏向

```css
/* iOS 字号（pt） */
--font-size-ios-body: 17px;
--font-size-ios-callout: 16px;
--font-size-ios-subhead: 15px;
--font-size-ios-footnote: 13px;
--font-size-ios-caption: 12px;

/* Android 字号（sp） */
--font-size-md-body: 16sp;
--font-size-md-label-large: 14sp;
--font-size-md-title: 22sp;

/* 触摸目标 */
--touch-ios: 44px;
--touch-android: 48px;

/* 圆角平台差异 */
--radius-ios-card: 10px;
--radius-ios-button: 8px;
--radius-md-card: 12px;
--radius-md-button: 20px;  /* M3 pill 按钮 */
```

---

## 推荐调色板

- **原生移动**（iOS / Material 系统色）— 默认
- **冷调极简** — 工具型 App
- **暖色商务** — 电商
- **金融稳重** — 银行、支付

---

## 反模式

- ❌ 跨端不做平台适配（同一套 iOS 风在 Android 上违和）
- ❌ 触摸目标 < 44pt
- ❌ 字号 < 12pt（无障碍问题）
- ❌ 缺少状态栏/安全区处理
- ❌ 装饰性动效（原生 App 要克制）
- ❌ 渐变文字
- ❌ 紫色渐变 + 白色
- ❌ 强制横屏或竖屏（除非必要）
- ❌ 拦截系统手势（返回滑动等）
- ❌ 用 emoji 作图标（用 SVG）

---

## iOS vs Android 设计选择

| 决策 | iOS 优先 | Android 优先 | 跨端统一 |
|------|---------|-------------|---------|
| 导航位置 | 底部 Tab | 顶部 Nav + 底部 FAB | 品牌决定 |
| 返回 | 左滑手势 | 系统返回键 | 跨端需同时支持 |
| 圆角 | squircle (10pt) | M3 形状（12-28dp） | 12-16px 居中 |
| 字体 | SF Pro | Roboto Flex | 平台系统字体 |
| 主色 | 系统蓝 | Material You | 品牌色 + 平台色 |
| 主题 | 浅/深切换 | 动态取色 | 支持深色 + 平台特性 |

---

## 验证清单

- [ ] 触摸目标 ≥44pt（iOS）/ 48dp（Android）
- [ ] 安全区正确处理
- [ ] 状态栏不重叠
- [ ] 字号 ≥12pt
- [ ] 返回手势/按钮可用
- [ ] 减弱动效模式
- [ ] 系统字体（除非品牌字体）
- [ ] 平台组件原生感
- [ ] 横屏 / 竖屏适配
- [ ] 暗色模式支持
- [ ] 没有 AI slop
