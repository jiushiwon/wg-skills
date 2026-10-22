# uniapp 技能群整体规范（Unified AGENTS）

> 本文件是 `vibeCoding/frontend/uniapp/` 下**所有** uni-app 技能的总控规范。
>
> 上位规范：仓库根 [`AGENTS.md`](../../../AGENTS.md)（仓库级通用规则，本文件不重复，只做细化与补充）。
> 下位规范：每个 skill 目录下的 `STANDARD.md`（个体规范），结构统一，内容按本模块实际情况填写。
>
> 层级关系：**根 AGENTS.md（仓库通用） → 本文件（uniapp 群通用） → STANDARD.md（单模块个体）**。下位不得与上位冲突；下位更严格时从下位。

---

## 一、模块定位与分层

uniapp 目录下的技能**不是并列的**，而是分层的。任何新增技能必须先确定它属于哪一层。

```
第 第 0 层  变量真源层   uniapp-theme-skill
          └─ 提供全量 CSS 变量（base.css），所有其他层只能引用，不能自造变量名

第 1 层  容器层       uniapp-base-skill（根容器 + 基础零件）
          └─ 提供所有可复用的 UI 基础件，是"内容型组件"的唯一实现来源

第 2 层  专项层       uniapp-style-skill / uniapp-request-skill / uniapp-auth-skill
          uniapp-code-audit-skill / uniapp-crossplatform-audit-skill
          uniapp-standard-skill / uniapp-diagnostic-skill / uniapp-page-components-skill
          uniapp-app-generate-skill / uniapp-ui-replica-skill
          uniapp-ui-template-builder-skill / uniapp-vue2-upgrade-skill
          uniapp-member-center-skill
          └─ 各自解决一个具体方向的问题（样式规范 / 请求 / 鉴权 / 审计 / 脚手架 …）
```

**依赖方向是单向的**：

```
专项专项层  ──依赖──▶  容器层  ──依赖──▶  变量真源层
```

- 下层**不得**反向依赖上层（`base-skill` 不得 import `request-skill` 的代码）。
- 同层之间原则上不互相依赖；确需引用时，在对方 `SKILL.md` 的「依赖」表中登记。

---

## 二、唯一真源原则（Single Source of Truth）

同一份"事实"在整个 uniapp 技能群中**只允许存在一份**，其余位置一律引用。

| 事实 | 唯一真源 | 其他位置怎么用 |
|------|----------|----------------|
| 主题变量（颜色 / 间距 / 圆角 / 字号 / 阴影 / 动效 / 层级） | `uniapp-theme-skill/templates/src/static/css/base.css` | 只能 `var(--xxx)` 引用，**禁止**在别处 `:root` 里重定义同名变量，**禁止**新造命名 |
| 卡片外壳 | `uniapp-base-skill/containers/base-card/` | 组件用 `<base-card>` 包裹，**禁止**手写卡片圆角/分割线/内边距 |
| 弹窗外壳（遮罩 / 方向 / 圆角 / 安全区 / 动画） | `uniapp-base-skill/containers/base-popup/` | 组件用 `<base-popup>` 承载，**禁止**自己写 `position: fixed` + 遮罩 |
| 表单项外壳 | `uniapp-base-skill/containers/base-form-item/` | 同上 |
| 头像外壳 | `uniapp-base-skill/containers/base-avatar/` | 同上 |
| 顶部导航 / 底部菜单外壳 | `uniapp-base-skill/containers/base-navbar/`、`base-tabbar/` | 同上 |
| 全局关键帧（`@keyframes`） | `uniapp-base-skill/styles/animation.scss` | 组件用 `.ui-spin` / `.ui-fade-in` / `.ui-slide-up` 等类，**禁止**组件内自带 `@keyframes` |
| 组件清单 / 别名 / 匹配规则 | `uniapp-base-skill/commands/` + `components/_registry.json` + `references/matching-rules.md` | 其他 skill 引用组件时按别名检索，不各自维护一份清单 |
| 组件**实现** | `uniapp-base-skill/components/` | 专项层**依赖**，不复制源码 |

