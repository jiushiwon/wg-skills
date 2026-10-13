# fastapi-qr-login-skill

小程序/微信扫码登录后端模块

## 概述

基于 FastAPI + MongoDB，实现网站扫码登录、小程序扫码绑定等完整流程。

## 核心能力

| 接口 | 说明 | 调用方 |
|------|------|--------|
| `POST /auth/qr/create` | 创建扫码会话 | Web |
| `GET /auth/qr/status/{id}` | 轮询会话状态 | Web |
| `POST /auth/qr/scan` | 小程序扫码标记 | 小程序 |
| `POST /auth/qr/confirm` | 确认登录 | 小程序 |
| `GET /auth/qr/wxacode/{id}` | 生成小程序码 | Web |

## 业务流程

```
Web                                小程序
 │                                   │
 ├─ /auth/qr/create ───────────────>│
 │<─ session_id ────────────────────┤
 │                                   │
 ├─ 生成二维码 ───────────────────>  │
 │                                   │
 │      用户扫码 ───────────────>    │
 │                                   │
 │                           /auth/qr/scan
 │<─ /auth/qr/status ──────────────  │
 │<─ status: scanned ───────────────┤
 │                                   │
 │                           用户确认
 │                           /auth/qr/confirm
 │                                   │
 │<─ /auth/qr/status ──────────────  │
 │<─ status: confirmed, token ──────┤
```

## 技术栈

- **FastAPI** - Web 框架
- **MongoDB** - 会话存储
- **JWT** - 鉴权
- **httpx** - 微信 API 调用
- **微信小程序码** - getwxacodeunlimit

## 关键特性

- **5 分钟过期** - 会话自动失效
- **并发安全** - 条件更新防止抢占
- **微信 access_token 缓存** - 提前 60s 刷新
- **时区处理** - 统一 UTC 比较

## 快速使用

```python
from fastapi import FastAPI
from app.routers.qr_login import router

app = FastAPI()
app.include_router(router, prefix="/api")
```

## 配套前端

- Web 端 - 调用 `/auth/qr/create` + 轮询
- 小程序端 - 解析 scene + 调用 scan/confirm

## 触发词

- 小程序登录
- 微信扫码登录
- 扫码登录
- 微信授权
