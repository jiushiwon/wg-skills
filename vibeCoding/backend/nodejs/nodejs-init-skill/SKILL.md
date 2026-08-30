---
name: nodejs-init-skill
description: Node.js + Express 项目一键初始化技能。面向零基础小白，提供环境探测、自动安装、完整 Web 骨架生成、JWT 鉴权、统一响应封装、文件上传接口、一键启动/重启脚本、Swagger 文档，内置 MongoDB（默认）/ MySQL / PostgreSQL 数据库选择。用户只需说"帮我搭一个 Node.js 项目"即可一条命令完成从零到跑的完整链路。触发词："Node.js 脚手架"、"Node.js 一键生成"、"初始化 Node.js 项目"、"Node.js 快速开始"、"nodejs init"、"搭建 Express 服务"、"Express Web 骨架"、"Express 开箱即用"、"Node.js 零基础"、"Node.js 小白"、"帮我搭一个 Node.js"、"新建 Node.js"、"create express project"、"express starter"。
---

# Node.js Init Skill

面向**完全不懂编程的小白**，一键生成标准化、开箱即用的 Node.js + Express Web 服务骨架。

## 与其他后端初始化技能的区别

| 维度 | springboot-init-skill | fastapi-init-skill | 本 skill |
|------|---------------------|-------------------|----------|
| 目标用户 | 零基础小白 | 零基础小白 | 零基础小白 |
| 语言 | Java | Python | JavaScript/TypeScript |
| 框架 | Spring Boot | FastAPI | Express.js |
| 环境安装 | 自动检测+JDK | 自动检测+Python | **自动检测+Node.js** |
| 启动方式 | ./restart.sh | ./restart.sh | **npm start / npm run dev** |
| 默认数据库 | MySQL | MySQL | **MongoDB**（可选 MySQL/PG） |
| ORM | JPA | SQLAlchemy | **Mongoose / Sequelize** |
| 鉴权 | Spring Security + JWT | FastAPI JWT | **passport.js + JWT** |
| 交互次数 | 3个问题 | 3个问题 | **3个问题** |

**不重复造轮子**：统一响应信封、错误码、JWT 规范与 `backend-convention-skill` 对齐，但模板已内置于本 skill（`references/api-contract-template.md`、`references/project-guide-template.md`），生成项目不依赖 `backend-convention-skill` 文件；数据库配置引用 `database-skill`；前端联动规范引用 `frontend-request-skill`。本 skill 在它们之上增加「小白友好」的完整封装。

## 依赖

- **backend-convention-skill**：响应信封 `{ code, message, data }`、错误码（-1001 校验 / -2000 系统）、JWT Bearer、api-contract、project-guide 规范对齐（模板已内置本 skill）
- **database-skill**：MongoDB / MySQL / PostgreSQL 选型规则、连接参数
- **frontend-request-skill**：前端请求层规范，确保后端生成的接口契约可直接被前端消费

## 核心能力清单（11 项）

| # | 能力 | 说明 |
|---|------|------|
| 1 | **环境探测** | 自动检测 Node.js 版本（>=18）、npm、操作系统类型 |
| 2 | **自动安装** | 初始化 npm、安装依赖、检查兼容性 |
| 3 | **一键启动/重启** | `npm start`（生产）或 `npm run dev`（开发）：自动安装依赖、启动服务 |
| 4 | **开发模式** | `npm run dev` 使用 nodemon 热重载，日志输出到控制台 |
| 5 | **生产模式** | `npm start` 使用 pm2 后台运行，日志 `logs/app.log` |
| 6 | **JWT 鉴权** | jsonwebtoken：注册 / 登录 / 刷新令牌 / 当前用户注入 |
| 7 | **文件上传** | 内置 `multer`，示例端点 `/api/upload` 单文件与 `/api/uploads` 多文件 |
| 8 | **统一响应** | 中间件自动包装 `{ code, message, data }` |
| 9 | **全局异常** | 错误中间件统一处理 BusinessError / 校验错误 / 兜底错误 |
| 10 | **CORS 配置** | 内置 cors 中间件，可配置允许的域名 |
| 11 | **安全头** | 内置 helmet 中间件（X-Frame-Options / X-Content-Type-Options 等） |

## 生成流程

### 第一步：询问用户（只问 3 个问题）

```
1. 项目名叫什么？（默认 my-express-app）
2. 用哪个数据库？
   A. MongoDB（默认，推荐）
   B. MySQL
   C. PostgreSQL
   D. 暂时不用数据库
3. 使用 TypeScript 还是 JavaScript？（默认 JavaScript）
```

**不做**：不问技术细节、不问版本号、不问目录结构——全部自动选最佳实践。

### 第二步：环境探测

按 `references/env-setup.md` 流程执行：

1. 检测 Node.js 是否安装 / 版本（需 >= 18 LTS）
2. 检测 npm 是否可用
3. 检测操作系统（Linux / macOS / Windows）
4. 若未安装：给出明确的中文提示 + 下载链接
5. 若已安装但版本过低：给出升级指引

### 第三步：生成项目骨架

按 `references/skeleton.md` 的目录结构与代码模板，现场生成全部文件。

