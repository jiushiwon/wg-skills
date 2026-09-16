---
name: base-select
description: "uni-app 下拉选择组件：13 种形态统一收敛（下拉/弹出面板/标签多选/城市级联/搜索/宫格/分组/级联/树形/异步搜索/可创建），所有选择场景优先使用本组件避免样式碎片化。"
argument-hint: "[形态: dropdown|popup|tag|city|search|grid] [选项数据 JSON]"
user-invocable: true
triggers:
  - "做一个下拉选择"
  - "做一个下拉框"
  - "做一个弹出面板选择"
  - "做一个标签多选"
  - "做一个城市选择器"
  - "做一个搜索下拉"
  - "做一个宫格选择"
  - "做一个分组选择"
  - "做一个级联选择"
  - "做一个树形选择"
  - "做一个异步搜索"
  - "做一个可创建选择"
  - "base-select"
  - "select.*组件"
---

# base-select 下拉选择

## 定位

**本组件为 uni-app 项目收敛所有选择场景（13 种形态），由 base-card 设计思想实现（参数化外壳 + 选择交互逻辑）。**

业务开发中任何"选一个/选多个/筛选/配置/地址"的场景，**必须**使用 base-select，不允许各自实现下拉框/弹出面板/级联/树形，否则会出现样式碎片化、主题切换不同步。

## 边界声明

### ✅ 本组件负责

| 能力 | 说明 |
|------|------|
| 13 种形态的下拉选择交互 | dropdown / popup / tag / city / search / grid / group / cascade / tree / async / creatable |
| 单选 + 多选统一 API | `multiple: boolean` 一键切换 |
| 客户端搜索 + 远程搜索 | `searchable` + `remote` 双模式 |
| 主题变量接入 | 颜色/尺寸/圆角全部走 `var(--xxx)` |

### ❌ 本组件不负责

| 能力 | 状态 |
|------|------|
| 表单校验 | ❌ 由 base-form 处理 |
| 数据请求封装 | ❌ 由 request skill 处理 |
| 选项数据源管理 | ❌ 业务自行提供 options |
| Modal/Dialog 弹窗（非选择场景） | ❌ 用 base-popup |
| DatePicker / TimePicker | ❌ 用 base-card + 业务实现 |

## 核心能力

1. **13 种形态收敛**：一套组件覆盖 95% 选择场景，无需重复开发
2. **单选/多选统一**：通过 `multiple` 一键切换，API 完全一致
3. **客户端 + 远程搜索**：`searchable` 本地过滤，`remote` 远程拉取（含防抖）
4. **级联 + 树形**：city/cascade/tree 三种结构化数据
5. **可创建**：`creatable: true` 支持输入即新增（标签、技能场景）
6. **Design Tokens 接入**：颜色/间距/圆角全部走 CSS 变量 + SCSS Token，主题切换自动同步
7. **图标系统集成**：触发器/选项/关闭按钮统一使用根级 icon sprite
8. **容器原则**：复杂形态（popup）内部就是 base-card，遵守容器基底
9. **深色模式兼容**：通过 CSS 变量 + `data-theme="dark"` 支持主题切换

## 形态总览

**13 种形态**，覆盖 95% 选择场景：

| # | 风格 | 场景 | 类型值 / 关键参数 |
|---|------|------|------------------|
| 00 | **总览** | 13 形态对比一览 | — |
| 01 | 基础下拉 | 表单选择、简单筛选 | `dropdown` |
| 02 | 弹出面板 | 复杂选择、弹窗选择 | `popup` |
| 03 | 标签多选 | 兴趣选择、已选展示 | `tag` |
| 04 | 城市级联 | 地址选择、省市区 | `city` |
| 05 | 搜索下拉 | 模糊匹配、本地过滤 | `search` + `searchable` |
| 06 | 宫格选择 | 商品规格、套餐选择 | `grid` |
| 07 | 多选下拉 | 兴趣标签、批量筛选 | `dropdown` + `multiple` |
| 08 | 分组选择 | 联系人、分类目录 | `groupable: true` |
| 09 | 级联选择 | 省/市/区三级联动 | `cascade: true` |
| 10 | 树形选择 | 部门、组织架构 | `treeData: true` |
| 11 | 异步搜索 | 远程数据、防抖 | `remote: true` |
| 12 | 可创建 | 标签、技能自定义 | `creatable: true` |

