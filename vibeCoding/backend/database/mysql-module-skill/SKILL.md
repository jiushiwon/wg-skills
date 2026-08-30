---
name: mysql-module-skill
description: MySQL 数据库模块集成技能。面向已有后端项目的开发者，提供 MySQL 连接配置、表结构设计、ORM 映射、索引优化、事务处理、主从复制等能力的快速集成。触发词："MySQL 集成"、"MySQL 配置"、"MySQL 连接"、"mysql module"、"mysql setup"、"mysql 索引"、"mysql 事务"、"mysql 主从"。
---

# MySQL Module Skill

面向**已有后端项目**的开发者，快速集成 MySQL 能力。

## 能力清单

| 能力 | 说明 |
|------|------|
| **连接配置** | JDBC/连接池/环境变量配置 |
| **表结构设计** | DDL 建表/字段类型/约束 |
| **ORM 映射** | 实体类/Repository/Service |
| **索引优化** | 索引设计/慢查询优化 |
| **事务处理** | 声明式/编程式事务 |
| **主从复制** |读写分离/负载均衡 |

## 触发场景

用户说"帮我加 MySQL"或"集成 MySQL"时触发。

## 核心配置

### Java (Spring Boot)

```yaml
# application.yml
spring:
  datasource:
    url: jdbc:mysql://${MYSQL_HOST:localhost}:${MYSQL_PORT:3306}/${MYSQL_DATABASE:myapp}?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
    username: ${MYSQL_USER:root}
    password: ${MYSQL_PASSWORD:}
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      connection-timeout: 30000
```

### Python (FastAPI)

```python
# config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    mysql_host: str = "localhost"
    mysql_port: int = 3306
    mysql_user: str = "root"
    mysql_password: str = ""
    mysql_database: str = "myapp"

# database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

engine = create_engine(
    f"mysql+pymysql://{user}:{password}@{host}:{port}/{database}",
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

## 表结构设计

### 基础表模板

```sql
CREATE TABLE `wg_user` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `password` VARCHAR(255) NOT NULL COMMENT '密码',
  `nickname` VARCHAR(100) DEFAULT NULL COMMENT '昵称',
  `avatar` VARCHAR(500) DEFAULT NULL COMMENT '头像',
  `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态 0禁用 1正常',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

## 索引设计原则

1. **主键**：自增 BIGINT
2. **唯一索引**：username、email、phone 等唯一字段
3. **普通索引**：常用于 WHERE/ORDER BY 的字段
4. **复合索引**：遵循最左前缀原则

## 事务处理

### Java

```java
@Service
public class UserService {

    @Transactional(rollbackFor = Exception.class)
    public void createUser(User user) {
        // 业务逻辑
        userRepository.save(user);
    }
}
```

### Python

```python
from sqlalchemy.orm import Session

def create_user(db: Session, user: User):
    with db.begin():
        db.add(user)
    # 自动提交或回滚
```

## 主从复制（读写分离）

### 配置示例

```yaml
# Spring Boot 多数据源
spring:
  datasource:
    master:
      url: jdbc:mysql://master:3306/myapp
      hikari:
        maximum-pool-size: 20
    slave:
      url: jdbc:mysql://slave:3306/myapp
      hikari:
        maximum-pool-size: 10
```

## 不做

- 不负责 MySQL Server 安装（用户自行安装或使用 Docker）
- 不处理复杂的集群配置
- 不提供数据迁移工具
