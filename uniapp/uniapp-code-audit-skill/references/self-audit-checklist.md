# 自我审计清单

> 本清单用于 `uniapp-code-audit-skill` 升级完成后，对自身 `SKILL.md`、`README.md` 及所有 `references/*.md` 进行审计，确保符合“报告-only”原则。
> 提示：表格内"检查方式"列中的 `\|` 为 markdown 表格转义，实际执行时按 `|`（POSIX ERE 分组交替符）处理；命令基于 Unix 工具，Windows 环境可用内置 Grep 工具或 ripgrep（`rg`）替代。

## 1. 无修复指令

| 检查项 | 判定标准 | 检查方式 |
|--------|----------|----------|
| 无修复指令/方案/建议 | 全 skill 目录内不出现“修复方案”、“修复建议”、“修复优先级”、“必须修复”、“立即修复”等修复导向表述；仅允许出现在“不修复/不输出修复方案”等报告-only 声明中 | `grep -rnE '修复方案\|修复建议\|修复优先级\|必须修复\|立即修复' uniapp-code-audit-skill/` |
| 无修复导向代码示例 | 代码示例只展示“违规模式”，不展示“正确写法” | 人工检查所有代码块 |

## 2. Frontmatter 规范

| 检查项 | 判定标准 | 检查方式 |
|--------|----------|----------|
| `name` 正确 | `SKILL.md` frontmatter 中 `name` 为 `uniapp-code-audit-skill` | 检查 `SKILL.md` 第 1-5 行 |
| `description` 为触发条件描述 | `description` 以“当……时触发”开头，说明使用场景，不包含工作流程摘要 | 检查 `SKILL.md` frontmatter |
| `description` 声明报告-only | `description` 中明确“只输出审计报告，不修改、不修复项目代码” | 检查 `SKILL.md` frontmatter |

## 3. 报告-only 输出

| 检查项 | 判定标准 | 检查方式 |
|--------|----------|----------|
| 仅输出 `uniapp-audit-report.md` | `SKILL.md` 与 `README.md` 中只提及生成 `uniapp-audit-report.md` | `grep -rnE 'audit-report|fix-guide' uniapp-code-audit-skill/` |
| 不生成补丁/重构代码 | 全 skill 目录内无“重构”、“自动修复”、“生成代码”等修复导向表述；“落地”仅允许出现在协作 skill 说明中 | `grep -rnE '重构\|自动修复\|生成代码' uniapp-code-audit-skill/` |
| 扫描命令只读 | 所有 bash/grep 命令仅用于扫描，无 `rm`、`mv`、`sed -i`、自动格式化等 | 人工检查所有代码块 |

## 4. 中文文档

| 检查项 | 判定标准 | 检查方式 |
|--------|----------|----------|
| 文档主体为中文 | `SKILL.md`、`README.md`、所有 references 主体内容使用中文 | 人工抽样检查 |
| 表格列名为中文 | 检查清单表格列名使用中文（检查项、风险等级、风险描述、判定依据、参考标准、检测命令） | `grep -rnE '\| 检查项 \|' uniapp-code-audit-skill/references/` |

## 5. 引用标准准确

| 检查项 | 判定标准 | 检查方式 |
|--------|----------|----------|
| 引用 skill 存在 | 文中引用的 `uniapp-standard-skill`、`uniapp-app-generate-skill`、`uniapp-request-skill`、`uniapp-components-skill`、`uniapp-crossplatform-audit-skill`、`uniapp-standardization-skill`、`uniapp-vue2-upgrade-skill`、`uniapp-theme-skill` 均存在于仓库 | `ls uniapp-*-skill` |
| 引用 reference 存在 | 引用的 `theme-system.md`、`project-structure.md`、`component-standards.md`、`cross-platform-compatibility.md`、`mini-program-checklist.md` 等存在于对应 skill 目录 | `ls uniapp-app-generate-skill/references/` |
| 无死链 | 不引用 `uniapp-common-skill` 等已删除/重命名 skill；与 `uniapp-style-skill` 等已存在同类 skill 保持职责边界，避免误引用 | `grep -rnE 'uniapp-style-skill\|uniapp-common-skill' uniapp-code-audit-skill/` |

## 6. 协作措辞

| 检查项 | 判定标准 | 检查方式 |
|--------|----------|----------|
| 不暗示本 skill 执行修复 | “可配合技能”段落明确说明“本 skill 不执行修复，如需按报告调整可调用其他 skill” | 检查 `SKILL.md` 与 `README.md` |
| 协作 skill 描述中性 | 不将 `uniapp-standardization-skill` 描述为“审计后做规范化修复” | 人工检查协作技能段落 |

## 7. 风险等级无修复色彩

| 检查项 | 判定标准 | 检查方式 |
|--------|----------|----------|
| 使用 P0/P1/P2/P3 | 风险等级说明中不出现“必须修复”、“建议修复”、“可后续处理”等修复导向表述 | `grep -rnE '必须修复\|建议修复\|可后续处理\|立即修复' uniapp-code-audit-skill/` |
| 说明等级含义 | 明确“风险等级仅用于报告分类，不代表修复指令” | 检查 `SKILL.md` 风险等级段落 |

## 8. 目录结构完整

| 检查项 | 判定标准 | 检查方式 |
|--------|----------|----------|
| 入口文件齐全 | 存在 `SKILL.md`、`README.md` | `ls uniapp-code-audit-skill/SKILL.md uniapp-code-audit-skill/README.md` |
| references 完整 | 存在 11 个 reference 文件 | `ls uniapp-code-audit-skill/references/` |
| 新增文件已登记 | `SKILL.md` 与 `README.md` 的 References/目录说明包含新增文件（app-platform-checklist.md、dead-code-checklist.md） | 检查对应段落 |

## 9. 无重复内容

| 检查项 | 判定标准 | 检查方式 |
|--------|----------|----------|
| 各 reference 职责清晰 | 安全、性能、代码质量、UI、架构、API、跨平台、小程序、App 端、冗余与死代码、自审 11 个文件不大量重复 | 人工比对相邻清单 |
| SKILL.md 不重复 reference 内容 | `SKILL.md` 只列维度与参考文件，不展开具体检查项 | 检查 `SKILL.md` 审计维度表 |

## 10. 触发词一致

| 检查项 | 判定标准 | 检查方式 |
|--------|----------|----------|
| SKILL.md 与 README.md 触发词一致 | 两处触发词列表相同或互补，不矛盾 | 对比 `SKILL.md` 与 `README.md` |
| 触发词聚焦 uniapp | 不出现“检查项目问题”等过于泛化的触发 | 检查 `SKILL.md` 与 `README.md` |

## 审计记录模板

```markdown
## 自我审计结果

- 审计对象：uniapp-code-audit-skill
- 审计时间：YYYY-MM-DD
- 审计结论：符合 / 基本符合 / 不符合 报告-only 原则
- 不符合项：
  1. ...
- 处理情况：...
```
