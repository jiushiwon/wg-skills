---
name: springboot-agent-module-skill
description: Spring Boot AI Agent 模块。基于 Spring AI / LangChain4j 实现对话 Agent，支持 Tool 扩展、模型接入、上下文记忆、多轮对话、流式输出、限流、审计等。面向已安装 springboot-init-skill + springboot-auth-module-skill 的项目。触发词："Spring AI Agent"、"Spring Agent"、"AI 对话模块"、"Spring Tool"、"帮我加一个 Spring AI 对话模块"。
---

# Spring Agent Module Skill

为 Spring Boot 项目**叠加**一套 AI Agent 能力，基于 Spring AI / LangChain4j 框架实现。

## 定位

- 目标：在已有 `springboot-init-skill` 骨架 + `springboot-auth-module-skill` 鉴权模块上，添加 AI Agent 对话能力。
- 核心：Agent 工作流 + Tool 扩展 + 模型接入 + 上下文记忆 + 安全防护。
- 输出：Agent 核心、Tool 定义、Controller、数据库模型、接口契约。

## 骨架依赖

> 本模块依赖 `springboot-init-skill` 骨架 + `springboot-auth-module-skill` 鉴权模块。

**使用前必须满足：**
1. ✅ 已安装 `springboot-init-skill`（项目骨架）
2. ✅ 已安装 `springboot-auth-module-skill`（用户鉴权）
3. ✅ 骨架包含：JWT、统一响应、分页、异常处理

**对接规范（必须遵循）：**
1. ✅ 使用骨架的 `ConfigurationProperties` 配置系统
2. ✅ 使用骨架的统一响应 `AjaxResult`
3. ✅ 使用骨架的全局异常处理
4. ✅ 使用骨架的 `ThreadLocal` 鉴权上下文
5. ✅ 使用骨架的 `RedisTemplate` 缓存
6. ✅ 使用骨架的 `DynamicTableLoader` 多数据源
7. ✅ Agent 模块注册到 Spring 容器，通过 `@Autowired` 注入

## 用户问题（最多 3 个）

```
1. 用什么模型？（默认 OpenAI gpt-4o-mini，可选 Claude/本地模型）
2. 需要哪些内置 Tool？（默认：查用户信息、查角色、查菜单、查组织）
3. 是否开启历史消息？（默认开启，保留 20 轮）
```

## 核心能力清单

| # | 能力 | 说明 |
|---|------|------|
| 1 | **Agent 框架** | 基于 Spring AI / LangChain4j 的对话 Agent |
| 2 | **Tool 系统** | 声明式 Tool 定义，自动参数校验 |
| 3 | **模型接入** | 统一模型接口，支持 OpenAI/Claude，本地模型 |
| 4 | **多轮对话** | 支持上下文记忆，会话级别历史 |
| 5 | **对话管理** | 创建/查询/删除/清除会话 |
| 6 | **用户绑定** | 对话关联 SysUser，权限隔离 |
| 7 | **流式输出** | Server-Sent Events 流式返回 token |
| 8 | **Rate Limiting** | 限流防刷，每用户 10 次/分钟 |
| 9 | **审计日志** | 结构化审计日志 |
| 10 | **Token 统计** | 消耗统计与限额控制 |
| 11 | **接口契约** | 生成 `api-contract-agent.md` |
| 12 | **多模型支持** | GPT-4o-mini / Claude / 本地模型 |

## 内置 Tools

| Tool | 功能 | 依赖模块 |
|------|------|----------|
| `getUserInfo` | 查询用户基本信息 | springboot-auth-module-skill |
| `getUserRoles` | 查询用户角色 | springboot-auth-module-skill |
| `getUserMenus` | 查询用户菜单权限 | springboot-auth-module-skill |
| `getOrgTree` | 查询组织架构树 | springboot-auth-module-skill |
| `searchUsers` | 搜索用户（分页） | springboot-auth-module-skill |
| `getPostList` | 查询岗位列表 | springboot-auth-module-skill |
| `getTenantInfo` | 查询租户信息 | springboot-auth-module-skill |

## 生成的模块结构

