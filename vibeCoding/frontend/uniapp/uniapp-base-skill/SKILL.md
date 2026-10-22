---
name: uniapp-base-skill
description: uni-app 基础组件与容器库，兼组件索引层。提供根容器（base-card/base-popup/base-form-item/base-avatar/base-navbar/base-tabbar）与内置业务组件（表单/反馈/列表/导航/业务），是 uni-app 侧所有组件实现的唯一真源；同时按别名把中文需求映射到组件并给出路径与属性契约，并负责新组件的固化登记。触发词：做一个卡片、做一个输入框、做搜索栏、做开关、做单选、做复选、做滚轮选择器、做日期选择器、做弹窗、做底部弹窗、做确认弹窗、做操作面板、做加载态、做空状态、做列表项、做商品卡片、做文章卡片、做聊天气泡、做时间线、做顶部页签、做侧边菜单、做面包屑、做头像、做价格标签、做倒计时、做进度条、做数量步进器、做优惠券、做顶部导航、做底部菜单、做个导航、做个列表、做个表单、固化、沉淀组件、登记组件。
trigger: |
  # 卡片
  做一个卡片 | 做一个基础卡片 | 做一个好友卡片 | 做一个设置卡片 | 做一个商品卡片
  做一个评论卡片 | 做一个通知卡片 | 做一个图片卡片
  # 按钮
  做一个按钮 | 主色实心按钮 | 主色描边按钮 | 幽灵按钮 | 胶囊按钮
  # 输入
  做一个输入框 | 做一个账号输入框 | 做一个密码输入框 | 做一个手机号输入框
  做一个验证码输入框 | 做一个多行文本输入框
  # 搜索 / 开关 / 单选 / 复选
  做一个搜索栏 | 做一个胶囊搜索栏 | 做一个开关 | 做一个单选 | 做一个复选
  # 选择
  做一个下拉选择 | 做一个滚轮选择器 | 做一个多列选择器 | 做一个城市选择器
  做一个日期选择器 | 做一个时间选择器 | 做一个年月日选择器
  # 弹层
  做一个弹窗 | 做一个底部弹窗 | 做一个居中弹窗 | 做一个确认弹窗
  做一个支付方式选择弹窗 | 做一个优惠券选择弹窗 | 做一个规格选择弹窗
  做一个操作面板 | 做一个搜索面板
  # 反馈
  做一个加载态 | 做一个空状态 | 做一个轻提示
  # 列表
  做一个列表项 | 做一个商品卡片 | 做一个文章卡片 | 做一个聊天气泡 | 做一个时间线
  # 导航
  做一个顶部页签 | 做一个侧边菜单 | 做一个面包屑 | 做一个顶部导航 | 做一个底部菜单
  # 业务件
  做一个头像 | 做一个价格标签 | 做一个倒计时 | 做一个进度条 | 做一个数量步进器 | 做一个优惠券
  # 页面模板
  做一个聊天页面 | 做一个商品详情页 | 做一个个人中心页 | 做一个好友列表 | 做一个登录页
  # 组件检索 / 固化
  做个顶部导航 | 做个底部tab | 做个导航 | 做个列表 | 做个表单 | 做个弹窗 | 做个按钮
  固化 | 把这个组件固化 | 把这个功能固化 | 沉淀组件 | 登记组件
  # 子技能入口
  做一个卡片组件 | 做一个表单组件 | 做一个页面模板
---

# uniapp-base-skill

> uni-app **基础组件与容器库**，组件实现的**唯一真源**。
>
> 上位规范：[uniapp/AGENTS.md](../AGENTS.md)　个体规范：[STANDARD.md](STANDARD.md)

## 一、模块定位

本模块是 uni-app 侧的**组件唯一真源**，同时提供三样东西：

1. **根容器**（`containers/`）：卡片、弹窗、表单行、头像、顶部导航、底部菜单的外壳实现。
2. **内置组件**（`components/`）：表单、反馈、列表、导航、业务五类开箱即用组件。
3. **组件索引**（`commands/` + `components/_registry.json` + `references/matching-rules.md`）：
   把中文需求映射到组件，并给出路径与属性契约。

**其它 uni-app 专项技能（style / standard / request / auth / page-components / app-generate …）
一律不在本模块外重复实现组件**，需要组件时从本模块取。

```
专项层  style / standard / page-components / app-generate …
              ↓ 依赖
容器层  uniapp-base-skill/containers/    ← 根容器实现
              ↓ 依赖
变量层  uniapp-theme-skill/base.css      ← 主题变量唯一真源
```

> **索引与实现同源**：注册表 `components/_registry.json` 描述的每条 `path` 都落在本模块内，
> `commands/*.md` 由注册表 + 各组件 `props.json` 生成，**禁止手改**。

## 二、依赖

| Skill | 关系 | 说明 |
|-------|------|------|
| `uniapp-theme-skill` | **变量真源** | 所有 `var(--xxx, 兜底)` 的变量名与兜底值以 `templates/src/static/css/base.css` 为准，本模块不定义变量 |

**反向依赖禁止**：`uniapp-theme-skill` 不得引用本模块组件。

