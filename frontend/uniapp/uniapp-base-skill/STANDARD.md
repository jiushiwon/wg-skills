# uniapp-base-skill 个体规范

> 上位规范：[uniapp/AGENTS.md](../AGENTS.md)
> 本文件只写本模块特有约束；与上位规范重复的内容不再赘述。

## 一、模块定位

**第 1 层：容器层 + 组件索引层。**

本模块提供 uniapp 技能群的**根容器**与**基础零件**，是所有内容型组件的唯一实现来源；
同时提供**组件索引**（注册表 + 分类索引 + 匹配规则），是"用哪个、去哪拿、怎么沉淀"的唯一出处。

```
uniapp-theme-skill（变量真源）
          
uniapp-base-skill（容器 + 零件 + 索引）   本模块
          
专项层（style / page-components / app-generate / ui-template-builder …）
```

## 二、依赖

| 依赖 | 方向 | 用途 |
|------|------|------|
| `uniapp-theme-skill` | 依赖（变量真源） | 全部颜色/间距/圆角/字号来自 `base.css` |
| `uniapp-page-components-skill` | 索引依赖 | 历史页面组件清单，用于搬迁时的对照 |

反向依赖（**禁止**）：`uniapp-theme-skill` 不得引用本模块。

## 三、目录约定

```
uniapp-base-skill/
├── SKILL.md
├── README.md
├── STANDARD.md                       # 本文件
├── base-card.md                      # 根容器契约文档
├── base-popup.md                     # 根容器契约文档
├── input-field.md                    # 表单类文档（input-field / search-bar）
├── commands/                         # ★ 分类组件索引（生成物，勿手改）
│   ├── container.md / form.md / feedback.md / list.md
│   └── navigation.md / business.md / style.md
├── scripts/
│   └── gen-commands.js               # ★ 索引生成器（改实现后必须重跑）
├── containers/                       # ★ 根容器层
│   ├── base-card/{index.vue,…}
│   ├── base-popup/{index.vue,…}
│   ├── base-form-item/{index.vue,…}
│   ├── base-avatar/{index.vue,…}
│   ├── base-navbar/{index.vue,…}
│   └── base-tabbar/{index.vue,…}
├── components/                       # ★ 内置组件层
│   ├── _registry.json                # ★ 组件注册表（严格合法 JSON）
│   ├── _template/                    # 固化模板（index.vue + props.json + usage.md）
│   ├── form/      button/search-bar/input-field/picker/date-picker/
│   │              switch/checkbox-group/radio-group
│   ├── feedback/  toast/modal/action-sheet/loading/empty-state
│   ├── list/      list-item/product-card/article-card/chat-bubble/timeline
│   ├── navigation/ top-tab/side-menu/breadcrumb
│   └── business/  price-tag/count-down/progress-bar/stepper/coupon
├── styles/                           # 样式类组件 + 全局关键帧真源
│   ├── animation.scss                # ★ @keyframes 唯一定义处
│   ├── index.scss
│   └── button/ line/ shape/ combo/ card/
├── references/
│   ├── matching-rules.md             # 需求词 → 组件 匹配规则与冲突裁决
│   ├── skill-matrix.md
│   └── component-checklist.md
└── demo-components/                  # ★ 场景 demo（Markdown 规范 + HTML 参考图）
    ├── base-card-layout/  base-form/  base-page/
    └── base-popup/  base-picker/  base-date-picker/  shared/
```

### 3.1 容器 vs 零件

| | 容器 `containers/` | 零件 `components/` |
|---|---|---|
| 职责 | 提供外壳（背景/圆角/边框/阴影/遮罩/安全区/动画） | 提供内容（选项、标签、数据、交互逻辑） |
| 数量 | 少而稳定 | 可持续扩充 |
| 依赖 | 只依赖主题变量 | 依赖容器 + 主题变量 |
| 例子 | `base-card` `base-popup` `base-form-item` | `picker` `radio-group` `toast` `product-card` |

## 四、内容清单

### 4.1 根容器（6 个）

