# 数据库表设计规范

## 表命名规范

- 所有表名使用 `wg_` 前缀
- 使用下划线命名法（snake_case）
- 表名使用英文单数形式

## 用户表 (wg_user)

```sql
CREATE TABLE `wg_user` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL COMMENT '用户名（登录账号）',
  `password` VARCHAR(255) NOT NULL COMMENT '密码（加密存储）',
  `nickname` VARCHAR(100) NULL COMMENT '昵称',
  `email` VARCHAR(100) NULL COMMENT '邮箱',
  `phone` VARCHAR(20) NULL COMMENT '手机号',
  `avatar` VARCHAR(255) NULL COMMENT '头像URL',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1正常 0禁用',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  `deleted_at` DATETIME(3) NULL COMMENT '删除时间（软删除）',

  UNIQUE KEY `uk_username` (`username`),
  INDEX `idx_email` (`email`),
  INDEX `idx_phone` (`phone`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';
```

## 字段类型选择

| 字段类型 | MySQL 类型 | Go 类型 | 说明 |
|----------|------------|---------|------|
| 主键 | BIGINT UNSIGNED | uint | 自增主键 |
| 状态 | TINYINT | int8 | 0/1 状态 |
| 布尔 | TINYINT | bool | 0/1 布尔 |
| 计数 | INT | int32 | 普通计数 |
| 数量 | BIGINT | int64 | 大数量 |
| 金额 | DECIMAL(10,2) | float64 | 货币 |
| 时间 | DATETIME(3) | time.Time | 精确到毫秒 |
| 时间戳 | BIGINT | int64 | Unix 时间戳 |

## 软删除

使用 GORM 的 `DeletedAt` 字段实现软删除：

```go
type User struct {
    // ... other fields
    DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at"`
}
```

GORM 会自动：
- 查询时添加 `WHERE deleted_at IS NULL`
- 删除时改为 `UPDATE SET deleted_at = NOW()`
- 支持 `Unscoped()` 查询已删除记录

## 索引规范

### 必建索引

| 字段 | 索引类型 | 说明 |
|------|----------|------|
| 主键 | PRIMARY | 自增主键 |
| username | UNIQUE | 登录账号唯一 |
| email | INDEX | 邮箱查找 |
| phone | INDEX | 手机号查找 |
| status | INDEX | 状态筛选 |
| created_at | INDEX | 时间排序 |

### 复合索引

```sql
-- 状态 + 创建时间（用于分页查询）
INDEX `idx_status_created` (`status`, `created_at` DESC)

-- 用户ID + 状态（用于统计）
INDEX `idx_user_status` (`user_id`, `status`)
```

## 公共字段

所有表包含以下公共字段：

```go
type BaseModel struct {
    ID        uint           `gorm:"primarykey" json:"id"`
    CreatedAt time.Time      `json:"created_at"`
    UpdatedAt time.Time      `json:"updated_at"`
    DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at"`
}
```

## 迁移策略

### 开发环境

使用 GORM AutoMigrate：

```go
func main() {
    db, _ := database.Init(config.Load())
    db.AutoMigrate(
        &models.User{},
        // 添加新模型
    )
}
```

### 生产环境

使用独立的迁移工具（如 golang-migrate）：

```bash
# 创建迁移
migrate create -ext sql -dir migrations create_users_table

# 执行迁移
migrate -path migrations -database "$DATABASE_URL" up
```

## 设计原则

1. **主键使用 BIGINT UNSIGNED**：避免自增溢出
2. **所有表加软删除**：支持数据恢复
3. **所有表加时间戳**：便于审计和排序
4. **使用有意义的注释**：便于维护
5. **避免 SELECT ***：明确指定字段
