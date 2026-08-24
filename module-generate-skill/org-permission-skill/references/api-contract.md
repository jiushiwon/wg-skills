# org-permission-skill — 接口契约增量

以下接口追加进项目根目录 `api-contract.md`，格式遵循 backend-convention-skill `references/api-contract-spec.md`。所有接口 HTTP 状态码统一 200，业务结果走 `{ code, message, data }` 信封；鉴权栏为 `Bearer` 的接口需要有效 access token。除特别说明，管理类接口还要求对应 `perms` 标识（后端强制校验，见各接口错误码）。

---

## GET /api/dept/tree

**描述**：获取部门树（树形结构，供组织管理与数据范围选择）。

**鉴权**：Bearer

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | integer | 否 | 1 启用 0 禁用；不传返回全部 |

**响应结构**

| 字段 | 类型 | 说明 |
|------|------|------|
| list | array | 部门树节点数组，节点见下 |

节点字段：`{ id, parentId, name, sort, status, children: [...] }`

**响应示例**

```json
{ "code": 0, "message": "success", "data": { "list": [
  { "id": 1, "parentId": 0, "name": "总部", "sort": 0, "status": 1, "children": [
    { "id": 3, "parentId": 1, "name": "研发部", "sort": 0, "status": 1, "children": [] }
  ] }
] } }
```

**错误码**：`-1002` 未登录

---

## POST /api/dept

**描述**：新建部门。`ancestors` 由服务端按父节点计算，客户端不传。

**鉴权**：Bearer（`dept:add`）

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| parentId | integer | 是 | 父部门 ID，根传 0 |
| name | string | 是 | 部门名，1~64 位 |
| sort | integer | 否 | 同级排序，默认 0 |

**请求示例**

```json
{ "parentId": 1, "name": "测试组", "sort": 1 }
```

**响应示例**

```json
{ "code": 0, "message": "success", "data": { "id": 8 } }
```

**错误码**：`-1001` 参数校验失败；`-1002` 未登录；`-1003` 无权限；`-1004` 父部门不存在；`-1005` 同级部门名重复

---

## PUT /api/dept/{id}

**描述**：更新部门（改名、调序、启停、移动）。移动（改 `parentId`）时服务端级联刷新子孙 `ancestors`。

**鉴权**：Bearer（`dept:edit`）

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 否 | 部门名 |
| parentId | integer | 否 | 移动目标父部门（禁止移动到自己的子孙下） |
| sort | integer | 否 | 排序 |
| status | integer | 否 | 1 启用 0 禁用 |

**请求示例**

```json
{ "name": "质量保障组", "status": 1 }
```

**错误码**：`-1001` 参数校验失败；`-1002` 未登录；`-1003` 无权限；`-1004` 部门不存在；`-1005` 同名冲突 / 移动到自身子孙下

---

## DELETE /api/dept/{id}

**描述**：删除部门。有子部门或有关联用户时拒绝。

**鉴权**：Bearer（`dept:remove`）

**请求参数**：无（路径参数 `id`）

**响应示例**

```json
{ "code": 0, "message": "success", "data": null }
```

**错误码**：`-1002` 未登录；`-1003` 无权限；`-1004` 部门不存在；`-1005` 存在子部门或关联用户

---

## GET /api/role/page

**描述**：角色分页列表。

**鉴权**：Bearer（`role:list`）

**请求参数**（query）

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | integer | 否 | 页码，默认 1 |
| pageSize | integer | 否 | 每页条数，默认 20 |
| name | string | 否 | 按角色名模糊匹配 |

**响应结构**：分页信封（`{ page, pageSize, total, list }`），角色字段：`{ id, name, code, dataScope, status, remark, createdAt }`

**响应示例**

```json
{ "code": 0, "message": "success", "data": { "page": 1, "pageSize": 20, "total": 2, "list": [
  { "id": 1, "name": "超级管理员", "code": "admin", "dataScope": 1, "status": 1, "remark": "", "createdAt": "2026-07-12T10:00:00Z" }
] } }
```

**错误码**：`-1002` 未登录；`-1003` 无权限

---

## POST /api/role

**描述**：新建角色。

**鉴权**：Bearer（`role:add`）

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 角色名 |
| code | string | 是 | 角色标识，唯一，字母数字下划线；上线后禁止改名 |
| dataScope | integer | 否 | 数据范围，默认 1 |
| remark | string | 否 | 备注 |

**请求示例**

```json
{ "name": "运营", "code": "ops", "dataScope": 3, "remark": "运营角色" }
```

**响应示例**

```json
{ "code": 0, "message": "success", "data": { "id": 5 } }
```

**错误码**：`-1001` 参数校验失败；`-1002` 未登录；`-1003` 无权限；`-1005` code 已存在

---

## PUT /api/role/{id}

**描述**：更新角色基本信息（名称、备注、启停）。`code` 不可改。权限与数据范围走专门接口。

**鉴权**：Bearer（`role:edit`）

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 否 | 角色名 |
| remark | string | 否 | 备注 |
| status | integer | 否 | 1 启用 0 禁用 |

**错误码**：`-1001` 参数校验失败；`-1002` 未登录；`-1003` 无权限；`-1004` 角色不存在

---

## DELETE /api/role/{id}

**描述**：删除角色。有关联用户时拒绝。

**鉴权**：Bearer（`role:remove`）

**响应示例**

```json
{ "code": 0, "message": "success", "data": null }
```

**错误码**：`-1002` 未登录；`-1003` 无权限；`-1004` 角色不存在；`-1005` 存在关联用户

---

## PUT /api/role/{id}/permissions

