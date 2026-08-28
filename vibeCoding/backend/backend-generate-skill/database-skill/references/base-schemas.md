# 基础表设计（base schemas）

按项目类型给出**标准基础表清单 + 通用字段约定**，供选型与实体设计参考。生成项目时由对应后端 skill 按确认后的实体清单**现场写 DDL / 模型代码**（本文件不内置双版本 DDL，避免与选型漂移），表前缀默认 `wg_`。

| 项目类型 | 标准基础表 |
|----------|-----------|
| 通用 | `users`、`roles`、`permissions`、`operation_logs` |
| 博客 / 内容站 | `posts`、`comments`、`tags`、`post_tags`、`categories` |
| 电商 | `addresses`、`categories`、`products`、`carts`、`orders`、`order_items`、`payments` |
| SaaS / 多租户 | `tenants`、`users`、`roles`、`permissions`、`user_roles`、`role_permissions` |
| IoT / 设备管理 | `devices`、`device_data`、`alerts`、`device_groups` |
| 社交 | `follows`、`posts`、`likes`、`comments`、`messages` |

## 通用字段约定

- 主键：`id`（自增整数或 UUID，见 backend-convention-skill 契约）。
- 时间：`created_at`、`updated_at`（UTC，ISO 8601）。
- 软删除：`deleted_at`，未删除为 `null`。
- 密码：`password_hash`（bcrypt，禁存明文）。
