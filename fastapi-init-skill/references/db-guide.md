# 数据库配置指南

`fastapi-init-skill` 默认使用 **MySQL 8.0**，同时支持 **PostgreSQL**、**MongoDB** 以及 **暂不启用数据库**。

## 数据库选型建议

| 数据库 | 适用场景 | 默认端口 | 驱动 |
|--------|----------|----------|------|
| **MySQL**（默认） | 中文资料丰富、云服务支持广泛、团队熟悉 | 3306 | `aiomysql` |
| **PostgreSQL** | 需要复杂查询、JSON 字段、地理信息 | 5432 | `asyncpg` |
| **MongoDB** | 数据结构多变、快速原型、文档型存储 | 27017 | `motor` |
| **none** | 纯 API 演示、无持久化需求、先跑通接口 | - | - |

## .env 配置项

```env
# 数据库类型：mysql / postgresql / mongodb / none
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=app_db
DB_USER=root
DB_PASSWORD=root
DB_PREFIX=wg
```

### 直接使用完整连接串（覆盖分项）

```env
# MySQL
DB_URL=mysql+aiomysql://root:root@localhost:3306/app_db?charset=utf8mb4

# PostgreSQL
DB_URL=postgresql+asyncpg://root:root@localhost:5432/app_db

# MongoDB
DB_URL=mongodb://root:root@localhost:27017/app_db
```

## Docker 快速启动数据库

### MySQL 8.0

```bash
docker run -d -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=app_db \
  --name my-mysql \
  mysql:8.0
```

### PostgreSQL 15

```bash
docker run -d -p 5432:5432 \
  -e POSTGRES_PASSWORD=root \
  -e POSTGRES_DB=app_db \
  --name my-postgres \
  postgres:15
```

### MongoDB 6

```bash
docker run -d -p 27017:27017 \
  -e MONGO_INITDB_DATABASE=app_db \
  --name my-mongo \
  mongo:6
```

首次启动后数据库即就绪（MySQL/PostgreSQL 应用启动时 `lifespan` 自动建表；MongoDB 无需预建表）。

> ⚠️ **生产环境警告**：`lifespan` 中的 `create_all()` 仅适用于开发阶段。生产环境请使用 Alembic 迁移，并禁用自动建表。

## 依赖清单

```txt
# MySQL
sqlalchemy[asyncio]
pymysql
aiomysql
cryptography

# PostgreSQL
asyncpg

# MongoDB
motor
```

`requirements.txt` 默认包含全部驱动，方便切换数据库时无需重新安装。

## 表名前缀

默认表前缀 `wg`，通过 `.env` 中 `DB_PREFIX` 配置。表名格式：`{prefix}_user`、`{prefix}_order` 等。

## 数据库操作示例

```python
from sqlalchemy import select
from app.database import get_db
from app.models.user import User

async def find_user(db, user_id: int):
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()

async def list_users(db, page: int, size: int):
    result = await db.execute(
        select(User).order_by(User.id.desc()).offset((page - 1) * size).limit(size)
    )
    return result.scalars().all()
```

## 小白常见问题

| 问题 | 解决 |
|------|------|
| 还没有装数据库 | 使用上方 Docker 一行命令启动 |
| 数据库连不上 | 检查 `.env` 中 `DB_TYPE`、`DB_HOST`、`DB_PORT` 是否正确 |
| MySQL 认证失败 | MySQL 8.0 默认用 caching_sha2_password，需要 `cryptography` 包 |
| 想换 PostgreSQL | 修改 `.env` 中 `DB_TYPE=postgresql`、`DB_PORT=5432`，并确保 Docker 容器运行 |
| 想先不启用数据库 | 修改 `.env` 中 `DB_TYPE=none`，此时只启用 health / sse / upload（上传无需登录） |
| 生产环境表结构变更 | 使用 Alembic：`alembic init alembic` → `alembic revision --autogenerate -m "描述"` → `alembic upgrade head` |