## HTML 参考图

13 个独立 demo 文件，按形态命名：

| # | HTML | 风格 | 一句话 |
|---|------|------|--------|
| 00 | [00-showcase.html](html/00-showcase.html) | 形态总览 | 一图看完 13 种形态 |
| 01 | [select-dropdown.html](html/select-dropdown.html) | 基础下拉 | 触发器 + 下拉列表 |
| 02 | [select-popup.html](html/select-popup.html) | 弹出面板 | 底部抽屉 / 居中弹层 |
| 03 | [select-tag.html](html/select-tag.html) | 标签多选 | 已选项以 chip 展示 |
| 04 | [select-city.html](html/select-city.html) | 城市级联 | 地区数据联动 |
| 05 | [select-search.html](html/select-search.html) | 搜索下拉 | 输入框 + 实时过滤 |
| 06 | [select-grid.html](html/select-grid.html) | 宫格选择 | 图标 + 文字九宫格 |
| 07 | [select-multiple.html](html/select-multiple.html) | 多选下拉 | checkbox + 底部操作 |
| 08 | [select-group.html](html/select-group.html) | 分组选择 | group header 黏性 |
| 09 | [select-cascade.html](html/select-cascade.html) | 级联选择 | 弹层 + 三列联动 |
| 10 | [select-tree.html](html/select-tree.html) | 树形选择 | 展开折叠 + 父子联动 |
| 11 | [select-async-search.html](html/select-async-search.html) | 异步搜索 | 远程数据 + loading |
| 12 | [select-creatable.html](html/select-creatable.html) | 可创建 | 输入即新增 |

## 为什么需要这个组件？

下拉选择是 App 高频交互场景，但实际开发中：
- 下拉框、弹出面板、标签多选各自实现，样式不统一
- 单选、多选、级联选择各自处理
- 城市选择、搜索选择重复开发
- 主题切换时选择器样式难以同步

