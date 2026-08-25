---
name: ui-component-commands-skill
description: "前端UI组件指令系统 - 可扩展的组件库框架，每次做完复杂组件沉淀成指令，下次直接调用。"
user-invocable: true
argument-hint: "[组件需求描述] 或 [已有组件名]"
triggers:
  # 自动触发 - 当用户请求这些类型时启用
  - "顶部导航"
  - "底部tab"
  - "做个导航"
  - "做个列表"
  - "做个表单"
  - "做个弹窗"
  - "做个按钮"
  - "做个卡片"
  # 固化指令触发
  - "固化"
  - "把这个.*固化"
  - "记录.*=.*"
---

# UI Component Commands

可扩展的前端UI组件指令系统：把做过的复杂组件沉淀成指令，下次直接复用。

## 核心理念

```
用户：帮我做个顶部导航，要自定义标题，左边返回，右边分享
AI：生成 nav-bar 组件 → 沉淀到 components/nav-bar/ → 下次直接用

用户：加个tab切换
AI：检测 tab-bar 已沉淀 → 直接输出 <tab-bar :tabs="[...]" />
```

**不是写死几个class，而是做一个可扩展的框架。**

## 技术栈确认（首次使用必问）

**⚠️ 重要：每次用户请求组件时，首次使用必须先确认技术栈**

```
AI：请问您使用的是哪种技术栈？
- H5（原生 HTML/CSS/JS）
- Vue2 (uniapp Vue2)
- Vue3 (uniapp Vue3 / Vue3)
- React
- Taro
```

用户选择后，后续组件生成和代码输出都基于该技术栈。

## 触发场景

### 自动触发
当用户请求以下类型的UI时，自动启用：

| 类型 | 示例 |
|------|------|
| 导航类 | 顶部导航、底部tab、侧边栏、面包屑 |
| 列表类 | 商品卡片、文章列表、聊天记录、时间线 |
| 表单类 | 搜索框、输入框、选择器、开关 |
| 反馈类 | 弹窗、轻提示、加载态、空状态 |
| 业务类 | 头像、价格标签、倒计时、优惠券 |

### 固化指令触发

当用户使用以下句式时，识别为固化请求：

```
固化[标签名]
把这个[代码/模块]固化成一个指令
做一个[描述]，固化下来
记录[标签名]=[代码]
```

**示例**：
```
固化"常规tab"
固化"商品卡片"：<复制代码>
做一个带轮播的商品块，固化
记录 product-card=<代码>
```

## 两种内置组件方式

### 方式一：从页面拷贝（代码固化）

适用于用户已有现成组件代码的场景：
```
用户：把这代码固化成一个指令，标签叫"常规tab"
```
AI 解析代码 → 提取特征 → 生成组件 → 记录指令

### 方式二：直接内置常用组件（预置组件库）

内置覆盖 90% 常见场景的组件库，无需用户每次重新定义：
- 导航类：nav-bar、tab-bar、top-tab、side-menu、breadcrumb
- 列表类：list-item、product-card、article-card、chat-bubble、timeline
- 表单类：search-bar、input-field、picker、date-picker、switch、checkbox-group、radio-group
- 反馈类：toast、modal、action-sheet、loading、empty-state
- 业务类：user-avatar、price-tag、count-down、progress-bar、stepper、coupon
- 按钮类：btn-primary、btn-secondary、btn-ghost、btn-icon
- 线条类：solid-line、dashed-line、gradient-line、space-line、v-solid-line
- 图形类：semi-circle、circle、dot
- 组合类：icon-tag、badge
- 卡片类：card-basic、card-elevated、card-glass

## 组件体系

### 导航类 (navigation)

| 组件 | 说明 | 别名 |
|------|------|------|
| `nav-bar` | 自定义导航栏（返回/标题/右侧操作/胶囊按钮） | 导航栏、header、头部 |
| `tab-bar` | 底部Tab栏（图标+文字+选中态） | 底部导航、tab切换 |
| `top-tab` | 顶部Tab切换 | 顶部tab、分类切换 |
| `side-menu` | 侧边栏菜单 | 侧边导航、抽屉 |
| `breadcrumb` | 面包屑导航 | 路径导航 |

### 列表类 (list)

