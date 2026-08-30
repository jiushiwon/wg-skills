# springboot-agent-module-skill

> 为 Spring Boot 项目叠加 AI Agent 对话能力：Spring AI / LangChain4j + Tool + 多轮对话 + 上下文记忆。

## 一句话

在已有 `springboot-init-skill` + `springboot-auth-module-skill` 的项目上说一句"帮我加一个 AI 对话模块"，即可拿到一套可运行的 Java Agent 代码、Tool 扩展、接口契约。

> **前置条件**：必须先安装 `springboot-init-skill` 骨架 + `springboot-auth-module-skill` 鉴权模块

## 适合场景

- 已有项目需要 AI 智能助手
- 需要基于用户权限的智能查询（如查自己信息、角色、菜单）
- 需要多轮对话、上下文记忆
- 需要扩展自定义 Tool

## 不适合场景

- 项目还没有 Spring Boot 骨架（请先用 `springboot-init-skill`）
- 项目还没有权限模块（请先用 `springboot-auth-module-skill`）

## 触发关键词

```
Java AI Agent、Spring Agent、AI 对话模块、Java Tool、
帮我加一个 Java AI 对话模块、Agent 模块、LLM 对话
```

## 快速上手

```bash
# 1. 在 Claude Code 中说：
#    "在现有 Spring Boot 项目上加一个 AI 对话模块"

# 2. 回答 3 个问题：
#    Q1: 用什么模型？（默认 gpt-4o-mini）
#    Q2: 需要哪些内置 Tool？（默认查用户/角色/菜单）
#    Q3: 是否开启历史消息？（默认开启 20 轮）

# 3. 安装依赖（pom.xml）
# 4. 执行迁移后重启
mvn spring-boot:run
```

## 生成内容

```
src/main/java/com/{package}/agent/
├── config/
│   ├── AgentProperties.java
│   └── AgentAutoConfiguration.java
├── controller/
│   ├── AgentChatController.java
│   ├── AgentSessionController.java
│   └── AgentToolController.java
├── service/
│   ├── IAgentChatService.java
│   ├── AgentChatServiceImpl.java
│   ├── IAgentSessionService.java
│   └── AgentSessionServiceImpl.java
├── agent/
│   ├── AgentBuilder.java
│   ├── ToolExecutor.java
│   └── MemoryManager.java
├── tool/
│   ├── Tool.java
│   ├── BaseTool.java
│   ├── UserTools.java
│   ├── OrgTools.java
│   └── ToolRegistry.java
├── model/
│   ├── AgentSession.java
│   └── AgentMessage.java
├── dto/
│   ├── ChatRequest.java
│   ├── ChatResponse.java
│   ├── SessionDTO.java
│   └── ToolDefinition.java
└── repository/
    ├── AgentSessionRepository.java
    └── AgentMessageRepository.java

src/main/resources/
├── mapper/
│   ├── AgentSessionMapper.java
│   └── AgentMessageMapper.java
└── agent/
    ├── agent.properties
    └── agent.sql

api-contract-agent.md
docs/agent-module-guide.md
```

## 内置 Tools

| Tool | 功能 |
|------|------|
| `getUserInfo` | 查询当前用户信息 |
| `getUserRoles` | 查询用户角色 |
| `getUserMenus` | 查询用户菜单权限 |
| `getOrgTree` | 查询组织架构树 |
| `searchUsers` | 搜索用户 |
| `getPostList` | 查询岗位列表 |
| `getTenantInfo` | 查询租户信息 |

## 核心接口

| 路径 | 说明 |
|------|------|
| `POST /api/agent/chat` | 流式对话 |
| `POST /api/agent/chat/sync` | 同步对话 |
| `GET /api/agent/sessions` | 会话列表 |
| `POST /api/agent/sessions` | 创建会话 |
| `DELETE /api/agent/sessions/{id}` | 删除会话 |
| `GET /api/agent/tools` | 可用工具列表 |

## 表清单

| 表名 | 说明 |
|------|------|
| `{prefix}_agent_session` | AI 对话会话 |
| `{prefix}_agent_message` | 消息记录 |

## 与 springboot-auth-module-skill 集成

1. Agent 自动获取当前登录用户
2. Tool 可以调用 Auth 模块的服务层
3. 用户权限决定 Tool 返回的数据范围

## 与 fastapi-agent-module-skill 对齐

- 接口路径一致：`/api/agent/*`
- 响应结构一致：流式 SSE

## 版本日志

### v1.0.0 (2026-08-30)

- ✅ Agent 核心框架
- ✅ Tool 声明式定义
- ✅ 模型接入（Spring AI / LangChain4j）
- ✅ 多轮对话 + 记忆
- ✅ SSE 流式输出
- ✅ 接口契约

---

**【考拉搞AI】，带你全面进入 VibeCoding 的世界~**
