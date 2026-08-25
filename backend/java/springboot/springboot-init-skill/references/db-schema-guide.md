# 数据库表设计规范

本规范与 `database-skill` 对齐。所有通过 springboot-init-skill 生成的项目默认遵循。

## 一、表名规范

| 规则 | 示例 |
|------|------|
| 格式：`{表前缀}_{snake_case}` | `wg_user`、`wg_order_item` |
| 表前缀：默认 `wg`（`.env` 中 `DB_TABLE_PREFIX` 可改） | `order_user`、`crm_user` |
| 单词数 ≤ 4；超过 4 个用 `_` 连接 | `wg_user_social_account` |

## 二、字段命名

| 规则 | 示例 |
|------|------|
| snake_case | `user_id` / `created_at` |
| 主键统一 `id` | BIGINT 自增 / MongoDB ObjectId |
| 时间字段统一 `created_at` / `updated_at` | DATETIME NOT NULL |
| 软删除字段 `deleted_at` | DATETIME NULL，未删为 NULL |
| 状态字段 `status` | TINYINT（0=禁用，1=正常） |
| 布尔字段 `is_*` 前缀 | `is_active` / `is_verified` |
| 避免 MySQL 保留字 | order / group / user 等已脱敏处理 |

## 三、必备字段

每张业务表至少包含：

```sql
id          BIGINT       NOT NULL AUTO_INCREMENT  -- 主键
created_at  DATETIME     NOT NULL                  -- 创建时间
updated_at  DATETIME     NOT NULL                  -- 更新时间
deleted_at  DATETIME     NULL DEFAULT NULL         -- 软删除（可选）
```

MongoDB 同理：

```java
@Id private String id;
private LocalDateTime createdAt;
private LocalDateTime updatedAt;
private LocalDateTime deletedAt;  // null 表示未删
```

## 四、索引规范

| 类型 | 适用字段 | 命名 |
|------|----------|------|
| 主键索引 | `id` | PRIMARY |
| 唯一索引 | 唯一字段（username / email / phone） | `uk_{table}_{column}` |
| 普通索引 | 外键 / 频繁查询字段 | `idx_{table}_{column}` |
| 复合索引 | 多字段联合查询 | `idx_{table}_{col1}_{col2}` |

示例：

```sql
CREATE TABLE wg_user (
    id BIGINT NOT NULL AUTO_INCREMENT,
    username VARCHAR(64) NOT NULL,
    email VARCHAR(128),
    phone VARCHAR(20),
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    deleted_at DATETIME,
    PRIMARY KEY (id),
    UNIQUE KEY uk_wg_user_username (username),
    UNIQUE KEY uk_wg_user_email (email),
    INDEX idx_wg_user_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

## 五、字段类型选择

| 业务场景 | MySQL | PostgreSQL | MongoDB |
|---------|-------|---------------|---------|
| 主键 | BIGINT | BIGSERIAL | ObjectId |
| 用户名 / 短字符串 | VARCHAR(64) | VARCHAR(64) | String |
| 长文本 | TEXT | TEXT | String |
| 富文本（带格式） | LONGTEXT | TEXT | String |
| 整数计数 | INT / BIGINT | INT / BIGINT | Integer / Long |
| 金额 | DECIMAL(10,2) | NUMERIC(10,2) | BigDecimal |
| 时间 | DATETIME | TIMESTAMP | LocalDateTime |
| 布尔 | TINYINT(1) | BOOLEAN | Boolean |
| JSON | JSON | JSONB | Document |

## 六、禁止事项

- ❌ 禁止外键级联（由业务层控制事务一致性）
- ❌ 禁止无注释字段
- ❌ 禁止使用 ENUM 类型（用 TINYINT 映射 + 字典表）
- ❌ 禁止魔法数字（所有枚举必须有字典表或常量类）
- ❌ 禁止 VARCHAR(255) 默认（按实际最长业务值设定）
- ❌ 禁止删除字段（用 `deleted_at` 软删除）

## 七、Flyway 迁移

`FLYWAY_ENABLED=true` 时使用。迁移文件命名：

```
src/main/resources/db/migration/
├── V1__init_user.sql
├── V2__add_user_status.sql
├── V3__create_order.sql
└── V4__add_index_user_phone.sql
```

- `V{version}__{description}.sql`
- version 必须单调递增
- description 用 snake_case
- 一次提交只做一件事

示例 `V1__init_user.sql`（已在 skeleton 落地）：

```sql
CREATE TABLE IF NOT EXISTS {{tablePrefix}}_user (
    id BIGINT NOT NULL AUTO_INCREMENT,
    username VARCHAR(64) NOT NULL,
    password VARCHAR(100) NOT NULL,
    nickname VARCHAR(64),
    email VARCHAR(128),
    phone VARCHAR(20),
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    deleted_at DATETIME,
    PRIMARY KEY (id),
    UNIQUE KEY uk_{{tablePrefix}}_user_username (username),
    UNIQUE KEY uk_{{tablePrefix}}_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

## 八、JPA 实体映射

`@Table(name = "{{tablePrefix}}_user")`、`@Column(name = "username")` 显式声明字段映射，避免依赖 Hibernate 默认下划线推断：

```java
@Entity
@Table(name = "{{tablePrefix}}_user")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "username", nullable = false, unique = true, length = 64)
    private String username;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    // ...
}
```