| 组件 | 说明 | 别名 |
|------|------|------|
| `list-item` | 列表项（图标/箭头/开关） | 列表项、单元格 |
| `product-card` | 商品卡片（图片/标题/价格/按钮） | 商品、商品块 |
| `article-card` | 文章卡片 | 文章、文章块 |
| `chat-bubble` | 聊天气泡 | 消息气泡、对话气泡 |
| `timeline` | 时间线 | 时间轴 |

### 表单类 (form)

| 组件 | 说明 | 别名 |
|------|------|------|
| `search-bar` | 搜索栏 | 搜索框、搜索输入 |
| `input-field` | 表单项（标签/输入/校验） | 输入框、表单项 |
| `picker` | 选择器 | 下拉选择 |
| `date-picker` | 日期选择器 | 日期选择 |
| `switch` | 开关 | 切换开关 |
| `checkbox-group` | 多选组 | 多选框 |
| `radio-group` | 单选组 | 单选框 |

### 反馈类 (feedback)

| 组件 | 说明 | 别名 |
|------|------|------|
| `toast` | 轻提示 | 提示、轻反馈 |
| `modal` | 模态框 | 弹窗、对话框 |
| `action-sheet` | 操作菜单 | 操作表、底部菜单 |
| `loading` | 加载态 | loading、加载 |
| `empty-state` | 空状态 | 空列表、无数据 |

### 业务类 (business)

| 组件 | 说明 | 别名 |
|------|------|------|
| `user-avatar` | 用户头像 | 头像、用户图 |
| `price-tag` | 价格标签 | 价格、金额 |
| `count-down` | 倒计时 | 计时、 countdown |
| `progress-bar` | 进度条 | 进度、进度条 |
| `stepper` | 步进器 | 计数器、数量加减 |
| `coupon` | 优惠券 | 券、优惠卡 |

## 固化方式

### 方式一：直接给代码（代码固化）

