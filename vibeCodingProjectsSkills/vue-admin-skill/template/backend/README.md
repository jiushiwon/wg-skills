# vue-admin 后端模板

基于 Spring Boot 3 + JPA + MySQL + JWT 的管理后台后端基础设施。

## 启动三步法

1. **启动数据库**：`docker compose up -d mysql`（首次启动会自动执行 `../database/init.sql` 建表并植入种子数据）
2. **启动后端**：`./restart.sh dev`（Windows: `restart.bat dev`）
3. **访问接口**：打开 http://localhost:8080/swagger-ui.html 查看所有接口

## 默认账号

| 账号 | 密码 | 说明 |
|------|------|------|
| admin | admin123 | 超级管理员（数据由 `auth` 模块提供种子数据） |

## 主要接口

| 模块 | 路径前缀 | 说明 |
|------|----------|------|
| 健康检查 | `/api/health` | 服务存活检测 |
| 文件上传 | `/api/upload` | 单文件/多文件上传 |
| SSE | `/api/sse/**` | 服务端推送 |
| 认证 | `/api/auth/**` | 登录/注册/刷新令牌（由 auth 模块提供） |
| 用户管理 | `/api/users/**` | 用户 CRUD（由 auth 模块提供） |
| 角色管理 | `/api/roles/**` | 角色与权限（由 auth 模块提供） |
| 菜单管理 | `/api/menus/**` | 动态菜单树（由 auth 模块提供） |
| 组织管理 | `/api/orgs/**` | 组织/部门树（由 auth 模块提供） |
| 商品示例 | `/api/products/**` | 业务示例模块（演示完整 CRUD + 分页 + 模糊搜索） |

## 项目结构

```
backend/
├── pom.xml                   # Maven 配置
├── Dockerfile                # 多阶段构建镜像
├── docker-compose.yml        # 一键编排 MySQL + Spring Boot
├── restart.sh / restart.bat  # 本地启动脚本
├── .env.example              # 环境变量模板
└── src/main/java/com/example/demo/
    ├── Application.java
    ├── common/               # ApiResponse / BusinessException / 分页 / JWT 工具 — 见 [Provenance](#provenance)
    ├── config/               # Security / Web / Swagger / 全局响应 — 见 [Provenance](#provenance)
    ├── controller/           # Health / Upload / SSE
    ├── example/              # 业务示例（Product 模块）
    └── auth/                 # RBAC 完整实现（基于 springboot-auth-module-skill/api-contract-auth.md 契约对齐）
```

## Provenance

**来源声明**：本后端的 `common/` 和 `config/` 目录 13 个 Java 文件均为 **springboot-init-skill/demo** 的衍生派生（详见各文件顶部 `// Derived from ...` 注释）。

| 本文件 | 派生自 | 差异 |
|--------|--------|------|
| `common/ApiResponse.java` | `springboot-init-skill/demo/.../common/ApiResponse.java` | 无 |
| `common/BusinessException.java` | 同上 | 无 |
| `common/CurrentUser.java` | 同上 | 无 |
| `common/CurrentUserArgumentResolver.java` | 同上 | 无 |
| `common/GlobalExceptionHandler.java` | 同上 | 无 |
| `common/JwtAuthenticationFilter.java` | 同上 | 无 |
| `common/JwtUtil.java` | 同上 | 无 |
| `common/PageRequest.java` | 同上 | `pageSize` → `size` + 新增 `toPageable(Sort)` 重载 |
| `common/PageResponse.java` | 同上 | 无 |
| `config/SecurityConfig.java` | `springboot-init-skill/demo/.../config/SecurityConfig.java` | 删除 `/api/sse/**` permitAll（vue-admin 无 SSE） |
| `config/WebConfig.java` | 同上 | 无 |
| `config/OpenApiConfig.java` | 同上 | 无 |
| `config/LoggingFilter.java` | 同上 | 无 |
| `config/ResponseAdvice.java` | 同上 | 无 |
| `auth/*` | `springboot-auth-module-skill/api-contract-auth.md` 契约对齐 | **vue-admin 手写完整 RBAC**（auth-module-skill 零源码） |
| `example/*` | vue-admin-skill 自带业务示例 | 与任何依赖技能无关 |

**为什么不能完全软链接**：Java 后端是单项目工程，无法像前端那样通过 `file:` 协议软链接包；springboot-init-skill 提供的 `demo/` 本质是"教学示例代码"（非可 maven 依赖的库）。

**同步上游注意事项**：
- springboot-init-skill/demo 升级时，13 个文件的差异会被覆盖；本表记录当前差异状态
- 如需主动同步：在 springboot-init-skill/demo 修改后，对照本表 diff 即可定位冲突点

## Future options（不推荐）

**P2-A**：把 springboot-init-skill 改造为双模块（demo + starter），让 vue-admin-skill/template/backend 通过 maven 依赖引入 starter，删除这 14 个文件。**不推荐原因**：
- 改动爆炸（springboot-init-skill 需新增 starter 模块 + 移动 ~50 文件）
- 违背核心设计约束（Java 单工程不可拆包软链接）
- 会破坏现有 dogfooding（D:/projects/java-vue-admin 已完整跑通）