**判定规则**：如果你要写的东西"在别处已经有一份"，就是复制，不是复用。

---

## 三、容器原则

> 本节是 uniapp 技能群的第一条硬规则，优先级高于任何单组件的实现便利。

### 3.1 什么叫"内容型组件"

凡是**内部承载一段可替换内容**的组件，都属于内容型组件：卡片、商品卡、文章卡、列表项、表单项、气泡、弹窗、面板、抽屉、页签内容区。

表单控件（单选、多选、开关、步进器）与纯展示件（标签、价格、进度条）**不属于**内容型组件，不需要套容器。

### 3.2 强制要求

1. 内容型组件的**外壳**必须来自根容器组件（`base-card` / `base-popup` / `base-form-item` / `base-avatar` / `base-navbar` / `base-tabbar`），不得自行实现圆角、分割线、背景、内边距。
2. 需要"内容 + 标题 + 底部操作区"的结构时，用容器的 `header` / `footer` 插槽，不要自己再包一层。
3. 容器组件允许**再包容器**（如 `base-popup` 内部就是 `base-card`），这是特性不是违规。
4. 容器内部的**内容**由调用方通过插槽决定，容器不感知业务。

### 3.3 典型反例（禁止）

```vue
<template>
<!--  手写卡片外壳 -->
<view class="my-card">
  <text class="my-card__title">标题</text>
  <view class="my-card__body">…</view>
  <view class="my-card__footer">…</view>
</view>

<!--  手写弹窗外壳 -->
<view v-if="show" class="mask" @click="close">
  <view class="sheet">…</view>
</view>

<!--  用容器 -->
<base-card title="标题" padding="default">
  <view>…</view>
  <template #footer>…</template>
</base-card>
</template>


```

### 3.4 专项层怎么用容器

专项层（page-components / app-generate / ui-template-builder 等）**依赖** `uniapp-base-skill` 的容器与零件，不得复制其源码。需要调整外观时，走 props 或主题变量；确需派生时，继承而非复制。

---

## 四、主题变量规范

### 4.1 命名空间

所有运行时 CSS 变量定义在 `base.css` 的 `:root, page` 选择器下，采用以下前缀语义：

| 类别 | 前缀 | 示例 |
|------|------|------|
| 语义色 | `--color-*` | `--color-primary` `--color-error` |
| 文字 | `--text-*` | `--text-primary` `--text-tertiary` |
| 背景 | `--bg-*` | `--bg-page` `--bg-card` |
| 线条 | `--border*` | `--border` `--border-light` |
| 间距 | `--space-N` | `--space-4` |
| 圆角 | `--radius-*` | `--radius-md` `--radius-card` |
| 字号 | `--font-*` | `--font-md` |
| 尺寸 | `--height-*` `--icon-*` | `--height-btn-md` `--icon-sm` |
| 阴影 | `--shadow-*` | `--shadow-sm` |
| 动效 | `--transition-*` | `--transition-fast` |
| 层级 | `--z-index-*` | `--z-index-modal` |

### 4.2 使用规则

1. **只允许引用 `base.css` 里已存在的变量**。新增变量必须先加进 `base.css`，再引用。
2. **禁止在业务组件里定义 `:root` / `page` 级变量**。组件内部的局部变量必须带组件前缀（如 `--pay-item-gap`），且只作用在组件根 class 上。
3. **禁止裸值**。颜色一律 `var(--xxx, #兜底)`；间距/圆角/字号同理。`#fff`、`16px`、`12rpx` 这类字面量只允许出现在 `base.css` 自身。
4. 长度单位统一 **rpx**（`base.css` 体系），`px` 仅用于必须是物理像素的场景（如 `1px` 细线、`env()` 安全区）。
5. 引用变量时**必须带兜底值**：`var(--bg-card, #ffffff)`，保证主题未加载时组件仍可渲染。
6. **兜底值必须与 `base.css` 的真值完全一致**。不一致会出现"变量已加载但取值不同"的隐性漂移，且主题切换时无法察觉。改动 `base.css` 真值时，必须同步全仓兜底值。
7. **禁止 `var(--token)` 裸引用**：变量改名后裸引用会静默失效，必须写成 `var(--token, 兜底)`。