## 三、目录结构

```
uniapp-base-skill/
├── SKILL.md                     # 本文件
├── README.md                    # 用户文档
├── STANDARD.md                  # 个体规范（B01–B15 + C01–C10）
├── base-card.md                 # 根容器文档：基础卡片
├── base-popup.md                # 根容器文档：弹窗 / 抽屉
├── input-field.md               # 表单类文档：input-field / search-bar
├── commands/                    # ★ 组件索引（生成物，勿手改）
│   ├── container.md / form.md / feedback.md / list.md
│   └── navigation.md / business.md / style.md
├── scripts/
│   └── gen-commands.js          # ★ 索引生成器（改实现后必须重跑）
├── references/
│   ├── matching-rules.md        # 需求词 → 组件 匹配规则与冲突裁决
│   ├── skill-matrix.md          # 技能矩阵（配套技能与协作方式）
│   └── component-checklist.md   # 组件完备性检查表（新增组件必过）
├── containers/                  # ★ 根容器层
│   ├── base-card/index.vue
│   ├── base-popup/index.vue
│   ├── base-form-item/index.vue
│   ├── base-avatar/index.vue
│   ├── base-navbar/index.vue
│   └── base-tabbar/index.vue
├── components/                  # ★ 内置组件层（按类别分目录）
│   ├── _registry.json           # ★ 组件注册表（合法 JSON）
│   ├── _template/               # 固化模板（index.vue + props.json + usage.md）
│   ├── form/       button / search-bar / input-field / picker / date-picker
│   │               switch / checkbox-group / radio-group
│   ├── feedback/   toast / modal / action-sheet / loading / empty-state
│   ├── list/       list-item / product-card / article-card / chat-bubble / timeline
│   ├── navigation/ top-tab / side-menu / breadcrumb
│   └── business/   price-tag / count-down / progress-bar / stepper / coupon
├── styles/                      # 纯样式类组件 + 全局关键帧真源
│   ├── animation.scss           # ★ @keyframes 唯一定义处
│   ├── index.scss               # 统一样式入口
│   ├── button/ line/ shape/ combo/ card/
├── demo-components/             # ★ 场景 demo（Markdown + HTML 参考图）
│   ├── shared/                  # demo 公共样式
│   ├── base-card-layout/        # 卡片布局案例（31 种）
│   ├── base-form/base-input/    # 表单输入案例（14 种）
│   ├── base-page/               # 页面模板案例
│   ├── base-popup/              # 弹窗案例
│   ├── base-picker/             # 滚轮选择器案例
│   └── base-date-picker/        # 日期选择器案例
```

每个内置组件目录固定三件套：

```
components/<category>/<name>/
├── index.vue      # Vue 3 <script setup lang="ts"> 实现
├── props.json     # props / events / slots 契约（合法 JSON）
└── usage.md       # 使用示例
```

## 四、容器原则

> **所有内容型组件的外壳必须来自根容器，禁止各自手写外壳。**

**内容型组件**指承载"一段内容"的组件：卡片、弹窗、表单行、列表项、气泡、面板、页签内容区。

| 场景 | 必须使用 |
|------|---------|
| 卡片 / 面板 / 列表项 | `BaseCard` |
| 弹窗 / 抽屉 / 底部面板 | `BasePopup`（内置 BaseCard） |
| 带标签与错误提示的表单行 | `BaseFormItem` |
| 头像 | `BaseAvatar` |
| 顶部导航 | `BaseNavbar` |
| 底部菜单 | `BaseTabbar` |

**不强制套容器**：表单控件（switch / radio / checkbox / input）与纯展示件（empty-state / loading / price-tag / progress-bar / count-down）。

**容器可嵌容器**：容器不感知业务，只提供外壳与插槽。

**子类不要重复设置**容器已提供的属性（圆角、背景、边框、阴影、安全区），避免双层边框与双层圆角。

```vue
<script setup lang="ts">
import BaseCard from '../../containers/base-card/index.vue'
</script>

<template>
  <BaseCard :title="title" :shadow="true">
    <text class="desc">{{ description }}</text>
  </BaseCard>
</template>
```

## 五、组件实现要求

1. **Vue 3 `<script setup lang="ts">`**：禁止 `export default {}`、`data()`、`methods`、`this.$emit`。
2. **props 用 `interface` + `withDefaults`**；事件用 `defineEmits<{ ... }>()` 泛型元组。
3. **颜色 / 尺寸 / 间距 / 圆角 / 字号一律 `var(--token, 兜底)`**，兜底值与 `base.css` 真值一致。
4. **只用 rpx**（`env(safe-area-inset-*)` 除外），不出现 `px`。
5. **组件内不写 `@keyframes`**：关键帧真源是 `styles/animation.scss`，用 `.ui-spin` / `.ui-fade-in` / `.ui-slide-up` 等类。
6. **不使用 HTML5 标签**：只用 `view` / `text` / `image` / `input` / `textarea` / `scroll-view` / `picker` / `picker-view` / `switch` / `radio` / `checkbox`。
7. **不使用 Emoji**；占位用中文文字。
8. **不引入三方依赖**。
9. **`<style scoped>`**，不定义新的 `--xxx:` 变量。
10. **图片**用 `image` 组件 + `mode="aspectFill"` + 占位背景 + `@error` 兜底。
11. **点击区不小于 88rpx**。
12. **动画只改 `transform` / `opacity`**。

