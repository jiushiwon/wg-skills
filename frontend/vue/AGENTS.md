# Vue 技能群整体规范（Vue AGENTS）

> 本文件是 `frontend/vue/` 下**所有** Vue 技能的总控规范。
>
> 上位规范：仓库根 [`AGENTS.md`](../../AGENTS.md) 与前端公共层 [`frontend/AGENTS.md`](../AGENTS.md)（本文件不重复，只做 Vue 群细化与补充）。
> 下位规范：每个 skill 目录下的 `STANDARD.md`（个体规范）。
>
> 层级关系：**根 AGENTS.md → frontend/AGENTS.md → 本文件 → STANDARD.md**。下位不得与上位冲突；下位更严格时从下位。

---

## 一、模块定位与分层

vue 目录下的技能**不是并列的**，而是分层的。任何新增技能必须先确定它属于哪一层。

```
第 0 层  变量真源层   vue-theme-skill
          └─ 提供全量 Design Token（templates/src/styles/tokens.css），所有其他层只能引用，不能自造变量名

第 1 层  容器 + 组件层   vue-base-skill（base-card 容器 + 30+ 子组件 skill）
          └─ 提供所有可复用的 UI 基础件，是"内容型组件"的唯一实现来源

第 2 层  专项层       vue-style-skill / vue-generate-skill / vue-tui-skill
          vue-complex-skill（及 7 个复合子 skill）/ universal-login-page
          nuxt-generate-skill / electron-vue-init-skill
          └─ 各自解决一个具体方向的问题（样式基础设施 / 脚手架 / 复合场景 / SSR / 桌面端）
```

**依赖方向是单向的**：

```
专项层  ──依赖──▶  容器 + 组件层  ──依赖──▶  变量真源层
```

- 下层**不得**反向依赖上层（`vue-base-skill` 不得 import `vue-generate-skill` 的代码）。
- 同层之间原则上不互相依赖；确需引用时，在对方 `SKILL.md` 的「依赖」表中登记。

---

## 二、唯一真源原则（Single Source of Truth）

同一份"事实"在整个 Vue 技能群中**只允许存在一份**，其余位置一律引用。

| 事实 | 唯一真源 | 其他位置怎么用 |
|------|----------|----------------|
| 主题 Token（颜色 / 间距 / 圆角 / 字号 / 阴影 / 动效 / 层级） | `vue-theme-skill/templates/src/styles/tokens.css` | 只能 `var(--xxx)` 引用，**禁止**别处 `:root` 重定义同名变量 |
| 卡片外壳 | `vue-base-skill/base-card.md`（base-card 组件） | 内容型组件用 `<base-card>` 包裹，**禁止**手写卡片圆角/分割线/内边距 |
| 组件**实现** | `vue-base-skill/vue-{xxx}-skill/components/` | 专项层**依赖**，不复制源码 |
| 组件**规格**（props/events/slots 契约） | `vue-base-skill/vue-{xxx}-skill/base-{xxx}.md` | 引用时按规格对齐，不各自维护一份 |
| 样式基础设施（工具类 / 动画 / 布局） | `vue-style-skill` | 只引用其规则，不新造平行工具类 |

**判定规则**：如果你要写的东西"在别处已经有一份"，就是复制，不是复用。

---

## 三、零 HTML5 标签红线（Vue 群第一条硬规则）

> 详见根 `AGENTS.md` 第十二节，此处是 Vue 群内的强制落地。

`vue-base-skill/` 下所有 `.md` 组件文档中的**实现代码**，严禁出现以下原生标签：

```
<button>  <input>  <select>  <table>  <tr>  <td>  <th>
<textarea>  <form>  <option>  <label>  <fieldset>  <legend>
<header>  <footer>  <h1>-<h6>  <ul>/<ol>/<li>  <a href>
```

**替代方案**：

| 原生标签 | 替代写法 |
|----------|----------|
| `<button>` | `<div role="button" tabindex="0" :aria-disabled @click @keydown.enter @keydown.space.prevent>` |
| `<input type="checkbox">` | `<div role="checkbox" tabindex="0" :aria-checked>` |
| `<input type="radio">` | `<div role="radio" tabindex="0" :aria-checked>` |
| `<input type="text">` | `<div contenteditable="true" role="textbox" @input>` |
| `<textarea>` | `<div contenteditable="true" role="textbox">` |
| `<form>` | `<div role="form" @keydown.enter.prevent>` + `emit('submit')` |
| `<table>` | `<div role="table">` + CSS Grid/Flex |

