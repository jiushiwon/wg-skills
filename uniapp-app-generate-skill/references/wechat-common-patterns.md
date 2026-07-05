# 微信小程序常见模式

> 本参考文档汇总微信小程序开发中最常用、最容易踩坑的几个模式：登录授权、用户信息、分享转发、分包加载、版本更新、支付、订阅消息等。供 `uniapp-app-generate-skill` 在生成项目时参考。

## 1. 登录与用户信息

### 1.1 推荐登录流程

微信小程序登录通常采用 **wx.login 获取 code → 后端换取 openid/session_key → 返回自定义 token → 前端缓存 token**。

```typescript
// src/utils/auth.ts
import { request } from './request';
import { storage } from './storage';

const TOKEN_KEY = 'app_token';

export async function wxLogin(): Promise<string | null> {
  return new Promise((resolve) => {
    uni.login({
      provider: 'weixin',
      success: async (res) => {
        if (res.code) {
          try {
            const { token } = await request.post('/api/auth/wx-login', { code: res.code });
            storage.set(TOKEN_KEY, token);
            resolve(token);
          } catch (err) {
            console.error('登录失败:', err);
            resolve(null);
          }
        } else {
          resolve(null);
        }
      },
      fail: () => resolve(null),
    });
  });
}

export function getToken(): string | null {
  return storage.get(TOKEN_KEY);
}

export function logout(): void {
  storage.remove(TOKEN_KEY);
}
```

### 1.2 获取用户信息

微信小程序自 2021 年后，已废弃 `wx.getUserInfo` 的静默获取能力。现在推荐方式：

- 使用 `button` 组件的 `open-type="chooseAvatar"` 获取头像；
- 使用 `nickname-input` 或 input 获取昵称；
- 不要一进入小程序就弹窗索取用户信息。

```vue
<button open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
  选择头像
</button>

<script setup lang="ts">
function onChooseAvatar(e: any) {
  const avatarUrl = e.detail.avatarUrl;
  // 上传头像到服务器
}
</script>
```

## 2. 分享转发

### 2.1 页面内分享

在页面 `onShareAppMessage` 中配置：

```typescript
onShareAppMessage(() => {
  return {
    title: '分享标题',
    path: '/pages/index/index?inviter=123',
    imageUrl: '/static/images/share-cover.png',
  };
});
```

### 2.2 全局默认分享

在 `App.vue` 中设置默认分享：

```vue
<script setup lang="ts">
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';

onShareAppMessage(() => ({
  title: '默认分享标题',
  path: '/pages/index/index',
}));

onShareTimeline(() => ({
  title: '默认朋友圈标题',
}));
</script>
```

注意：朋友圈分享需要小程序类目支持。

## 3. 分包加载

### 3.1 为什么分包

微信小程序主包体积限制为 **2MB**，整个小程序所有包合计 **20MB**。当业务增长时，必须使用分包。

### 3.2 pages.json 配置示例

```json
{
  "pages": [
    { "path": "pages/index/index" },
    { "path": "pages/profile/index" }
  ],
  "subPackages": [
    {
      "root": "pages-sub/order",
      "pages": [
        { "path": "list/index" },
        { "path": "detail/index" }
      ]
    },
    {
      "root": "pages-sub/setting",
      "pages": [
        { "path": "index/index" }
      ]
    }
  ],
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["pages-sub/order"]
    }
  }
}
```

### 3.3 分包页面跳转

```typescript
uni.navigateTo({ url: '/pages-sub/order/list/index' });
```

## 4. 版本更新

微信小程序启动时会检查更新。建议在 `App.vue` 中监听：

```typescript
import { onLaunch } from '@dcloudio/uni-app';

onLaunch(() => {
  const updateManager = uni.getUpdateManager();

  updateManager.onCheckForUpdate((res) => {
    console.log('是否有新版本:', res.hasUpdate);
  });

  updateManager.onUpdateReady(() => {
    uni.showModal({
      title: '更新提示',
      content: '新版本已准备好，是否重启应用？',
      success: (res) => {
        if (res.confirm) {
          updateManager.applyUpdate();
        }
      },
    });
  });
});
```

## 5. 微信支付

### 5.1 支付流程

1. 前端调用后端接口创建订单，返回 `timeStamp`、`nonceStr`、`package`、`signType`、`paySign`。
2. 前端调用 `uni.requestPayment`。

```typescript
interface PaymentParams {
  timeStamp: string;
  nonceStr: string;
  package: string;
  signType: string;
  paySign: string;
}

export function requestPayment(params: PaymentParams): Promise<any> {
  return new Promise((resolve, reject) => {
    uni.requestPayment({
      provider: 'wxpay',
      ...params,
      success: resolve,
      fail: reject,
    });
  });
}
```

## 6. 订阅消息

### 6.1 一次性订阅

```typescript
uni.requestSubscribeMessage({
  tmplIds: ['TEMPLATE_ID_1', 'TEMPLATE_ID_2'],
  success: (res) => {
    console.log('订阅结果:', res);
  },
});
```

### 6.2 长期订阅

长期订阅需要用户在设置中开启，适合服务通知类小程序。

## 7. 图片选择与上传

```typescript
export function chooseImage(count = 1): Promise<string[]> {
  return new Promise((resolve, reject) => {
    uni.chooseImage({
      count,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => resolve(res.tempFilePaths),
      fail: reject,
    });
  });
}

export function uploadFile(filePath: string, url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url,
      filePath,
      name: 'file',
      success: (res) => {
        const data = JSON.parse(res.data);
        resolve(data.url);
      },
      fail: reject,
    });
  });
}
```

## 8. 安全区与刘海屏适配

在 `App.vue` 或全局样式中处理：

```scss
/* 顶部安全区 */
.safe-area-top {
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
}

/* 底部安全区 */
.safe-area-bottom {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
```

## 9. 禁止事项

- 不要在一进入小程序就调用 `wx.getUserProfile` 索取用户信息。
- 不要把 `session_key` 传到前端。
- 不要在前端拼接支付签名。
- 不要滥用 `web-view` 绕过审核。
- 不要使用未经授权的第三方字体或图片资源。
