# 接口契约

本文档定义项目的 API 接口规范。

## 基础信息

| 项目 | 值 |
|------|-----|
| 基础URL | http://localhost:8080 |
| API前缀 | /api |
| 协议 | HTTP |
| 认证方式 | Bearer Token |

## 统一响应格式

### 成功响应

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

### 错误响应

```json
{
  "code": -1,
  "message": "错误信息"
}
```

## 错误码规范

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| -1 | 通用错误 |
| -1001 | 参数校验错误 |
| -2000 | 系统错误 |
| -401 | 未授权 |
| -403 | 禁止访问 |
| -404 | 资源不存在 |

---

## 接口列表

### 1. 健康检查

#### GET /api/health

检查服务健康状态。

**请求参数**: 无

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "status": "ok",
    "timestamp": 1699999999
  }
}
```

---

### 2. 用户注册

#### POST /api/auth/register

注册新用户。

**请求头**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| Content-Type | string | 是 | application/json |

**请求体**:
```json
{
  "username": "string",
  "password": "string",
  "nickname": "string",
  "email": "string",
  "phone": "string"
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "注册成功",
  "data": {
    "user_id": 1,
    "username": "testuser"
  }
}
```

---

### 3. 用户登录

#### POST /api/auth/login

用户登录，获取 Token。

**请求头**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| Content-Type | string | 是 | application/json |

**请求体**:
```json
{
  "username": "string",
  "password": "string"
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expire": 86400,
    "user": {
      "id": 1,
      "username": "testuser",
      "nickname": "测试用户",
      "avatar": ""
    }
  }
}
```

---

### 4. 刷新 Token

#### POST /api/auth/refresh

刷新访问令牌。

**请求头**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| Authorization | string | 是 | Bearer {old_token} |

**请求参数**: 无

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 5. 获取用户列表

#### GET /api/users

获取用户列表（分页）。

**请求头**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| Authorization | string | 是 | Bearer {token} |

**请求参数**:
| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | int | 否 | 1 | 页码 |
| page_size | int | 否 | 10 | 每页数量 |
| keyword | string | 否 | - | 搜索关键词 |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "username": "testuser",
        "nickname": "测试用户",
        "email": "test@example.com",
        "phone": "13800138000",
        "avatar": "",
        "status": 1,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "page_size": 10
  }
}
```

---

### 6. 获取用户详情

#### GET /api/users/:id

获取指定用户详情。

**请求头**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| Authorization | string | 是 | Bearer {token} |

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| id | int | 用户ID |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "username": "testuser",
    "nickname": "测试用户",
    "email": "test@example.com",
    "phone": "13800138000",
    "avatar": "",
    "status": 1,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### 7. 更新用户

#### PUT /api/users/:id

更新用户信息。

**请求头**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| Content-Type | string | 是 | application/json |
| Authorization | string | 是 | Bearer {token} |

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| id | int | 用户ID |

**请求体**:
```json
{
  "nickname": "string",
  "email": "string",
  "phone": "string",
  "avatar": "string",
  "status": 1
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "更新成功",
  "data": {
    "id": 1
  }
}
```

---

### 8. 删除用户

#### DELETE /api/users/:id

删除用户（软删除）。

**请求头**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| Authorization | string | 是 | Bearer {token} |

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| id | int | 用户ID |

**响应示例**:
```json
{
  "code": 0,
  "message": "删除成功",
  "data": null
}
```

---

### 9. SSE 聊天

#### GET /api/sse/chat

SSE 流式聊天接口。

**请求头**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| Authorization | string | 是 | Bearer {token} |

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| message | string | 否 | 用户消息 |

**响应**: EventStream

**事件类型**:
- `message`: 消息内容
- `done`: 完成标识

---

### 10. 单文件上传

#### POST /api/upload

上传单个文件。

**请求头**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| Authorization | string | 是 | Bearer {token} |
| Content-Type | string | 是 | multipart/form-data |

**请求体**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | file | 是 | 上传文件 |

**响应示例**:
```json
{
  "code": 0,
  "message": "上传成功",
  "data": {
    "filename": "image.png",
    "url": "/uploads/image.png",
    "size": 1024
  }
}
```

---

### 11. 多文件上传

#### POST /api/uploads

上传多个文件。

**请求头**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| Authorization | string | 是 | Bearer {token} |
| Content-Type | string | 是 | multipart/form-data |

**请求体**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| files | file[] | 是 | 上传文件（多个） |

**响应示例**:
```json
{
  "code": 0,
  "message": "上传成功",
  "data": {
    "files": [
      {
        "filename": "image1.png",
        "url": "/uploads/image1.png",
        "size": 1024
      }
    ]
  }
}
```
