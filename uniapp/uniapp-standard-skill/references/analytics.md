# 埋点规范

## 1. 埋点类型

### 1.1 埋点分类

| 类型 | 说明 | 示例 |
|------|------|------|
| **曝光埋点** | 页面/组件展示 | 页面曝光、弹窗曝光 |
| **点击埋点** | 用户点击行为 | 按钮点击、Tab切换 |
| **停留埋点** | 页面停留时长 | 页面停留时间 |
| **事件埋点** | 自定义业务事件 | 登录成功、下单成功 |

### 1.2 数据结构

```typescript
interface TrackEvent {
  event: string;           // 事件名称
  params?: Record<string, any>;  // 事件参数
  timestamp?: number;      // 时间戳
  userId?: string;         // 用户ID
  deviceId?: string;       // 设备ID
  appVersion?: string;     // App版本
  platform?: string;       // 平台
}
```

## 2. 埋点SDK封装

### 2.1 基础封装

```typescript
// src/utils/analytics.ts

interface TrackOptions {
  event: string;
  params?: Record<string, any>;
}

class Analytics {
  private appVersion: string;
  private deviceId: string;

  constructor() {
    this.appVersion = uni.getSystemInfoSync().appVersion;
    this.deviceId = this.getDeviceId();
  }

  private getDeviceId(): string {
    let deviceId = uni.getStorageSync('device_id');
    if (!deviceId) {
      deviceId = 'device_' + Date.now() + Math.random().toString(36).substr(2);
      uni.setStorageSync('device_id', deviceId);
    }
    return deviceId;
  }

  private getUserInfo() {
    try {
      const userInfo = uni.getStorageSync('user_info');
      return userInfo ? JSON.parse(userInfo) : null;
    } catch {
      return null;
    }
  }

  track(options: TrackOptions): void {
    const userInfo = this.getUserInfo();

    const data: Record<string, any> = {
      event: options.event,
      timestamp: Date.now(),
      platform: 'mp-weixin',
      app_version: this.appVersion,
      device_id: this.deviceId,
      ...options.params,
    };

    if (userInfo) {
      data.user_id = userInfo.id;
    }

    // 上报数据
    this.report(data);
  }

  private report(data: Record<string, any>): void {
    // 根据项目选择上报方式
    // 方式1：直接请求
    // uni.request({ url: '/api/track', method: 'POST', data });

    // 方式2：先缓存再批量上报
    this.cacheEvent(data);

    console.log('[Analytics]', data);
  }

  private cacheEvent(event: Record<string, any>): void {
    const events = uni.getStorageSync('analytics_cache') || [];
    events.push(event);
    uni.setStorageSync('analytics_cache', events);

    // 达到阈值自动上报
    if (events.length >= 10) {
      this.flush();
    }
  }

  flush(): void {
    const events = uni.getStorageSync('analytics_cache') || [];
    if (events.length === 0) return;

    // 上报并清空
    // await uni.request({ url: '/api/track/batch', data: { events } });
    uni.removeStorageSync('analytics_cache');

    console.log('[Analytics] Flush:', events.length, 'events');
  }
}

export const analytics = new Analytics();
```

### 2.2 便捷方法

```typescript
// src/utils/analytics.ts

export const analytics = {
  // 页面曝光
  pageView(pageName: string, params?: Record<string, any>) {
    this.track({ event: 'page_view', params: { page_name: pageName, ...params } });
  },

  // 点击事件
  click(eventName: string, params?: Record<string, any>) {
    this.track({ event: 'click', params: { event_name: eventName, ...params } });
  },

  // 自定义事件
  event(eventName: string, params?: Record<string, any>) {
    this.track({ event: eventName, params });
  },

  // 停留时长（需要配合页面生命周期）
  stay(pageName: string, duration: number) {
    this.track({
      event: 'page_stay',
      params: { page_name: pageName, duration },
    });
  },

  // 登录成功
  loginSuccess(method: string) {
    this.track({ event: 'login_success', params: { method } });
  },

  // 通用追踪
  track(options: TrackOptions) {
    // ...
  },
};
```

## 3. 使用规范

### 3.1 页面曝光（需等待隐私授权）

```typescript
// pages/index/index.vue
<script setup lang="ts">
import { analytics } from '@/utils/analytics';
import { checkAnalyticsConsent } from '@/utils/privacy';

onShow(async () => {
  const consented = await checkAnalyticsConsent();
  if (consented) {
    analytics.pageView('首页');
  }
});
</script>
```

### 3.2 点击事件

```typescript
// 方式1：方法内埋点
function handleClick() {
  // 业务逻辑
  analytics.click('首页_ banner_点击', { banner_id: 1 });
}

// 方式2：使用装饰器（如果项目支持）
@click('首页_按钮_点击')
function handleClick() {
  // 业务逻辑
}
```

