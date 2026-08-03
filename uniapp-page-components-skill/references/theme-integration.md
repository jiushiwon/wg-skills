# 主题系统接入与 fallback

本文件说明本 skill 组件如何接入 uniapp-theme-skill 主题系统，以及目标项目无主题系统时的硬编码替换方案。

## 1. 主题变量清单（组件使用到的）

组件全部样式只引用下表变量（源自 `uniapp-theme-skill` 的 color-scale / size-scale / radius-scale）：

### 颜色

| 变量 | 说明 | 组件使用场景 |
|------|------|--------------|
| `--color-primary` | 主色 | 高亮文字、自己消息气泡、主按钮、Tab 激活、链接色 |
| `--color-bg-page` | 页面背景 | 页面根背景 |
| `--color-bg-surface` | 卡片/输入/气泡背景 | BaseCard、对方气泡、输入框 |
| `--color-bg-tinted` | 浅色强调底 | 标签底、点赞/评论底、占位底 |
| `--color-text-primary` | 主文字 | 标题、正文 |
| `--color-text-secondary` | 次要文字 | 描述 |
| `--color-text-tertiary` | 弱化文字 | 时间、占位、箭头 |
| `--color-border-light` | 细边框 | 分割线、描边 |
| `--color-error` | 错误/价格红 | 价格、角标、失败态 |
| `--white` | 反白文字 | 主题色上的文字 |

### 尺寸

| 变量 | 说明 |
|------|------|
| `--spacing-xs / sm / md / lg / xl / 2xl / 3xl` | 间距阶梯（8/16/24/32/48/64/96rpx） |
| `--font-xs / sm / md / lg / xl / 2xl` | 字号阶梯 |
| `--height-btn-md / lg / xl` | 按钮/输入/导航栏高度 |
| `--height-avatar-sm / md / lg` | 头像尺寸 |
| `--icon-md / lg` | 图标尺寸 |

### 圆角

| 变量 | 说明 |
|------|------|
| `--radius-card` | 卡片圆角（BaseCard 默认） |
| `--radius-btn` | 按钮/输入框胶囊圆角 |
| `--radius-avatar` | 头像圆角 |
| `--radius-image` | 图片圆角 |
| `--radius-tag` | 标签圆角 |
| `--radius-sm / lg` | 气泡角/列表项圆角 |

## 2. 无主题系统 fallback 硬编码替换表

> 使用前提：目标项目**没有**主题系统（无 `--color-primary` / `--radius-card` 等变量），且用户选择直接硬编码（而非先初始化 uniapp-theme-skill）。此时允许写死，但仍应统一色值，方便日后接入主题。

生成时把每个 `var(--xxx)` 替换为下表默认值（取自 business 商务风主题，可按用户品牌色调整）：

| 变量 | 默认值 |
|------|--------|
| `--color-primary` | `#2563EB` |
| `--color-bg-page` | `#F5F6F8` |
| `--color-bg-surface` | `#FFFFFF` |
| `--color-bg-tinted` | `#EFF6FF` |
| `--color-text-primary` | `#171717` |
| `--color-text-secondary` | `#737373` |
| `--color-text-tertiary` | `#A3A3A3` |
| `--color-border-light` | `#F0F0F0` |
| `--color-error` | `#EF4444` |
| `--white` | `#FFFFFF` |
| `--spacing-xs/sm/md/lg/xl/2xl/3xl` | `8rpx / 16rpx / 24rpx / 32rpx / 48rpx / 64rpx / 96rpx` |
| `--font-xs/sm/md/lg/xl/2xl` | `22rpx / 24rpx / 28rpx / 32rpx / 36rpx / 44rpx` |
| `--height-btn-md/lg/xl` | `72rpx / 88rpx / 96rpx` |
| `--height-avatar-sm/md/lg` | `64rpx / 96rpx / 128rpx` |
| `--icon-sm/md/lg` | `32rpx / 40rpx / 48rpx` |
| `--radius-card` | `16rpx` |
| `--radius-btn` | `16rpx` |
| `--radius-avatar` | `9999rpx`（对齐主题 `--radius-full`，正方形头像下等同圆形） |
| `--radius-image` | `8rpx` |
| `--radius-tag` | `8rpx` |
| `--radius-sm` | `8rpx` |
| `--radius-lg` | `24rpx` |
| `calc((100% - 2 * var(--spacing-xs)) / 3)` 等 | 直接用 `calc((100% - 16rpx) / 3)` 等价替换 |