**描述**：给角色分配权限（全量覆盖该角色的权限集合）。变更后失效持有该角色用户的权限缓存。

**鉴权**：Bearer（`role:edit`）

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| permissionIds | array<integer> | 是 | 权限 ID 全量列表，传空数组即清空 |

**请求示例**

```json
{ "permissionIds": [1, 2, 10, 11] }
```

**响应示例**

```json
{ "code": 0, "message": "success", "data": null }
```

**错误码**：`-1001` 参数校验失败；`-1002` 未登录；`-1003` 无权限；`-1004` 角色或权限不存在

---

## PUT /api/role/{id}/data-scope

**描述**：设置角色数据范围；`dataScope=2` 时需传自定义部门列表。变更后失效相关用户权限缓存。

**鉴权**：Bearer（`role:edit`）

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| dataScope | integer | 是 | 1 全部 2 自定义 3 本部门 4 本部门及子部门 5 仅本人 |
| deptIds | array<integer> | 否 | dataScope=2 时必填，自定义部门 ID 列表 |

**请求示例**

```json
{ "dataScope": 2, "deptIds": [3, 8] }
```

**错误码**：`-1001` 参数校验失败（如 dataScope=2 未传 deptIds）；`-1002` 未登录；`-1003` 无权限；`-1004` 角色或部门不存在

---

## GET /api/permission/tree

**描述**：获取权限（菜单+按钮）树，供角色分配勾选与前端菜单渲染。

**鉴权**：Bearer

**响应结构**：`{ list: [...] }`，节点字段：`{ id, parentId, name, type, perms, path, component, icon, sort, visible, status, children: [...] }`

**响应示例**

```json
{ "code": 0, "message": "success", "data": { "list": [
  { "id": 1, "parentId": 0, "name": "系统管理", "type": 1, "perms": null, "path": "/system", "component": "Layout", "icon": "setting", "sort": 0, "visible": 1, "status": 1, "children": [
    { "id": 10, "parentId": 1, "name": "用户管理", "type": 2, "perms": "user:list", "path": "user", "component": "system/user", "icon": "user", "sort": 0, "visible": 1, "status": 1, "children": [
      { "id": 11, "parentId": 10, "name": "新增", "type": 3, "perms": "user:add", "path": "", "component": "", "icon": "", "sort": 0, "visible": 1, "status": 1, "children": [] }
    ] }
  ] }
] } }
```

**错误码**：`-1002` 未登录

---

## POST /api/permission

**描述**：新建权限（目录/菜单/按钮）。按钮（`type=3`）的 `perms` 必填且唯一。

**鉴权**：Bearer（`permission:add`）

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| parentId | integer | 是 | 父权限 ID，根传 0 |
| name | string | 是 | 名称 |
| type | integer | 是 | 1 目录 2 菜单 3 按钮 |
| perms | string | 条件 | 按钮必填，唯一，如 user:add |
| path | string | 否 | 路由路径（菜单用） |
| component | string | 否 | 组件路径（菜单用） |
| icon | string | 否 | 图标 |
| sort | integer | 否 | 排序 |
| visible | integer | 否 | 1 显示 0 隐藏，默认 1 |

**响应示例**

```json
{ "code": 0, "message": "success", "data": { "id": 12 } }
```

**错误码**：`-1001` 参数校验失败；`-1002` 未登录；`-1003` 无权限；`-1005` perms 已存在

---

## PUT /api/permission/{id}

**描述**：更新权限。`perms` 上线后禁止改名（前后端都引用），本接口不接受修改 `perms`。

**鉴权**：Bearer（`permission:edit`）

**请求参数**：同新建（除 `perms` 外均可改）。

**错误码**：`-1001` 参数校验失败；`-1002` 未登录；`-1003` 无权限；`-1004` 权限不存在

---

## DELETE /api/permission/{id}

**描述**：删除权限。有子权限时拒绝；角色关联可级联清理。

**鉴权**：Bearer（`permission:remove`）

**响应示例**

```json
{ "code": 0, "message": "success", "data": null }
```

**错误码**：`-1002` 未登录；`-1003` 无权限；`-1004` 权限不存在；`-1005` 存在子权限

---

## PUT /api/user/{id}/roles

**描述**：给用户分配角色（全量覆盖）。变更后失效该用户权限缓存。

**鉴权**：Bearer（`user:edit`）

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| roleIds | array<integer> | 是 | 角色 ID 全量列表，传空数组即清空 |

**请求示例**

```json
{ "roleIds": [1, 5] }
```

**响应示例**

```json
{ "code": 0, "message": "success", "data": null }
```

**错误码**：`-1001` 参数校验失败；`-1002` 未登录；`-1003` 无权限；`-1004` 用户或角色不存在

---

## GET /api/auth/permissions

**描述**：获取当前登录用户的权限标识集合 + 菜单树，供前端鉴权（按钮显隐、路由生成）。后端鉴权不依赖此接口，此接口仅为前端体验。

**鉴权**：Bearer

**响应结构**

| 字段 | 类型 | 说明 |
|------|------|------|
| perms | array<string> | 当前用户全部权限标识（按钮级），如 ["user:add","user:list"]；超管返回 ["*:*:*"] |
| menus | array | 当前用户可见的菜单树（仅 type=1/2 且 visible=1，递归 children） |

**响应示例**

```json
{ "code": 0, "message": "success", "data": {
  "perms": ["user:list", "user:add"],
  "menus": [
    { "id": 1, "name": "系统管理", "path": "/system", "icon": "setting", "children": [
      { "id": 10, "name": "用户管理", "path": "user", "icon": "user", "children": [] }
    ] }
  ]
} }
```

**错误码**：`-1002` 未登录