### 3.3 停留时长

```typescript
// pages/detail/index.vue
<script setup lang="ts">
import { analytics } from '@/utils/analytics';

const pageName = '详情页';
let startTime = 0;

onShow(() => {
  startTime = Date.now();
});

onHide(() => {
  const duration = Date.now() - startTime;
  analytics.stay(pageName, duration);
});

onUnmounted(() => {
  const duration = Date.now() - startTime;
  analytics.stay(pageName, duration);
});
</script>
```

### 3.4 批量页面曝光

```typescript
// 自定义指令
const pageViews = new Set<string>();

export function trackPageView(pagePath: string) {
  if (pageViews.has(pagePath)) return;
  pageViews.add(pagePath);
  analytics.pageView(pagePath);
}

// main.ts 中全局使用
uni.addInterceptor('navigateTo', {
  success({ url }) {
    const page = url.split('?')[0];
    trackPageView(page);
  },
});
```

## 4. 事件命名规范

### 4.1 命名规则

```
页面_位置_动作
```

| 部分 | 说明 | 示例 |
|------|------|------|
| 页面 | 页面名称 | 首页、详情页、个人中心 |
| 位置 | 页面内位置 | 顶部导航、轮播图、商品列表 |
| 动作 | 用户动作 | 点击、曝光、停留 |

### 4.2 常用事件

```typescript
// 页面相关
'page_view'           // 页面曝光
'page_stay'           // 页面停留

// 点击相关
'click_banner'       // Banner点击
'click_button'       // 按钮点击
'click_tab'          // Tab切换
'click_goods'        // 商品点击

// 业务相关
'login_success'      // 登录成功
'login_fail'         // 登录失败
'register_success'   // 注册成功
'share_success'      // 分享成功
'pay_success'        // 支付成功

// 错误相关
'js_error'           // JS错误
'api_error'          // 接口错误
'request_timeout'   // 请求超时
```

## 5. 参数规范

### 5.1 通用参数

```typescript
interface CommonParams {
  user_id?: number;       // 用户ID
  device_id?: string;     // 设备ID
  app_version?: string;   // App版本
  platform?: string;      // 平台
  network?: string;       // 网络类型
  os_version?: string;    // 操作系统版本
}
```

### 5.2 页面参数

```typescript
interface PageParams {
  page_name: string;      // 页面名称
  page_path?: string;     // 页面路径
  referrer?: string;       // 来源页面
  stay_duration?: number;  // 停留时长(ms)
}
```

### 5.3 点击参数

```typescript
interface ClickParams {
  event_name: string;     // 事件名称
  element_id?: string;     // 元素ID
  element_text?: string;   // 元素文本
  position?: string;       // 位置描述
  category?: string;       // 分类
}
```

## 6. 合规要求

### 6.1 隐私合规

```typescript
// ✅ 正确：脱敏处理
analytics.click('login_success', {
  user_id: userId,  // 业务需要可保留
});

// ❌ 错误：上报敏感信息
analytics.click('login_success', {
  password: '123456',  // 禁止
  id_card: '110101...',  // 禁止
});

// ✅ 正确：用户授权后埋点
function trackWithConsent(event: string, params?: Record<string, any>) {
  const consent = uni.getStorageSync('analytics_consent');
  if (consent) {
    analytics.track({ event, params });
  }
}
```

### 6.2 权限申请

```typescript
// 微信小程序隐私协议
function requestPrivacyAuthorization() {
  return new Promise((resolve) => {
    uni.getPrivacyAuthorizationState({
      success(res) {
        resolve(res.authState);
      },
      fail() {
        resolve('denied');
      },
    });
  });
}

// 检查埋点授权状态（供页面曝光等场景调用）
export async function checkAnalyticsConsent(): Promise<boolean> {
  const state = await requestPrivacyAuthorization();
  return state === 'authorized';
}
```

## 7. 调试与验证

### 7.1 开发环境调试

```typescript
// 开发环境打印日志
if (process.env.NODE_ENV === 'development') {
  console.log('[Analytics]', event, params);
}
```

### 7.2 验证工具

```typescript
// 导出缓存的事件用于调试
export function getCachedEvents() {
  return uni.getStorageSync('analytics_cache') || [];
}

// 手动触发上报
export function flushEvents() {
  analytics.flush();
}
```

## 8. 最佳实践

| 实践 | 说明 |
|------|------|
| 统一入口 | 所有埋点通过 `analytics` 对象，禁止直接 `uni.request` |
| 批量上报 | 达到阈值自动上报，减少请求 |
| 脱敏处理 | 禁止上报敏感信息 |
| 延迟初始化 | 隐私授权后再初始化埋点，页面曝光需等 consent 通过 |
| 降级处理 | 上报失败不影响主业务 |
