# Spring Boot Agent Module Skill

> 为 Spring Boot 项目叠加 AI Agent 能力，基于 **Spring AI 1.0** 实现。

## 技术栈

| 组件 | 版本策略 | 说明 |
|------|----------|------|
| **JDK** | ≥ 17（骨架基线） | Spring AI 1.0 最低要求 |
| **Spring Boot** | ≥ 3.3.x（骨架基线） | 不硬编码，遵循骨架版本获取策略 |
| **ORM** | Spring Data JPA | 与骨架一致（不引入 MyBatis Plus） |
| **SSE** | SseEmitter | 与骨架一致（不引入 WebFlux） |
| **DB 迁移** | Flyway | 与骨架一致（不手动执行 SQL） |

## 依赖清单

### 骨架已含依赖（不重复引入）

| 依赖 | 说明 | 来源 |
|------|------|------|
| `spring-boot-starter-web` | Web + SseEmitter | springboot-init-skill |
| `spring-boot-starter-data-jpa` | ORM（JPA） | springboot-init-skill |
| `spring-boot-starter-security` | 安全框架 | springboot-init-skill |
| `spring-boot-starter-validation` | Jakarta Bean Validation | springboot-init-skill |
| `mysql-connector-j` | MySQL 驱动 | springboot-init-skill |
| `io.jsonwebtoken:jjwt-*` (0.12.x) | JWT 鉴权 | springboot-init-skill |
| `org.springdoc:springdoc-openapi-starter-webmvc-ui` (2.x) | Swagger 文档 | springboot-init-skill |
| `org.flywaydb:flyway-core` + `flyway-mysql` | 数据库迁移 | springboot-init-skill |
| `spring-boot-starter-data-redis` | Redis（可选） | springboot-init-skill |
| `org.projectlombok:lombok` | Lombok | springboot-init-skill |

### Agent 模块新增依赖

| 依赖 | 版本基线 | 说明 |
|------|----------|------|
| `org.springframework.ai:spring-ai-openai-spring-boot-starter` | 1.0.0 | Spring AI OpenAI（核心） |
| `org.springframework.ai:spring-ai-anthropic-spring-boot-starter` | 1.0.0 | Claude 模型（可选） |
| `org.springframework.ai:spring-ai-ollama-spring-boot-starter` | 1.0.0 | 本地模型（可选） |
| `com.bucket4j:bucket4j-core` | 8.10.1 | 限流 |
| `io.github.resilience4j:resilience4j-spring-boot3` | 2.2.0 | 重试 |
| `com.google.crypto.tink:tink` | 1.15.0 | PII 加密（Fernet） |

> **Spring AI BOM**：在 `<dependencyManagement>` 中引入 `spring-ai-bom` 统一管理版本。

### pom.xml 完整依赖片段

```xml
<!-- ===== Agent 模块新增依赖 ===== -->

<!-- Spring AI BOM -->
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.ai</groupId>
            <artifactId>spring-ai-bom</artifactId>
            <version>1.0.0</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<dependencies>
    <!-- Spring AI OpenAI（核心） -->
    <dependency>
        <groupId>org.springframework.ai</groupId>
        <artifactId>spring-ai-openai-spring-boot-starter</artifactId>
    </dependency>

    <!-- Spring AI Anthropic（可选，Claude 模型） -->
    <dependency>
        <groupId>org.springframework.ai</groupId>
        <artifactId>spring-ai-anthropic-spring-boot-starter</artifactId>
    </dependency>

    <!-- Spring AI Ollama（可选，本地模型） -->
    <dependency>
        <groupId>org.springframework.ai</groupId>
        <artifactId>spring-ai-ollama-spring-boot-starter</artifactId>
    </dependency>

    <!-- Bucket4j 限流 -->
    <dependency>
        <groupId>com.bucket4j</groupId>
        <artifactId>bucket4j-core</artifactId>
        <version>8.10.1</version>
    </dependency>

    <!-- Resilience4j 重试 -->
    <dependency>
        <groupId>io.github.resilience4j</groupId>
        <artifactId>resilience4j-spring-boot3</artifactId>
        <version>2.2.0</version>
    </dependency>

    <!-- PII 加密（Fernet） -->
    <dependency>
        <groupId>com.google.crypto.tink</groupId>
        <artifactId>tink</artifactId>
        <version>1.15.0</version>
    </dependency>
</dependencies>
```

## 核心能力