`base-select` 把所有选择器的共性收敛成一个组件，页面只关心选项数据。

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` / `v-model` | any / array | - | 选中值（单选 any，多选 array） |
| `options` | array | `[]` | 选项列表 |
| `type` | string | `'dropdown'` | 类型 |
| `multiple` | boolean | `false` | 是否多选 |
| `placeholder` | string | `'请选择'` | 占位文字 |
| `searchable` | boolean | `false` | 是否可搜索 |
| `remote` | boolean | `false` | 是否远程搜索 |
| `remoteMethod` | function | - | 远程搜索方法 `(kw) => Promise<options>` |
| `debounce` | number | `300` | 远程搜索防抖（ms） |
| `creatable` | boolean | `false` | 是否可创建新选项 |
| `groupable` | boolean | `false` | 是否分组 |
| `cascade` | boolean | `false` | 是否级联 |
| `treeData` | boolean | `false` | 是否树形 |
| `disabled` | boolean | `false` | 是否禁用 |
| `max` | number | - | 多选上限 |

## Events

| Event | 参数 | 说明 |
|-------|------|------|
| `update:modelValue` | value | 选中值变化（v-model） |
| `change` | value | 选中变化时触发 |
| `search` | keyword | 搜索时触发 |
| `select` | option | 选中某项时触发 |
| `clear` | - | 清空选择时触发 |

## 命名体系（与 uniapp-theme-skill 对齐）

所有 CSS 变量严格遵循 uniapp-theme-skill 规范，**禁止使用未定义的变量名**：

| 维度 | 格式 | base-select 常用 |
|------|------|-----------------|
| 颜色 | `--{color}-{step}` / `--color-{semantic}` | `--color-primary`, `--color-success` |
| 背景 | `--color-bg-surface`, `--color-bg` | 触发器/下拉背景 |
| 文字 | `--color-text`, `--color-text-secondary`, `--color-text-tertiary` | 标题/副标题/占位 |
| 边框 | `--color-border` | 分隔线 |
| 间距 | `--space-{n}` | `--space-2` (8rpx), `--space-3` (12rpx), `--space-4` (16rpx) |
| 圆角 | `--radius-{size}` | `--radius-md` |
| 字号 | `--font-{size}` | （继承全局） |

❌ **禁止**使用未在 uniapp-theme-skill 中定义的变量名（如 `--color-surface`）

## 与 uniapp-style-skill 对齐

> 本组件严格遵守 uniapp-style-skill 红线规则（D01-D34），以下列出 base-select 涉及的关键规则。

### 红线规则引用

| 规则 | 要求 | base-select 落地 |
|------|------|-----------------|
| D01 | SCSS 必须用 Token | 颜色/间距/圆角全部引用 `$color-*` / `$spacing-*` / `$radius-*` |
| D02 | 组件样式用 scoped | `<style scoped>` 或 SCSS scoped |
| D03 | Props 用 TS 接口 | `interface Props` + `withDefaults` |
| D06 | 字号禁止硬编码 | 使用 `$font-size-md` / `$font-size-sm` 等 |
| D10 | 深色模式可切换 | CSS 变量 + `data-theme="dark"` |
| D13 | Popup 必须有进出场动画 | select-popup 使用 base-popup（内置滑入滑出） |
| D18 | 圆角必须全局统一 | 使用 `$radius-md` / `$radius-small` |
| D24 | 可点击区域 ≥ 44pt | 触发器/选项最小高度 88rpx |
| D26 | 表单控件必须统一 | base-select 统一选择器样式 |
| D29 | 禁止第三方组件库 | 使用原生标签 + base-card / base-popup |
| D33 | 组件尺寸必须从 Token 取值 | 内边距/高度/圆角全部引用 Token |

### Design Token 层级

```
uniapp-theme-skill (CSS 变量)        uniapp-style-skill (SCSS Token)
──────────────────────────────       ─────────────────────────────────
--color-primary                   →  $color-primary
--color-bg-surface                →  $color-bg-primary
--color-text / secondary / tertiary → $color-text-primary / secondary / tertiary
--color-border                    →  $color-border
--space-{n}                       →  $spacing-{n}
--radius-{size}                   →  $radius-{size}
```

### 文本层级（必须使用预设类）

| 层级 | 类名 | 用途 |
|------|------|------|
| 页面主标题 | `.text-h1` | 选择器标题（弹出形态） |
| 区块标题 | `.text-h2` | 选项分组标题 |
| 选项文字 | `.text-body` | 选项标签 |
| 辅助文字 | `.text-caption` | 占位符、提示 |

### 动画规范

- select-popup 形态使用 base-popup，自带进出场动画（slide-in/slide-out）
- 动画仅使用 `transform` / `opacity`，禁止触发 layout/paint（D08）
- 动画时长使用 `$transition-duration-normal`（250ms）

### 屏幕适配

- 所有尺寸使用 rpx 单位（1rpx = 屏幕宽度 / 750）
- 底部安全区使用 `@include safe-area-bottom` mixin
- 最小触摸区域 ≥ 44pt（88rpx），符合 D24

## 架构说明

```
uniapp-base-skill/
├── uniapp-form-skill/
│   └── demo-components/
│       └── base-select/
│           ├── base-select.md          # 本文件（唯一规范源）
│           └── html/                   # 13 个 demo
│               ├── 00-showcase.html    # 13 形态总览
│               ├── select-dropdown.html
│               ├── select-popup.html
│               ├── ... (13 个 demo)
│               └── shared/             # 共享样式（外部引用）
│                   └── base-preview.css
└── shared/
    └── icons/                          # 根级 icon sprite（trigger/icon 复用）
