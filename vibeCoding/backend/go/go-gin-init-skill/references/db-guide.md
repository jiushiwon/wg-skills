# 数据库选型与配置指南

## 支持的数据库

| 数据库 | 驱动 | 默认端口 | 推荐场景 |
|--------|------|----------|----------|
| MySQL 8.0 | gorm.io/driver/mysql | 3306 | Web 应用（默认） |
| PostgreSQL 15+ | gorm.io/driver/postgres | 54315 | 复杂查询、数据仓库 |

## MySQL 配置

### 连接参数

```go
// internal/database/database.go
dsn := "root:password@tcp(localhost:3306)/wg_db?charset=utf8mb4&parseTime=True&loc=Local"
```

### Docker 启动 MySQL

```bash
# 方式一：使用 docker-compose（推荐）
docker-compose -f docker-compose.yml up -d

# 方式二：手动启动
docker run -d \
  --name mysql-dev \
  -e MYSQL_ROOT_PASSWORD=wg123456 \
  -e MYSQL_DATABASE=wg_db \
  -p 3306:3306 \
  -v mysql_data:/var/lib/mysql \
  mysql:8.0
```

### MySQL 8.0 特性

- 支持 Window Functions
- 支持 CTE (Common Table Expressions)
- JSON 函数增强
- 支持 Atomic DDL

## PostgreSQL 配置

### 连接参数

```go
// internal/database/database.go
dsn := "host=localhost user=postgres password=wg123456 dbname=wg_db port=5432 sslmode=disable"
```

### Docker 启动 PostgreSQL

```bash
# 方式一：使用 docker-compose
docker-compose -f docker-compose.pg.yml up -d

# 方式二：手动启动
docker run -d \
  --name postgres-dev \
  -e POSTGRES_PASSWORD=wg123456 \
  -e POSTGRES_DB=wg_db \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:15-alpine
```

### PostgreSQL 特性

- 更强大的 JSON 支持 (JSONB)
- 数组类型
- 范围类型
- 全文搜索
- Window Functions
- CTE 递归查询

## 数据库选择建议

### 选 MySQL 的场景

- 典型的 Web 应用
- 团队对 MySQL 更熟悉
- 需要广泛社区支持
- 对事务要求较高

### 选 PostgreSQL 的场景

- 复杂查询、数据分析
- 需要 JSON/JSONB 强支持
- 需要数组、范围类型
- 需要全文搜索
- 需要地理信息系统功能

## 表前缀规范

所有表名使用 `wg_` 前缀：

| 表名 | 说明 |
|------|------|
| wg_user | 用户表 |
| wg_user_token | 用户 Token 表 |

## 软删除

使用 GORM 的 `DeletedAt` 字段实现软删除：

```go
type User struct {
    // ... other fields
    DeletedAt gorm.DeletedAt `gorm:"index"`
}
```

查询时会自动过滤已删除记录：
```go
// 自动添加 WHERE deleted_at IS NULL
db.Find(&users)
```

如需查询已删除记录：
```go
db.Unscoped().Find(&users)
```

## 索引规范

### 主键索引

- 使用 `BIGINT UNSIGNED` 自增主键
- 表前缀 + `_id`：`wg_user.id`

### 业务索引

| 字段 | 索引类型 | 说明 |
|------|----------|------|
| username | UNIQUE INDEX | 登录账号唯一 |
| email | INDEX | 邮箱查找 |
| phone | INDEX | 手机号查找 |
| status | INDEX | 状态筛选 |
| created_at | INDEX | 时间排序 |

## 连接池配置

```go
// internal/database/database.go
sqlDB, err := db.DB()
if err != nil {
    return nil, err
}

// 最大空闲连接数
sqlDB.SetMaxIdleConns(10)

// 最大打开连接数
sqlDB.SetMaxOpenConns(100)

// 连接最大生命周期
sqlDB.SetConnMaxLifetime(time.Hour)
```

## 迁移工具

项目使用 GORM AutoMigrate：

```go
// 在 main.go 或专门的迁移文件中
db.AutoMigrate(&models.User{})
```

生产环境建议使用独立的迁移工具（如 golang-migrate）。

## 常见问题

### Q: 连接报错 "Access denied"

A: 检查用户名、密码、数据库名是否正确。

### Q: 连接报错 "Too many connections"

A: 调整连接池配置，或降低并发请求。

### Q: 中文乱码

A: 确保连接字符串包含 `charset=utf8mb4`。

### Q: 时区错误

A: 连接参数添加 `loc=Local` 或 `serverTimezone=Asia/Shanghai`。
