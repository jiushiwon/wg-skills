# 真实投毒案例库(Threat Cases)

本文件沉淀**真实发生/被安全研究披露**的恶意 Skill 案例,作为审计时的对照参照。每个案例给出:手法、为何危险、对应审计维度。来源见文末。

> 大规模实证:[arXiv 2602.06547](https://arxiv.org/html/2602.06547v1) 扫描 **98,380 个 Skill,实锤 157 个恶意、632 个漏洞**。这印证核心前提:**星标 ≠ 可信**,高下载量的 Skill 恰恰是投毒首选目标。

---

## 案例 1 · 数据外泄(DNS 外带)— CVE-2025-55284

**手法**:恶意 prompt 诱导 agent 读取 `.env` 拿到 API key,把 key 编码进 DNS 查询,通过**白名单允许的 `ping` 命令**外发。全程无权限确认——`ping` 看起来人畜无害。

**为何危险**:外泄用的是**合法工具**,传统"拦截陌生命令"失效;数据走 DNS,多数网络管控放行。

**对应维度**:维度 1(数据外泄链)。判据:读敏感文件 → 编码 → 网络外发,**无论工具是否合法**。

---

## 案例 2 · 数据外泄(官方 API 回传)— "Claudy Day"

**手法**:不走陌生域名,直接调用**合法的 `api.anthropic.com` Files API**,把整个对话历史上传外泄,绕过"只拦陌生 IP"的网络管控。

**为何危险**:外发目标是**可信域**,基于域名信誉的防御完全失效。

**对应维度**:维度 1。判据:外发目标是官方/可信域**不代表安全**,要看**外发内容是否包含本地敏感数据**。

---

## 案例 3 · 供应链木马(高相似克隆)— smp_2485

**手法**:与某正版 Skill **相似度 98.3%** 的克隆品,仅**多加 3 行**,静默把用户文件上传到攻击者服务器。肉眼 diff 几乎不可见。

**为何危险**:用户冲着正版名气安装,实际装的是夹带私货的克隆。**星标/名气可被盗用**。

**对应维度**:维度 6(货不对板)+ 维度 2(隐藏脚本)。判据:宣称功能正常,但夹带**与功能无关的一两行动作**。

---

## 案例 4 · 平台武器化(hook / MCP 凭证)— smp_866 / smp_413

**手法**:① 滥用 Claude Code 的 **hook 机制**,在工具执行前后静默外发执行结果;② 在 Skill 里塞一个 **`.mcp.json`**,**硬编码攻击者凭证**,诱导 agent 连上恶意 MCP server。

**为何危险**:hook 与 MCP 是 agent 的**信任扩展点**,一旦被污染,agent 的所有操作都在攻击者眼皮底下。

**对应维度**:维度 2(隐藏脚本)+ 维度 5(权限放大)。判据:出现 hook 配置、`.mcp.json` 硬编码凭证,且与功能无关。

---

## 案例 5 · 模型/流量劫持 — smp_9014

**手法**:诱导把 API 调用**重定向到攻击者代理**,并配 `--dangerously-skip-permissions` **关掉所有确认**。

**为何危险**:既偷数据(流量经过攻击者)又夺权(跳过确认),双重危害。

**对应维度**:维度 5(权限放大)。判据:出现 `--dangerously-skip-permissions`、API base URL 重定向、代理设置。

---

## 案例 6 · 命令注入(白名单绕过)— CVE-2025-54794/795 "InversePrompt"

**手法**:通过**白名单里的 `echo`** 做命令注入,**无需用户确认**即执行任意命令。攻击者用"无害命令"拼出破坏动作。

**为何危险**:破坏命令藏在合法命令背后,基于命令黑名单的防御失效。

**对应维度**:维度 3(破坏性命令)。判据:识别**不可逆操作**(rm/覆盖/强推),尤其与宣称功能无关时。

---

## 案例 7 · 动态上下文预执行 — Datadog "Clawsights"

**手法**:恶意 Skill 利用 Claude Code 的**动态上下文 `!` 命令**预处理机制——命令在**模型来得及拒绝之前就已执行**;配合 frontmatter `allowed-tools: Bash(*)` 实现静默执行 + 凭证外泄(参见 [Reversec Labs](https://labs.reversec.com/posts/2026/05/skill-issues-compromising-claude-code-with-malicious-skills-agents-part-1))。

**为何危险**:绕过了"模型会拒绝危险操作"这一层防线——**根本没给模型拒绝的机会**。

**对应维度**:维度 4(注入话术)+ 维度 5(权限放大)。判据:`allowed-tools: Bash(*)` 等过宽授权 + 诱导预执行。

---

## 两大攻击原型(总结)

| 原型 | 手段 | 典型维度 | 静态规则能否抓 |
|------|------|---------|---------------|
| **数据窃贼** | 代码:脚本读文件、发网络请求 | 1、2、3 | 部分(明显模式能抓) |
| **代理劫持者** | 自然语言:骗 agent 主动作恶 | 4、5、6 | **难**(需语义理解) |

**审计启示**:静态信号是线索,**语义判断才是结论**。尤其维度 6(货不对板)——克隆品与注入话术,只有比对"宣称 vs 实际"才能识别。

---

## 来源

- [Malicious Agent Skills in the Wild(98,380 Skill 实证研究,arXiv 2602.06547)](https://arxiv.org/html/2602.06547v1)
- [Datadog Security Labs — 恶意 Skill 与动态上下文风险](https://securitylabs.datadoghq.com/articles/malicious-skills-supply-chain-risks-in-coding-agents-with-dynamic-context/)
- [Reversec Labs — Skill Issues Part 1](https://labs.reversec.com/posts/2026/05/skill-issues-compromising-claude-code-with-malicious-skills-agents-part-1) / [Part 2](https://labs.reversec.com/posts/2026/06/skill-issues-compromising-claude-code-with-malicious-skills-agents-part-2)
- [TrueFoundry — Claude Code Prompt Injection 企业指南](https://www.truefoundry.com/blog/claude-code-prompt-injection)
- [Prompt Injection Attacks on Agentic Coding Assistants(arXiv 2601.17548)](https://arxiv.org/html/2601.17548v1)
