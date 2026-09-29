# API Contract - Auth Module

> 本接口契约与 `fastapi-auth-module-skill` 完全对齐，确保前端一套 API 可同时对接 Java 和 Python 后端。

## 响应信封格式

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| code | int | 0 成功，非 0 失败 |
| message | string | 提示信息 |
| data | object | 响应数据 |

---

## 认证接口

### 登录

```
POST /api/auth/login
```

**请求体**

```json
{
  "username": "admin",
  "password": "password123"
}
```

**响应**

```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 7200
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| access_token | string | 访问令牌 |
| refresh_token | string | 刷新令牌 |
| token_type | string | 令牌类型，默认 bearer |
| expires_in | int | 有效期（秒） |

### 登出

```
POST /api/auth/logout
```

**请求头**

```
Authorization: Bearer {access_token}
```

**响应**

```json
{
  "code": 0,
  "message": "登出成功"
}
```

### 获取当前用户

```
GET /api/auth/me
```

**响应**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "username": "admin",
    "nickname": "管理员",
    "email": "admin@example.com",
    "phone": "13800138000",
    "avatar": "https://example.com/avatar.jpg",
    "tenant_id": 1,
    "org_id": 1,
    "roles": ["admin", "editor"],
    "permissions": ["user:create", "user:update", "user:delete"]
  }
}
```

### 修改密码

```
PUT /api/auth/password
```

**请求体**

```json
{
  "old_password": "old123456",
  "new_password": "new123456"
}
```

**响应**

```json
{
  "code": 0,
  "message": "密码修改成功"
}
```

### 获取当前用户菜单树

```
GET /api/auth/menus
```

**响应**

```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "系统管理",
      "path": "/system",
      "component": "Layout",
      "menu_type": "C",
      "icon": "setting",
      "children": [
        {
          "id": 2,
          "name": "用户管理",
          "path": "/system/user",
          "component": "system/User",
          "menu_type": "M",
          "icon": "user",
          "permission": "user:list",
          "children": []
        },
        {
          "id": 3,
          "name": "新增用户",
          "menu_type": "B",
          "permission": "user:create",
          "children": []
        }
      ]
    }
  ]
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| id | long | 菜单ID |
| name | string | 菜单名称 |
| path | string | 路由路径 |
| component | string | 组件路径 |
| menu_type | string | M=菜单 C=目录 B=按钮 |
| icon | string | 图标 |
| permission | string | 权限标识 |
| children | array | 子菜单 |

---

## 用户管理

### 用户列表

```
GET /api/users?page=1&page_size=10&username=admin
```

**查询参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| page | int | 页码，默认 1 |
| page_size | int | 每页条数，默认 10 |
| username | string | 用户名（模糊搜索） |
| status | int | 状态筛选 |

**响应**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "username": "admin",
        "nickname": "管理员",
        "email": "admin@example.com",
        "phone": "13800138000",
        "avatar": "https://example.com/avatar.jpg",
        "org_id": 1,
        "org_name": "技术部",
        "status": 1,
        "created_at": "2026-01-01 10:00:00",
        "roles": ["admin"],
        "posts": ["技术总监"]
      }
    ],
    "total": 100,
    "page": 1,
    "page_size": 10
  }
}
```

### 用户详情

```
GET /api/users/{id}
```

