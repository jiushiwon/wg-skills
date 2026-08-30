---
name: fastapi-org-permission-module-skill
description: Python FastAPI 组织权限模块技能。面向已有 FastAPI 项目的开发者，提供组织架构、部门管理、角色权限、RBAC、菜单管理、数据权限等能力的快速集成。触发词："组织架构"、"部门管理"、"角色权限"、"RBAC"、"菜单管理"、"数据权限"、"org permission"、"role"、"menu"、"department"。
---

# FastAPI Org Permission Module Skill

面向**已有 FastAPI 项目**的开发者，快速集成组织权限能力。

## 能力清单

| 能力 | 说明 |
|------|------|
| **组织架构** | 组织/部门管理 |
| **用户管理** | 用户-部门-岗位关联 |
| **角色管理** | 角色定义与权限分配 |
| **菜单管理** | 前后端菜单配置 |
| **权限控制** | 按钮/接口级权限 |
| **数据权限** | 行级数据隔离 |

## 触发场景

用户说"帮我加权限"或"集成 RBAC"时触发。

## 核心实现

### 依赖配置

```bash
pip install sqlalchemy python-jose passlib
```

### 数据模型

```python
# models.py
from sqlalchemy import Column, BigInteger, String, Integer, Text, DateTime, Enum as SQLEnum
from sqlalchemy.sql import func
from database import Base
import enum

class RoleType(str, enum.Enum):
    SYSTEM = "system"
    CUSTOM = "custom"

class MenuType(str, enum.Enum):
    CATALOG = "catalog"
    MENU = "menu"
    BUTTON = "button"

class Org(Base):
    __tablename__ = "wg_org"
    
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    parent_id = Column(BigInteger, default=0)
    parent_ids = Column(String(500), default="0/")
    sort = Column(Integer, default=0)
    leader = Column(String(50))
    phone = Column(String(20))
    status = Column(Integer, default=1)
    created_at = Column(DateTime, server_default=func.now())

class Dept(Base):
    __tablename__ = "wg_dept"
    
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    org_id = Column(BigInteger, nullable=False)
    parent_id = Column(BigInteger, default=0)
    name = Column(String(100), nullable=False)
    sort = Column(Integer, default=0)
    leader = Column(String(50))
    status = Column(Integer, default=1)
    created_at = Column(DateTime, server_default=func.now())

class User(Base):
    __tablename__ = "wg_user"
    
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    nickname = Column(String(100))
    dept_id = Column(BigInteger)
    post_id = Column(BigInteger)
    email = Column(String(100))
    phone = Column(String(20))
    status = Column(Integer, default=1)
    created_at = Column(DateTime, server_default=func.now())

class Role(Base):
    __tablename__ = "wg_role"
    
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    name = Column(String(50), nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    description = Column(String(200))
    type = Column(SQLEnum(RoleType), default=RoleType.CUSTOM)
    status = Column(Integer, default=1)
    created_at = Column(DateTime, server_default=func.now())

class Menu(Base):
    __tablename__ = "wg_menu"
    
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    name = Column(String(50), nullable=False)
    parent_id = Column(BigInteger, default=0)
    path = Column(String(200))
    component = Column(String(200))
    icon = Column(String(50))
    sort = Column(Integer, default=0)
    type = Column(SQLEnum(MenuType), default=MenuType.MENU)
    permission = Column(String(100))
    status = Column(Integer, default=1)
    created_at = Column(DateTime, server_default=func.now())

# 关联表
class UserRole(Base):
    __tablename__ = "wg_user_role"
    
    user_id = Column(BigInteger, primary_key=True)
    role_id = Column(BigInteger, primary_key=True)

class RoleMenu(Base):
    __tablename__ = "wg_role_menu"
    
    role_id = Column(BigInteger, primary_key=True)
    menu_id = Column(BigInteger, primary_key=True)
```

### 服务层

