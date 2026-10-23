# ONBOARDING — 5 分钟上手 wg-skills

> 新人首次进入仓库必读。读完本文，你应能回答：
> 1. **我能用它做什么？** —— 看 §1
> 2. **我应该跑哪个 skill？** —— 看 §2
> 3. **怎么开始第一个项目？** —— 看 §3

---

## §1. 这是什么

**wg-skills** 是一个**自包含的技能仓库**。每个子目录是一个 skill（`SKILL.md` + `README.md` + `references/` + `templates/`），用一句话触发，AI 智能体按"**选型 → 骨架 → 业务模块 → 上线**"的顺序串起来执行。

**不是** AI 一键生成的流水线玩具，**是** 10 年开发经验沉淀的可复用体系。

完整介绍：[README.md](README.md) · 仓库规则：[AGENTS.md](AGENTS.md) · 私有仓库 skill：[MISSING_SKILLS.md](MISSING_SKILLS.md)

---

## §2. 我能用什么 —— 4 类场景速查

| 你想干啥？ | 用什么 skill？ | 入口 |
|----------|--------------|------|
| **搭一个 SpringBoot 后端** | `springboot-init-skill` | 触发词：「SpringBoot 项目初始化」 |
| **搭一个 FastAPI 后端** | `fastapi-init-skill` | 触发词：「FastAPI 项目初始化」 |
| **搭一个 Vue3 管理后台** | `vue-generate-skill` + `vue-base-skill` | 触发词：「Vue3 后台脚手架」 |
| **搭一个小程序** | `uniapp-app-generate-skill` + `uniapp-base-skill` | 触发词：「UniApp 项目初始化」 |
| **加登录/权限** | `springboot-auth-module-skill` / `fastapi-auth-module-skill` / `go-auth-module-skill` | 触发词：「加 RBAC 权限模块」 |
| **加支付** | `springboot-wechat-pay-skill` / `springboot-alipay-pay-skill` / `fastapi-wechat-pay-skill` / `fastapi-alipay-pay-skill` | 触发词：「加微信支付」 |
| **加文件存储** | `springboot-storage-module-skill` / `fastapi-storage-module-skill` | 触发词：「加对象存储」 |
| **加日志/审计** | `springboot-log-module-skill` / `fastapi-log-module-skill` | 触发词：「加操作审计」 |
| **部署到服务器** | `super-deploy-skills`（含 16 子 skill） | 触发词：「部署到 Linux 服务器」 |
| **接手陌生项目分析** | `backend-analysis-skill` | 触发词：「分析这个项目」 |
| **写公众号文章** | `article-generator` | 触发词：「生成技术文章」 |
| **抓热点写选题** | `hot-trend-collector` | 触发词：「抓今天热点」 |

---

## §3. 第一个项目 —— 5 步路径

### 步骤 1：选型（30 秒）

看 [README.md 的 6 大板块总览](README.md#6-大板块总览)，选你的"语言 × 框架"组合。

### 步骤 2：读规范（3 分钟）

进入项目前，**必读**以下 3 份规范（只读与自己相关的）：

- [backend-convention-skill](vibeCoding/backend/backend-convention-skill/) — 后端统一规范（响应信封 / 错误码 / JWT / 分页 / 模块接口）
- [frontend-request-skill](vibeCoding/frontend/frontend-request-skill/) — 前端请求层规范（4 套前端共用）
- [database-design-skill](vibeCoding/backend/database/database-design-skill/) — 数据库设计规范

### 步骤 3：跑骨架（1 分钟）

进入对应 init-skill 的目录，按其 README 「快速上手」跑一次：

```bash
# 示例：搭一个 SpringBoot 后端
cd vibeCoding/backend/java/springboot-init-skill
# 把 README「快速上手」段贴给 AI 智能体
```

### 步骤 4：叠模块（按需）

按 README §2 速查表，把需要的 module-skill **逐个叠加**。每个 module-skill 都是独立的 SKILL.md，复制其 `templates/` 到你的项目即可。

### 步骤 5：查契约（前后端桥接）

前后端连调前，**必看**：
- 后端 → `vibeCoding/backend/shared/` 下 5 份 spec（error/jwt/pagination/response/module）
- 前端 → `vibeCoding/frontend/frontend-request-skill/references/`
- 桥接 → `vibeCoding/vibecoding-guide-skill/vibecoding-workflow-skill/references/frontend-backend-integration.md`

---

## §4. 必避的坑

| 坑 | 怎么避 |
|---|--------|
| **复制 vue-admin-skill 等私有 skill** | 看 [MISSING_SKILLS.md](MISSING_SKILLS.md) — 这 4 个 skill 在私有仓库 |
| **把证书/私钥提交到 git** | 已在 `.gitignore` 兜底，**不要再 `git add -f`** |
| **直接用 init-skill 的默认密钥/JWT** | 部署前必改，否则裸奔 |
| **跨语言契约不查表** | springboot-auth / fastapi-auth / go-auth 的契约是**对齐的**（camelCase + 负数错误码），但要按表对照 |
| **README 数字对不齐** | 以仓库内实际 `SKILL.md` 数量为准；维护者更新 skill 时必须同步首页统计 |

---

## §5. 仓库地图（ASCII）

```
wg-skills/
├── README.md              ← 产品页（5 分钟能力地图）
├── ONBOARDING.md          ← 本文件（5 分钟新手路径）
├── AGENTS.md              ← 规则 SoT（维护者读）
├── CHANGELOG.md           ← 待补（聚合自 frontmatter）
├── ARCHITECTURE.md        ← 待补（实际拓扑图）
├── MISSING_SKILLS.md      ← 4 个私有 skill 登记
├── .gitignore             ← 证书/私钥/数据库已覆盖
├── docs/
│   ├── plans/             ← 本地沉淀
│   ├── adr/               ← 待补（关键决策记录）
│   └── skill-graph.yaml   ← 待补（机器可读关联图）
└── vibeCoding/            ← 150 个 skill 都在这里（连同 others/ 共 158 个）
    ├── backend/           ← Java/Python/Go/Node.js/Rust + 数据库
    ├── frontend/          ← Vue/UniApp/React/HTML
    ├── super-deploy-skills/
    ├── vibecoding-guide-skill/
    └── ... 其他工具类
```

---

## §6. 反馈 & 贡献

- 提 Issue：在 `AGENTS.md §13` 查看规则
- 提 PR：commit message 规范 `feat/fix/docs/refactor/chore` + 中文描述
- 私有 skill 公开化建议：开 Issue 标 `[public-request]`
