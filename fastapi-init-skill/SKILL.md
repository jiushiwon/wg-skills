---
name: fastapi-init-skill
description: FastAPI 项目一键初始化技能。面向零基础小白，提供环境探测、自动安装、完整 Web 骨架生成、SSE 流式框架、JWT 鉴权、统一响应封装、文件上传接口、一键启动/重启脚本、Swagger 文档，内置 MySQL（默认）/ PostgreSQL / MongoDB 数据库选择。用户只需说"帮我搭一个 FastAPI 项目"即可一条命令完成从零到跑的完整链路。触发词："FastAPI 脚手架"、"FastAPI 一键生成"、"初始化 FastAPI 项目"、"FastAPI 快速开始"、"fastapi init"、"搭建 FastAPI 服务"、"Python Web 骨架"、"FastAPI 开箱即用"、"FastAPI 零基础"、"FastAPI 小白"、"帮我搭一个 FastAPI"、"新建 FastAPI"、"create fastapi project"、"fastapi starter"。
---

# FastAPI Init Skill

面向**完全不懂编程的小白**，一键生成标准化、开箱即用的 FastAPI Web 服务骨架。

## 与 python-backend-skill 的区别

| 维度 | python-backend-skill | 本 skill |
|------|---------------------|----------|
| 目标用户 | 后端开发者 | 零基础小白 |
| 环境安装 | 用户自己装 | **自动检测 + 自动安装** |
| 启动方式 | pip install 后手动 uvicorn | **一条命令：`./restart.sh [dev|prod]`** |
| SSE 支持 | 无 | **内置 SSE 流式框架** |
| 文件上传 | 无 | **内置文件上传接口** |
| 默认数据库 | PostgreSQL | **MySQL**（可选 PG / MongoDB / 无数据库） |
| 脚本 | 无 | **只生成 `restart.sh` / `restart.bat`（dev/prod 双模式）** |
| Swagger | 有 | 有 + **增强注释 + 中文说明** |
| 交互次数 | 多个技术问题 | **最多 3 个问题** |
| 文件数 | ~40 | **~22** |

**不重复造轮子**：统一响应信封、错误码、JWT 规范与 `backend-convention-skill` 对齐，但模板已内置于本 skill（`references/api-contract-template.md`、`references/project-guide-template.md`），生成项目不依赖 `backend-convention-skill` 文件；关系型 DB 配置引用 `database-skill`；前端联动规范引用 `frontend-request-skill`。本 skill 在它们之上增加「小白友好」的完整封装。

## 依赖

- **backend-convention-skill**：响应信封 `{ code, message, data }`、错误码（-1001 校验 / -2000 系统）、JWT Bearer、api-contract、project-guide 规范对齐（模板已内置本 skill）
- **database-skill**：MySQL / PostgreSQL / MongoDB 选型规则、表前缀 `wg`、连接参数
- **frontend-request-skill**：前端请求层规范，确保后端生成的接口契约可直接被前端消费

## 核心能力清单（11 项）

| # | 能力 | 说明 |
|---|------|------|
| 1 | **环境探测** | 自动检测 Python 版本（>=3.9）、pip、操作系统类型 |
| 2 | **自动安装** | 创建 venv、安装依赖、编译检查 |
| 3 | **一键启动/重启** | `./restart.sh [dev|prod]`：环境搭建、拉代码、装依赖、安全停旧进程、启动、输出日志命令 |
| 4 | **开发模式** | `./restart.sh dev` 热重载，改代码自动重启，日志 `logs/dev.log` |
| 5 | **生产模式** | `./restart.sh prod` 后台多 worker，日志 `logs/app.log` |
| 6 | **SSE 流式** | 内置 `sse-starlette`，示例端点 `/api/sse/chat` |
| 7 | **文件上传** | 内置 `/api/upload` 单文件与 `/api/uploads` 多文件上传 |
| 8 | **统一响应** | `EnvelopeRoute` 自动包装 `{ code, message, data }` |
| 9 | **全局异常** | BusinessException / -1001 校验 / -2000 兜底 |
| 10 | **JWT 鉴权** | 注册 / 登录 / 刷新令牌 / 当前用户注入 |
| 11 | **安全头** | 内置 X-Frame-Options / X-Content-Type-Options 等基础安全头 |

