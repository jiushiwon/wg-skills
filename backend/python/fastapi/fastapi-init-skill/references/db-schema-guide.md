# 数据库表设计规范

本规范适用于 `fastapi-init-skill` 生成的关系型数据库项目（MySQL / PostgreSQL）。MongoDB 项目可参照字段命名与索引原则。

## 1. 表名规范

- **格式**：`{DB_PREFIX}_{snake_case}`
- **示例**：`wg_user`、`wg_order_item`
- 全部小写，单词间用下划线连接
- 禁止复数与单数混用，统一使用单数表名（`wg_user` 而非 `wg_users`）

## 2. 字段命名规范

- 使用 `snake_case`，全小写
- 禁止 SQL 保留字（如 `order`、`group`、`key`）作为字段名
- 禁止拼音、无意义缩写
- 每个字段必须有明确业务含义

## 3. 必备字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `id` | `BIGINT` / `INTEGER` | 主键，自增 |
| `created_at` | `DATETIME` / `TIMESTAMP` | 创建时间，服务端默认当前时间 |
| `updated_at` | `DATETIME` / `TIMESTAMP` | 更新时间，变更时自动更新 |

## 4. 软删除

- 统一使用 `deleted_at` 字段，类型为可空时间戳
- 未删除时为 `NULL`
- 查询业务数据时必须带上 `deleted_at IS NULL` 过滤

## 5. 索引规范

- 主键自动建索引
- 唯一字段必须加唯一索引（如用户名、邮箱、手机号）
- 外键字段必须加普通索引
- 频繁查询、排序字段按需加索引
- 禁止在低区分度字段上单独建索引（如性别、状态）

## 6. 字段类型选择

| 业务场景 | 推荐类型 | 说明 |
|----------|----------|------|
| 用户名 / 昵称 | `VARCHAR(64)` | 长度根据业务确定 |
| 邮箱 | `VARCHAR(128)` | 支持较长邮箱地址 |
| 手机号 | `VARCHAR(20)` | 兼容国际区号 |
| 密码哈希 | `VARCHAR(256)` | bcrypt 哈希约 60 字符，预留余量 |
| 头像 / 长文本 URL | `TEXT` | 可能超过 255 字符 |
| 布尔状态 | `BOOLEAN` | 明确 true/false |
| JSON 扩展字段 | `JSON` | 存储非结构化配置 |
| 大段文本 | `TEXT` | 文章内容、日志等 |
| 金额 | `DECIMAL(19, 4)` | 避免浮点精度问题 |

## 7. 禁止事项

- 禁止外键级联删除/更新（由业务层控制，便于审计和软删除）
- 禁止无注释的字段（项目交付时 `models/*.py` 中应写清字段含义）
- 禁止使用魔法数字枚举（应建枚举表或在代码中用常量定义）
- 禁止在模型层写触发器，业务逻辑统一放到 `services/` 中

## 8. 示例：用户表

```python
class User(Base):
    __tablename__ = f"{settings.db_prefix}_user"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    password: Mapped[str] = mapped_column(String(256), nullable=False)
    email: Mapped[str | None] = mapped_column(String(128), default=None)
    phone: Mapped[str | None] = mapped_column(String(20), default=None)
    nickname: Mapped[str | None] = mapped_column(String(64), default=None)
    avatar: Mapped[str | None] = mapped_column(Text, default=None)
    is_active: Mapped[bool] = mapped_column(default=True)
    refresh_token: Mapped[str | None] = mapped_column(String(512), default=None)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime, default=None)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
```