```
src/main/java/com/{package}/agent/
├── AgentApplication.java           # Agent 模块配置
├── config/
│   ├── AgentProperties.java      # 配置属性
│   └── AgentAutoConfiguration.java # 自动配置
├── controller/
│   ├── AgentChatController.java   # 对话接口
│   ├── AgentSessionController.java # 会话管理
│   └── AgentToolController.java   # Tool 管理
├── service/
│   ├── IAgentChatService.java    # 对话服务接口
│   ├── AgentChatServiceImpl.java # 对话服务实现
│   ├── IAgentSessionService.java # 会话服务接口
│   └── AgentSessionServiceImpl.java
├── agent/
│   ├── AgentBuilder.java         # Agent 构建器
│   ├── ToolExecutor.java        # Tool 执行器
│   └── MemoryManager.java       # 记忆管理
├── tool/
│   ├── Tool.java                # Tool 注解
│   ├── BaseTool.java           # Tool 基类
│   ├── UserTools.java           # 用户相关 Tool
│   ├── OrgTools.java           # 组织架构 Tool
│   └── ToolRegistry.java       # Tool 注册表
├── model/
│   ├── AgentSession.java        # 会话实体
│   └── AgentMessage.java        # 消息实体
├── dto/
│   ├── ChatRequest.java         # 对话请求
│   ├── ChatResponse.java        # 对话响应
│   ├── SessionDTO.java         # 会话DTO
│   └── ToolDefinition.java     # Tool 定义
└── repository/
    ├── AgentSessionRepository.java
    └── AgentMessageRepository.java

src/main/resources/
├── mapper/
│   ├── AgentSessionMapper.java
│   └── AgentMessageMapper.java
└── agent/
    ├── agent.properties         # Agent 配置
    └── agent.sql               # 建表 SQL

api-contract-agent.md
docs/agent-module-guide.md
```

## Agent 工作流

```
用户输入 → Agent State 初始化
    ↓
LLM 生成思考 + Action
    ↓
Tool Executor 执行 Tool
    ↓
观察结果 → 返回 LLM
    ↓
LLM 生成最终回复 → 流式输出
    ↓
记忆存储（可选）
```

## Tool 定义示例

```java
@Tool(name = "getUserInfo", description = "获取用户信息")
public class UserTools {
    
    @ToolMethod("查询用户基本信息")
    public UserDTO getUserInfo(
        @ToolParam(description = "用户ID，不传则查当前用户") Long userId,
        @Context Long currentUserId
    ) {
        // 实现逻辑
        return userService.getUserById(userId);
    }
}
```

## 接口契约

| 路径 | 说明 |
|------|------|
| `POST /api/agent/chat` | 流式对话 |
| `POST /api/agent/chat/sync` | 同步对话（非流式） |
| `GET /api/agent/sessions` | 会话列表 |
| `POST /api/agent/sessions` | 创建会话 |
| `DELETE /api/agent/sessions/{id}` | 删除会话 |
| `GET /api/agent/tools` | 可用工具列表 |
| `POST /api/agent/clear-memory` | 清除会话记忆 |

## 生成流程

1. 确认已存在 Spring Boot 骨架 + Auth 模块。
2. 询问用户模型选择、内置 Tool、记忆轮数。
3. 按模板生成 `agent/` 下全部源码。
4. 生成 `api-contract-agent.md` 与 `docs/agent-module-guide.md`。
5. 提示用户安装依赖。

## 依赖安装

```xml
<!-- Spring AI (推荐) -->
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-openai-spring-boot-starter</artifactId>
</dependency>

<!-- 或 LangChain4j -->
<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j</artifactId>
</dependency>

<!-- SSE 支持 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>

<!-- 限流 -->
<dependency>
    <groupId>com.bucket4j</groupId>
    <artifactId>bucket4j-core</artifactId>
</dependency>
```

## 红线

1. 不重复生成 Spring Boot 骨架和 Auth 模块。
2. Tool 定义使用声明式，自动参数校验。
3. 对话历史默认保留 20 轮，可配置。
4. 流式输出使用 SSE。
5. 所有注释、文档用中文。
6. 必须遵循骨架的代码风格（统一响应、异常处理、配置）。
7. 禁止在 Tool 中直接操作数据库，必须调用 Service 层。

## 与 fastapi-agent-module-skill 对齐

- 接口路径一致：`/api/agent/*`
- 响应结构一致：`{ code, message, data }` 信封格式
- Tool 命名风格一致：驼峰命名
- 配置属性风格一致

## 后续迭代

- 支持 LangChain4j LCEL 表达式
- 支持 RAG 知识库
- 支持自定义 Agent 节点
- 与 `fastapi-agent-module-skill` 字段对齐

---

**【考拉搞AI】，带你全面进入 VibeCoding 的世界~**

## 触发关键词

```
Spring AI Agent、Spring Agent、AI 对话模块、Spring Tool、
帮我加一个 Spring AI 对话模块、Agent 模块、LLM 对话、Spring AI
```