| 容器 | 职责 | 状态 |
|------|------|------|
| `base-card` | 卡片外壳：圆角/背景/边框/阴影/header/footer/按压反馈 | 已实现（唯一实现） |
| `base-popup` | 弹窗外壳：遮罩/方向/圆角/安全区/进出场动画；内部内置 `base-card` | 已实现（唯一实现） |
| `base-form-item` | 表单项行外壳：标签/必填星号/错误文案/控件位 | 已实现（唯一实现） |
| `base-avatar` | 头像外壳：图片/文字兜底/4 档尺寸/圆形或圆角 | 已实现（唯一实现） |
| `base-navbar` | 顶部导航：状态栏占位/返回/标题/右侧插槽/胶囊 | 已实现（唯一实现） |
| `base-tabbar` | 底部菜单：2~5 项/角标/安全区/固定 | 已实现（唯一实现） |

### 4.2 内置组件（26 个）

| 分类 | 含义 | 组件 |
|------|------|------|
| `form` | 表单控件 | `button` `search-bar` `input-field` `picker` `date-picker` `switch` `checkbox-group` `radio-group` |
| `feedback` | 反馈提示 | `toast` `modal` `action-sheet` `loading` `empty-state` |
| `list` | 列表件 | `list-item` `product-card` `article-card` `chat-bubble` `timeline` |
| `navigation` | 导航件 | `top-tab` `side-menu` `breadcrumb` |
| `business` | 业务展示 | `price-tag` `count-down` `progress-bar` `stepper` `coupon` |

### 4.3 样式类（5 类）

| 目录 | 类名 |
|------|------|
| `styles/button/` | `btn-primary` `btn-secondary` `btn-ghost` `btn-icon` `btn--small` `btn--large` `btn--block` |
| `styles/card/` | `card-basic` `card-elevated` `card-glass` |
| `styles/combo/` | `icon-tag` `badge` |
| `styles/line/` | `solid-line` `dashed-line` `gradient-line` `space-line` `v-solid-line` |
| `styles/shape/` | `semi-circle` `circle` `dot` |

### 4.4 索引层

| 文件 | 职责 |
|------|------|
| `components/_registry.json` | 全量注册表（机器读），每条含 `name` / `title` / `kind` / `category` / `aliases` / `path` |
| `components/_template/` | 固化模板（`index.vue` + `props.json` + `usage.md`） |
| `commands/<category>.md` | 分类组件索引：名称、说明、别名、路径、props、事件、插槽、CSS 类（**生成物**） |
| `scripts/gen-commands.js` | 索引生成器：改实现或改注册表后重跑 |
| `references/matching-rules.md` | 需求词 → 组件 判定规则、优先级与冲突裁决 |

## 五、内置约束

### 5.1 实现层约束（B）

**B01** 容器是唯一实现。`uniapp-page-components-skill/components/base-*` 的历史实现必须迁入本模块后删除原件，不允许两处并存。

**B02** 容器**不感知业务**。容器内不出现接口调用、store 访问、业务文案、业务字段。

**B03** 内容型组件必须基于根容器。判定与示例见上位规范 §三。

**B04** 容器可嵌容器。`base-popup` 内部就是 `base-card`，这是设计而非违规。

**B05** 组件一律 Vue 3 `<script setup lang="ts">`，`props` 用 TS 接口 + `withDefaults`，每个 prop 带注释。

**B06** 每个组件目录必须有 `index.vue` + `props.json` + `usage.md` 三件套。`props.json` 必须**严格合法 JSON**（禁止 `//` 注释、禁止尾逗号）。

**B07** `props.json` 字段固定 7 类：`name` / `title` / `category` / `aliases` / `props` / `events` / `slots`；`props` 每项四元组 `{name, type, default, desc}`；`aliases` 必填。

**B08** `props.json` 的 `props` 与实现**逐条对应**（名称、类型、默认值三者一致），`events` / `slots` 与实现的 `defineEmits` / `<slot>` 一致。

**B09** 样式全部 `scoped`，颜色与尺寸走 `var(--xxx, 兜底)`，禁止裸值。

