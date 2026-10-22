# UI Component Commands（组件索引层）

> uni-app 组件**索引与固化层**：把中文需求映射到 `uniapp-base-skill` 的根容器 / 内置组件 / 样式类，
> 给出组件名、路径、属性契约与用法；同时负责新组件的固化登记。
>
> 上位规范：[uniapp/AGENTS.md](../AGENTS.md)　个体规范：[STANDARD.md](STANDARD.md)

## 一、它解决什么

| 传统方式 | 索引层方式 |
|----------|-----------|
| 每次重新设计外壳，圆角/背景/边框各写一套 | 先命中根容器，外壳由容器统一提供 |
| 组件散落在各技能目录，找不到 | 全部实现在 `uniapp-base-skill`，本模块只做索引 |
| 改完组件，文档与索引不同步 | `commands/*.md` 由注册表 + `props.json` **生成**，同步是机械动作 |

## 二、分层定位

```
专项层  app-generate / page-components / ui-template-builder …
            ↓ 检索
索引层  uniapp-ui-component-commands-skill（本模块）
            ↓ 指向实现
实现层  uniapp-base-skill/containers/ + components/ + styles/
            ↓ 依赖
变量层  uniapp-theme-skill/.../base.css
```

> **边界**：本模块回答"用哪个、去哪拿、怎么沉淀"；
> `uniapp-base-skill` 回答"它长什么样、怎么用"。
> 组件实现**一律**在 `uniapp-base-skill`，本模块 `components/` 下不得出现 `.vue`。

## 三、快速开始

```bash
# 复制到 Claude Code skills 目录
cp -r uniapp-ui-component-commands-skill ~/.claude/skills/
```

**场景 1：调用已沉淀组件**

```
用户：加一个顶部导航

AI：
1. 命中别名「顶部导航」→ base-navbar
2. 输出 <base-navbar title="页面标题" />，并提示其 props / 事件 / 插槽
```

**场景 2：首次做复杂组件**

```
用户：帮我做一个顶部导航，右边放分享

AI：
1. 判定分类（navigation）与依赖容器（base-navbar）
2. 在 uniapp-base-skill/components/navigation/<name>/ 写 index.vue + props.json + usage.md
3. 登记到 components/_registry.json
4. 重新生成 commands/<category>.md（`node scripts/gen-commands.js`）
5. 在 references/matching-rules.md 补关键词行
6. 补 demo
```

## 四、检索流程

```
用户需求
  → ① 清洗：去空格、统一大小写
  → ② 点名命中：组件名 / 别名
  → ③ 容器优先：命中外壳词 → 先给根容器
  → ④ 分类匹配：查 references/matching-rules.md
  → ⑤ 冲突裁决：查同文件 §4 裁决表
  → ⑥ 未命中 → 走固化流程
```

## 五、组件总览

| 分类 | 数量 | 组件 |
|------|------|------|
| 根容器 | 6 | base-card、base-popup、base-form-item、base-avatar、base-navbar、base-tabbar |
| form | 8 | button、search-bar、input-field、picker、date-picker、switch、checkbox-group、radio-group |
| feedback | 5 | toast、modal、action-sheet、loading、empty-state |
| list | 5 | list-item、product-card、article-card、chat-bubble、timeline |
| navigation | 3 | top-tab、side-menu、breadcrumb |
| business | 5 | price-tag、count-down、progress-bar、stepper、coupon |
| style | 5 类 | button / line / shape / combo / card（纯 CSS 类，路径在 `uniapp-base-skill/styles/`） |

逐条属性、事件、插槽见 [commands/](commands/)：

- [container.md](commands/container.md) —— 6 个根容器
- [form.md](commands/form.md) / [feedback.md](commands/feedback.md) / [list.md](commands/list.md)
- [navigation.md](commands/navigation.md) / [business.md](commands/business.md) / [style.md](commands/style.md)

## 六、目录结构

```
uniapp-ui-component-commands-skill/
├── SKILL.md                    # 技能核心
├── README.md                   # 本文件
├── STANDARD.md                 # 个体规范（C01–C10）
├── commands/                   # ★ 组件索引（生成物，勿手改）
│   ├── container.md / form.md / feedback.md / list.md
│   └── navigation.md / business.md / style.md
├── scripts/
│   └── gen-commands.js         # ★ 索引生成器（改实现后必须重跑）
├── components/
│   ├── _registry.json          # ★ 组件注册表（合法 JSON）
│   └── _template/              # 新组件三件套模板
├── references/
│   └── matching-rules.md       # 匹配优先级 / 分类表 / 冲突裁决
└── templates/
    ├── ui-variables.scss       # 指针文件（变量真源见 uniapp-theme-skill/base.css）
    └── ui-components.scss      # 指针文件（样式实现见 uniapp-base-skill/styles/index.scss）
```

## 七、契约格式

每个组件 / 容器目录下固定三件套（样式类为 `.scss` + `props.json` + `usage.md`）：

```
uniapp-base-skill/components/<category>/<name>/
├── index.vue        # 组件源码（Vue 3 <script setup lang="ts">）
├── props.json       # 属性契约
└── usage.md         # 使用示例
```

`props.json`：

```json
{
  "name": "button",
  "title": "按钮",
  "category": "form",
  "description": "统一按钮样式",
  "aliases": ["按钮", "button", "提交按钮", "主按钮", "次按钮"],
  "props": [
    { "name": "type", "type": "'primary' | 'ghost' | 'text' | 'danger'", "default": "primary", "desc": "按钮类型" }
  ],
  "events": ["click"],
  "slots": [{ "name": "default", "desc": "按钮内容，优先于 text" }]
}
```

> 容器契约写在 `uniapp-base-skill/containers/<name>/props.json`，`category` 固定为 `container`。

## 八、主题变量

本模块**不定义**任何 CSS 变量。变量真源是
`uniapp-theme-skill/templates/src/static/css/base.css`；
`templates/ui-variables.scss` 仅为指针文件。

## 九、扩展新组件

1. 判定分类与依赖容器（内容型组件必须基于根容器实现）；
2. 在 `uniapp-base-skill/components/<category>/<name>/` 写 `index.vue` + `props.json` + `usage.md`；
3. 在 `components/_registry.json` 追加一条（`name` / `title` / `kind` / `category` / `aliases` / `path`）；
4. **重新生成** `commands/<category>.md`（生成物，勿手改）：`node scripts/gen-commands.js`；
5. 在 `references/matching-rules.md` 对应分类表加关键词行；
6. 补 demo。

## 十、自检

```bash
bash scripts/check-skills.sh
```

- [ ] `components/` 下无 `.vue` 实现
- [ ] `_registry.json` 是合法 JSON，且每条 `path` 真实存在
- [ ] 每个组件在 `commands/*.md` 中有对应条目
- [ ] 组件别名 ≥ 3 且无跨组件重复