## 六、组件检索与固化

### 6.1 检索流程

    用户需求
      → ① 清洗：去空格、统一大小写
      → ② 点名命中：组件名 / 别名 → 直接命中
      → ③ 容器优先：命中"卡片/弹窗/表单行/头像/导航"等外壳词 → 先给根容器
      → ④ 分类匹配：查 references/matching-rules.md 的分类表
      → ⑤ 冲突裁决：按 matching-rules.md 第四章 裁决表
      → ⑥ 未命中 → 走 6.4 固化流程

### 6.2 输出格式

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

### 6.3 组件总览

| 分类 | 数量 | 组件 |
|------|------|------|
| 容器 | 6 | base-card、base-popup、base-form-item、base-avatar、base-navbar、base-tabbar |
| form | 8 | button、search-bar、input-field、picker、date-picker、switch、checkbox-group、radio-group |
| feedback | 5 | toast、modal、action-sheet、loading、empty-state |
| list | 5 | list-item、product-card、article-card、chat-bubble、timeline |
| navigation | 3 | top-tab、side-menu、breadcrumb |
| business | 5 | price-tag、count-down、progress-bar、stepper、coupon |
| style | 5 类 | button / line / shape / combo / card（纯 CSS 类，路径在 `styles/`） |

逐条属性、事件、插槽、CSS 类见 [commands/](commands/)。

### 6.4 固化流程（新组件）

1. **判定分类**：`form` / `feedback` / `list` / `navigation` / `business`（样式类归 `style`）；
2. **落位**：`components/<category>/<name>/`，写 `index.vue` + `props.json` + `usage.md`；
   内容型组件必须基于根容器实现；
3. **登记**：在 `components/_registry.json` 追加一条（`name` / `title` / `kind` / `category` / `aliases` / `path`）；
4. **同步索引**：跑 `node scripts/gen-commands.js` 重新生成 `commands/*.md`（**不手写**）；
5. **同步匹配规则**：在 `references/matching-rules.md` 对应分类表加关键词行；
6. **补 demo**：在 `demo-components/` 下补一个可直接打开的 HTML。

> `commands/*.md` 是**生成物**。改组件先改实现与注册表，再重新生成，**禁止**手改 `commands/*.md`。

## 七、主题变量

变量真源：`uniapp-theme-skill/templates/src/static/css/base.css`（约 144 个变量）。

命名空间：

| 前缀 | 语义 |
|------|------|
| `--color-*` | 主色 / 语义色（`--color-primary` / `--color-success` / `--color-error` …） |
| `--primary-*` `--secondary-*` `--tertiary-*` `--gray-*` | 色阶 |
| `--text-*` | 文字色 |
| `--bg-*` | 背景色 |
| `--border` `--border-light` | 描边 |
| `--space-N` | 间距 |
| `--radius-*` | 圆角 |
| `--font-*` | 字号 |
| `--height-*` `--icon-*` | 固定尺寸 |
| `--shadow-*` | 阴影 |
| `--transition-*` `--ease-*` | 过渡 |
| `--z-index-*` | 层级 |

**写法**：`var(--token, 兜底)`。兜底必须等于真源值，不得写 `var(--token)` 裸引用。

**主题切换**：根节点 `data-theme="cute|business|fresh|cyber|retro|glass|minimal|warm"`，组件无需改动。

## 八、文档与 Demo

| 文件 | 内容 |
|------|------|
| `SKILL.md` | 本文件：定位、依赖、目录、容器原则、实现要求、检索与固化流程 |
| `README.md` | 给使用者看的总览与快速上手 |
| `STANDARD.md` | 个体规范（B01–B15 实现红线 + C01–C10 索引红线） |
| `base-card.md` / `input-field.md` / `base-popup.md` | 根容器使用文档 |
| `commands/<category>.md` | 分类组件索引（生成物） |
| `references/matching-rules.md` | 需求词 → 组件 匹配规则与冲突裁决 |
| `references/skill-matrix.md` | 与其它技能的协作关系 |
| `references/component-checklist.md` | 新增/修改组件的完备性检查表 |

Demo 规范见 `uniapp/AGENTS.md` 第七节。

## 九、版本历史

### v4.0.0

- 吸收原「UI 组件指令」模块（已删除）：注册表、分类索引、匹配规则、生成器全部并入本模块，该 skill 删除。
- 组件实现与索引同源，`commands/*.md` 改由 `scripts/gen-commands.js` 生成。

### v3.0.0

- 组件实现全部迁入本模块，原「UI 组件指令」模块退化为索引层。
- 新增 `containers/` 根容器层；`templates/` 目录移除。
- 全部内置组件重写为 Vue 3 `<script setup lang="ts">`。
- 新增 `styles/animation.scss` 作为全局关键帧唯一真源。
- 新增 `STANDARD.md` 与 `references/component-checklist.md`。
