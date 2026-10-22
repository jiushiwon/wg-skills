# uniapp-vue2-upgrade-skill 个体规范

> 上位规范：[uniapp/AGENTS.md](../AGENTS.md)
> 本文件只写本模块特有约束；与上位规范重复的内容不再赘述。

## 一、模块定位

**第 2 层：专项层（Vue2 → Vue3 升级）。**

本模块输出**升级方案、迁移指南与差异清单**。

> **铁律**：本模块**不直接修改、不重构、不执行升级**。只有用户明确确认方案后才进入执行阶段。

## 二、依赖

| 依赖 | 方向 | 用途 |
|------|------|------|
| `uniapp-standard-skill` | 依赖（目标规范） | 升级后的目录、命名、红线 |
| `uniapp-theme-skill` | 依赖（变量真源） | 样式层升级的变量口径 |
| `uniapp-base-skill` | 依赖（容器与零件） | 组件层升级后的实现来源 |

## 三、目录约定

```
uniapp-vue2-upgrade-skill/
├── SKILL.md
├── README.md
└── STANDARD.md                       # 本文件
```

- 无 `references/`：内容全部收在 `SKILL.md`。
- 本模块**不携带** Vue2 样例工程，避免与 `uniapp-ui-template-builder-skill` 混淆。

## 四、内容清单

| 章节 | 内容 |
|------|------|
| §1 定位与边界 | 只出方案，不执行 |
| §2 阻塞点识别 | Options API、生命周期、filters、事件、`$set`、Vuex → Pinia、slot 语法、Vue2 特有指令 |
| §3 迁移方案 | 分批策略、每批范围、验证方式、回滚点 |
| §4 差异清单 | API 对照表 |
| §5 迁移指南 | 分步操作 |
| §6 执行前置 | 用户确认门禁 |

## 五、内置约束

**V01** 默认只输出方案。执行升级**必须**先获得用户明确确认。

**V02** Vue2 项目**可以继续被 `uniapp-code-audit-skill` 审计**，Vue3 专属检查项标注"不适用"。不得以"必须先升级"为由拒绝审计。

**V03** 升级目标必须落在 `uniapp-standard-skill` 的现行规范上（目录、命名、TS、Pinia），不产出"半 Vue3"。

**V04** 迁移分批，每批**可独立验证、可回滚**。禁止一次性全量替换。

**V05** 差异清单必须覆盖：响应式（`Vue.observable` / `Vue.set`）、生命周期命名、`v-model` 语义、`filters`、`$listeners`、`$children`、插槽语法、事件总线、Vuex → Pinia、Vue Router 差异、自定义指令钩子。

**V06** 组件层升级后优先复用 `uniapp-base-skill` 的容器与零件，禁止把旧组件原样搬过来形成第二份实现。

**V07** 样式层升级统一落到 `uniapp-theme-skill` 的 CSS 变量；升级中不得引入第三套变量名。

**V08** 方案输出必须包含**风险点**与**回滚方式**，不能只列改动清单。

**V09** 方案中每条改动都要给**落点文件**与**改动原因**，便于逐条评审。

## 六、变更纪律

- 改迁移策略 → 同步 `SKILL.md` §3 与 `README.md` 示例。
- 目标规范变更（`uniapp-standard-skill`） → 同步本模块的目标口径。

## 七、自检

- [ ] 默认不执行升级
- [ ] 方案含风险与回滚
- [ ] 差异清单覆盖全部 Vue2 特有 API
- [ ] 分批可独立验证
- [ ] 组件复用 `uniapp-base-skill`
- [ ] `bash scripts/check-skills.sh` 错误为 0