```

### 调用关系

- base-select → base-card（容器基底，所有形态外层 = base-card）
- select-popup → base-popup（弹出形态 → 弹窗容器）
- select-* → 根级 icon sprite（trigger 箭头 / check / close）

## 代码

```vue
<template>
  <view class="base-select base-card">
    <!-- 触发器 -->
    <view class="select-trigger" @click="onOpen">
      <text :class="{ placeholder: !modelValue }">
        {{ displayText || placeholder }}
      </text>
      <svg class="icon icon-12 icon-tertiary">
        <use href="#i-chevron-down"/>
      </svg>
    </view>

    <!-- 下拉面板 -->
    <view v-if="visible" class="select-dropdown">
      <!-- 搜索框 -->
      <view v-if="searchable || remote" class="select-search">
        <svg class="icon icon-14 icon-tertiary"><use href="#i-search"/></svg>
        <input v-model="keyword" :placeholder="searchPlaceholder" />
      </view>

      <!-- 选项列表 -->
      <view class="select-options">
        <view
          v-for="option in filteredOptions"
          :key="option.value"
          class="select-option"
          :class="{ selected: isSelected(option) }"
          @click="onSelect(option)"
        >
          <text>{{ option.label }}</text>
          <svg v-if="multiple && isSelected(option)"
               class="icon icon-12 icon-primary"><use href="#i-check"/></svg>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Option {
  label: string
  value: any
  disabled?: boolean
  children?: Option[]
  group?: string
}

interface Props {
  modelValue?: any | any[]
  options?: Option[]
  type?: 'dropdown' | 'popup' | 'tag' | 'city' | 'search' | 'grid'
  multiple?: boolean
  placeholder?: string
  searchable?: boolean
  remote?: boolean
  remoteMethod?: (kw: string) => Promise<Option[]>
  debounce?: number
  creatable?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  options: () => [],
  type: 'dropdown',
  multiple: false,
  placeholder: '请选择',
  searchable: false,
  remote: false,
  debounce: 300,
  creatable: false,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: any | any[]]
  change: [value: any | any[]]
  search: [keyword: string]
  select: [option: Option]
  clear: []
}>()

// ... 更多逻辑
</script>

<style scoped>
.base-select { position: relative; }
.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3);
  background: var(--color-bg-surface);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--font-md);
  color: var(--color-text);
}
.select-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: var(--space-2);
  background: var(--color-bg-surface);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  max-height: 320rpx;
  overflow-y: auto;
  z-index: 100;
}
.select-option {
  padding: var(--space-3) var(--space-4);
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  border-bottom: 1px solid var(--color-border);
}
.select-option:last-child { border-bottom: none; }
.select-option.selected { color: var(--color-primary); }
/* 更多样式... */
</style>
```

## 使用示例

### 基础下拉

```vue
<base-select
  v-model="city"
  :options="[
    { label: '北京', value: 'beijing' },
    { label: '上海', value: 'shanghai' },
    { label: '广州', value: 'guangzhou' }
  ]"
  placeholder="请选择城市"
/>
```

### 弹出面板

```vue
<base-select
  v-model="category"
  type="popup"
  :options="categories"
/>
```

### 标签多选

```vue
<base-select
  v-model="interests"
  type="tag"
  multiple
  :options="[
    { label: '阅读', value: 'reading' },
    { label: '音乐', value: 'music' },
    { label: '运动', value: 'sports' }
  ]"
/>
```

### 城市级联

```vue
<base-select
  v-model="address"
  type="city"
  :options="cityData"
/>
```

### 搜索下拉

```vue
<base-select
  v-model="member"
  type="search"
  searchable
  :options="memberList"
  placeholder="搜索成员"
/>
```

### 异步搜索

```vue
<base-select
  v-model="user"
  type="search"
  remote
  :remote-method="searchUsers"
  :debounce="300"
  placeholder="输入姓名搜索"
/>
```

### 可创建

```vue
<base-select
  v-model="tags"
  type="tag"
  multiple
  creatable
  :options="existingTags"
