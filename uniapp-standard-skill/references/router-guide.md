# 路由规范

## 1. 路由配置

### 1.1 pages.json 结构

```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "首页",
        "navigationStyle": "custom",
        "enablePullDownRefresh": false,
        "backgroundColor": "#f8f9fa"
      }
    },
    {
      "path": "pages/login/index",
      "style": {
        "navigationBarTitleText": "登录"
      }
    }
  ],
  "globalStyle": {
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "应用名称",
    "navigationBarBackgroundColor": "#ffffff",
    "backgroundColor": "#f8f9fa"
  },
  "tabBar": {
    "color": "#999999",
    "selectedColor": "#1CC8C4",
    "borderStyle": "white",
    "backgroundColor": "#ffffff",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页"
      },
      {
        "pagePath": "pages/my/index",
        "text": "我的"
      }
    ]
  }
}
```

### 1.2 自定义导航栏

```json
{
  "path": "pages/index/index",
  "style": {
    "navigationStyle": "custom",
    "enablePullDownRefresh": true
  }
}
```

## 2. 路由跳转

### 2.1 跳转方法

| 方法 | 用途 | 特点 |
|------|------|------|
| `switchTab` | 跳转 TabBar 页面 | 关闭其他所有页面 |
| `navigateTo` | 普通页面跳转 | 保留当前页面 |
| `redirectTo` | 关闭当前页面跳转 | 关闭当前页面 |
| `reLaunch` | 关闭所有页面跳转 | 重新打开应用 |

### 2.2 跳转封装

```typescript
// src/utils/router.ts

type NavigateType = 'navigateTo' | 'redirectTo' | 'switchTab' | 'reLaunch';

interface NavigateOptions {
  type?: NavigateType;
  url: string;
  params?: Record<string, any>;
}

function navigateTo(options: NavigateOptions): Promise<void> {
  const { type = 'navigateTo', url, params } = options;

  let fullUrl = url;
  if (params && Object.keys(params).length > 0) {
    const query = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');
    fullUrl += `?${query}`;
  }

  return new Promise((resolve, reject) => {
    uni[type]({
      url: fullUrl,
      success: () => resolve(),
      fail: (err) => reject(err),
    });
  });
}

// 便捷方法
export const router = {
  push: (url: string, params?: Record<string, any>) =>
    navigateTo({ type: 'navigateTo', url, params }),

  replace: (url: string, params?: Record<string, any>) =>
    navigateTo({ type: 'redirectTo', url, params }),

  pushTab: (url: string) =>
    navigateTo({ type: 'switchTab', url }),

  reLaunch: (url: string, params?: Record<string, any>) =>
    navigateTo({ type: 'reLaunch', url, params }),

  back: (delta: number = 1) => {
    uni.navigateBack({ delta });
  },
};
```

### 2.3 使用示例

```typescript
import { router } from '@/utils/router';

// 跳转页面
router.push('/pages/detail/index', { id: 123 });

// 关闭当前页跳转
router.replace('/pages/login/index');

// 跳转 TabBar
router.pushTab('/pages/index/index');

// 返回上一页
router.back();

// 重新应用
router.reLaunch('/pages/index/index');
```

## 3. 路由参数

### 3.1 参数接收

```typescript
// pages/detail/index.vue
<script setup lang="ts">
onLoad((options) => {
  const id = options.id;
  const type = options.type;
});
</script>
```

### 3.2 类型化参数

```typescript
// src/types/router.d.ts

interface PageParams {
  'pages/detail/index': { id: number; type?: string };
  'pages/user/profile': { userId: number };
  'pages/goods/detail': { goodsId: string; from?: string };
}

type PagePath = keyof PageParams;
type PageParamsOf<T extends PagePath> = PageParams[T];

// 封装带类型提示的跳转
function goToDetail(id: number, type?: string) {
  router.push('/pages/detail/index', { id, type });
}
```

## 4. 路由守卫

### 4.1 页面守卫

