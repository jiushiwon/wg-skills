# uniapp-diagnostic-skill 个体规范

> 上位规范：[uniapp/AGENTS.md](../AGENTS.md)
> 本文件只写本模块特有约束；与上位规范重复的内容不再赘述。

## 一、模块定位

**第 2 层：专项层（问题诊断）。**

本模块负责**定位问题根因**：运行时报错、渲染异常、样式错乱、构建失败、性能劣化。

> **边界**：与 `uniapp-code-audit-skill` 的分工是"静态合规"与"运行时排障"。本模块**可读可写**（诊断需要最小复现与打点），但**改动范围限于诊断本身**，不顺手重构业务代码。

## 二、依赖

| 依赖 | 方向 | 用途 |
|------|------|------|
| `uniapp-standard-skill` | 依赖（前置规范） | 目录、命名、红线 |
| `uniapp-style-skill` | 依赖（样式规范） | 样式类问题的判定依据 |
| `uniapp-theme-skill` | 依赖（变量真源） | 变量缺失/悬空判定 |
| `uniapp-base-skill` | 依赖（容器规范） | 结构类问题判定 |
| `uniapp-request-skill` | 依赖 | 网络类问题定位 |
| `uniapp-auth-skill` | 依赖 | 登录态问题定位 |

## 三、目录约定

```
uniapp-diagnostic-skill/
├── SKILL.md
├── README.md
├── STANDARD.md                       # 本文件
└── references/
    ├── component-spec.md             # 组件实现层面的规范（命名/Props/事件/样式）
    └── ...
```

## 四、内容清单

| 章节 | 内容 |
|------|------|
| §1 诊断流程 | 复现 → 分层定位（渲染/数据/样式/网络/环境）→ 根因 → 最小修复 |
| `references/component-spec.md` | 组件命名、Props、事件、插槽、样式细则 |
| 其他 references | 按问题域拆分 |

## 五、内置约束

**D01** 先复现后下结论。不复现就改代码属于赌博。

**D02** 按层定位：渲染层 → 数据层 → 样式层 → 网络层 → 环境/平台层。禁止一上来就改样式。

**D03** 一次只改一个变量。多个猜测同时落地会掩盖真因。

**D04** 修复要**最小**：在根因处改一次，不在每个调用点打补丁。

**D05** 诊断产物：问题现象 → 复现步骤 → 根因 → 修复方案 → 验证方式。

**D06** 涉及组件实现规范的判定，以 `references/component-spec.md` 为准；但**容器原则**以 `uniapp-base-skill` 为准（`references/component-spec.md` 历史上完全没有容器要求条款，需补齐）。

**D07** `references/component-spec.md` 的命名规范采用 PascalCase + `App` 前缀，属于**业务项目命名空间**（上位规范 §5.0）；描述时必须写明作用域，避免与技能库 kebab-case 混淆。

**D08** 诊断过程中的临时打点必须清理，不得留在提交里。

**D09** 改不动的问题要明说边界：说明卡在哪、需要什么信息，不做无根据的猜测性修改。

## 六、变更纪律

- 改诊断流程 → 同步 `SKILL.md` §1 与 `README.md`。
- `references/component-spec.md` 补容器条款时，同步 `uniapp-base-skill` 侧的表述（容器原则只有一个真源表述，本模块引用）。

## 七、自检

- [ ] 每个结论有复现步骤
- [ ] 根因在源头修复，非多处打补丁
- [ ] 无遗留临时打点
- [ ] 命名规范标注了作用域
- [ ] `bash scripts/check-skills.sh` 错误为 0
