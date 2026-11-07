---
name: fastapi-dict-module-skill
description: FastAPI 字典/配置模块技能。面向已有 FastAPI 项目，提供字典类型、字典项、系统配置、参数管理等能力的快速集成。触发词："字典模块"、"配置模块"、"系统参数"、"字典管理"、"系统配置"、"dict module"、"config module"。
---

# FastAPI Dict Module Skill

面向**已有 FastAPI 项目**的开发者，快速集成字典和配置管理能力。

## 能力清单

| 能力 | 说明 |
|------|------|
| **字典类型** | 字典分类管理 |
| **字典项** | 字典数据 CRUD |
| **系统配置** | 系统参数配置 |
| **缓存** | 字典数据缓存 |
| **接口** | RESTful API |

## 触发场景

用户说"帮我加字典模块"或"加配置管理"时触发。

## 数据模型

### 字典类型表

```python
from sqlalchemy import Column, BigInteger, String, Integer, DateTime, Boolean
from sqlalchemy.sql import func

class DictType(Base):
    __tablename__ = "wg_dict_type"
    
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False, comment="字典名称")
    code = Column(String(50), nullable=False, unique=True, comment="字典编码")
    description = Column(String(500), comment="描述")
    status = Column(Integer, default=1, comment="状态：0禁用 1正常")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime, nullable=True)
```

### 字典项表

```python
class DictItem(Base):
    __tablename__ = "wg_dict_item"
    
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    dict_type_id = Column(BigInteger, nullable=False, comment="字典类型ID")
    label = Column(String(100), nullable=False, comment="显示标签")
    value = Column(String(100), nullable=False, comment="值")
    sort = Column(Integer, default=0, comment="排序")
    status = Column(Integer, default=1, comment="状态")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime, nullable=True)
```

### 系统配置表

```python
class SysConfig(Base):
    __tablename__ = "wg_sys_config"
    
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    config_key = Column(String(100), nullable=False, unique=True, comment="配置键")
    config_value = Column(String(500), comment="配置值")
    config_type = Column(String(20), default="string", comment="类型：string/int/json")
    description = Column(String(500), comment="描述")
    status = Column(Integer, default=1, comment="状态")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
```

## API 接口

### 字典类型

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/dict/type/list | 字典类型列表 |
| GET | /api/dict/type/{id} | 字典类型详情 |
| POST | /api/dict/type | 新增字典类型 |
| PUT | /api/dict/type/{id} | 更新字典类型 |
| DELETE | /api/dict/type/{id} | 删除字典类型 |

### 字典项

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/dict/item/list | 字典项列表 |
| GET | /api/dict/item/{type_code} | 根据编码获取字典项 |
| POST | /api/dict/item | 新增字典项 |
| PUT | /api/dict/item/{id} | 更新字典项 |
| DELETE | /api/dict/item/{id} | 删除字典项 |

### 系统配置

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/config/list | 配置列表 |
| GET | /api/config/{key} | 获取配置 |
| PUT | /api/config/{key} | 更新配置 |

## 使用示例

### 获取字典数据

```python
# 前端下拉框数据源
@app.get("/api/dict/item/{type_code}")
async def get_dict_items(type_code: str):
    # 从缓存或数据库获取
    items = await get_dict_by_code(type_code)
    return Success(data=[{"label": i.label, "value": i.value} for i in items])
```

### 使用字典数据

```python
from fastapi import Depends

async def create_user(user: UserCreate, dict_svc: DictService = Depends()):
    # 获取性别字典
    genders = await dict_svc.get_items("gender")
    # ...
```

### 系统配置

```python
# 读取配置
@app.get("/api/config/site-name")
async def get_site_name(config_svc: ConfigService = Depends()):
    value = await config_svc.get("site_name")
    return Success(data=value)

# 更新配置
@app.put("/api/config/site-name")
async def update_site_name(value: str, config_svc: ConfigService = Depends()):
    await config_svc.set("site_name", value)
    return Success()
```

## 缓存支持

```python
from functools import lru_cache

@lru_cache(maxsize=100)
async def get_dict_cache(type_code: str) -> List[DictItem]:
    """字典数据缓存"""
    return await DictItem.filter(dict_type_code=type_code, status=1).all()

async def refresh_dict_cache(type_code: str):
    """刷新缓存"""
    get_dict_cache.cache_clear()
```

## 不做

- 不负责前端页面（使用方自行实现）
- 不处理敏感配置加密（业务层自行处理）
- 不提供配置变更审计日志
