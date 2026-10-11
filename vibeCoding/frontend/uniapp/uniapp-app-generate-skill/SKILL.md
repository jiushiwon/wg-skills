---
name: uniapp-app-generate-skill
description: UniApp 三端项目初始化技能。面向零基础小白，从想法到可上线的 uni-app + Vue3 + TypeScript + Pinia 项目，包含动态主题系统、静态资源生成、布局设计、三端差异处理（小程序/H5/App）。触发词：帮我做一个 uniapp 小程序、初始化 uniapp 项目、uniapp 三端应用、微信小程序构建、小程序生成、App 打包。
---

# UniApp 三端项目初始化技能

将模糊的小程序想法转化为生产级的 uni-app 项目，统一架构、设计令牌、静态资源、编码标准。

## 核心能力

| 能力 | 说明 |
|------|------|
| **四阶段工作流** | 需求 → 初始化 → 开发 → 交付 |
| **动态主题系统** | 单色系生成 50~900 调色板 |
| **静态资源** | TabBar 图标 + 占位图 |
| **三端兼容** | 小程序 / H5 / App 一套代码 |
| **平台抽象层** | 登录/分享/图片统一封装 |

## 三端差异处理

### 1.1 小程序 vs H5 vs App 核心差异

| 维度 | 小程序 | H5 | App |
|------|--------|-----|-----|
| **渲染方式** | 微信WebView | 浏览器 | 原生渲染 |
| **API** | wx.xxx | browser APIs | plus.xxx |
| **路由** | wx.navigateTo | history API | native navigation |
| **登录** | wx.login | OAuth | OAuth / 第三方 SDK |
| **支付** | wx.requestPayment | 微信 JSAPI | 第三方 SDK |
| **推送** | 订阅消息 | Web Push | 推送 SDK |
| **发布** | 微信后台 | CDN | 应用商店 |

### 1.2 条件编译

```vue
<!-- #ifdef MP-WEIXIN -->
<text>微信小程序特有</text>
<!-- #endif -->

<!-- #ifdef H5 -->
<text>H5 特有</text>
<!-- #endif -->

<!-- #ifdef APP-PLUS -->
<text>App 特有</text>
<!-- #endif -->
```

### 1.3 平台判断

```typescript
// src/utils/platform.ts
export const isMpWeixin = () => {
  // #ifdef MP-WEIXIN
  return true;
  // #endif
  return false;
};

export const isH5 = () => {
  // #ifdef H5
  return true;
  // #endif
  return false;
};

export const isApp = () => {
  // #ifdef APP-PLUS
  return true;
  // #endif
  return false;
};
```

### 1.4 打包命令差异

| 平台 | 开发命令 | 打包命令 |
|------|---------|---------|
| 微信小程序 | `npm run dev:mp-weixin` | `npm run build:mp-weixin` |
| H5 | `npm run dev:h5` | `npm run build:h5` |
| App (Android) | `npm run dev:app-plus` | `npm run build:app-plus` |
| App (iOS) | - | HBuilderX 打包 |

## 工作流程

### Phase 1: 需求确认

问用户 3-5 个关键问题：
1. 小程序解决什么问题？目标用户是谁？
2. 核心功能有哪些？列出 3-5 个核心页面
3. 倾向哪种视觉风格？清新健康 / 极简工具 / 活泼社区 / 商务数据
4. 底部 TabBar 需要几个入口？
5. 是否需要用户登录？

### Phase 2: 项目初始化

1. 复制 boilerplate 模板
2. 替换占位符（项目名、描述）
3. 创建标准目录结构
4. 生成 CLAUDE.md / AGENTS.md

### Phase 3: 主题系统

1. 询问主题配置（主色/成功/警告/错误色）
2. 生成 theme.json
3. 运行 `npm run theme:sync`
4. 验证 `npm run theme:check`

### Phase 4: 开发

1. 布局设计（TabBar + 页面）
2. 核心页面（首页/列表/详情/我的）
3. 公共组件（AppButton/AppCard/AppInput 等）
4. 状态管理（Pinia）

### Phase 5: 三端适配

1. 处理登录差异（小程序 wx.login / H5 OAuth / App 第三方）
2. 处理分享差异（小程序 onShareAppMessage / H5 Web Share API / App plus.share）
3. 处理支付差异
4. 条件编译特殊逻辑

### Phase 6: 交付

1. 运行 `npm run lint`
2. 验证各端打包
3. 检查清单

## 触发关键词

```
帮我做一个 uniapp 小程序
初始化 uniapp 项目
uniapp 三端应用
微信小程序构建
小程序生成
App 打包
用 uniapp 搭建一个 xxx 小程序
```

## 相关技能

- uniapp-base-skill：基础组件库
- uniapp-theme-skill：主题系统
- uniapp-style-skill：样式规范
- uniapp-auth-skill：认证模块
- uniapp-request-skill：请求层

## 不做

- 不写死平台特定代码（用条件编译）
- 不使用 H5 标签（div/span/p 等）
- 不使用浏览器 API（fetch/window/document）
- 不使用 CSS 自定义属性（var()）
- 不使用 off-scale 颜色
