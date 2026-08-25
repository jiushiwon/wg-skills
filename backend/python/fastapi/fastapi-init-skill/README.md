# fastapi-init-skill

面向**零基础小白**的 FastAPI 项目一键初始化技能。一条命令完成从零到跑的完整链路。

## 适合谁用

- 完全不懂编程、想搭建一个 API 服务的小白
- 想快速验证 FastAPI 项目的开发者
- 需要一个标准化、带 SSE 和文件上传的 Python Web 骨架的团队

## 一句话描述

你说"帮我搭一个 FastAPI 项目"，它给你一个**立刻能跑的服务**——自带环境检测、自动安装、SSE 流式、文件上传、JWT 鉴权、Swagger 文档、一键启动。

## 触发关键词

```
FastAPI 脚手架、FastAPI 一键生成、初始化 FastAPI 项目、FastAPI 快速开始、
fastapi init、搭建 FastAPI 服务、Python Web 骨架、FastAPI 开箱即用、
FastAPI 零基础、FastAPI 小白、帮我搭一个 FastAPI、新建 FastAPI
```

## 生成的项目包含哪些能力

| 能力 | 说明 |
|------|------|
| **环境探测** | 自动检测 Python 版本（>=3.9）、操作系统 |
| **自动安装** | 创建 venv、安装依赖、编译检查 |
| **一键启动/重启** | `./restart.sh [dev|prod]`：环境搭建、拉代码、装依赖、安全重启、日志输出 |
| **开发模式** | `./restart.sh dev` 热重载，日志 `logs/dev.log` |
| **生产模式** | `./restart.sh prod` 后台多 worker，日志 `logs/app.log` |
| **SSE 流式** | 内置 `sse-starlette`，示例端点 `/api/sse/chat` |
| **文件上传** | 内置 `/api/upload` 单文件与 `/api/uploads` 多文件上传 |
| **统一响应** | `{ code, message, data }` 自动包装 |
| **JWT 鉴权** | 注册、登录、刷新令牌、当前用户 |
| **Swagger** | `/docs`（Swagger UI）+ `/redoc` |
| **数据库** | MySQL 默认，可选 PostgreSQL / MongoDB / 暂不启用数据库 |
| **健康检查** | `/api/health` 含 DB 检测 |
| **安全头** | X-Frame-Options / X-Content-Type-Options 自动注入 |
| **请求日志** | 自动过滤敏感路径（password/token/auth 等） |

## 使用示例

### 最简场景

```
你：帮我搭一个 FastAPI 项目，叫 my-api

AI：好的！只需要确认一下：
  1. 用哪个数据库？（默认 MySQL）
  2. 是否需要 Redis？（默认不需要）

你：MySQL，不用 Redis

AI：开始生成...
  ✓ 环境检测：Python 3.12.0 ✓
  ✓ 创建虚拟环境：venv/
  ✓ 安装依赖：fastapi / uvicorn / sqlalchemy ... 共 13 个包
  ✓ 生成项目文件：18 个文件
  ✓ 编译检查：通过

✅ 项目 my-api 生成完毕！

🚀 启动方式：
  开发模式：  ./restart.sh dev         # 热重载，日志 logs/dev.log
  生产模式：  ./restart.sh prod        # 后台多 worker，日志 logs/app.log
  默认：      ./restart.sh             # 同 dev

📖 接口文档：
  Swagger UI：http://localhost:8080/docs
```

### 带 SSE 的 AI 聊天后端

```
你：帮我搭一个 AI 聊天后端，要 SSE 流式输出

AI：好的！FastAPI + MySQL + SSE 流式，生成中...
  ✓ 内置 SSE 端点：/api/sse/chat（流式输出示例）
  ✓ 已配置 sse-starlette 依赖
  ✓ 可直接对接 OpenAI / 通义 / DeepSeek 等大模型
```

### 带文件上传的后端

```
你：帮我搭一个 FastAPI 后端，需要文件上传

AI：好的！已内置文件上传接口：
  ✓ POST /api/upload   单文件上传
  ✓ POST /api/uploads  多文件上传
  ✓ 默认限制 10MB，支持 jpg/png/gif/pdf
```

## 和 python-backend-skill 的区别

| 维度 | python-backend-skill | fastapi-init-skill |
|------|---------------------|--------------------|
| 目标用户 | 后端开发者 | **零基础小白** |
| 环境安装 | 需要自己装 | **自动检测 + 自动安装** |
| 启动方式 | 手动 uvicorn | **一条命令：`./restart.sh [dev|prod]`** |
| SSE 支持 | 无 | **内置** |
| 文件上传 | 无 | **内置** |
| 默认数据库 | PostgreSQL（可选 PG/MySQL/MongoDB） | **MySQL（可选 PG/MongoDB/无数据库）** |
| 脚本 | 无 | **只生成 `restart.sh` / `restart.bat`（dev/prod 双模式）** |
| Swagger | 有 | 有 + **增强中文说明** |
| 交互次数 | 需要回答多个技术问题 | **最多 3 个问题** |
| 文件数 | ~40 | **~22** |

## 目录结构

