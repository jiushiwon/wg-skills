# database-skill

为后端生成流程提供**数据库选型、表前缀、初始 schema、基础表设计、迁移规范**。被 select 与 4 个后端 skill 引用，也可单独触发。

## 适合场景

- "PostgreSQL 还是 MySQL？"
- "MongoDB 还是关系型？"
- "数据库迁移怎么做？"
- "我要做博客/电商/SaaS，基础表怎么设计？"

## 触发关键词

`数据库选型`、`PostgreSQL 还是 MySQL`、`数据库迁移`、`schema 设计`、`表前缀`、`MongoDB 还是关系型`、`基础表设计`

## 选型速览

| 数据特征 | 推荐 | 备注 |
|----------|------|------|
| 强关系、事务 | PostgreSQL | 默认首选 |
| 团队熟 MySQL | MySQL 8 | 兼容现有团队 |
| 文档、灵活模式 | MongoDB | 仅 Node / Python 栈自动生成；Java / Go / NestJS 不生成 |
| 时序 / 日志 | TimescaleDB / InfluxDB | 仅用户明确要求时推荐 |

## 表前缀

默认 `wg`（如 `wg_user`），snake_case；用户可覆盖。

## 基础表设计

标准基础表按项目类型给出（通用 / 博客 / 电商 / SaaS / IoT / 社交）——表清单 + 通用字段约定（主键、时间、软删除、密码 hash）见 `references/base-schemas.md`；具体 DDL 由后端 skill 按确认后的实体清单现场生成。

## 迁移规范

| 栈 | 工具 | 关键配置 |
|----|------|----------|
| Java | Flyway / Liquibase | `ddl-auto: validate` |
| Python | Alembic | 已含在依赖 |
| Node | TypeORM CLI | 生产关 `synchronize` |
| Go | golang-migrate / goose | 开发可 AutoMigrate |

详见 `references/migration-guide.md`。

## 调用样例

```
你：我要做电商后端，基础表怎么设计？

AI（database-skill → references/base-schemas.md）：
  电商标准基础表清单：users、addresses、categories、products、carts、
  orders、order_items、payments。
  通用约定：id 主键、created_at/updated_at（UTC）、deleted_at 软删除、
  password_hash（bcrypt）；表前缀默认 wg_。
  推荐 PostgreSQL（订单/库存强事务）。确认实体后我按你的清单
  现场生成 DDL（关系型）或集合设计（MongoDB，仅 Node/Python 栈）。
```

## 与其他 skill 的关系

被 `backend-select-skill` 与 4 个后端 skill 引用。

## 交付物落点

本 skill 不单独产出文件，决策结果落到两处：
1. **spec.md**：DB 类型、表前缀、核心实体、迁移工具选择
2. **生成项目内**：连接变量写入 `.env.example`；库名/前缀/迁移方式写入 `docs/project-guide.md`；DDL/迁移文件由后端 skill 按本 skill 规范生成

## 不做

- 不写业务接口
- 不替 Java / Go / NestJS 生成 MongoDB
- 不替你提交