> 推荐做法：与其逐个替换，不如直接在项目 `src/styles/theme.css`（或 App.vue 的 `<style>`）里一次性定义这组 CSS 变量，组件原样复制即可。这样日后接入 uniapp-theme-skill 也无需改动组件。

## 3. easycom 注册

**方式 A：autoscan（默认推荐）**

```json
// pages.json
{
  "easycom": {
    "autoscan": true
  }
}
```

uni-app 会自动扫描 `src/components/组件名/组件名.vue`，把目录名注册为全局标签（kebab-case）：
`base-card/base-card.vue` → `<base-card>`，`chat-page/chat-page.vue` → `<chat-page>`。

**方式 B：自定义规则（组件放在公共子目录时）**

```json
// pages.json
{
  "easycom": {
    "autoscan": true,
    "custom": {
      "^page-(.*)": "@/components/page/page-$1/$1.vue"
    }
  }
}
```

**方式 C：手动导入**

```vue
<script setup lang="ts">
import ChatPage from '@/components/chat-page/chat-page.vue'
import BaseCard from '@/components/base-card/base-card.vue'
</script>
```

## 4. 主题变量覆盖示例

组件已把大部分外观参数暴露为 props（`radius` / `padding` / `background` / `margin`），个别需要全局调整时直接覆盖主题变量：

```scss
// 全局/页面级覆盖（主题系统允许的地方）
.page-mall {
  --color-primary: #10B981;   // 该区域主色换绿
  --radius-card: 24rpx;       // 卡片圆角加大
}
```

## 5. 与其他 uniapp 技能的协同

本 skill 位于 uniapp 技能链路的「页面组件层」，与以下技能协同：

### 5.1 uniapp-standard-skill（通用规范，前置）

- **红线**：组件遵循其 R15（SCSS 用 Token）、R05（长列表分页，`tab-list-page` 的 `loadMore` 由页面层实现）、R08（禁止硬编码，配置走 config）等。
- **目录/命名**：组件目录小写 kebab-case、`components/<name>/<name>.vue`，符合 easycom 默认规则；若项目按 `components/common/<Name>/index.vue` 组织，把组件放到对应位置并改用 easycom `custom` 规则或手动 import。
- **组件通信**：遵循其组件通信规范（props 单向、事件向上、slot 插槽），本 skill 组件全部满足。

### 5.2 uniapp-theme-skill（主题系统，依赖）

- 组件全部样式引用其 CSS 变量（`var(--color-primary)` / `var(--radius-card)` / `var(--spacing-md)` ...），实现运行时换肤。
- 无主题系统时按 §2 fallback 表硬编码；推荐先在项目全局一次性定义这组 CSS 变量（可引用 style-skill 的 SCSS 变量值生成），组件原样复制，日后接入 theme-skill 零改动。

### 5.3 uniapp-style-skill（设计规范，必循）

- 视觉规范（排版、间距、语义色、圆角）遵循其 Design Tokens 体系。
- **SCSS token 与 CSS 变量桥接**：style-skill 的 `$color-primary` 等是编译期 SCSS 变量，theme-skill 的 `--color-primary` 是运行时 CSS 变量。二选一保持单一来源：
  - **推荐**：主题系统（CSS 变量）作为唯一来源，SCSS 里 `$color-primary: var(--color-primary)` 反向引用，编译期获得 CSS 变量引用，运行时切换主题。
  - 或 SCSS 变量作为来源，生成 CSS 变量文件时把 SCSS 值写进去。
- 组件代码规范（scoped、TS Props、图片兜底、点击区 ≥88rpx）按 style-skill D01-D32 红线自查。

### 5.4 uniapp-app-generate-skill（骨架 + 原子组件）

- 页面组件是「页面骨架层」，app-generate 的共享组件（AppButton / AppTab / AppInput / AppPopup / AppNavbar）是「原子 UI 层」。
- 若项目已生成共享组件体系：用本 skill 组件的 `#tab` / `#footer` / `#navbar` / `#plus-panel` / `#header` 等 slot 注入共享组件；内部自绘的基础 UI（tab 栏、输入栏、底部按钮）可作为默认实现保留或按需替换，避免重复造轮子。

### 5.5 uniapp-request-skill（数据层）

- 组件只接收数据（`list` / `messages` / `feedList` / `groups`），副作用（分页、加载、发送、点赞）由页面层调用 request-skill 封装处理，组件只 `emit` 事件。组件内禁止直接 `uni.request`。
