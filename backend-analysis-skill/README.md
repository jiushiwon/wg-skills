# Backend Analysis Skill 🔍

> 后端项目全景分析技能：不运行项目，静态扫描源码，一次产出 **接口 / 技术栈 / 数据库 / 业务逻辑** 4 份报告。

## 这是什么

接手一个陌生后端项目时，最头疼的是四个问题：**有哪些接口？用了什么技术？数据库长什么样？业务逻辑怎么跑？**

本技能通过静态源码扫描（不需要项目能编译、能启动、有数据库），为 Java / Go / Python / Node.js 后端项目生成 4 份结构化报告，落到目标项目的 `docs/backend-analysis/` 目录。

## 4 份报告

| 报告 | 内容 | 典型用途 |
|------|------|----------|
| `01-api-report.md` | 全部 API 清单：HTTP 方法、完整路径、处理函数、入参出参、鉴权标记、无鉴权接口预警 | 补接口文档、对接前端、安全自查 |
| `02-tech-report.md` | 语言/框架版本、依赖分类、中间件（Redis/MQ/ES/对象存储）、第三方 API（短信/支付/推送/AI）、架构组件（拦截器/全局异常/AOP/跨域/定时任务）、安全隐患 | 技术盘点、技术选型汇报、风险评估 |
| `03-database-report.md` | 数据库类型、表清单、核心表结构、表关系、迁移脚本、Redis 缓存设计 | 补数据字典、理解数据模型 |
| `04-business-report.md` | 项目定位、模块划分、核心业务流程（带调用链）、定时/异步任务、对外集成点、遗留风险 | 快速上手业务、重构前摸底 |
| `00-overview.md` | 项目画像 + 规模统计 + 4 份报告摘要 + Top 风险 + 接手阅读顺序 | 第一眼看全局 |

## 支持的技术栈

| 语言 | 框架 | ORM / 数据访问 |
|------|------|----------------|
| Java | Spring Boot / Spring Cloud / Dubbo | MyBatis(-Plus)、JPA/Hibernate、JdbcTemplate |
| Go | Gin / Echo / Kratos / gRPC | GORM、Ent、sqlx |
| Python | FastAPI / Django(+DRF) / Flask | SQLAlchemy、Django ORM、Tortoise |
| Node.js | Express / NestJS / Koa / Fastify | Prisma、TypeORM、Sequelize、Mongoose |

数据库：MySQL、PostgreSQL、MongoDB、Redis、SQLite、Oracle、SQL Server。

## 使用方式

### 自然语言触发（推荐）

把 Claude 的**工作目录切到目标后端项目**，然后说：

```
帮我分析下这个后端项目，出完整报告
梳理下这个项目所有接口
盘点下这个项目的技术栈和第三方服务
出一份这个项目的数据库文档
接手这个项目，帮我读懂它的业务逻辑
```

### 指定单份报告

```
只出接口报告
只要技术报告，重点看用了哪些中间件和第三方 API
只出数据库报告
```

### 指定输出位置

```
分析报告写到 docs/handover/ 目录
```

默认输出到 `<目标项目>/docs/backend-analysis/`。

## 工作流程

```
Step 0  识别技术栈（读 pom.xml / go.mod / package.json / requirements.txt）
Step 1  扫描接口    → 01-api-report.md
Step 2  扫描技术栈  → 02-tech-report.md
Step 3  扫描数据库  → 03-database-report.md
Step 4  梳理业务    → 04-business-report.md
Step 5  汇总总览    → 00-overview.md
```

每份报告的结论都标注来源文件（`path/file.java:42`），可逐条核对；推测性结论标注"（推测）"；密钥密码一律打码。

## 与传统工具的对比

| 对比项 | 本技能 | Knife4j / Swagger | screw / SchemaCrawler | SonarQube |
|--------|--------|-------------------|----------------------|-----------|
| 需要项目能运行 | ❌ 不需要 | ✅ 必须启动 | ✅ 需连真实数据库 | ✅ 需编译 |
| 跨语言（Java/Go/Py/Node） | ✅ | ❌ 仅 JVM | 部分 | ✅ 但需配置 |
| 一次出 4 份报告 | ✅ | 仅接口 | 仅数据库 | 仅代码质量 |
| 业务逻辑梳理 | ✅ | ❌ | ❌ | ❌ |
| 标注结论来源 | ✅ | — | — | ✅ |

> 定位差异：Knife4j 是**运行时**接口文档（项目活着时用），本技能是**静态**盘点（项目跑不起来、或只想快速理解时用），两者互补。

## 报告示例（节选）

接口报告中的接口表：

| # | 方法 | 路径 | 处理函数 | 入参 | 出参 | 鉴权 | 来源 |
|---|------|------|----------|------|------|------|------|
| 1 | POST | /user/login | UserController.login | LoginDTO | R\<TokenVO\> | 免鉴权 | UserController.java:35 |
| 2 | GET | /user/{id} | UserController.getById | id:Long | R\<UserVO\> | 需登录 | UserController.java:48 |

技术报告中的第三方 API 表：

| 服务 | 类型 | 用途 | 配置（已打码） | 证据 |
|------|------|------|----------------|------|
| 阿里云短信 | 短信 | 登录验证码 | sms.access-key=LTAI**** | SmsService.java:22 |
| 微信支付 | 支付 | 订单支付 | pay.mch-id=16**** | PayConfig.java:18 |

## 目录说明

```
backend-analysis-skill/
├── SKILL.md                              # 技能定义：触发条件 + 工作流 + 输出规范
├── README.md                             # 本文件：用户使用文档
└── references/
    ├── detection-rules.md                # Step 0：语言/框架/ORM/数据库识别规则
    ├── api-scan-patterns.md              # Step 1：各框架接口扫描正则与路径拼接规则
    ├── tech-scan-patterns.md             # Step 2：中间件/第三方API/架构组件/安全隐患扫描
    ├── database-scan-patterns.md         # Step 3：各 ORM 实体扫描 + SQL/迁移文件收集
    └── report-templates.md               # 4 份报告 + 总览的输出模板
```

## 注意事项

1. **只读**：不修改、不运行目标项目任何代码
2. **大项目**：先扫结构再按模块深入，不会一次读完全量文件
3. **敏感信息**：密钥、密码、Token 在报告中自动打码
4. **证据优先**：每条结论带来源文件，存疑项标"（推测）"，不会编造
5. **边界**：要"部署检测"请用 `deploy-detect-skill`，要"从零生成后端"请用 `backend-generate-skill`

## 兼容性

- 首次发布，无历史版本，无破坏性变更。
- 与 `backend-generate-skill`、`super-deploy-skills` 触发词无冲突：本技能响应"分析/梳理/盘点/读懂/接手"，不响应"生成/部署"。
