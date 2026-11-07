# 数据库配置指南

## MySQL 启动

```bash
docker run -d --name mysql-dev \
  -e MYSQL_ROOT_PASSWORD=wg123456 \
  -e MYSQL_DATABASE=wg_db \
  -p 3306:3306 \
  -v mysql_data:/var/lib/mysql \
  mysql:8.0
```

## PostgreSQL 启动

```bash
docker run -d --name pg-dev \
  -e POSTGRES_PASSWORD=wg123456 \
  -e POSTGRES_DB=wg_db \
  -p 5432:5432 \
  -v pg_data:/var/lib/postgresql/data \
  postgres:15-alpine
```

## 环境变量

```bash
# MySQL
DB_DRIVER=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=wg123456
DB_NAME=wg_db

# PostgreSQL
DB_DRIVER=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=wg123456
DB_NAME=wg_db
```
