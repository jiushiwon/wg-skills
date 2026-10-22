---
name: vue-loading-skill
description: Vue 加载状态组件技能。包含骨架屏、按钮加载、全屏遮罩、图片占位。
trigger: |
  做一个加载状态 | 做一个骨架屏 | 做一个按钮loading | 做一个加载遮罩
  做一个图片占位 | 做一个列表骨架屏 | 做一个卡片骨架屏
  做一个loading动画 | 做一个加载占位
---

# vue-loading-skill

> Vue 加载状态组件技能。基于 Vue主题-skill 的 Token 实现，零第三方组件库。

## 核心组件

| 组件 | 说明 |
|------|------|
| **base-loading** | 通用加载指示器（spin/dots/pulse） |
| **base-skeleton** | 骨架屏（表格/卡片/头像/段落） |
| **base-loading-mask** | 全屏加载遮罩 |

## 模式矩阵

| 模式 | 类型 | 场景 |
|------|------|------|
| `base-loading` | spin/dots/pulse | 按钮内、全屏、局部 |
| `base-skeleton` | avatar/paragraph/table/card | 数据加载占位 |
| `base-loading-mask` | fullscreen | 页面/接口请求中 |

## 文件结构

```
vue-loading-skill/
├── SKILL.md
├── README.md
├── base-loading.md
├── types/
│   └── loading.ts
├── templates/
│   ├── BaseLoading.vue
│   ├── BaseSkeleton.vue
│   ├── BaseLoadingMask.vue
│   └── index.ts
└── demo-components/
    └── base-loading/
        └── html/01-all-modes.html
```

## 使用示例

### 1. 按钮加载
```vue
<base-button :loading="submitting" @click="handleSubmit">
  提交
</base-button>
```

### 2. 骨架屏列表
```vue<base-skeleton type="paragraph" :rows="3" />
<base-skeleton type="table" :columns="4" :rows="5" />
```

### 3. 全屏遮罩
```vue<base-loading-mask :visible="loading" text="提交中..." />
```

## 容器原则

> 加载组件是**状态组件**，不直接展示数据，需嵌入 base-card 或业务组件内使用。

```vue
<base-card title="用户列表">
  <!-- 加载中 -->
  <template v-if="loading">
    <base-skeleton type="table" :columns="3" :rows="5" />
  </template>
  <!-- 正常内容 -->
  <template v-else>
    <base-table :data="list" />
  </template>
</base-card>
```

✅ 正确：嵌入 base-card
❌ 错误：直接放在页面根目录

## 设计 Token

```css
.base-loading__spin {
  width: var(--loading-size-md, 20px);
  height: var(--loading-size-md, 20px);
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: loading-spin 0.8s linear infinite;
}

.base-skeleton {
  background: linear-gradient(
    90deg,
    var(--color-bg-secondary) 25%,
    var(--color-bg) 50%,
    var(--color-bg-secondary) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}
```

**禁止硬编码任何颜色 / 间距 / 动画时长值。**

## 第三方组件库

❌ 禁止 Element Plus / Naive UI / Ant Design Vue / Vuetify / PrimeVue。