生成顺序：
1. 创建目录结构
2. 写入依赖与配置（`package.json`、`.env.example`、`.env`、`.gitignore`）
3. 写入核心模块（`app.js` / `app.ts`、`config.js` / `config.ts`、`database.js` / `database.ts`、`middleware/response.js`、`middleware/error.js`、`middleware/auth.js`）
4. 写入业务模块（models → controllers → routes）
5. 写入启动脚本（`package.json` scripts）
6. 写入 Docker 配置（`Dockerfile` + `docker-compose.yml`，按需启用）
7. 写入强制交付物（`api-contract.md` + `docs/project-guide.md`）
8. 写入项目说明（`README.md`）

### 第四步：自动安装与启动

生成完成后：
1. 运行 `npm install`
2. 从 `.env.example` 复制生成 `.env`（如不存在）
3. 编译检查（如用 TypeScript：`npm run build`）
4. 检测数据库是否可用，有 Docker 则自动启动数据库容器
5. 提示用户运行 `npm run dev` 或 `npm start` 启动

### 第五步：交付清单

向用户汇报完整交付物：

```
✅ 项目 {{project}} 生成完毕！

📁 生成的文件（约 20 个）：
  - 核心模块：app.js, config.js, database.js, middlewares/*
  - API 路由：health / auth / users / upload
  - 启动脚本：package.json scripts（dev/prod 双模式）
  - 数据库：MongoDB（已配置 docker-compose.yml，可选 MySQL/PG）
  - 文档：api-contract.md, docs/project-guide.md

🚀 启动方式：
  开发模式：  npm run dev        （热重载，日志输出到控制台）
  生产模式：  npm start          （pm2 后台运行，日志 logs/app.log）

📖 接口文档：
  Swagger UI：  http://localhost:3000/api-docs

📎 上传示例：
  curl -F "file=@test.png" http://localhost:3000/api/upload

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
- 上传路由：`/api/upload`、`/api/uploads`
- 应用端口：`3000`
- Swagger：`/api-docs`（使用 swagger-ui-express）
- 健康检查：`GET /api/health`

## 引用索引

| 文件 | 内容 |
|------|------|
| `references/skeleton.md` | 精简目录结构 + 核心文件代码模板（app/config/database/middlewares/controllers/routes） |
| `references/env-setup.md` | 环境探测流程、自动安装逻辑、常见问题排错 |
| `references/db-guide.md` | 数据库选型、MongoDB/MySQL/PG 连接配置、Docker 启动命令 |
| `references/auth-guide.md` | JWT 鉴权方案、passport.js 集成、token 刷新 |
| `references/upload-guide.md` | 文件上传 multer 配置、存储策略、大小限制 |
| `references/middleware-guide.md` | 中间件链（helmet→cors→body-parser→auth→router→error） |
| `references/startup-scripts.md` | package.json scripts 模板（dev/prod 双模式） |
| `references/api-contract-template.md` | 生成项目根目录 `api-contract.md` 的模板 |
| `references/project-guide-template.md` | 生成项目 `docs/project-guide.md` 的模板 |

## 强制交付物

生成项目时必须同时落地两份文档，模板已内置本 skill：

| 文档 | 位置 | 说明 |
|------|------|------|
| 项目指南 | `docs/project-guide.md` | 按本 skill `references/project-guide-template.md` 生成 |
| 接口契约 | `api-contract.md` | 以本 skill `references/api-contract-template.md` 为起点 |

## 红线（不可绕过）

1. **不做其他后端初始化技能已做的事**：本 skill 生成的是 Node.js + Express 版本的完整骨架。
2. **不硬编码版本号**：Node.js / npm / 依赖版本一律使用 LTS 或 latest。
3. **不跳过环境探测**：生成前必须先检查用户环境，无法安装则给出明确提示。
4. **不强制安装系统级数据库**：若本机有 Docker，生成逻辑可自动拉起开发数据库容器（可选）。
5. **不替用户提交 git**。
6. **默认值必须安全**：`.env.example` 对 `JWT_SECRET` / `CORS` / `NODE_ENV` 有醒目警告，安全头中间件强制开启。
7. **所有注释、文档用中文**：目标用户是中文小白，不要英文注释。
8. **接口契约必须和 frontend-request-skill 对齐**：响应信封、错误码、字段命名前后端一致。
9. **`.env` 与 `.gitignore` 必须随脚手架一起生成，且 `.env` 中的配置必须被服务加载**

## 触发关键词清单

```
Node.js 脚手架、Node.js 一键生成、初始化 Node.js 项目、Node.js 快速开始、
nodejs init、搭建 Express 服务、Express Web 骨架、Express 开箱即用、
Node.js 零基础、Node.js 小白、帮我搭一个 Node.js、新建 Node.js、
create express project、express starter、nodejs express 初始化
```

## 不做

- 不生成与其他后端初始化技能完全相同的骨架（本 skill 是 Node.js + Express 版本）
- 不询问技术细节（ORM 选择、目录结构等——全部自动选最佳实践）
- 不安装系统级依赖（如 MongoDB Server），只提供 Docker 启动命令
- 不锁定版本号
- 不替用户提交 git
- 不加未请求的中间件（如 Redis、Socket.io——除非用户明确说要）
