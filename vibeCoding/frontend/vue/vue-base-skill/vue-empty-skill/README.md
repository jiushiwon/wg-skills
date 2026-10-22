# vue-empty-skill

> Vue 空状态组件技能

## 安装

```bash
# 复制到你的项目
cp -r vue-empty-skill/templates/* src/components/
```

## 快速开始

### 1. 引入组件

```typescript
import { BaseEmpty } from '@/components/empty'
```

### 2. 基本用法

```vue
<base-empty description="暂无数据" />
```

### 3. 带操作按钮

```vue
<base-empty 
  description="暂无数据" 
  action-text="新建"
  @action="handleCreate" 
/>
```

## 组件 API

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| image | string | 内置图标 | 图片/图标 |
| description | string | '暂无内容' | 描述文字 |
| actionText | string | '' | 操作按钮文字 |
| imageSize | number | 120 | 图片尺寸 |

| 事件 | 说明 |
|------|------|
| action | 点击操作按钮时触发 |

## 依赖

- vue-theme-skill（CSS 变量）