/>
```

## 形态切换

通过 `type` 切换选择器形态：

| 类型 | 场景 |
|------|------|
| `dropdown` | 基础下拉、表单选择 |
| `popup` | 复杂选择、弹窗选择 |
| `tag` | 筛选条件、兴趣多选 |
| `city` | 地址选择、省市区级联 |
| `search` | 搜索选择、模糊匹配 |
| `grid` | 商品规格、套餐选择 |

## 主题变量（与 uniapp-theme-skill 对齐）

| 变量 | 用途 |
|------|------|
| `var(--color-primary)` | 选中态颜色 / 主色 |
| `var(--color-bg-surface)` | 触发器 / 下拉面板背景 |
| `var(--color-text)` | 主要文字 |
| `var(--color-text-secondary)` | 副标题 |
| `var(--color-text-tertiary)` | 占位符 / 提示 |
| `var(--color-border)` | 选项分隔线 |
| `var(--radius-md)` | 触发器 / 下拉圆角 |
| `var(--space-2) / --space-3 / --space-4` | 内边距 |

## 触发示例

```markdown
# 基础下拉
/uniapp-base-skill 做一个下拉选择
/uniapp-base-skill 做一个下拉框

# 弹窗类
/uniapp-base-skill 做一个弹出面板选择
/uniapp-base-skill 做一个底部选择器

# 多选类
/uniapp-base-skill 做一个标签多选
/uniapp-base-skill 做一个兴趣多选

# 结构化数据
/uniapp-base-skill 做一个城市选择器
/uniapp-base-skill 做一个省市区级联
/uniapp-base-skill 做一个部门树形选择

# 搜索类
/uniapp-base-skill 做一个搜索下拉
/uniapp-base-skill 做一个模糊匹配选择
/uniapp-base-skill 做一个异步搜索选择

# 特殊
/uniapp-base-skill 做一个宫格选择
/uniapp-base-skill 做一个可创建标签
/uniapp-base-skill 做一个分组选择
```

## 输出物

### 必需输出

- `uniapp-form-skill/demo-components/base-select/base-select.md`：本规范文件（唯一源）
- `uniapp-form-skill/demo-components/base-select/html/`：13 个 demo HTML（验证用）
- 业务使用时：`<base-select>` 组件代码 + props/options 配置

### 引用资源

- `demo-components/shared/base-preview.css`：手机壳容器 + 参数条
- `demo-components/shared/icons/icons-sprite.svg`：根级 icon sprite
- `uniapp-theme-skill` 提供的 CSS 变量（颜色/尺寸/圆角）

## 回滚方式

```bash
# 回滚 base-select.md 到上一版本
git checkout HEAD~1 -- uniapp-form-skill/demo-components/base-select/base-select.md

# 清理生成的 demo（如不再需要）
rm -rf uniapp-form-skill/demo-components/base-select/html/
```

## 与其他 skill 的关系

| skill | 关系 |
|---|---|
| `uniapp-base-skill` | 上游：提供 base-card / base-popup 容器基底 |
| `uniapp-theme-skill` | 上游：提供 CSS 变量系统（颜色/尺寸/圆角） |
| `uniapp-form-skill` | 上游：表单组件容器，base-select 是其中一员 |
| `base-popup` | 平行：select-popup 形态使用 base-popup 弹窗容器 |
| `icon-image-catch-skill` | 上游：根级 icon 资源 |

## 约束红线

> 以下规则同时参考 uniapp-theme-skill 与 uniapp-style-skill（D01-D34）。

- **禁止**自行实现下拉框 / 弹出选择 / 级联选择，必须使用 base-select
- **禁止**使用未在 uniapp-theme-skill 中定义的 CSS 变量（如 `--color-surface`）（D01）
- **禁止**在 base-select 内使用原生组件或第三方组件库（Element Plus / Naive UI 等）（D29）
- **必须**遵守容器原则：select-popup 内部就是 base-card
- **必须**使用图标 sprite（`<svg class="icon"><use href="#i-xxx"/></svg>`），禁止 emoji
- **必须**走 CSS 变量 + SCSS Token（颜色/尺寸/圆角），禁止硬编码 rpx/px 值（D01）
- **必须**使用 `scoped` 样式（D02）
- **必须**使用 TypeScript 接口定义 Props（D03）
- **必须**使用 `$font-size-*` 语义变量，禁止硬编码字号（D06）
- **必须**使用 `$radius-*` 统一圆角（D18）
- **必须**确保可点击区域 ≥ 44pt / 88rpx（D24）
- **禁止**直接修改此文件破坏对齐规范（必须先与 uniapp-theme-skill / uniapp-style-skill 同步）
- uni-app 项目必须使用 rpx 单位（除少量 px 兼容性值）