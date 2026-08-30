---
name: pgsql-module-skill
description: PostgreSQL 数据库模块集成技能。面向已有后端项目的开发者，提供 PostgreSQL 连接配置、表结构设计、ORM 映射、索引优化、JSON 支持、数组类型、事务处理、主从复制等能力的快速集成。触发词："PostgreSQL 集成"、"PostgreSQL 配置"、"PostgreSQL 连接"、"pgsql module"、"postgres setup"、"pgsql 索引"、"pgsql json"、"pgsql 数组"。
---

# PostgreSQL Module Skill

面向**已有后端项目**的开发者，快速集成 PostgreSQL 能力。

## 能力清单

| 能力 | 说明 |
|------|------|
| **连接配置** | JDBC/连接池/环境变量配置 |
| **表结构设计** | DDL 建表/字段类型/约束 |
| **ORM 映射** | 实体类/Repository/Service |
| **JSON/JSONB** | JSON 文档存储与查询 |
| **数组类型** | PostgreSQL 原生数组支持 |
| **索引优化** | 索引设计/慢查询优化 |
| **事务处理** | 声明式/编程式事务 |
| **主从复制** | 读写分离/流复制 |

## 触发场景

用户说"帮我加 PostgreSQL"或"集成 PostgreSQL"时触发。

## 核心配置

### Java (Spring Boot)

```yaml
# application.yml
spring:
  datasource:
    url: jdbc:postgresql://${PG_HOST:localhost}:${PG_PORT:5432}/${PG_DATABASE:myapp}
    username: ${PG_USER:postgres}
    password: ${PG_PASSWORD:}
    driver-class-name: org.postgresql.Driver
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
    pg_host: str = "localhost"
    pg_port: int = 5432
    pg_user: str = "postgres"
    pg_password: str = ""
    pg_database: str = "myapp"

# database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

engine = create_engine(
    f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{database}",
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

## 表结构设计

### 基础表模板

```sql
CREATE TABLE "wg_user" (
  "id" BIGSERIAL PRIMARY KEY,
  "username" VARCHAR(50) NOT NULL UNIQUE,
  "password" VARCHAR(255) NOT NULL,
  "nickname" VARCHAR(100),
  "avatar" VARCHAR(500),
  "email" VARCHAR(100),
  "phone" VARCHAR(20),
  "status" SMALLINT NOT NULL DEFAULT 1 CHECK (status IN (0, 1)),
  "extra" JSONB DEFAULT '{}',
  "tags" TEXT[] DEFAULT '{}',
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMP
);

CREATE INDEX "idx_wg_user_status" ON "wg_user" ("status");
CREATE INDEX "idx_wg_user_created_at" ON "wg_user" ("created_at");
CREATE INDEX "idx_wg_user_extra" ON "wg_user" USING GIN ("extra");

COMMENT ON TABLE "wg_user" IS '用户表';
COMMENT ON COLUMN "wg_user"."username" IS '用户名';
```

## JSON/JSONB 支持

### PostgreSQL 特性

```sql
-- JSONB 字段
ALTER TABLE wg_user ADD COLUMN extra JSONB DEFAULT '{}';

-- 查询 JSON 字段
SELECT * FROM wg_user WHERE extra->>'nickname' = '小明';

-- 索引 JSON 字段
CREATE INDEX idx_user_extra ON wg_user USING GIN (extra);
```

### Java

```java
@Entity
@Table(name = "wg_user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true)
    private String username;
    
    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> extra;
    
    @Column(columnDefinition = "text[]")
    private String[] tags;
}
```

### Python

```python
from sqlalchemy.dialects.postgresql import JSONB, ARRAY

class User(Base):
    __tablename__ = "wg_user"
    
    id = Column(BigInteger, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    extra = Column(JSONB, default={})
    tags = Column(ARRAY(String), default=[])
```

## 数组类型

```sql
-- 数组字段
ALTER TABLE wg_user ADD COLUMN tags TEXT[] DEFAULT '{}';

-- 查询数组
SELECT * FROM wg_user WHERE 'admin' = ANY(tags);

-- 数组包含
SELECT * FROM wg_user WHERE tags @> '{admin,user}';
```

## 索引设计

1. **B-tree 索引**：用于 =、<、>、<=、>= 查询
2. **GIN 索引**：用于 JSON、数组、全文搜索
3. **GiST 索引**：用于地理空间数据
4. **BRIN 索引**：用于时间序列数据

```sql
-- 复合索引
CREATE INDEX idx_user_status_created ON wg_user (status, created_at DESC);

-- 条件索引
CREATE INDEX idx_user_active ON wg_user (id) WHERE status = 1;

-- JSON 索引
CREATE INDEX idx_user_extra ON wg_user USING GIN (extra);
```

## 事务处理

### Java

```java
@Service
public class UserService {

    @Transactional(rollbackFor = Exception.class)
    public void createUser(User user) {
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
```

## 不做

- 不负责 PostgreSQL Server 安装（用户自行安装或使用 Docker）
- 不处理复杂的集群配置
- 不提供数据迁移工具
