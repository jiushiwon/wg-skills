# UI Component Commands 🎯

> 前端UI组件指令系统 - 可扩展的组件库框架，做过的组件沉淀成指令，下次直接复用。

[![Claude Code](https://img.shields.io/badge/Claude%20Code-Skill-blue?logo=anthropic)](https://claude.ai/code)

---

## 痛点

| 传统方式 | 指令方式 |
|----------|----------|
| 用户：做个顶部导航 | 用户：做个顶部导航 |
| AI：自由发挥，样式随机 | AI：调用已沉淀的 nav-bar 组件 |
| 反复拉扯调样式... | **一次搞定** ✓ |

---

## 核心理念

```
做一个复杂组件 → 沉淀为指令 → 下次直接调用
```

**不是写死几个class，而是一个可扩展的框架。**

---

## 快速开始

### 安装

```bash
# 复制到 Claude Code skills 目录
cp -r ui-component-commands-skill ~/.claude/skills/
```

### 使用

**场景1：首次做复杂组件**

```
用户：帮我做一个顶部导航，要能自定义标题，左边返回按钮，右边放分享

AI：
1. 分析需求 → 生成 nav-bar 组件
2. 确认样式细节
3. 输出代码 → 沉淀到 components/nav-bar/
4. 记录指令：nav-bar、顶部导航、header
```

**场景2：调用已沉淀组件**

```
用户：加一个顶部导航

AI：
1. 检测 nav-bar 已沉淀
2. 直接输出 <nav-bar title="页面标题" />
```

---

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

---

## 组件沉淀位置

**重要：固化的组件会存到用户当前项目的 components/ 目录下**

```
当前项目/
├── components/           # 固化组件存放目录
│   ├── nav-bar/        # 顶部导航
│   ├── product-card/   # 商品卡片
│   └── ...
├── pages/
├── App.vue
└── main.js
```

**两种沉淀方式：**

1. **内置组件**：Skill 自带的 30+ 组件，直接调用
2. **项目固化**：用户新做的组件，存到当前项目，供下次复用

---

## 组件库（内置 30+ 组件）

### 导航类 (navigation) - 5 个

| 组件 | 说明 | 别名 |
|------|------|------|
| nav-bar | 自定义导航栏 | 导航栏、header、头部 |
| tab-bar | 底部Tab栏 | 底部导航、tab切换 |
| top-tab | 顶部Tab切换 | 分类切换 |
| side-menu | 侧边栏菜单 | 抽屉 |
| breadcrumb | 面包屑 | 路径导航 |

### 列表类 (list) - 5 个

| 组件 | 说明 | 别名 |
|------|------|------|
| list-item | 列表项 | 单元格 |
| product-card | 商品卡片 | 商品块 |
| article-card | 文章卡片 | 文章块 |
| chat-bubble | 聊天气泡 | 消息气泡 |
| timeline | 时间线 | 时间轴 |

### 表单类 (form) - 7 个

| 组件 | 说明 | 别名 |
|------|------|------|
| search-bar | 搜索栏 | 搜索框 |
| input-field | 表单项 | 输入框 |
| picker | 选择器 | 下拉选择 |
| date-picker | 日期选择器 | - |
| switch | 开关 | - |
| checkbox-group | 多选组 | - |
| radio-group | 单选组 | - |

### 反馈类 (feedback) - 5 个

| 组件 | 说明 | 别名 |
|------|------|------|
| toast | 轻提示 | 提示 |
| modal | 模态框 | 弹窗 |
| action-sheet | 操作菜单 | 底部菜单 |
| loading | 加载态 | - |
| empty-state | 空状态 | 无数据 |

### 业务类 (business) - 6 个

| 组件 | 说明 | 别名 |
|------|------|------|
| user-avatar | 用户头像 | 头像 |
| price-tag | 价格标签 | 价格 |
| count-down | 倒计时 | - |
| progress-bar | 进度条 | - |
| stepper | 步进器 | 计数器 |
| coupon | 优惠券 | 券 |

### 其他类 - CSS 类

- **按钮类**: btn-primary、btn-secondary、btn-ghost、btn-icon
- **线条类**: solid-line、dashed-line、gradient-line、space-line
- **图形类**: circle、dot、semi-circle
- **组合类**: icon-tag、badge
- **卡片类**: card-basic、card-elevated、card-glass

---

## 工作原理

### 1. 首次使用（无沉淀）

```
1. 用户描述需求
2. AI 分析 → 生成组件代码
3. 用户确认样式
4. AI 沉淀组件到 components/目录
5. AI 记录指令别名到匹配表
```

### 2. 后续使用（有沉淀）

```
1. 用户描述需求
2. AI 查找已沉淀组件 → 直接输出使用代码
3. 询问是否需要自定义
```

### 3. 增量修改

```
1. 用户：导航栏右边加个胶囊按钮
2. AI 读取现有组件 → 添加属性 → 输出diff
3. 更新 props.json
```

---

## 组件结构

### Vue 组件

每个 Vue 组件目录下包含：

```
components/
├── nav-bar/
│   ├── index.vue        # 组件源码
│   ├── props.json       # 属性定义
│   └── usage.md        # 使用示例
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

### props.json

```json
{
  "name": "nav-bar",
  "title": "自定义导航栏",
  "category": "navigation",
  "aliases": ["导航栏", "header", "头部"],
  "props": [
    { "name": "title", "type": "string", "default": "", "desc": "标题" },
    { "name": "showBack", "type": "boolean", "default": true },
    { "name": "fixed", "type": "boolean", "default": false }
  ],
  "events": ["back", "rightClick"]
}
```

---

## CSS变量

首次使用时会注入：

```scss
:root {
  --primary: #007AFF;
  --text-primary: #1C1C1E;
  --text-secondary: #6C6C70;
  --bg-primary: #FFFFFF;
  --bg-secondary: #F2F2F7;
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --radius-sm: 6px;
  --radius-md: 10px;
}
```

---

## 目录结构

```
ui-component-commands-skill/
├── SKILL.md                    # 技能核心
├── README.md                   # 本文件
├── components/                 # 组件库（项目级沉淀）
│   ├── _template/            # 组件模板
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
│   ├── ui-variables.scss    # CSS变量
│   └── ui-components.scss   # 公共样式
└── references/
    └── matching-rules.md     # 匹配规则
```

---

## 扩展新组件

1. 在 `components/` 创建组件目录
2. Vue 组件：编写 `index.vue` + `props.json` + `usage.md`
3. CSS 类组件：编写 `.scss` + `props.json` + `usage.md`
4. 更新 `commands/` 对应分类文档
5. 更新 `references/matching-rules.md`

---

**一句话**：做过的组件 → 沉淀为指令 → 下次直接用 ✓