```typescript
// src/utils/router-guard.ts

interface RouteGuardOptions {
  requireAuth?: boolean;
  requireVIP?: boolean;
  title?: string;
}

// 路由白名单（无需登录即可访问）
const whiteList = [
  '/pages/index/index',
  '/pages/login/index',
  '/pages/register/index',
];

export function setupRouteGuard() {
  // 页面跳转前
  uni.addInterceptor('navigateTo', {
    invoke({ url }) {
      return handleRoute(url);
    },
  });

  uni.addInterceptor('redirectTo', {
    invoke({ url }) {
      return handleRoute(url);
    },
  });
}

function handleRoute(url: string): boolean {
  const path = url.split('?')[0];

  // 白名单直接放行
  if (whiteList.includes(path)) {
    return true;
  }

  // 检查登录态
  const token = uni.getStorageSync('token');
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    uni.navigateTo({ url: '/pages/login/index' });
    return false;
  }

  return true;
}
```

### 4.2 使用

```typescript
// src/main.ts
import { setupRouteGuard } from '@/utils/router-guard';

setupRouteGuard();

App({
  onLaunch() {
    // 应用启动
  },
});
```

## 5. 分包配置

### 5.1 分包结构

```
pages/
├── index/              # 主包页面
├── login/
└── my/
pages-sub/              # 分包
├── detail/            # 详情模块
├── user/              # 用户模块
│   ├── profile/
│   └── settings/
└── order/             # 订单模块
```

### 5.2 分包配置

```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": { "navigationBarTitleText": "首页" }
    }
  ],
  "subPackages": [
    {
      "root": "pages-sub/detail/",
      "pages": [
        {
          "path": "index",
          "style": { "navigationBarTitleText": "详情" }
        }
      ]
    },
    {
      "root": "pages-sub/user/",
      "pages": [
        { "path": "profile", "style": { "navigationBarTitleText": "资料" } },
        { "path": "settings", "style": { "navigationBarTitleText": "设置" } }
      ]
    }
  ],
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["pages-sub/detail"]
    }
  }
}
```

### 5.3 分包跳转

```typescript
// 分包页面路径需要写全路径
router.push('/pages-sub/detail/index', { id: 1 });

// 或者使用绝对路径（相对于 root）
router.push('/detail/index', { id: 1 });
```

## 6. 最佳实践

### 6.1 路径规范

```typescript
// ✅ 正确：使用简写
router.push('/pages/index/index');

// ❌ 错误：使用完整路径
router.push('/pages/index/index');

// ✅ 正确：统一使用 router 封装
import { router } from '@/utils/router';

// ❌ 错误：直接使用 uni.navigateTo
uni.navigateTo({ url: '/pages/index/index' });
```

### 6.2 参数规范

```typescript
// ✅ 正确：参数命名清晰
router.push('/pages/detail', { goodsId: '123', from: 'home' });

// ❌ 错误：参数无意义
router.push('/pages/detail', { a: '1', b: '2' });

// ✅ 正确：使用类型定义
interface DetailParams {
  goodsId: string;
  from?: string;
}
```

### 6.3 页面标题

```typescript
// 动态设置标题
onShow(() => {
  uni.setNavigationBarTitle({ title: '详情页' });
});

// 页面间传递标题
router.push('/pages/detail/index', {
  id: 1,
  _title: '商品详情'
});

// detail/index.vue
onLoad((options) => {
  if (options._title) {
    uni.setNavigationBarTitle({ title: options._title });
  }
});
```

## 7. 路由表

```typescript
// src/constants/routes.ts

export const ROUTES = {
  INDEX: '/pages/index/index',
  LOGIN: '/pages/login/index',
  REGISTER: '/pages/register/index',
  MY: '/pages/my/index',
  DETAIL: '/pages-sub/detail/index',
  USER_PROFILE: '/pages-sub/user/profile',
  USER_SETTINGS: '/pages-sub/user/settings',
} as const;

// 使用
router.push(ROUTES.DETAIL, { id: 1 });
```