### 4.3 换肤机制

换肤只通过 `base.css` 的 `[data-theme="xxx"]` 覆盖实现（内置 cute / business / fresh / cyber / retro / glass / minimal / warm）。组件**不得**内置 `data-theme` 判断逻辑，也不得写死主色。

---

## 五、组件规范

### 5.0 两套命名空间（先分清作用域）

历史上 uniapp 侧存在三套组件命名法并存，本规范按**作用域**划清，各管一段，不再互相打架：

| 命名空间 | 位置 | 命名法 | 归属 |
|----------|------|--------|------|
| **技能库组件** | `uniapp-base-skill/components/`、`uniapp-base-skill/containers/` | kebab-case + 分类目录 | 本规范 §5.1 |
| **业务项目组件** | 使用方项目的 `src/components/` | PascalCase 目录 + `App` 前缀 | `uniapp-app-generate-skill` / `uniapp-diagnostic-skill` / `uniapp-style-skill` |

- 技能库组件被引入项目后，如需在项目内二次封装，按业务项目命名法落地（`AppCard/AppCard.vue`），但**实现来源仍指向技能库组件**，不得复制源码。
- 技能库组件**不强制** `App` 前缀，也**不使用** PascalCase 目录。

### 5.1 技能库组件目录结构

一个组件 = 一个目录，kebab-case 命名：

```
components/<category>/<component-name>/
├── index.vue        # 组件实现（Vue3 <script setup lang="ts">）
├── props.json       # 属性契约（合法 JSON，禁止注释）
├── usage.md         # 使用示例
└── index.scss       # 仅纯样式类组件需要（无 Vue 逻辑）
```

`<category>` 取值固定为：`form` / `feedback` / `business` / `list` / `navigation` / `style` / `container`。

根容器（`base-card` / `base-popup` / `base-form-item` / `base-avatar` / `base-navbar` / `base-tabbar`）单独放 `uniapp-base-skill/containers/<name>/`，不混在 `components/` 里——容器是"地基"，零件是"积木"，两者生命周期与复用层级不同。

### 5.2 实现要求

1. Vue 组件统一使用 **Vue 3 `<script setup lang="ts">`**；`props` 必须有 TypeScript 接口 `Props`；`withDefaults` 给全默认值。
2. 组件名用 PascalCase 文件名 + `name` 声明（`BaseCard` / `RadioGroup`）。
3. **每个 prop 都要有注释**，写清用途与取值范围。
4. 样式一律 `scoped`；`lang="scss"` 仅在需要嵌套时使用。
5. 组件不直接依赖具体业务；不引入 store / 请求等上层依赖。

### 5.3 `props.json` 契约

```json
{
{
  "name": "radio-group",
  "title": "单选组",
  "category": "form",
  "description": "一组互斥选项",
  "aliases": ["单选框", "radio", "单选"],
  "props": [
    { "name": "modelValue", "type": "string | number", "default": "", "desc": "绑定值" }
  ],
  "events": ["update:modelValue", "change"],
  "slots": ["default"]
}
```

- 必须是**严格合法 JSON**（禁止 `//` 注释、禁止尾逗号），以便工具链 `JSON.parse`。
- `props` 里的每一项必须与 `index.vue` 的 `Props` 接口**逐条对应**，名称、类型、默认值三者一致。
- `aliases` 用于检索匹配，**必填**（即使只有一项）。
- `slots` 无则写 `[]`，`events` 无则写 `[]`。

### 5.4 `usage.md` 要求

必须有：基础用法 → 至少一个进阶用法（组合 / 插槽 / 事件）→ 注意事项。

### 5.5 组件完备性检查表

提交前逐条自查（详见 `uniapp-base-skill/references/component-checklist.md`）：

