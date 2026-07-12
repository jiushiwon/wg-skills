# python-backend-skill

现场生成 **Python + FastAPI** 后端项目骨架。

## 适合场景

- 快速 API、AI / 数据型项目
- 异步 IO、机器学习集成
- 团队熟悉 Python

## 触发关键词

`用 Python 写后端`、`FastAPI 项目`、`生成 FastAPI`、`python backend`、`fastapi 骨架`

## 输入

- 项目名
- 数据库（PostgreSQL 默认 / MySQL / MongoDB）
- 表前缀（默认 `wg`）
- 核心实体
- 是否需要 Redis / Kafka 等中间件（YAGNI）

## 输出

```
{{project}}/
├── app/
│   ├── main.py  config.py  database.py  response.py  exceptions.py
│   ├── routers/  models/  schemas/  services/  utils/
├── alembic/  tests/
├── pyproject.toml  requirements.txt  Dockerfile  docker-compose.yml
├── .env.example  .gitignore  README.md
├── api-contract.md  versions.md  CLAUDE.md  AGENTS.md
```

内置：统一响应 `EnvelopeRoute`（handler 返裸数据，自动加信封，`api_response` 仅异常兜底）、全局异常 `exception_handler`（含 `RequestValidationError`→-1001）、JWT（python-jose）、请求日志中间件（logging）、Pydantic 校验、分页列表、`/api/health`。

**MongoDB**：本栈与 Node 栈是唯一自动生成 MongoDB 的两个栈（用 motor 异步驱动）。

## 强制交付物（文档）

生成项目时与代码同时落地两份文档，缺一不可：

| 文档 | 位置 | 内容 |
|------|------|------|
| 介绍 & 拓展性文档 | `docs/project-guide.md` | 技术栈、启动方式、如何对接前端（uni-app / axios）、接口范式、拦截器链路（日志→CORS→鉴权依赖→Pydantic 校验→EnvelopeRoute→异常兜底）、出入参范式、鉴权范式、错误码、拓展指南（加模块/加中间件/Alembic 迁移） |
| 接口契约（接口 md） | 根目录 `api-contract.md` | 全部接口字段级定义，前后端唯一事实来源 |

模板：`backend-convention-skill/references/project-guide-template.md`（栈特定段按本 skill `references/skeleton.md` 末尾「project-guide 填充段」填）+ `default-api-contract.md`（已含 health/auth/users 全量接口，按实体追加）。

## 调用样例

```
你：用 Python 写一个 AI 推理后端，要 MongoDB

AI（python-backend-skill）：
  选型：Python + FastAPI + MongoDB（motor）。
  ① 核心实体？
  ② 是否需要 Redis？

你：实体：用户、推理任务、结果。要 Redis 做队列。

AI：正在生成项目 ai-service/：
  - pyproject.toml、requirements.txt、app/ 各层
  - 统一响应、全局异常、JWT、请求日志、Pydantic 校验、分页
  - User/InferenceTask/Result 的 model/schema/router
  - api-contract.md、versions.md
  正在 pip install -r requirements.txt && python -m compileall app && curl /api/health ...
  ✓ 编译通过
```

## 版本获取

不写死版本号。生成时按优先级：本机 `python --version` → `pypi.org/pypi/<pkg>/json` 查最新稳定 → 你覆盖 → 写入 `versions.md`。

## 验证

```bash
pip install -r requirements.txt
python -m compileall app
uvicorn app.main:app --host 0.0.0.0 --port 8080
curl http://localhost:8080/api/health
```

## 与其他 skill 的关系

- 规范引用 `backend-convention-skill`（不复制）
- 数据库/schema/迁移引用 `database-skill`

## 不做

- 不加未请求的中间件
- 不锁定版本号
- 不替你提交
