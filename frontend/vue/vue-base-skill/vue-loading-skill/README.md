# vue-loading-skill

> Vue 加载状态组件技能

## 安装

```bash
# 复制到你的项目
cp -r vue-loading-skill/templates/* src/components/
```

## 快速开始

### 1. 引入组件

```typescript
import { BaseLoading, BaseSkeleton, BaseLoadingMask } from '@/components/loading'
```

### 2. 按钮加载

```vue
<base-button :loading="loading" @click="submit">
  提交
</base-button>
```

### 3. 骨架屏（嵌入 base-card）

```vue
<base-card title="用户列表">
  <!-- 加载中显示骨架屏 -->
  <template v-if="loading">
    <base-skeleton type="table" :columns="3" :rows="5" />
  </template>
  <!-- 正常内容 -->
  <template v-else>
    <base-table :data="list" />
  </template>
</base-card>
```

### 4. 全屏遮罩

```vue
<base-loading-mask :visible="loading" text="提交中..." />
```

## 容器原则

> 加载组件是**状态组件**，必须嵌入 base-card 或业务组件内使用。

✅ 正确：
```vue
<base-card title="商品列表">
  <base-skeleton v-if="loading" type="table" :rows="5" />
  <base-table v-else :data="products" />
</base-card>
```

❌ 错误（直接暴露）：
```vue
<!-- loading 组件不应直接放在页面根 -->
<base-skeleton type="paragraph" />
```

## 组件列表

| 组件 | 说明 |
|------|------|
| BaseLoading | 加载动画（spin/dots/pulse） |
| BaseSkeleton | 骨架屏（avatar/paragraph/table/card） |
| BaseLoadingMask | 全屏加载遮罩 |

## 依赖

- vue-theme-skill（CSS 变量）
- vue-button-skill（按钮加载）
