# uniapp-ui-component-commands-skill 个体规范

> 上位规范：[uniapp/AGENTS.md](../AGENTS.md)
> 本文件只写本模块特有约束；与上位规范重复的内容不再赘述。

## 一、模块定位

**索引层 + 固化流程层。**

本模块**不生产组件实现**，它提供三件事：

1. **组件索引**：需求描述 → 组件别名 → 组件路径 → 使用方式。
2. **匹配规则**：把中文需求词映射到具体组件。
3. **固化流程**：把新写的组件按规范沉淀进 `uniapp-base-skill`。

```
专项层（app-generate / page-components / ui-template-builder …）
           检索
uniapp-ui-component-commands-skill（索引 + 匹配 + 固化流程）    本模块
           指向实现
uniapp-base-skill/components/ + containers/                   唯一实现处
```

> **边界**：本模块与 `uniapp-base-skill` 的分工是"目录 vs 仓库"。本模块回答"用哪个、去哪拿、怎么沉淀"，`uniapp-base-skill` 回答"它长什么样、怎么用"。

## 二、依赖

| 依赖 | 方向 | 用途 |
|------|------|------|
| `uniapp-theme-skill` | 依赖（变量真源） | 组件实现引用的变量名以 `base.css` 为准 |
| `uniapp-base-skill` | 依赖（实现来源） | 组件实现、注册表 `path` 均指向本模块 |

反向依赖（**禁止**）：`uniapp-base-skill` 不得反向引用本模块的组件源码。

## 三、目录约定

```
uniapp-ui-component-commands-skill/
├── SKILL.md
├── README.md
├── STANDARD.md                       # 本文件
├── commands/                         # 按分类的组件索引（人读 + 检索，生成物）
│   ├── container.md / form.md / feedback.md / business.md / list.md / navigation.md / style.md
├── scripts/
│   └── gen-commands.js               # ★ 索引生成器（改实现后必须重跑）
├── components/                       #  迁移后清空，仅保留索引与元数据
│   ├── _registry.json                # 组件注册表（严格合法 JSON）
│   └── _template/                    # 新组件模板（index.vue + props.json + usage.md）
├── references/
│   └── matching-rules.md             # 需求词  组件匹配规则
└── templates/
    ├── ui-variables.scss             #  指针文件，不含变量定义
    └── ui-components.scss            #  指针文件，不含样式实现
```

### 3.1 组件实现迁出后的目录职责

组件实现全部迁入 `uniapp-base-skill/components/<category>/<name>/` 与
`uniapp-base-skill/containers/<name>/` 后，本模块保留：

- `components/_registry.json`：注册表（`path` 指向新位置）
- `components/_template/`：固化模板
- `commands/*.md`：分类索引（每条含组件名、别名、路径、props 摘要）
- `references/matching-rules.md`：匹配规则

`templates/ui-variables.scss` 与 `templates/ui-components.scss` 均退化为**指针文件**：
前者指向 `uniapp-theme-skill/templates/src/static/css/base.css`，
后者指向 `uniapp-base-skill/styles/index.scss`，**不得**再定义变量或样式实现。

## 四、内容清单

| 文件 | 职责 |
|------|------|
| `commands/<category>.md` | 该分类下的组件清单：名称、别名、路径、关键 props、CSS 类（**生成物**，由 `_registry.json` + 各组件 `props.json` 重新生成） |
| `scripts/gen-commands.js` | 索引生成器：改实现或改注册表后重跑，输出 `commands/*.md` |
| `references/matching-rules.md` | 需求描述 → 组件 的判定规则与优先级 |
| `components/_registry.json` | 全量注册表（机器读） |
| `components/_template/` | 新组件三件套模板 |
| `templates/ui-variables.scss` | 变量真源指针 |
| `templates/ui-components.scss` | 样式实现指针 |

注册表 `path` 字段一律写**相对仓库根**的路径，指向组件实际所在位置。

## 五、内置约束

**C01** 本模块**不存放**组件实现。发现 `components/` 下出现 `.vue` 即为违规。

**C02** 本模块**不定义**任何 CSS 变量。`ui-variables.scss` 只做指针。

**C03** 每个组件必须在注册表有且仅有一条记录，字段：`name` / `title` / `kind` / `category` / `aliases` / `path`。
`kind` 区分三类：`container`（根容器）/ `component`（业务组件）/ `style`（纯样式类）。

**C04** `category` 枚举固定：`container` / `form` / `feedback` / `business` / `list` / `navigation` / `style`。
其中 `kind=container` 的记录，`category` 一律为 `container`。

**C05** `aliases` 至少 3 个，覆盖：中文口语名、英文名、常见同义词（如 `picker` → `["选择器", "picker", "下拉选择", "滚轮选择"]`）。

**C06** 匹配规则优先级：**用户点名组件名 > 点名别名 > 语义描述**。同名冲突时按 `matching-rules.md` 的判定表。

**C07** 需求里出现"卡片/弹窗/面板/列表项"等**内容型**词汇时，必须先匹配到根容器，再匹配具体组件。

**C08** 固化流程（新增组件）固定 6 步：判定分类 → 在 `uniapp-base-skill/components/<category>/` 建目录 → 写 `index.vue` + `props.json` + `usage.md` → 注册到 `_registry.json` → 跑 `node scripts/gen-commands.js` 生成 `commands/*.md` 并补 `matching-rules.md` → 补 demo。

**C09** `commands/*.md` 与 `_registry.json` 必须同步，二者不一致视为违规；`commands/*.md` 是生成物，**禁止手改**，改完实现必须重跑 `node scripts/gen-commands.js`。

**C10** 组件从 `uniapp-base-skill` 迁出或废弃时，本模块必须同步清理（**禁止**留下指向空路径的记录）。

## 六、变更纪律

- 组件实现变更 → 本模块的 `path` 不变，但 `props` 摘要需同步。
- 组件迁移路径 → 同步 `_registry.json` + `commands/*.md` + `matching-rules.md`。
- 匹配规则变更 → 同步 `README.md` 的检索示例。

## 七、自检

- [ ] `components/` 下无 `.vue` 实现
- [ ] `ui-variables.scss` 无变量定义
- [ ] `_registry.json` 是合法 JSON，且每条 `path` 真实存在
- [ ] 每个组件在 `commands/*.md` 中有对应条目
- [ ] 组件别名 ≥ 3 且无跨组件重复
- [ ] `bash scripts/check-skills.sh` 错误为 0