**唯一技术豁免**：`base-upload.md` 内部允许渲染一个 `display:none` 的隐藏 file 控件（Web 文件选择是浏览器安全模型硬性要求），可见触发区仍用 `<div role="button">`。

---

## 四、零 Emoji 铁律

所有组件代码（`.md` 的 template/script/style + `demo-components/**/*.html` 可见 UI）**严禁使用彩色 emoji**。

- 约定标记（❌ ✅ ⚠️）与标准 Unicode 符号（✓ × ✎ →）允许（跨平台一致）。
- 文件类型图标用纯文本标记（`PDF` `DOC`）+ CSS badge，不用 emoji。

---

## 五、容器原则

### 5.1 什么叫"内容型组件"

凡是**内部承载一段可替换内容**的组件，都属于内容型组件：卡片、商品卡、列表项、表单项、气泡、弹窗、面板、抽屉。

表单控件（单选、多选、开关）与纯展示件（标签、价格、状态、加载）**不属于**内容型组件，不需要套容器。

### 5.2 强制要求

1. 内容型组件的**外壳**必须来自 `base-card`，不得自行实现圆角、分割线、背景、内边距。
2. 需要"内容 + 标题 + 底部操作区"结构时，用 `base-card` 的 `header` / `footer` 插槽。
3. 容器组件允许**再包容器**，这是特性不是违规。
4. 组件本身**不强制**内嵌 `base-card`（避免嵌套过深），但布局应假定外层是 `base-card`。

---

## 六、组件契约规范

### 6.1 一个组件 = 一个目录

```
vue-{xxx}-skill/
├── SKILL.md              # 入口
├── README.md             # 人类说明
├── base-{xxx}.md         # 组件规格（props/events/slots 契约，唯一真源）
├── package.json          # 可选：npm 软链接时
└── components/
    └── BaseXxx.vue       # 可选：组件实现
```

### 6.2 Props / Events / Slots 命名

| 类型 | 约定 |
|------|------|
| 双向绑定 | `modelValue` + `update:modelValue` |
| 命名 | camelCase（`placeholder` / `disabled` / `loading`） |
| 布尔属性 | 直接 boolean，不加 `is` 前缀 |
| 事件 | 动宾结构：`change` / `clear` / `select` / `submit` |
| Slot | 语义化：`default` / `header` / `footer` / `prefix` / `suffix` |

### 6.3 实现要求

1. Vue 3 `<script setup lang="ts">`；`defineProps<{...}>()` 泛型；`defineEmits<{...}>()` 泛型。
2. 样式一律 `scoped`；零硬编码，颜色/间距/圆角/字号全走 `var(--xxx, 兜底)`。
3. 组件不直接依赖具体业务；不引入 store / 请求等上层依赖。

---

## 七、md 与 demo 分离

| 层级 | 文件 | 性质 | 受零 HTML5 标签约束 |
|------|------|------|-------------------|
| 逻辑层 | `*.md` 组件文档 | 实现代码 + 设计契约 | ✅ 是 |
| 视觉层 | `demo-components/**/html/*.html` | 静态演示 | ❌ 否 |

- demo HTML 允许用原生标签，但**视觉必须与 `.md` 渲染效果一致**（className / CSS 变量 / 组件层级 / 交互状态）。
- demo 底部需列出完整入参（props / columns / events / slots）。

---

## 八、变更纪律

1. 改组件规格 → 同步 `base-{xxx}.md` 与 `SKILL.md`。
2. 改 Token → 同步 `vue-theme-skill/templates/src/styles/tokens.css` 与所有引用处的兜底值。
3. 改触发词 → 同步 `README.md` 示例。
4. 改目录结构 → 同步 `SKILL.md` 目录树、根 `AGENTS.md` 第三节、根 `README.md`。
5. 新增组件类型，先补组件契约（`base-{xxx}.md`），再实现。
6. 破坏性变更必须在 `README.md` 标注迁移方式。

---

## 九、自检清单（提交前）

```bash
bash scripts/check-skills.sh
```

再人工确认：

- [ ] 实现代码是否零 HTML5 标签（`grep -rnE '<(button|input|select|table|...)' --include="*.md"`）
- [ ] 是否零彩色 emoji
- [ ] 是否引入了第二份重复实现（唯一真源）
- [ ] 内容型组件是否基于 `base-card`
- [ ] 颜色/间距/圆角/字号是否走 `var(--xxx, 兜底)`
- [ ] `base-{xxx}.md` 与 `SKILL.md` 是否同步
- [ ] demo 视觉是否与 `.md` 一致