```python
# services/org_service.py
from typing import List, Optional

class OrgService:
    # 部门管理
    async def create_dept(self, dept: Dept) -> Dept:
        db.add(dept)
        db.commit()
        db.refresh(dept)
        return dept
    
    async def get_dept_tree(self) -> List[dict]:
        depts = db.query(Dept).all()
        return self._build_tree(depts)
    
    def _build_tree(self, depts: List[Dept]) -> List[dict]:
        """构建部门树"""
        tree = []
        dept_map = {d.id: d for d in depts}
        
        for dept in depts:
            if dept.parent_id == 0:
                tree.append(self._to_tree(dept, depts))
        return tree
    
    def _to_tree(self, dept: Dept, all_depts: List[Dept]) -> dict:
        children = [self._to_tree(d, all_depts) 
                   for d in all_depts if d.parent_id == dept.id]
        return {
            "id": dept.id,
            "name": dept.name,
            "children": children
        }

# services/permission_service.py
class PermissionService:
    # 获取用户权限
    async def get_user_permissions(self, user_id: int) -> List[str]:
        # 1. 获取用户角色
        role_ids = db.query(UserRole.role_id).filter(
            UserRole.user_id == user_id
        ).all()
        role_ids = [r[0] for r in role_ids]
        
        # 2. 获取角色菜单
        menu_ids = db.query(RoleMenu.menu_id).filter(
            RoleMenu.role_id.in_(role_ids)
        ).all()
        menu_ids = [m[0] for m in menu_ids]
        
        # 3. 获取菜单权限
        menus = db.query(Menu).filter(
            Menu.id.in_(menu_ids),
            Menu.permission.isnot(None)
        ).all()
        
        return [m.permission for m in menus]
    
    # 获取用户菜单
    async def get_user_menus(self, user_id: int) -> List[Menu]:
        role_ids = db.query(UserRole.role_id).filter(
            UserRole.user_id == user_id
        ).all()
        role_ids = [r[0] for r in role_ids]
        
        menus = db.query(Menu).filter(
            Menu.id.in_(
                db.query(RoleMenu.menu_id).filter(
                    RoleMenu.role_id.in_(role_ids)
                )
            ),
            Menu.status == 1
        ).all()
        
        return self._build_menu_tree(menus)
    
    def _build_menu_tree(self, menus: List[Menu]) -> List[dict]:
        """构建菜单树"""
        menu_map = {m.id: m for m in menus}
        tree = []
        
        for menu in menus:
            if menu.parent_id == 0:
                tree.append(self._to_menu_tree(menu, menus))
        return tree
    
    def _to_menu_tree(self, menu: Menu, all_menus: List[Menu]) -> dict:
        children = [self._to_menu_tree(m, all_menus)
                   for m in all_menus if m.parent_id == menu.id]
        return {
            "id": menu.id,
            "name": menu.name,
            "path": menu.path,
            "component": menu.component,
            "icon": menu.icon,
            "children": children if children else None
        }
    
    # 检查权限
    async def has_permission(self, user_id: int, permission: str) -> bool:
        perms = await self.get_user_permissions(user_id)
        return permission in perms

# 依赖注入
async def get_current_user_permissions(user_id: int = Depends(get_current_user)):
    perms = await permission_service.get_user_permissions(user_id)
    return perms

# 接口权限检查
def require_permission(permission: str):
    async def checker(perms: List[str] = Depends(get_current_user_permissions)):
        if permission not in perms:
            raise HTTPException(status_code=403, detail="权限不足")
    return checker
```

### API 路由

```python
# routers/org.py
from fastapi import APIRouter, Depends, HTTPException

router = APIRouter(prefix="/api/org", tags=["组织权限"])

@router.get("/dept/tree")
async def get_dept_tree():
    tree = await org_service.get_dept_tree()
    return ApiResponse.ok(tree)

@router.post("/dept")
async def create_dept(dept: DeptCreate):
    new_dept = await org_service.create_dept(Dept(**dept.dict()))
    return ApiResponse.ok(new_dept)

# routers/permission.py
@router.get("/menus")
async def get_user_menus(user_id: int = Depends(get_current_user)):
    menus = await permission_service.get_user_menus(user_id)
    return ApiResponse.ok(menus)

@router.get("/permissions")
async def get_user_permissions(user_id: int = Depends(get_current_user)):
    perms = await permission_service.get_user_permissions(user_id)
    return ApiResponse.ok(perms)

# 使用示例
@router.delete("/user/{user_id}")
async def delete_user(
    user_id: int,
    _: List[str] = Depends(require_permission("user:delete"))
):
    await user_service.delete_user(user_id)
    return ApiResponse.ok(None)
```

## 不做

- 不负责 CAS 集成
- 不处理 SSO
- 不提供 UI 相关代码
