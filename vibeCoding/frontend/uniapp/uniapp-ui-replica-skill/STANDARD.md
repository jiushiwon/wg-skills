# uniapp-ui-replica-skill 个体规范

> 上位规范：[uniapp/AGENTS.md](../AGENTS.md)
> 本文件只写本模块特有约束；与上位规范重复的内容不再赘述。

## 一、模块定位

**第 2 层：专项层（界面复刻）。**

本模块负责把给定截图 / 设计稿 / 线上页面**复刻**成 uni-app 代码，并保证视觉对齐。

> **边界**：复刻产出的是**业务项目内的页面**，不是技能库组件。复刻过程中若发现可复用的通用件，走 `uniapp-base-skill` 的固化流程沉淀。

## 二、依赖

| 依赖 | 方向 | 用途 |
|------|------|------|
| `uniapp-theme-skill` | 依赖（变量真源） | 复刻出的颜色/间距落成变量 |
| `uniapp-base-skill` | 依赖（容器与零件） | 优先复用已有容器与组件 |
| `uniapp-style-skill` | 依赖（样式规范） | 排版、间距、动效规范 |
| `uniapp-base-skill` | 依赖（检索与固化） | 查已有组件、沉淀新组件 |

## 三、目录约定

```
uniapp-ui-replica-skill/
├── SKILL.md
├── README.md
├── STANDARD.md                       # 本文件
├── examples/                         # 复刻范例
│   ├── admin-dashboard/
│   ├── landing-page/
│   └── mobile-page/
└── references/
    ├── integration-guide.md          # 沉淀公共组件的步骤
    └── ...
```

## 四、内容清单

| 章节 | 内容 |
|------|------|
| §1 复刻流程 | 取图 → 拆解 → 选型 → 实现 → 对比校准 |
| §2 视觉校准 | 像素级对比方法与容差 |
| §3 组件沉淀 | 何时该沉淀、沉淀到哪、怎么写三件套 |
| `examples/` | 完整范例 |
| `references/integration-guide.md` | 集成与沉淀步骤 |

## 五、内置约束

**R01** 复刻前先查 `uniapp-base-skill` 的注册表。**已有组件禁止重写**，只做 props 配置。

**R02** 复刻出的页面级内容块必须用容器承载（`base-card` / `base-popup`），不手写外壳。

**R03** 颜色、间距、圆角、字号一律落成 `var(--xxx)`；复刻中"图上有某个特定颜色"时，先归入主题变量（必要时与 `uniapp-theme-skill` 协商新增语义色），不写死。

**R04** 视觉校准必须做**并排对比**，容差：颜色允许 ±2/255，间距允许 ±2px，字号必须完全一致。

**R05** 复刻产出的 demo 必须自包含可直接打开，且交互状态默认触发到底。

**R06** 沉淀公共组件时固定三件套：`index.vue` + `props.json` + `usage.md`，并同步注册表、`commands/*.md`、`matching-rules.md`（流程细节见 `references/integration-guide.md`）。

**R07** 沉淀的组件落在 `uniapp-base-skill/components/<category>/`，不在本模块留实现。

**R08** 图片资源必须用占位图替换方案处理缺失（`@error` 兜底），不硬引用不存在的路径。

**R09** 复刻**不还原**交互逻辑，只还原视觉与布局；交互按项目既有模式接。

## 六、变更纪律

- 改复刻流程 → 同步 `SKILL.md` 与 `README.md`。
- 改沉淀步骤 → 同步 `references/integration-guide.md` 与 `uniapp-base-skill` 的固化流程（两处必须一致）。

## 七、自检

- [ ] 复刻前查过注册表
- [ ] 内容块基于容器
- [ ] 无硬编码颜色/尺寸
- [ ] 已做并排视觉校准
- [ ] 沉淀件三件套齐全且已注册
- [ ] `bash scripts/check-skills.sh` 错误为 0