| # | 能力 | 说明 |
|---|------|------|
| 1 | Spring AI Agent | ChatClient + Function Calling |
| 2 | Tool 系统 | 声明式 @AgentTool + Jakarta Bean Validation |
| 3 | 模型接入 | OpenAI / Claude / DeepSeek / Ollama |
| 4 | 多轮对话 | Deque 自动裁剪 + LRU 内存缓冲 + Redis 可选 |
| 5 | 流式输出 | SseEmitter + 断连检测 |
| 6 | 限流 | Bucket4j（10 次/分钟/用户） |
| 7 | 审计日志 | 独立 logger，按天滚动 |
| 8 | 安全防护 | Prompt Injection / PII 加密 / trace_id / 安全响应头 |
| 9 | 事务一致性 | @Transactional 单事务写入 |
| 10 | 模型白名单 | 客户端无法指定白名单外模型 |

## 内置 Tools

| Tool | 功能 |
|------|------|
| `getUserInfo` | 查当前用户信息（脱敏） |
| `getUserRoles` | 查当前用户角色 |
| `getUserMenus` | 查当前用户菜单权限 |
| `searchUsers` | 搜索用户（脱敏） |
| `getOrgTree` | 查当前租户组织架构树 |
| `getOrgDetail` | 查当前租户部门详情 |
| `getPostList` | 查当前租户岗位 |
| `getTenantInfo` | 查当前用户所属租户 |
| `safeReadFile` | 读取项目内文件（安全限制） |
| `safeWriteFile` | 写入项目内文件（两步确认） |

## 接口

| 路径 | 方法 | 说明 |
|------|------|------|
| `/api/agent/chat` | POST | 流式对话（SSE） |
| `/api/agent/chat/sync` | POST | 同步对话 |
| `/api/agent/sessions` | GET | 会话列表 |
| `/api/agent/sessions` | POST | 创建会话 |
| `/api/agent/sessions/{id}` | GET | 获取会话 |
| `/api/agent/sessions/{id}` | DELETE | 删除会话（?hard=true 硬删除） |
| `/api/agent/sessions/{id}/messages` | GET | 获取消息 |
| `/api/agent/sessions/{id}/clear-memory` | POST | 清除内存记忆 |
| `/api/agent/tools` | GET | 工具列表 |

## 与骨架的对接规范

| 规范 | 骨架 | Agent 模块 |
|------|------|------------|
| ORM | Spring Data JPA | ✅ 一致 |
| SSE | SseEmitter | ✅ 一致 |
| DB 迁移 | Flyway | ✅ 一致 |
| 响应格式 | ApiResponse（ResponseBodyAdvice） | ✅ 一致 |
| 异常处理 | GlobalExceptionHandler | ✅ 一致 |
| 用户获取 | @CurrentUser | ✅ 一致 |
| 安全头 | SecurityConfig | ✅ 复用 |
| 表前缀 | {prefix} | ✅ 一致 |
| 配置 | .env + application.yml | ✅ 一致 |
| 版本策略 | 不硬编码 | ✅ 一致 |

## 文件说明

```
references/
├── agent.sql           # Flyway 迁移（V20__init_agent_module.sql，含 5 个索引 + FK CASCADE）
├── agent.properties    # 配置模板（.env 风格）
├── config.java         # AgentAutoConfiguration + AgentProperties
├── models.java         # 实体类（JPA @Entity）
├── tools.java          # @AgentTool 注解 + BaseTool 基类 + ToolRegistry
├── controller.java     # Controller（@CurrentUser + ApiResponse）
├── user-tools.java     # 用户 Tools（@CurrentUser 注入）
├── org-tools.java      # 组织 Tools（多租户隔离）
├── enums.java          # ChatErrorCode 错误码
├── audit.java          # AgentAuditLogger 审计日志
├── pii.java            # PiiEncryptor PII 加密
├── memory.java         # MemoryManager 记忆管理
├── agent-runner.java   # AgentRunner 运行器
├── tool-executor.java  # ToolExecutor 执行器
├── security-filters.java # PromptSanitizer + TraceIdFilter（安全头由骨架管理）
└── rate-limiter.java   # Bucket4jRateLimiter + FileTools
```

## 与 fastapi-agent-module-skill 对齐

接口路径、响应结构、错误码、审计日志格式完全一致，Tool 命名风格遵循 Java 惯例（camelCase）。

---

**【考拉搞AI】，带你全面进入 VibeCoding 的世界~**
