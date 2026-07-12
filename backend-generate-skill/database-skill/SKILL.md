---
name: database-skill
description: Use when a backend project needs database selection, table prefix, initial schema, or migration strategy. Covers PostgreSQL / MySQL / MongoDB selection and migration rules. Referenced by backend-select-skill and the 4 backend skills. Triggers: "数据库选型", "PostgreSQL 还是 MySQL", "数据库迁移", "schema 设计", "表前缀", "MongoDB 还是关系型", "基础表设计".
---

# Database Skill

为后端生成流程提供数据库选型、表前缀、初始 schema 与迁移规范。被 select 与 4 个后端 skill 引用。

## 选型

| 数据特征 | 推荐 | 备注 |
|----------|------|------|
| 强关系、事务 | PostgreSQL | 默认首选 |
| 团队熟 MySQL | MySQL 8 | 兼容现有团队 |
| 文档、灵活模式 | MongoDB | 仅 Node / Python 栈自动生成；Java / Go / NestJS 不生成 MongoDB |
| 时序 / 日志 | TimescaleDB / InfluxDB | 仅用户明确要求时推荐 |

## 表前缀

默认 `wg`（如 `wg_user`），snake_case；写入 `spec.md`，落到 entity / migration 名。用户可覆盖。

## 初始 schema

按核心实体给最小建表/建集合：主键、created_at / updated_at、deleted_at（软删除）、必要唯一索引。关系型用 snake_case 字段，MongoDB 用 camelCase。

## 交付物落点

本 skill 不生成独立文件，决策结果必须落到两处：
1. **spec.md**（选型期）：DB 类型、表前缀、核心实体清单、是否需要迁移工具。
2. **生成项目内**（生成期）：连接变量按 backend-convention-skill `env-config-guide.md` 写入 `.env.example`；库名/前缀/迁移方式写入 `docs/project-guide.md` 的数据库与拓展段；DDL/迁移文件由后端 skill 按本 skill 规范现场生成。

## 迁移规范

生产必须显式迁移，迁移文件入库且可回滚。各栈工具：

| 栈 | 工具 | 关键配置 |
|----|------|----------|
| Java | Flyway / Liquibase | `ddl-auto: validate` |
| Python | Alembic | 已含在依赖 |
| Node | TypeORM CLI | 生产关 `synchronize` |
| Go | golang-migrate / goose | 开发可 AutoMigrate |

详见 `references/migration-guide.md`。

## 连接覆盖（稳定事实，不腐烂）

| 项 | PostgreSQL | MySQL | MongoDB |
|----|-----------|-------|---------|
| 端口 | 5432 | 3306 | 27017 |
| DB_USER | postgres | app（官方镜像禁 root 作 MYSQL_USER） | - |
| DB_TYPE | postgres / postgresql | mysql（Python 用 `mysql+pymysql`） | - |
| 镜像 | `postgres:<ver>-alpine` | `mysql:<ver>` | `mongo:<ver>` |
| DB_URL | built from host/port/name | `jdbc:mysql://host:3306/<db>` | `mongodb://host:27017/<db>` |

生成 MySQL 项目时用 `docker-compose.mysql.yml` 改名为 `docker-compose.yml`。

## 版本获取

镜像版本查官方源：Docker Hub 官方标签页或 `https://endoflife.date/api/{postgresql,mysql,mongodb}.json`。**不写死版本号**；实际值写入生成项目的 `versions.md`。

## 不做

- 不在本 skill 写业务接口。
- 不替 Java / Go / NestJS 生成 MongoDB。
- 不替用户提交。
