# org-permission-skill — Python (FastAPI) 实现要点

骨架已有的（auth-skill / python-backend-skill 生成，**不要重写**）：JWT 依赖注入当前用户、`EnvelopeRoute` 信封、`BizError`、全局异常、Redis 客户端。本模块只补权限业务。

## 新增依赖

无（复用骨架的 Redis 与 SQLAlchemy）。

## 关键文件

| 文件 | 职责 |
|------|------|
| `app/models/perm.py` | `Dept` / `Role` / `Permission` / 三个关联 SQLAlchemy 模型 |
| `app/core/permissions.py` | `require_perm("user:add")` 依赖工厂 + 数据权限拼接 + 权限缓存 |
| `app/schemas/perm.py` | 各接口的 Pydantic 入参/出参模型 |
| `app/services/perm_service.py` | 部门/角色/权限 CRUD、权限计算、缓存失效 |
| `app/api/v1/perm.py` | 路由，只做依赖注入 + 调 service，返回裸数据 |

## 关键片段

### 权限校验依赖（Depends）

```python
from fastapi import Depends, Request

def require_perm(perm: str):
    async def checker(request: Request, user=Depends(get_current_user)) -> User:
        if user is None:
            raise BizError(-1002, "未登录")
        if await perm_cache.is_admin(user.id):           # 超管唯一判断点
            return user
        perms = await perm_cache.get_perms(user.id)
        if perm not in perms:
            raise BizError(-1003, "无权限")
        return user
    return checker

# 路由用法：
@router.post("/api/user")
async def create_user(payload: UserIn, user=Depends(require_perm("user:add"))):
    return await user_service.create(payload)
```

### 数据权限过滤拼接（唯一拼接点）

```python
from sqlalchemy import select, or_

def apply_data_scope(stmt, user_id: int, model):
    ds = perm_cache.get_data_scope(user_id)  # { scope, dept_ids, user_dept_id, user_dept_ancestors }
    if ds.scope == 1:                        # 全部
        return stmt
    if ds.scope == 2:                        # 自定义部门
        return stmt.where(model.dept_id.in_(ds.dept_ids))
    if ds.scope == 3:                        # 本部门
        return stmt.where(model.dept_id == ds.user_dept_id)
    if ds.scope == 4:                        # 本部门及子部门
        like = f"{ds.user_dept_ancestors},{ds.user_dept_id},%"
        sub = select(Dept.id).where(Dept.ancestors.like(like))
        return stmt.where(or_(model.dept_id == ds.user_dept_id, model.dept_id.in_(sub)))
    if ds.scope == 5:                        # 仅本人
        return stmt.where(model.created_by == user_id)
    return stmt
```

### 权限树构建（递归）

```python
def build_tree(all_perms: list[Permission], parent_id: int = 0) -> list[dict]:
    children = [p for p in all_perms if p.parent_id == parent_id]
    children.sort(key=lambda p: p.sort)
    return [
        {**to_node(p), "children": build_tree(all_perms, p.id)}
        for p in children
    ]
```

## 坑位

- `ancestors` 的 `LIKE` 匹配务必带尾部 `,%`，否则 `0,1` 会误中 `0,12`；SQLAlchemy 用 `.like(...)` 别忘了拼上 `%`。
- 移动部门要在同一事务内级联刷新所有子孙 `ancestors`（`await db.commit()` 之前全部改完），漏一条子树查询就错。
- 权限缓存失效按影响面批量删（`scan_iter("perm:user:*")` 或维护反向索引），改角色权限别只删一个用户的 key。
- `build_tree` 递归前先按 `parent_id` 分组成 dict 再建树，避免 O(n²)；每层单独 `sort`。
- 依赖工厂 `require_perm` 返回的是协程函数，务必用 `Depends(require_perm("x"))` 而不是 `Depends(require_perm)`（少了调用）。