## 生成流程

### 第一步：询问用户（只问 3 个问题）

```
1. 项目名叫什么？（默认 my-fastapi-app）
2. 用哪个数据库？
   A. MySQL（默认，推荐）
   B. PostgreSQL
   C. MongoDB
   D. 暂时不用数据库
3. 是否需要 Redis？（默认不需要）
```

**不做**：不问技术细节、不问版本号、不问目录结构——全部自动选最佳实践。

### 第二步：环境探测

按 `references/env-setup.md` 流程执行：

1. 检测 Python 是否安装 / 版本（需 >= 3.9）
2. 检测 pip 是否可用
3. 检测操作系统（Linux / macOS / Windows）
4. 若未安装：给出明确的中文提示 + 下载链接
5. 若已安装但版本过低：给出升级指引

### 第三步：生成项目骨架

按 `references/skeleton.md` 的目录结构与代码模板，现场生成全部文件。维护者可用本 skill 根目录的 `scripts/generate_project.py` 作为 canonical 生成器参考，确保所有文件一次生成、编码正确（`.bat` 为 UTF-8 with BOM + CRLF）。

生成顺序：
1. 创建目录结构
2. 写入依赖与配置（`requirements.txt`、`.env.example`、`.env`、`.gitignore`）
3. 写入核心模块（main.py、config.py、database.py、response.py、exceptions.py、dependencies.py）
4. 写入业务模块（models → schemas → services → routers）
5. 写入启动脚本（`restart.sh` / `restart.bat`，dev/prod 双模式）
6. 写入 Docker 配置（Dockerfile + docker-compose.yml / docker-compose.pg.yml / docker-compose.mongo.yml，按需启用）
7. 写入强制交付物（api-contract.md + docs/project-guide.md）
8. 写入项目说明（README.md）

### 第四步：自动安装与启动

生成完成后：
1. 创建 Python 虚拟环境（`python -m venv venv`）
2. 从 `.env.example` 复制生成 `.env`（如不存在）
3. 安装依赖（`pip install -r requirements.txt`）
4. 编译检查（`python -m compileall app`）
5. 检测数据库是否可用，有 Docker 则自动启动数据库容器
6. 提示用户运行 `./restart.sh [dev|prod]` 或 `restart.bat [dev|prod]` 一键启动

### 第五步：交付清单

向用户汇报完整交付物：

```
✅ 项目 {{project}} 生成完毕！

📁 生成的文件（约 18 个）：
  - 核心模块：app/main.py, config.py, database.py, response.py, exceptions.py, dependencies.py
  - API 路由：health / auth / users / sse / upload
  - 启动脚本：restart.sh, restart.bat（dev/prod 双模式）
  - 数据库：MySQL（已配置 docker-compose.yml，可选 PG / MongoDB / 无数据库）
  - 文档：api-contract.md, docs/project-guide.md

🚀 启动方式：
  开发模式：  ./restart.sh dev        （热重载，日志 logs/dev.log）
  生产模式：  ./restart.sh prod       （后台多 worker，日志 logs/app.log）
  默认：      ./restart.sh            （同 dev）

📖 接口文档：
  Swagger UI：  http://localhost:8080/docs
  ReDoc：       http://localhost:8080/redoc

🔌 SSE 示例：
  curl http://localhost:8080/api/sse/chat

📎 上传示例：
  curl -F "file=@test.png" http://localhost:8080/api/upload

🔑 默认账号：
  注册接口：POST /api/auth/register
  登录接口：POST /api/auth/login

⚠️ 安全提醒：
  请编辑 .env 文件修改 JWT_SECRET（搜索 change-me）
  生产环境务必使用随机密钥！
```

## 生成项目的目录结构

参见 `references/skeleton.md` 的「目录结构」小节。核心约定：

- 路由前缀：`/api`
- 认证路由：`/api/auth/*`
- SSE 路由：`/api/sse/*`
- 上传路由：`/api/upload`、`/api/uploads`
- 表前缀：`wg`（可在 .env 中修改）
- 应用端口：`8080`
- Swagger：`/docs`、`/redoc`
- 健康检查：`GET /api/health`