```
用户：把这代码固化成一个指令，标签叫"常规tab"
```css
.tab-wrap { display: flex; height: 44px; background: #fff; }
.tab-item { flex: 1; text-align: center; line-height: 44px; font-size: 14px; }
.tab-item.active { color: #007AFF; border-bottom: 2px solid #007AFF; }
```
```html
<div class="tab-wrap">
  <div class="tab-item" :class="{ active: current === 0 }" @click="current = 0">Tab1</div>
  <div class="tab-item" :class="{ active: current === 1 }" @click="current = 1">Tab2</div>
</div>
```

AI：
1. 解析代码 → 提取CSS和HTML结构
2. 抽象特征 → "等分tab"、"下划线选中"、"44px高度"
3. 创建组件 → 生成 .vue + .scss
4. 记录指令 → 标签："常规tab"、"普通tab"、"等分tab"

---

### 方式二：描述特征（描述固化）

```
用户：固化一个"常规tab"的指令，特征是：等分、下面有选中线、44px高、点击切换
```

AI：
1. 分析特征 → 等分布局、下划线选中态、固定高度44px、点击切换
2. 生成组件 → 抽象为可配置的 tab-bar 组件
3. 记录指令 → 标签："常规tab"、"普通tab"、"等分tab"

---

### 方式三：AI生成后沉淀

```
用户：帮我做个顶部导航，要能自定义标题，左边返回按钮，右边放分享和个人中心

AI：
1. 分析需求 → nav-bar 组件
2. 确认细节 → 是否固定定位、背景色、胶囊按钮样式
3. 生成代码 → 输出组件源码 + 样式
4. 沉淀 → 创建 components/nav-bar/ 目录存放
5. 记录 → 添加到指令库（nav-bar、顶部导航、header等）
```

---

## 使用流程

### 场景1：调用已沉淀组件

```
用户：加一个顶部导航

AI：
1. 检测 nav-bar 已沉淀
2. 直接输出使用代码
<nav-bar title="页面标题" :show-back="true" fixed />
3. 询问是否需要自定义
```

### 场景2：增量修改

```
用户：顶部导航右边加个胶囊按钮

AI：
1. 读取现有 nav-bar 组件
2. 添加 capsuleButton 属性
3. 更新 props.json
4. 输出增量 diff
```

### 场景3：新组件生成

同"方式三：AI生成后沉淀"

## 组件结构

### Vue 组件

每个 Vue 组件目录下包含：

```
components/
├── nav-bar/
│   ├── index.vue        # 组件源码
│   ├── props.json       # 属性定义
│   └── usage.md        # 使用示例
├── tab-bar/
│   └── ...
└── ...
```

### CSS 类组件

按钮、线条、图形、组合、卡片等纯样式类组件目录下包含：

```
components/
├── button/
│   ├── btn.scss         # 样式源码
│   ├── props.json       # 类名定义
│   └── usage.md        # 使用示例
└── ...
```

### props.json 结构

```json
{
  "name": "nav-bar",
  "title": "自定义导航栏",
  "category": "navigation",
  "aliases": ["导航栏", "头部", "header", "顶部菜单"],
  "props": [
    { "name": "title", "type": "string", "default": "", "desc": "标题文字" },
    { "name": "showBack", "type": "boolean", "default": true, "desc": "显示返回按钮" },
    { "name": "fixed", "type": "boolean", "default": false, "desc": "固定顶部" },
    { "name": "background", "type": "string", "default": "#fff", "desc": "背景色" },
    { "name": "capsuleRight", "type": "array", "default": [], "desc": "右侧胶囊按钮" }
  ],
  "events": ["back", "rightClick"],
  "slots": ["default", "left", "right", "title"]
}
```

## 组件查找规则

### 匹配优先级

1. **精确匹配**：组件名完全相等
2. **别名匹配**：用户输入匹配 aliases
3. **语义匹配**：用户描述匹配 title/description

### 示例

| 用户输入 | 匹配结果 |
|----------|----------|
| "导航栏" | nav-bar (alias) |
| "header" | nav-bar (alias) |
| "做个顶部导航" | nav-bar (semantic) |
| "底部tab" | tab-bar (semantic) |

## 项目注入机制

### 首次使用

```
1. 检测项目类型（uniapp/Vue/React）
2. 检测样式文件位置
3. 创建 components/ 目录
4. 注入 CSS 变量模板
5. 生成 easycom / 全局注册代码
```

### 组件使用

```vue
<!-- uniapp: 自动注册 -->
<nav-bar title="首页" :show-back="false" fixed />

<!-- 或手动引入 -->
<script>
import NavBar from '@/components/nav-bar/index.vue'
</script>
```

## CSS变量（必须注入）

```scss
:root {
  // 主色
  --primary: #007AFF;
  --primary-light: #4DA3FF;
  --primary-dark: #0056CC;

  // 文字
  --text-primary: #1C1C1E;
  --text-secondary: #6C6C70;
  --text-inverse: #FFFFFF;

  // 背景
  --bg-primary: #FFFFFF;
  --bg-secondary: #F2F2F7;

  // 间距
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;

  // 圆角
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
}
```

## 扩展新组件

### 添加流程

1. 在 `components/` 创建组件目录
2. Vue 组件：编写 `index.vue` + `props.json` + `usage.md`
3. CSS 类组件：编写 `.scss` + `props.json` + `usage.md`
4. 更新 `commands/` 下对应分类文档
5. 更新 `references/matching-rules.md`
6. 更新 `components/_registry.json`

### 组件模板

```json
{
  "name": "组件名",
  "title": "中文名",
  "category": "navigation|list|form|feedback|business",
  "aliases": ["别名1", "别名2"],
  "props": [...],
  "events": [...],
  "slots": [...]
}
```

## 与其他skill的关系

| Skill | 层级 | 协作 |
|-------|------|------|
| frontend-ui-foundry | 场景级 | foundry定整体风格，此skill提供组件 |
| impeccable | 优化级 | 优化组件时可参考样式规范 |

## 目录结构

```
ui-component-commands-skill/
├── SKILL.md                    # 本文件
├── README.md                   # 使用文档
├── components/                 # 组件库（项目级）
│   ├── _template/             # 组件模板
│   │   ├── index.vue
│   │   ├── props.json
│   │   └── usage.md
│   ├── index.scss             # 公共样式入口
│   └── _registry.json         # 内置组件注册表
├── commands/                   # 组件说明
│   ├── navigation.md
│   ├── list.md
│   ├── form.md
│   ├── feedback.md
│   ├── button.md
│   ├── line.md
│   ├── shape.md
│   ├── combo.md
│   └── card.md
├── templates/
│   ├── ui-variables.scss     # CSS变量
│   └── ui-components.scss    # 公共样式
└── references/
    └── matching-rules.md     # 匹配规则
```

---

**一句话**：做过的组件 → 沉淀为指令 → 下次直接用 ✓
