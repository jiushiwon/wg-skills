# 组织权限模块接口契约

> 本文件由 fastapi-org-permission-module-skill 生成，遵循 `backend/shared/module-output-spec.md`。

## 接口清单

### 组织管理

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| GET | /api/orgs | 组织列表 | 是 |
| POST | /api/orgs | 创建组织 | 是 |
| PUT | /api/orgs/{id} | 更新组织 | 是 |
| DELETE | /api/orgs/{id} | 删除组织 | 是 |
| GET | /api/orgs/{id}/tree | 组织树形结构 | 是 |

### 角色管理

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| GET | /api/roles | 角色列表 | 是 |
| POST | /api/roles | 创建角色 | 是 |
| PUT | /api/roles/{id} | 更新角色 | 是 |
| DELETE | /api/roles/{id} | 删除角色 | 是 |
| PUT | /api/roles/{id}/permissions | 分配权限 | 是 |

### 用户角色

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| GET | /api/users/{id}/roles | 用户角色列表 | 是 |
| PUT | /api/users/{id}/roles | 分配用户角色 | 是 |

## 数据模型

### OrgResponse

| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 组织 ID |
| name | string | 组织名称 |
| parent_id | integer | 上级组织 ID |
| sort | integer | 排序 |
| status | integer | 状态 |
| created_at | string | ISO 8601 |

### RoleResponse

| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 角色 ID |
| name | string | 角色名称 |
| code | string | 角色编码（唯一） |
| permissions | string[] | 权限编码列表 |
| created_at | string | ISO 8601 |

## 错误码扩展

| code | 含义 | 触发场景 |
|------|------|---------|
| -3001 | 组织已存在 | 同级下组织名重复 |
| -3002 | 组织有下级 | 删除时存在子组织 |
| -3003 | 角色编码已存在 | code 唯一约束 |
| -3004 | 系统角色不可删 | 内置角色保护 |