## 引用索引

| 文件 | 内容 |
|------|------|
| `scripts/generate_project.py` | canonical 项目生成器：从 `skeleton.md` / `startup-scripts.md` 提取模板并生成完整项目，保证 `.bat` 编码与文件完整性 |
| `references/skeleton.md` | 精简目录结构 + 核心文件代码模板（main/config/database/routers/models/schemas/utils/upload） |
| `references/env-setup.md` | 环境探测流程、自动安装逻辑、常见问题排错 |
| `references/sse-guide.md` | SSE 流式框架集成方案、示例端点、客户端对接 |
| `references/db-guide.md` | 数据库选型、MySQL/PG/Mongo 连接配置、Docker 启动命令 |
| `references/db-schema-guide.md` | 数据库表设计规范（表名、字段、索引、软删除等） |
| `references/middleware-guide.md` | 中间件链（安全头→日志→CORS→鉴权→校验→响应→异常） |
| `references/startup-scripts.md` | `restart.sh` / `restart.bat` 脚本模板（dev/prod 双模式，一条命令完成拉代码、装依赖、安全重启、日志输出） |
| `references/api-contract-template.md` | 生成项目根目录 `api-contract.md` 的模板，含 health/auth/users/sse/upload 全量接口 |
| `references/project-guide-template.md` | 生成项目 `docs/project-guide.md` 的模板，含栈说明、启动方式、拓展指南 |
| `references/frontend-integration.md` | 与 `frontend-request-skill` 的联动：响应信封、错误码、Token、SSE、上传对接 |

## 强制交付物

生成项目时必须同时落地两份文档，模板已内置本 skill：

| 文档 | 位置 | 说明 |
|------|------|------|
| 项目指南 | `docs/project-guide.md` | 按本 skill `references/project-guide-template.md` 生成，栈特定段填入本 skill 内容 |
| 接口契约 | `api-contract.md` | 以本 skill `references/api-contract-template.md` 为起点，含 health/auth/users/sse/upload 全量接口 |

## 红线（不可绕过）

1. **不做 python-backend-skill 已做的事**：不重复生成同样的骨架代码，本 skill 生成的是更完整、更小白友好的版本。
2. **不硬编码版本号**：Python / FastAPI / 依赖版本一律现场查询官方源最新稳定版。
3. **不跳过环境探测**：生成前必须先检查用户环境，无法安装则给出明确提示。
4. **不强制安装系统级数据库**：若本机有 Docker，生成逻辑可自动拉起开发数据库容器（可选）；否则提供 `references/db-guide.md` 中的 Docker 命令，由用户自行启动。
5. **不替用户提交 git**。
6. **默认值必须安全**：`.env.example` 对 `JWT_SECRET` / `CORS` / `APP_DEBUG` 有醒目警告，安全头中间件强制开启。
7. **所有注释、文档用中文**：目标用户是中文小白，不要英文注释。
8. **接口契约必须和 frontend-request-skill 对齐**：响应信封、错误码、字段命名前后端一致。
9. **`.env` 与 `.gitignore` 必须随脚手架一起生成，且 `.env` 中的配置必须被服务加载**：`app/config.py` 通过 Pydantic Settings 读取 `.env` 全部配置，禁止在代码中硬编码端口、数据库密码、JWT 密钥等运行时可变参数。

## 触发关键词清单

```
FastAPI 脚手架、FastAPI 一键生成、初始化 FastAPI 项目、FastAPI 快速开始、
fastapi init、搭建 FastAPI 服务、Python Web 骨架、FastAPI 开箱即用、
FastAPI 零基础、FastAPI 小白、帮我搭一个 FastAPI、新建 FastAPI、
create fastapi project、fastapi starter
```

## 不做

- 不生成与 python-backend-skill 完全相同的骨架（本 skill 额外包含 SSE、上传、一键脚本、环境探测）
- 不询问技术细节（ORM 选择、目录结构等——全部自动选最佳实践）
- 不安装系统级依赖（如 MySQL Server），只提供 Docker 启动命令
- 不在 SKILL.md 锁定版本号
- 不替用户提交 git
- 不加未请求的中间件（如 Redis、Celery——除非用户明确说要）
