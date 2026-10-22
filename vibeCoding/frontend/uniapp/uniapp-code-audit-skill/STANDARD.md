# uniapp-code-audit-skill 个体规范

> 上位规范：[uniapp/AGENTS.md](../AGENTS.md)
> 本文件只写本模块特有约束；与上位规范重复的内容不再赘述。

## 一、模块定位

**第 2 层：专项层（只读审计）。**

本模块对 uni-app 小程序项目做**合规体检**，输出审计报告。

> **铁律**：本模块**只读**。不修改代码、不修复问题、不生成修复补丁。发现问题只写进报告。

## 二、依赖

| 依赖 | 方向 | 用途 |
|------|------|------|
| `uniapp-standard-skill` | 依赖（规范来源） | R01–R20 |
| `uniapp-style-skill` | 依赖（规范来源） | D01–D34 |
| `uniapp-theme-skill` | 依赖（变量真源） | 判定"变量是否存在" |
| `uniapp-base-skill` | 依赖（容器规范） | 判定"是否违反容器原则" |
| `uniapp-page-components-skill` | 依赖（规范来源） | P01–P15 |

## 三、目录约定

```
uniapp-code-audit-skill/
├── SKILL.md
├── README.md
├── STANDARD.md                       # 本文件
└── references/
    ├── ui-consistency-checklist.md   # UI 一致性检查项
    └── ...
```

- 报告产物：`uniapp-audit-report.md`，落在被审计项目根目录。
- 本模块自身**不携带**被审计代码，不做静态配置。

## 四、内容清单

| 维度 | 规范来源 |
|------|----------|
| 目录结构与命名 | `uniapp-standard-skill` |
| API 契约 | `uniapp-request-skill` + `uniapp-standard-skill` |
| 状态管理 | `uniapp-standard-skill` / `references/store-guide.md` |
| 性能 | `uniapp-standard-skill` / `references/performance.md` |
| UI / 主题一致性 | `uniapp-style-skill` D01–D34 + `uniapp-theme-skill` |
| 容器原则 | `uniapp-base-skill` B01–B12 |
| 路由 | `uniapp-standard-skill` / `references/router-guide.md` |
| 埋点 | `uniapp-standard-skill` / `references/analytics.md` |
| 存储 | `uniapp-standard-skill` / `references/storage-guide.md` |
| 组件通信 | `uniapp-standard-skill` / `references/component-communication.md` |

## 五、内置约束

**U01** 只读。报告之外不产出任何文件修改。

**U02** 报告输出为 `uniapp-audit-report.md`，结构固定：结论摘要 → 风险分布 → 明细（按 P0→P3）→ 修复建议 → 附录（检测命令）。

**U03** 风险等级定义固定：P0（阻断发布/安全问题）、P1（功能缺陷/规范硬违规）、P2（体验与一致性问题）、P3（优化建议）。

**U04** 每条问题必须给出：文件路径、行号、判定依据（引用具体红线编号）、修复建议。**禁止**只写"建议优化"。

**U05** 引用规范必须带前缀（"D01"、"R10"、"B03"），避免编号歧义。

**U06** UI 一致性维度的"参考标准"列必须指向 `uniapp-style-skill` 的 D 系列 + `uniapp-theme-skill` 的 `base.css`，**不得**指向 `uniapp-app-generate-skill`（历史上全部指错，导致 D01–D34 实际未进入任何检查项）。

**U07** 变量检查的判定方式：以 `uniapp-theme-skill/templates/src/static/css/base.css` 的变量清单为准，引用了清单外的变量即判为"悬空变量"。

**U08** 容器原则检查：以 `uniapp-base-skill` 的根容器清单为准，识别出手写卡片/弹窗外壳的组件。

**U09** 检测命令必须可复制执行（grep / rg 形式），不写"人工检查"了事。

**U10** 扫描只读命令在 Windows 下的替代写法必须给出（PowerShell 等），不允许因为环境问题跳过维度。

## 六、变更纪律

- 改审计维度 → 同步 `SKILL.md` 维度映射表与 `references/ui-consistency-checklist.md`。
- 规范红线变更 → 同步本模块的"参考标准"列指向。

## 七、自检

- [ ] 未修改任何被审计文件
- [ ] 报告文件名为 `uniapp-audit-report.md`
- [ ] 每条问题含路径/行号/依据/建议
- [ ] 依据均带 D/R/B 前缀
- [ ] UI 维度的规范来源指向 style-skill 与 theme-skill
- [ ] `bash scripts/check-skills.sh` 错误为 0
