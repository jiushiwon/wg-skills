---
name: fastapi-qr-login-skill
description: 实现小程序或微信扫码登录功能，提供完整的后端 API 接口
---

# FastAPI 扫码登录技能

## 功能概述

实现网站生成二维码、小程序扫码确认登录的完整流程。包含以下核心功能：

1. **扫码登录会话管理** - 创建会话、轮询状态、标记已扫描、确认登录
2. **微信小程序码生成** - 生成带场景值的小程序码，扫一扫直达确认页
3. **JWT Token 生成** - 登录成功后返回 JWT Token

## 适用场景

- 网站/Web应用需要通过小程序扫码登录
- 需要在多个平台（Web + 小程序）实现统一登录

## 技术栈

- FastAPI
- MongoDB（存储会话）
- JWT（用户认证）
- 微信小程序 API（生成小程序码）

## 技能使用方法

### 1. 参考实现

参考 `references/impl/` 目录下的完整实现代码：

- `qr_login.py` - 核心登录 API（创建会话、轮询状态、扫码、确认）
- `models.py` - 数据模型（如需分离）
- `test_qr_login.py` - 测试用例

### 2. 依赖配置

确保 `app/config.py` 中配置以下环境变量：

```python
# 微信小程序配置
WX_APPID = "your_appid"
WX_APPSECRET = "your_appsecret"
WX_TOKEN_URL = "https://api.weixin.qq.com/cgi-bin/token"
```

### 3. 路由集成

在 `app/main.py` 或 `app/routers/__init__.py` 中注册路由：

```python
from app.routers import qr_login
app.include_router(qr_login.router)
```

### 4. 数据库集合

确保 MongoDB 中存在 `qr_sessions` 集合，用于存储登录会话。

## API 接口清单

| 方法 | 路径 | 说明 | 调用方 |
|------|------|------|--------|
| POST | `/auth/qr/create` | 创建扫码会话 | Web前端 |
| GET | `/auth/qr/status/{session_id}` | 轮询会话状态 | Web前端 |
| POST | `/auth/qr/scan` | 小程序扫码标记 | 小程序 |
| POST | `/auth/qr/confirm` | 确认登录 | 小程序 |
| GET | `/auth/qr/wxacode/{session_id}` | 生成小程序码 | Web前端 |

## 业务流程

```
Web端                              小程序端
  │                                   │
  ├─ POST /auth/qr/create ──────────>│
  │<─ 返回 session_id ───────────────┤
  │                                   │
  ├─ 生成二维码 (含 session_id) ─────>│
  │                                   │
  │      用户扫码 ───────────────>   │
  │                                   │
  │                           POST /auth/qr/scan
  │<─ 轮询 /status ──────────────>   │
  │<─ status: scanned ──────────────┤
  │                                   │
  │                           显示确认弹框
  │                           用户点击确认
  │                           POST /auth/qr/confirm
  │                                   │
  ├─ 轮询 /status ──────────────>   │
  │<─ status: confirmed, token ──────┤
  │                                   │
  │  使用 token 登录成功              │
```

## 前端配合

### Web 端

1. 调用 `/auth/qr/create` 获取 `session_id`
2. 将 `session_id` 编码为二维码（或调用 `/auth/qr/wxacode/{session_id}` 获取小程序码图片）
3. 轮询 `/auth/qr/status/{session_id}` 直到返回 `status: confirmed`
4. 拿到 `token` 后存储到本地，完成登录

### 小程序端

1. 解析二维码/小程序码中的 `scene` 参数获取 `session_id`
2. 用户进入确认页后，调用 `/auth/qr/scan` 标记已扫描
3. 用户点击确认按钮后，调用 `/auth/qr/confirm` 完成登录

## 注意事项

1. **会话有效期** - 默认 5 分钟，过期后状态变为 `expired`
2. **并发处理** - 防止同一会话被多个账号扫码，使用状态和用户 ID 条件更新
3. **微信 access_token 缓存** - 缓存已获取的 token，提前 60 秒刷新
4. **时区处理** - MongoDB 返回 naive datetime，统一转换为 aware datetime 比较
