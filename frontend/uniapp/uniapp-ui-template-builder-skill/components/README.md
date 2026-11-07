# 组件模板

> ui-template-builder 的组件层：与页面模板独立，但页面模板可以直接引用或复制使用。

## 设计原则

这里的组件**不是第三方 UI 库**（如 Element Plus、Ant Design、uView），而是：

- **纯模板代码**：基于 uniapp / React 原生能力实现
- **即拷即用**：复制到项目 `components/` 目录即可运行
- **无额外编译依赖**：不依赖 npm 包、不需要特殊编译配置
- **自包含示例**：每个组件都带 mock 数据和基础交互演示

页面模板可以通过 `import` 或复制源码的方式引用这些组件。

## 目录结构

```
components/
├── uniapp-vue3/          # uniapp Vue3 组件模板
│   ├── button/          # 按钮（多风格、状态）
│   ├── modal/           # 弹框 / Dialog
│   ├── drawer/          # 抽屉 / Sidebar
│   ├── toast/           # 轻提示
│   ├── picker/          # 选择器
│   ├── calendar/        # 日历
│   └── moments/         # 朋友圈 / 动态列表
│
└── pc-react/            # PC React 组件模板
    ├── button/
    ├── modal/
    ├── drawer/
    └── toast/
```

## 使用方式

### 方式1：页面模板内直接引用

```vue
<template>
  <view>
    <modal-basic :visible="showModal" title="提示" @confirm="onConfirm" @close="showModal = false" />
  </view>
</template>

<script setup>
import ModalBasic from '@/components/uniapp-vue3/modal/modal-basic.vue'
</script>
```

### 方式2：拷贝源码到项目

直接把需要的 `.vue` / `.tsx` 文件复制到业务项目的 `components/` 目录下使用。

## 命名规范

为了保持组件库的一致性，请遵循以下约定：

### 组件类名（BEM）

- 统一使用 `t-` 作为组件前缀，例如：`t-button`、`t-form`、`t-table`
- 组件根元素：`t-{component}`
- 元素节点：`t-{component}__{element}`
- 修饰符：`t-{component}--{modifier}`

示例：

```html
<view class="t-button t-button--primary t-button--lg">
  <view class="t-button__text">提交</view>
</view>
```

### CSS 变量

颜色、间距、圆角、阴影等设计 token 统一使用 `--` 前缀变量：

- 主色：`--color-primary`
- 主色色阶：`--primary-50` 到 `--primary-900`
- 间距：`--space-1`、`--space-2` ...
- 圆角：`--radius-sm`、`--radius-md` ...
- 阴影：`--shadow-sm`、`--shadow-md` ...

优先使用 `styles/tokens.css` 与 `styles/themes.css` 中定义的变量，减少硬编码。

### 文件命名

- 组件入口：`button.vue` / `button.tsx`
- 样式文件：`button.css` / `button.scss`
- 子组件：`form-item.vue` / `input.tsx`
- 说明文档：`README.md`

### 图标

uniapp 组件默认使用 emoji 或内联 SVG，避免依赖外部 iconfont 字体；如需使用 iconfont，请在业务项目中自行引入对应字体文件。