- [ ] `props.json` 与实现逐条对应，且是合法 JSON
- [ ] `usage.md` 覆盖基础 + 进阶用法
- [ ] 所有颜色/尺寸走 `var(--xxx, 兜底)`，无裸值
- [ ] 内容型组件基于根容器
- [ ] 事件、插槽与 `props.json` 声明一致
- [ ] 组件有可运行的 demo（`demo-components/` 下）

---

## 六、文档规范

| 文件 | 位置 | 作用 |
|------|------|------|
| `SKILL.md` | 每个 skill 根 | 入口：frontmatter + 能力说明 + 使用方式 + 目录树 |
| `README.md` | 每个 skill 根 | 面向用户的完整说明（功能 / 用法 / 示例 / 目录） |
| `STANDARD.md` | 每个 skill 根 | **个体规范**：本模块的目录约定、组件清单、依赖、内部约束 |
| `references/*.md` | 每个 skill 内 | 按主题拆分的参考资料，避免长文塞进 SKILL.md |
| 根 `*.md`（如 `base-popup.md`） | 仅 `uniapp-base-skill` | 根容器的详细契约文档 |

- **触发词**写在 `SKILL.md` 的 frontmatter `description`（或 `triggers`）里，**必须**与 `README.md` 的使用示例同步。
- 不得出现 emoji 在标题、表格、章节名中。
- 表格用 GFM；流程图用 Mermaid。
- 组件文档与实现不一致时，**以实现为准并立刻修文档**（禁止发布"文档写了但没有"的 API）。

---

## 七、Demo 规范

1. 每个组件**至少一个**可直接打开运行的 demo，放在该组件所属 skill 的 `demo-components/<组件名>/html/` 下。
2. Demo 必须是**自包含**的单个 HTML：自带 `:root` 变量定义、内联样式、可直接 `file://` 打开，不依赖构建。
3. Demo 中的交互状态要**默认触发到底**（例如弹窗 demo 默认是打开状态），避免出现"打开页面什么都没发生"。
4. 动画类 demo 需保证截图/静态查看时落到终态，不停在动画中间帧。
5. Demo 中禁止出现 `console.error`、未定义变量、失效路径。

---

## 八、命名与注册表

- 技能库组件目录 kebab-case；容器目录 kebab-case；Vue 文件统一 `index.vue`（根容器可用 `base-card.vue`）。
- 业务项目组件目录 PascalCase + `App` 前缀（见 §5.0）。
- 组件注册表 `components/_registry.json` 必须**严格合法 JSON**（禁止 `//` 注释、禁止尾逗号）；`path` 字段指向组件实际所在路径；新增/删除/移动组件必须同步。
- 同一组件在技能群内**只有一个实现目录**；其余位置以依赖方式引用。
- **零 Emoji 铁律**：标题、表格、章节名、正文结论句中禁止使用 emoji 作为强调标记；代码与标识符中的 emoji 一律禁止。

---

## 九、变更纪律

1. 改组件实现 → 同步 `props.json`、`usage.md`、对应 `*.md` 契约文档。
2. 改触发词 → 同步 `README.md` 示例、`STANDARD.md`。
3. 改目录结构 → 同步 `SKILL.md` 目录树、`README.md` 目录说明、仓库根 `AGENTS.md` 第三节、根 `README.md`。
4. 跨 skill 移动组件 → 必须更新：注册表路径、`uniapp-base-skill` 的 `commands/*.md` 与 `references/matching-rules.md`、所有引用该组件路径的文档。
5. 破坏性变更必须在 `README.md` 标注迁移方式。

---

## 十、自检清单（提交前）

```bash
bash scripts/check-skills.sh
```

再人工确认：

- [ ] 本次改动是否只影响目标 skill（技能自治）
- [ ] 是否引入了第二份重复实现（唯一真源）
- [ ] 是否有组件绕过了容器原则
- [ ] `props.json` 是否仍是合法 JSON
- [ ] 新增/移动组件是否已登记到注册表与索引层
- [ ] 文档与实现是否一致