**响应**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "username": "admin",
    "nickname": "管理员",
    "email": "admin@example.com",
    "phone": "13800138000",
    "avatar": "https://example.com/avatar.jpg",
    "org_id": 1,
    "org_name": "技术部",
    "status": 1,
    "created_at": "2026-01-01 10:00:00",
    "updated_at": "2026-01-02 10:00:00",
    "roles": [
      {
        "id": 1,
        "name": "管理员",
        "code": "admin"
      }
    ],
    "posts": [
      {
        "id": 1,
        "name": "技术总监",
        "code": "tech_leader"
      }
    ]
  }
}
```

### 创建用户

```
POST /api/users
```

**请求体**

```json
{
  "username": "newuser",
  "password": "password123",
  "nickname": "新用户",
  "email": "newuser@example.com",
  "phone": "13900139000",
  "org_id": 1,
  "role_ids": [1, 2],
  "post_ids": [1],
  "status": 1
}
```

**响应**

```json
{
  "code": 0,
  "message": "创建成功",
  "data": {
    "id": 2
  }
}
```

### 更新用户

```
PUT /api/users/{id}
```

**请求体**

```json
{
  "nickname": "修改昵称",
  "email": "newemail@example.com",
  "org_id": 2,
  "role_ids": [1],
  "status": 1
}
```

### 删除用户

```
DELETE /api/users/{id}
```

**响应**

```json
{
  "code": 0,
  "message": "删除成功"
}
```

### 分配角色

```
PUT /api/users/{id}/roles
```

**请求体**

```json
{
  "role_ids": [1, 2, 3]
}
```

### 分配岗位

```
PUT /api/users/{id}/posts
```

**请求体**

```json
{
  "post_ids": [1, 2]
}
```

---

## 角色管理

### 角色列表

```
GET /api/roles?page=1&page_size=10
```

**响应**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "管理员",
        "code": "admin",
        "data_scope": "ALL",
        "sort_order": 1,
        "status": 1,
        "created_at": "2026-01-01 10:00:00",
        "menu_count": 10
      }
    ],
    "total": 5,
    "page": 1,
    "page_size": 10
  }
}
```

### 角色详情

```
GET /api/roles/{id}
```

### 创建角色

```
POST /api/roles
```

**请求体**

```json
{
  "name": "编辑角色",
  "code": "editor",
  "data_scope": "DEPT_ONLY",
  "menu_ids": [1, 2, 3],
  "status": 1
}
```

### 更新角色

```
PUT /api/roles/{id}
```

### 删除角色

```
DELETE /api/roles/{id}
```

### 分配菜单

```
PUT /api/roles/{id}/menus
```

**请求体**

```json
{
  "menu_ids": [1, 2, 3, 4, 5]
}
```

---

## 菜单管理

### 菜单列表

```
GET /api/menus
```

**响应**

```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "系统管理",
      "parent_id": null,
      "path": "/system",
      "component": "Layout",
      "menu_type": "C",
      "icon": "setting",
      "permission": null,
      "sort_order": 1,
      "visible": 1,
      "status": 1,
      "children": [...]
    }
  ]
}
```

### 创建菜单

```
POST /api/menus
```

**请求体**

```json
{
  "name": "用户管理",
  "parent_id": 1,
  "path": "/system/user",
  "component": "system/User",
  "menu_type": "M",
  "icon": "user",
  "permission": "user:list",
  "sort_order": 1,
  "visible": 1,
  "status": 1
}
```

### 更新菜单

```
PUT /api/menus/{id}
```

### 删除菜单

```
DELETE /api/menus/{id}
```

---

## 组织架构

### 组织列表

```
GET /api/orgs
```

**响应**

```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "总公司",
      "parent_id": null,
      "sort_order": 1,
      "leader_user_id": 1,
      "phone": "010-12345678",
      "email": "hq@example.com",
      "status": 1,
      "children": [...]
    }
  ]
}
```

### 创建组织

```
POST /api/orgs
```

**请求体**

```json
{
  "name": "研发部",
  "parent_id": 1,
  "sort_order": 1,
  "leader_user_id": 2,
  "phone": "010-12345679",
  "email": "rd@example.com",
  "status": 1
}
```

---

## 岗位管理

### 岗位列表

```
GET /api/posts?page=1&page_size=10
```

### 创建岗位

```
POST /api/posts
```

**请求体**

```json
{
  "name": "前端开发",
  "code": "frontend_dev",
  "status": 1
}
```

---

## 租户管理

### 租户列表

```
GET /api/tenants?page=1&page_size=10
```

### 创建租户

```
POST /api/tenants
```

**请求体**

```json
{
  "name": "租户A",
  "code": "tenant_a",
  "status": 1
}
```

---

## 错误码

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未登录或 token 过期 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 数据权限范围

| 值 | 说明 |
|-----|------|
| ALL | 全部数据 |
| DEPT_ONLY | 本部门数据 |
| DEPT_AND_BELOW | 本部门及以下 |
| SELF_ONLY | 仅本人数据 |

---

**最后更新：2026-08-22**
