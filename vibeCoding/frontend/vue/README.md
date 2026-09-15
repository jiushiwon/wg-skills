# Vue 前端技能矩阵

> 一套 AI 时代的原生组件库——用 SKILL 代替 NPM 包，用自然语言代替 import 语句。

## 我们在做什么

古法时代，前端开发靠的是 `npm install element-plus`，然后翻文档、查 API、手写模板代码。Element Plus / Ant Design Vue / Naive UI 这些组件库很好，但它们是**给人看的**——你需要记住 `<el-table :data="tableData">` 这种语法，需要知道 `v-loading` 怎么用，需要查 `el-form` 的 `rules` 怎么写。

AI 时代，规则变了。

**我们不发 NPM 包。我们发 SKILL。**

SKILL 是写给 AI 看的组件规范——完整的 Props/Events/Types/样式/使用示例，AI 读完就能生成符合规范的代码。不需要你记住任何 API，只需要告诉 AI "我要一个用户管理页面"，它自动知道用什么组件、怎么组合、样式怎么统一。

### 与 Element Plus 的异同

| 维度 | Element Plus | 我们 |
|------|-------------|------|
| 组件内容 | 表格、表单、按钮、弹窗… | 相似，覆盖主流场景 |
| 实现方式 | 发布 NPM 包，用户 import | SKILL 规范，AI 读取后生成代码 |
| 安装方式 | `npm install element-plus` | 安装 SKILL 文件到 `.claude/skills/` |
| 使用方式 | 写 `<el-xxx>` 模板 | 告诉 AI "我要一个表格"，AI 生成 |
| 样式体系 | SCSS 变量 | CSS 变量 Token（vue-theme-skill） |
| 扩展方式 | Fork 源码 / 覆盖样式 | 修改 SKILL.md，AI 自动适配 |
| 第三方依赖 | 需要 | **零依赖**，全部原生实现 |
| 复杂页面 | 需要自己组装 | **直接做成 SKILL**（CRUD、登录、Dashboard…） |

### 核心理念

1. **组件即 SKILL**：每个组件是一个独立的 SKILL 目录，包含规范文档、类型定义、样式、composables
2. **复杂页面也是 SKILL**：CRUD、登录页、Dashboard、Chat 这些"页面级"功能，直接封装成 SKILL，一行提示词就能生成
3. **零依赖**：不依赖任何第三方 UI 库，全部原生 CSS + Canvas 实现
4. **统一主题**：所有组件由 vue-theme-skill 的 Token 体系控制，改主题改一行配置
5. **自由组合**：原子组件（按钮、输入框）→ 组合组件（表格、表单）→ 页面引擎（CRUD、Dashboard）→ 一键生成项目（vue-generate-skill）

## 技能矩阵全景

```
┌─────────────────────────────────────────────────────────────┐
│                    vue-generate-skill                        │
│              （一键生成 Vue3+TS+Vite+Pinia 项目）              │
└──────────────────────────┬──────────────────────────────────┘
                           │ 自动生成
                           ▼
┌─────────────────────────────────────────────────────────────┐
│   vue-theme-skill        vue-layout-skill                    │
│   （设计 Token 层）       （AppLayout：侧边栏+顶栏+内容区）     │
└──────────────┬──────────────────────┬───────────────────────┘
               │ 统一主题              │ 页面骨架
               ▼                      ▼
┌──────────────────────────────────────────────────────────────┐
│                 vue-complex-skill（页面编排器）                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐│
│  │ vue-crud │ │ vue-login│ │vue-dashbd│ │  vue-chart       ││
│  │ -skill   │ │ -skill   │ │ -skill   │ │  -skill          ││
│  │(增删改查) │ │(登录页)  │ │(数据看板) │ │(图表 20 种形态)  ││
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────────────┘│
└───────┼────────────┼────────────┼────────────┼──────────────┘
        │            │            │            │
        ▼            ▼            ▼            ▼
┌──────────────────────────────────────────────────────────────┐
│                    原子组件技能层                              │
│  button  input  select  table  form  card  tag  status      │
│  dropdown  tree  contextmenu  collapse  upload  dialog      │
│  toast  datepicker  menu  sidebar                            │
└──────────────────────────────────────────────────────────────┘
```

