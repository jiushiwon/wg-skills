# uniapp-app-generate-skill 个体规范

> 上位规范：[uniapp/AGENTS.md](../AGENTS.md)
> 本文件只写本模块特有约束；与上位规范重复的内容不再赘述。

## 一、模块定位

**第 2 层：专项层（工程脚手架）。**

本模块负责从零生成一个 uni-app 小程序项目骨架：目录、构建配置、依赖、共享组件、主题接入、脚本。

> **边界**：本模块**产出项目骨架**，不产出 UI 组件库。项目里用到的组件来自 `uniapp-base-skill`（依赖），不复制源码。

## 二、依赖

| 依赖 | 方向 | 用途 |
|------|------|------|
| `uniapp-standard-skill` | 依赖（前置规范） | 目录结构、命名、R 系列红线 |
| `uniapp-style-skill` | 依赖（样式规范） | D 系列、Token 体系、组件级 Token |
| `uniapp-theme-skill` | 依赖（变量真源） | 主题变量接入方式 |
| `uniapp-base-skill` | 依赖（容器与零件） | 共享组件清单的来源 |
| `uniapp-auth-skill` | 依赖 | 登录态骨架 |
| `uniapp-request-skill` | 依赖 | 请求层骨架 |

## 三、目录约定

```
uniapp-app-generate-skill/
├── SKILL.md
├── README.md
├── STANDARD.md                       # 本文件
├── assets/
│   └── boilerplate/                  # 脚手架模板
│       ├── scripts/
│       └── src/
└── references/
    ├── theme-system.md               # 主题接入
    ├── component-standards.md        # 共享组件规范
    └── ...
```

- 脚手架模板只放**可运行的最小骨架**，不放业务页面。
- `references/` 承载细则，避免 `SKILL.md` 膨胀。

## 四、内容清单

| 章节 / 文件 | 内容 |
|-------------|------|
| §1 生成流程 | 需求澄清 → 骨架生成 → 主题接入 → 共享组件接入 → 校验 |
| `references/theme-system.md` | 主题变量接入到新项目的方式 |
| `references/component-standards.md` | 共享组件表、复用红线、新增流程 |
| `assets/boilerplate/` | 脚手架模板 |

## 五、内置约束

**G01** 生成的项目必须遵守 `uniapp-standard-skill` 的目录结构与命名，不允许自造一套。

**G02** 主题变量真源统一指向 `uniapp-theme-skill/templates/src/static/css/base.css`；本模块的 `references/theme-system.md` **只讲接入方式**，不重新定义变量清单（历史上两处各写一份，是 UI 一致性审计指错的根因）。

**G03** 共享组件清单（权威组件表）里的组件必须来自 `uniapp-base-skill`；新增共享组件前先确认 `uniapp-base-skill` 是否已有等价实现。

**G04** 项目内共享组件采用 PascalCase 目录 + `App` 前缀（`src/components/AppButton/AppButton.vue`），这是**业务项目命名空间**，与技能库的 kebab-case 命名不冲突（见上位规范 §5.0）。

**G05** 新增共享组件流程：建 `src/components/<Name>/<Name>.vue` → 建 `index.ts`（同时导出 default 与具名）→ 在 `_components.scss` 加 `$comp-*` 变量再引用 → 在权威组件表补一行。

**G06** 组件内部禁止写死尺寸与颜色，引用 Token。

**G07** 生成结果必须能跑：至少含 `pages.json`、`App.vue`、`main.ts`、一个可访问首页、`manifest.json` 合法配置。

**G08** 生成的 `package.json` 不得引入第三方 UI 库（D29）。

**G09** 生成的 `styles/` 目录清单必须与 `uniapp-standard-skill` §2、`uniapp-style-skill` §2.1 **三方一致**。

**G10** 本模块的 `references/theme-system.md` 不得成为"第二份主题变量清单"；如需展示变量，必须注明真源路径。

## 六、变更纪律

- 改脚手架 → 同步 `SKILL.md` §生成流程 与 `README.md` 示例。
- 改共享组件表 → 同步 `references/component-standards.md`，并核对 `uniapp-base-skill` 无重复实现。
- 改主题接入方式 → 同步 `references/theme-system.md`，不得在此重定义变量。

## 七、自检

- [ ] 生成项目可运行
- [ ] 目录结构三方一致
- [ ] 无第三方 UI 库
- [ ] 主题变量真源单一
- [ ] 共享组件无重复实现
- [ ] `bash scripts/check-skills.sh` 错误为 0