```
fastapi-init-skill/
├── SKILL.md                    # 技能入口：触发条件、生成流程、红线
├── README.md                   # 本文件：使用文档
├── scripts/
│   └── generate_project.py     # canonical 生成器：从 references 提取模板生成完整项目
└── references/
    ├── skeleton.md             # 精简骨架：目录结构 + 核心文件代码模板
    ├── env-setup.md            # 环境探测：检测逻辑、安装指引、排错
    ├── sse-guide.md            # SSE 框架：集成方案、示例端点、客户端示例
    ├── db-guide.md             # 数据库：MySQL/PG/Mongo 选型与配置
    ├── db-schema-guide.md      # 数据库表设计规范
    ├── middleware-guide.md     # 中间件：核心中间件链
    ├── startup-scripts.md      # 启动脚本：restart.sh / restart.bat 模板（dev/prod 双模式）
    └── frontend-integration.md # 与 frontend-request-skill 的前后端联动
```

**维护者注意**：`scripts/generate_project.py` 是 canonical 生成器，从 `references/skeleton.md` 和 `references/startup-scripts.md` 自动提取所有模板并生成项目，避免人工复制遗漏文件或导致 `.bat` 中文乱码。修改模板后应重新运行该脚本生成 `demo/` 做验证。

除 `app/` 源码外，脚手架必须同时生成以下文件：

| 文件 | 说明 |
|------|------|
| `.env.example` | 环境变量模板，含端口、数据库、JWT、CORS、上传等全量配置与安全注释 |
| `.env` | 首次生成时从 `.env.example` 复制，用户按需修改后由服务加载 |
| `.gitignore` | Git 忽略规则，必须忽略 `.env`、`.env.*.local` 等敏感文件 |
| `api-contract.md` | 接口契约，与 `frontend-request-skill` 对齐 |
| `docs/project-guide.md` | 项目指南，含启动方式、拓展指南、前后端对接示例 |

**配置加载原则**：`app/config.py` 通过 Pydantic Settings 读取 `.env` 全部配置，禁止在代码中硬编码端口、数据库连接、密钥、上传路径等运行时可变参数。

## 生成项目的技术栈

- **Python 3.9+**（自动检测版本）
- **FastAPI**（现代 Python Web 框架）
- **Uvicorn**（ASGI 服务器，支持热重载）
- **SQLAlchemy 2.0**（异步 ORM，默认 MySQL）
- **Pydantic v2**（数据校验与配置管理）
- **python-jose**（JWT 签发与验证）
- **passlib[bcrypt]**（密码加密）
- **sse-starlette**（Server-Sent Events 流式推送）
- **python-multipart**（文件上传解析）

## 验证

生成后可在项目目录运行：

```bash
./restart.sh       # Linux/macOS 一键启动（默认 dev）
restart.bat        # Windows 一键启动（默认 dev）
```

或手动验证：

```bash
pip install -r requirements.txt
python -m compileall app
uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
curl http://localhost:8080/api/health
```

预期返回：`{ "code": 0, "message": "success", "data": { "status": "ok" } }`

## 重启脚本设计规则

`restart.sh` / `restart.bat` 是本 skill 的核心入口，设计目标：**小白只需要记住一条命令**。

| 规则 | 说明 |
|------|------|
| **单入口** | 每个平台只生成一个脚本，不拆分 setup / dev / start |
| **参数分模式** | `./restart.sh dev` 开发热重载，`./restart.sh prod` 生产多 worker，默认 dev |
| **一条龙** | 拉代码 → 装依赖 → 安全停旧进程 → 启动 → 输出日志命令 |
| **安全杀旧进程** | 先按 `app.pid` 优雅停止；PID 失效则按端口扫描清理残留进程 |
| **自动 .env** | 无 `.env` 时自动从 `.env.example` 复制并提示编辑 |
| **日志落地** | dev 写入 `logs/dev.log`，prod 写入 `logs/app.log`，启动后打印查看命令 |
| **失败可排查** | 启动失败时输出最近日志路径，方便定位 |

## 生产环境提醒

本技能面向**开发/学习**场景，生成的代码可直接运行，但上线生产前需要手动调整：

| 检查项 | 操作 | 文件位置 |
|--------|------|----------|
| **关闭调试模式** | `APP_DEBUG=false` | `.env` |
| **修改 JWT 密钥** | 执行 `openssl rand -hex 32` 替换 `JWT_SECRET` | `.env` |
| **限制 CORS 来源** | `CORS_ORIGINS=https://yourdomain.com` | `.env` |
| **修改数据库密码** | 将默认 `root` 改为强密码 | `.env` |
| **关闭 Swagger** | `docs_url=None, redoc_url=None` | `main.py` |
| **数据库迁移** | 使用 Alembic 管理表结构，禁用 `create_all` | 自行安装配置 |
| **HTTPS** | 在 Nginx / CDN 层开启 TLS | 反向代理 |

## 与其他 skill 的关系

- 与 `backend-convention-skill` 规范对齐（响应信封、错误码、JWT），但 `api-contract` 与 `project-guide` 模板已内置本 skill，生成项目不依赖外部文件
- 引用 `database-skill`（DB 选型与迁移规则）
- 引用 `frontend-request-skill`（前端请求层规范，接口契约联动）
- **不替代** `python-backend-skill`（后者面向开发者，在 backend-generate-skill 体系内）

## 前后端联动

本 skill 生成的后端与 `frontend-request-skill` 通过 `api-contract.md` 联动：

- 后端统一返回 `{ code, message, data }`
- 前端 `request.ts` 按相同结构解析
- `ERROR_CODE_MAP` 直接复用后端契约中的错误码表
- SSE、文件上传接口也纳入契约，避免前后端约定不一致

详见 [references/frontend-integration.md](references/frontend-integration.md)。