## 四层架构

| 层级 | 技能 | 职责 | 数量 |
|------|------|------|------|
| 🎬 导演层 | vue-generate-skill | 一键生成完整项目骨架 | 1 |
| 🎨 规范层 | vue-theme-skill | 设计 Token + 多主题切换 | 1 |
| 🔧 组合层 | vue-complex-skill | 页面编排器（CRUD/Dashboard/Login/Chart/Chat） | 5+ |
| ⚙️ 零件层 | vue-*-skill | 原子级 UI 组件 | 16+ |

## 技能清单

### 规范层

| 技能 | 内容 | 状态 |
|------|------|------|
| [vue-theme-skill](vue-theme-skill/) | 设计 Token（HSL 色阶 + 尺寸阶梯 + 8 套预设主题） | ✅ |

### 组合层（页面引擎）

| 技能 | 内容 | 状态 |
|------|------|------|
| [vue-complex-skill](vue-base-skill/vue-complex-skill/) | 页面编排器（8 种页面类型） | ✅ |
| [vue-crud-skill](vue-base-skill/vue-complex-skill/vue-crud-skill/) | 增删改查页面（搜索+表格+弹窗+分页） | ✅ |
| [vue-login-skill](vue-base-skill/vue-login-skill/) | 高端登录页（8 种风格） | ✅ |
| [vue-chart-skill](vue-base-skill/vue-complex-skill/vue-chart-skill/) | Canvas 图表（20 种形态，零依赖） | ✅ |
| vue-dashboard-skill | 数据看板 | 🔲 |
| vue-chat-skill | AI 对话页 | 🔲 |
| **vue-layout-skill** | **AppLayout（侧边栏+顶栏+内容区）** | **🔜 今日** |
| **vue-menu-skill** | **侧边菜单导航** | **🔜 今日** |

### 零件层（原子组件）

| 技能 | 内容 | 状态 |
|------|------|------|
| vue-card-skill | 卡片容器 + 12 种布局 | ✅ |
| vue-button-skill | 按钮（6 type × 5 variant × 3 size） | ✅ |
| vue-tag-skill | 标签（6 type × 3 variant） | ✅ |
| vue-status-skill | 状态/徽章 | ✅ |
| vue-table-skill | 表格（23 种形态 + 加载 + 分页） | ✅ |
| vue-form-skill | 表单体系（8 组件 + 校验引擎 + 万能渲染器） | ✅ |
| vue-dropdown-skill | 下拉菜单 + 气泡确认 | ✅ |
| vue-tree-skill | 树形组件 | ✅ |
| vue-contextmenu-skill | 右键菜单 | ✅ |
| vue-collapse-skill | 折叠面板 | ✅ |
| vue-upload-skill | 文件上传 | ✅ |
| vue-generate-skill | 代码生成器 | ✅ |

## 最终目标

**利用这套组件库，实现任意前端管理端项目。**

用户只需要一句提示词："帮我做一个 XX 管理系统"，vue-generate-skill 自动：

1. 生成项目骨架（Vite + TS + Pinia + Router）
2. 注入 vue-theme-skill Token 体系
3. 搭建 vue-layout-skill 布局骨架
4. 根据需求调用 vue-crud-skill / vue-chart-skill / vue-login-skill 等生成页面
5. 所有组件自动遵循统一主题、统一规范

**零第三方依赖，零 NPM 包，全原生实现，AI 全程驱动。**

后续计划从管理端拓展到：C 端 H5、文档站、数据大屏、低代码平台……

---

*这是古法十年经验的一次 AI 时代交代——用 SKILL 重新定义前端组件库。*