**B10** 容器对外不暴露内部实现类名（`.bc-header` / `.bc-body` 属私有），扩展走 props 与 slot。

**B11** 弹窗类组件（`modal` / `action-sheet` / `picker` / `date-picker`）必须用 `base-popup` 承载，**禁止**自写 `position: fixed` + 遮罩。

**B12** 卡片类组件（`product-card` / `article-card` / `list-item` / `chat-bubble`）必须用 `base-card` 承载，**禁止**自写圆角/边框/内边距。

**B13** 演示优先：每个组件至少有一个可直接 `file://` 打开的自包含 HTML demo，落在 `demo-components/<场景>/html/` 下。

**B14** Demo 交互状态默认触发到底（弹窗类默认打开），避免"打开页面什么都没发生"。

**B15** 场景 demo 一律放 `demo-components/<场景>/`，只放**场景化组合与参考图**，不放组件实现；实现一律在本模块 `containers/` 或 `components/`。

### 5.2 索引层约束（C）

**C01** 索引与实现**同源**：注册表 `path` 必须落在本模块内，禁止指向仓库外或指向空路径。

**C02** 每个组件在注册表有且仅有一条记录，字段：`name` / `title` / `kind` / `category` / `aliases` / `path`。
`kind` 区分三类：`container`（根容器）/ `component`（业务组件）/ `style`（纯样式类）。

**C03** `category` 枚举固定：`container` / `form` / `feedback` / `business` / `list` / `navigation` / `style`。
其中 `kind=container` 的记录，`category` 一律为 `container`。

**C04** `aliases` 至少 3 个，覆盖中文口语名、英文名、常见同义词（如 `picker` → `["选择器", "picker", "下拉选择", "滚轮选择"]`），
且**跨组件不得重复**。

**C05** 匹配规则优先级：**用户点名组件名 > 点名别名 > 语义描述**；同名冲突按 `matching-rules.md` 第四章裁决表。

**C06** 需求里出现"卡片/弹窗/面板/列表项"等**内容型**词汇时，必须先匹配到根容器，再匹配具体组件。

**C07** `commands/*.md` 与 `_registry.json` 必须同步，二者不一致视为违规；
`commands/*.md` 是**生成物**，**禁止手改**，改完实现必须重跑 `node scripts/gen-commands.js`。

**C08** 固化流程（新增组件）固定 6 步：判定分类 → 在 `components/<category>/` 建目录 →
写 `index.vue` + `props.json` + `usage.md` → 注册到 `_registry.json` →
跑 `scripts/gen-commands.js` 生成 `commands/*.md` 并补 `matching-rules.md` → 补 demo。

**C09** 组件从本模块迁出或废弃时，注册表与 `commands/*.md` 必须同步清理，**禁止**留下指向空路径的记录。

**C10** 本模块**不定义**任何 CSS 变量，也不重复定义 `@keyframes`；
变量真源是 `uniapp-theme-skill/.../base.css`，关键帧真源是 `styles/animation.scss`。

## 六、变更纪律

- 移动/新增组件 → 同步 `components/_registry.json`、`commands/*.md`、`references/matching-rules.md`、本文件 §四清单。
- 改容器 props → 同步 `base-card.md` / `base-popup.md` / `input-field.md` 契约文档。
- 破坏性变更在 `README.md` 标注迁移方式。

## 七、自检

- [ ] `props.json` 全部是合法 JSON
- [ ] `props.json` 与实现逐条对应
- [ ] 无第二份容器实现
- [ ] 弹窗/卡片类组件已基于根容器
- [ ] 全部颜色/尺寸走 `var()` 且带兜底
- [ ] 每个组件有可运行 demo
- [ ] `_registry.json` 是合法 JSON，每条 `path` 真实存在
- [ ] `commands/*.md` 与注册表一致（重跑 `scripts/gen-commands.js` 后无 diff）
- [ ] 组件别名 ≥ 3 且无跨组件重复
- [ ] `bash scripts/check-skills.sh` 错误为 0
