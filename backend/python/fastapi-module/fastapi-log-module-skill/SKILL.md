---
name: fastapi-log-module-skill
description: FastAPI 日志审计模块技能。面向已有 FastAPI 项目，提供操作日志、登录日志、审计追踪等能力的快速集成。触发词："日志模块"、"审计模块"、"操作日志"、"登录日志"、"log module"、"audit log"。
---

# FastAPI Log Module Skill

面向**已有 FastAPI 项目**的开发者，快速集成日志和审计能力。

## 能力清单

| 能力 | 说明 |
|------|------|
| **操作日志** | 记录用户操作 |
| **登录日志** | 记录登录登出 |
| **审计追踪** | 敏感操作审计 |
| **日志查询** | 分页查询、导出 |

## 数据模型

```python
class OperationLog(Base):
    __tablename__ = "wg_operation_log"
    
    id = Column(BigInteger, primary_key=True)
    user_id = Column(BigInteger)
    username = Column(String(50))
    module = Column(String(50))  # 模块
    operation = Column(String(50))  # 操作
    method = Column(String(10))  # 请求方法
    path = Column(String(255))  # 请求路径
    params = Column(Text)  # 请求参数
    result = Column(Text)  # 返回结果
    ip = Column(String(50))  # IP 地址
    location = Column(String(255))  # 地理位置
    duration = Column(Integer)  # 耗时 ms
    created_at = Column(DateTime)

class LoginLog(Base):
    __tablename__ = "wg_login_log"
    
    id = Column(BigInteger, primary_key=True)
    user_id = Column(BigInteger)
    username = Column(String(50))
    status = Column(Integer)  # 1成功 0失败
    ip = Column(String(50))
    location = Column(String(255))
    user_agent = Column(String(500))
    message = Column(String(255))
    created_at = Column(DateTime)
```

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/log/operation/list | 操作日志列表 |
| GET | /api/log/login/list | 登录日志列表 |

## 不做

- 不负责日志存储（业务层自行选择）
- 不处理日志分析（ELK 等专门工具）
