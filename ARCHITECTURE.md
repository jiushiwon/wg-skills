# ARCHITECTURE — wg-skills 拓扑与真源地图

> 本文件只说明结构、依赖方向与真源位置。使用方式见 [README.md](README.md)，首次上手见 [ONBOARDING.md](ONBOARDING.md)，治理规则见 [AGENTS.md](AGENTS.md)。

## 1. 板块拓扑

frontend/、backend/、database/、super-deploy-skills/、vibecoding-guide-skill/ 位于仓库根目录。提示词与独立领域工具归属私有 wg-project-kits。

## 2. 规范分层与依赖方向

```text
仓库治理：AGENTS.md
        ↓
模块规则：<domain>/AGENTS.md
        ↓
公共协议：backend/shared/ 与模块唯一真源
        ↓
Skill：SKILL.md / README.md / 可选 STANDARD.md
        ↓
项目生成物：api-contract.md / api-contract-<module>.md
```

下层只能引用上层，不能复制或反向定义上层事实。`STANDARD.md` 仅用于该 skill 无法由上层表达的局部约束；测试状态与迭代记录可放该 skill 内部的 `STATUS.md`。

## 3. 前后端契约路径

```text
backend/shared/
  ├─ response-envelope-spec.md  响应信封
  ├─ error-code-spec.md         错误码
  ├─ jwt-auth-spec.md           JWT
  └─ pagination-spec.md         分页
          ↓
项目 api-contract.md            真实端点、字段、已接入模块
          ↓
frontend-request-skill          读取契约并落位 src/api/
```

公共协议与项目实例分别是不同作用域的真源：前者定义跨语言不变事实，后者定义项目真实接口。前端不另建第三份全局协议。

## 4. 主题与组件真源

| 主题 | 真源 | 消费方 |
|---|---|---|
| Vue 组件红线与 demo 边界 | `frontend/vue/AGENTS.md` | Vue 各 skill |
| UniApp 容器、组件、主题规则 | `frontend/uniapp/AGENTS.md` | UniApp 各 skill |
| 后端公共协议 | `backend/shared/` | 所有后端技能与前端请求层 |
| 数据库设计规则 | `database/database-design-skill/` | 各语言骨架与模块 |
| 密码存储与密码学选型 | `backend/crypto-scenario-skill/` | 认证、支付和安全相关 skill |

## 5. 根入口分工

| 文件 | 读者 | 职责 |
|---|---|---|
| `README.md` | 使用者 | 定位、导航、适用边界 |
| `ONBOARDING.md` | 新使用者 | 首次完成任务的行动路径 |
| `AGENTS.md` | 智能体与维护者 | 治理、文档归属与变更纪律 |
| `MISSING_SKILLS.md` | 使用者与维护者 | 仓库外依赖登记 |
| `CHANGELOG.md` | 使用者 | 已发布变更 |
