---
name: uniapp-ui-component-commands-skill
description: "uni-app 组件索引层。把中文需求映射到 uniapp-base-skill 的根容器 / 内置组件 / 样式类，给出组件名、路径、属性契约与用法；并负责新组件的固化登记。触发词：做个顶部导航、做底部tab、做导航、做列表、做表单、做弹窗、做按钮、做卡片、固化、把这个组件固化、记录组件。"
user-invocable: true
argument-hint: "[组件需求描述] 或 [已有组件名]"
triggers:
  # 索引检索
  - "顶部导航"
  - "底部tab"
  - "做个导航"
  - "做个列表"
  - "做个表单"
  - "做个弹窗"
  - "做个按钮"
  - "做个卡片"
  # 固化登记
  - "固化"
  - "把这个.*固化"
  - "记录.*=.*"
---

# UI Component Commands（索引层）

> 上位规范：[uniapp/AGENTS.md](../AGENTS.md)　个体规范：[STANDARD.md](STANDARD.md)

## 一、模块定位

本模块**不生产组件实现**，只回答三件事：

1. **用哪个** —— 需求描述 → 组件（容器优先）；
2. **去哪拿** —— 组件路径与属性契约；
3. **怎么沉淀** —— 新组件落地到 `uniapp-base-skill` 并登记到索引。

```
专项层  app-generate / page-components / ui-template-builder …
            ↓ 检索
索引层  uniapp-ui-component-commands-skill（本模块）
            ↓ 指向实现
实现层  uniapp-base-skill/containers/ + components/ + styles/
            ↓ 依赖
变量层  uniapp-theme-skill/.../base.css
```

> **边界**：本模块回答"用哪个、去哪拿、怎么沉淀"；`uniapp-base-skill` 回答"它长什么样、怎么用"。
> 组件实现**一律**在 `uniapp-base-skill`，本模块 `components/` 下不得出现 `.vue`。

## 二、检索流程

```
用户需求
  → ① 清洗：去空格、统一大小写
  → ② 点名命中：组件名 / 别名 → 直接命中
  → ③ 容器优先：命中"卡片/弹窗/表单行/头像/导航"等外壳词 → 先给根容器
  → ④ 分类匹配：查 references/matching-rules.md 的分类表
  → ⑤ 冲突裁决：按 matching-rules.md §4 裁决表
  → ⑥ 未命中 → 走第三节固化流程
```

判定表与优先级见 [references/matching-rules.md](references/matching-rules.md)。

## 三、输出格式

命中组件后，**按以下顺序**输出（缺一不可）：

| 顺序 | 内容 | 来源 |
|------|------|------|
| 1 | 组件名 + 一句话说明 | `commands/<category>.md` |
| 2 | 组件路径（相对仓库根） | `_registry.json` 的 `path` |
| 3 | 属性 / 事件 / 插槽表 | `commands/<category>.md`（由组件 `props.json` 生成） |
| 4 | 用法示例 | 组件目录下的 `usage.md` |
| 5 | 依赖提醒（基于哪个容器、是否需要先引入容器） | `commands/<category>.md` |

**容器优先**规则：需求里出现"卡片 / 弹窗 / 面板 / 列表项 / 表单项 / 头像 / 顶部导航 / 底部菜单"等
**外壳**词时，先给根容器，再给内容组件。

## 四、固化流程（新组件）

1. **判定分类**：`form` / `feedback` / `list` / `navigation` / `business`（样式类归 `style`）；
2. **落位**：`uniapp-base-skill/components/<category>/<name>/`，写 `index.vue` + `props.json` + `usage.md`；
   内容型组件必须基于根容器实现；
3. **登记**：在 `components/_registry.json` 追加一条（`name` / `title` / `kind` / `category` / `aliases` / `path`）；
4. **同步索引**：重新生成 `commands/<category>.md`（由注册表 + 各组件 `props.json` 生成，**不手写**）：
   `node scripts/gen-commands.js`
5. **同步匹配规则**：在 `references/matching-rules.md` 对应分类表加关键词行；
6. **补 demo**：在 `uniapp-base-skill/demo-components/` 下补一个可直接打开的 HTML。

> `commands/*.md` 是**生成物**。改组件先改实现与注册表，再重新生成，**禁止**手改 `commands/*.md`。

## 五、组件总览

| 分类 | 数量 | 组件 |
|------|------|------|
| 容器 | 6 | base-card、base-popup、base-form-item、base-avatar、base-navbar、base-tabbar |
| form | 8 | button、search-bar、input-field、picker、date-picker、switch、checkbox-group、radio-group |
| feedback | 5 | toast、modal、action-sheet、loading、empty-state |
| list | 5 | list-item、product-card、article-card、chat-bubble、timeline |
| navigation | 3 | top-tab、side-menu、breadcrumb |
| business | 5 | price-tag、count-down、progress-bar、stepper、coupon |
| style | 5 类 | button / line / shape / combo / card（纯 CSS 类，路径在 `uniapp-base-skill/styles/`） |

逐条属性、事件、插槽见 [commands/](commands/)。

## 六、目录结构

```
uniapp-ui-component-commands-skill/
├── SKILL.md                    # 本文件
├── README.md                   # 用户文档
├── STANDARD.md                 # 个体规范（C01–C10）
├── commands/                   # ★ 组件索引（生成物，勿手改）
│   ├── container.md / form.md / feedback.md / list.md / navigation.md / business.md / style.md
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

## 七、触发词

uniapp-ui-component-commands、UI Component Commands、组件指令、组件索引、固化组件
