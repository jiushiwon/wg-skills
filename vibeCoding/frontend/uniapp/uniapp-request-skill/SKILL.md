---
name: uniapp-request-skill
description: 当用户在 uniapp 项目中需要设计或审查请求层（request.ts 封装、拦截器、去重、Mock、错误处理、文件上传、SSE 流式请求、Token 刷新、游客拦截、防抖）时触发。本 skill 是 `frontend-request-skill` 在 uniapp 场景的入口，权威规范位于 `frontend-request-skill/references/uniapp-spec.md`。
---

# UniApp Request Layer Skill

## 定位

**只聚焦 uniapp 请求层设计**：基于 `uni.request` / `uni.uploadFile` / `uni.downloadFile` 建立统一、健壮、可维护的请求体系。

权威规范位于 [`frontend-request-skill/references/uniapp-spec.md`](../../frontend-request-skill/references/uniapp-spec.md)。本 skill 是其在 uniapp 场景的入口与触发词聚合。

## When to Use

触发词：

- "uniapp 请求封装"
- "uniapp request.ts"
- "uniapp 接口拦截"
- "uniapp Token 刷新"
- "uniapp 游客模式拦截"
- "uniapp Mock 数据"
- "uniapp 接口防抖"
- "uniapp 错误处理"
- "uniapp 文件上传"
- "uniapp SSE 流式"
- "uniapp AI 聊天流式回复"
- "uniapp 跨端请求层"

## 不触发场景

- 通用 Web/Vue/React 请求设计（用 `frontend-request-skill`）
- 完整登录鉴权体系（用 `uniapp-components-skill`）
- 跨平台兼容性审计（用 `uniapp-crossplatform-audit-skill`）

## Workflow

```
Phase 1: 现状评估
  → 读取项目 src/utils/request.* / src/api/* / src/services/*
  → 评估是否已封装、是否接入鉴权、是否处理 SSE

Phase 2: 规范对照
  → 按 frontend-request-skill/references/uniapp-spec.md 的 11 项要点逐条对照
  → 输出"差距清单"

Phase 3: 用户确认
  → 列出"哪些项需要补、哪些项可保持现状"
  → 用户确认后进入实施

Phase 4: 改造实施
  → 新建或改造 src/utils/request.ts
  → 集成 auth、错误处理、Mock、防抖、SSE、上传

Phase 5: 验证
  → 小程序 / H5 / App 三端联调
  → 401 刷新流程、SSE 流式、上传进度回归
```

## 11 项核心要点（详见 `frontend-request-skill/references/uniapp-spec.md`）

| # | 要点 | 适用层 |
|---|------|--------|
| 1 | 统一入口 `request.ts` | request |
| 2 | 响应信封 `{ code, message, data }` | response |
| 3 | 鉴权拦截 + Token 注入 | interceptor |
| 4 | 401 自动刷新 Token + 队列重试 | interceptor |
| 5 | 游客模式拦截 | interceptor |
| 6 | 请求防抖 / 重复拦截 | interceptor |
| 7 | Mock 数据机制 | dev |
| 8 | 错误码统一映射与通知 | interceptor |
| 9 | 文件上传独立封装 + 进度回调 | upload |
| 10 | SSE 流式请求 + 打字机效果 | stream |
| 11 | 网络异常 / 超时重试策略 | interceptor |

## 跨端差异要点

| 端 | 网络 API | 注意点 |
|----|----------|--------|
| **微信小程序** | `uni.request` / `uni.uploadFile` | 需配置合法域名；不支持长连接需用 SSE 兼容方案 |
| **H5** | `uni.request`（包装 `fetch`） | CORS 跨域处理 |
| **App** | `uni.request`（plus.net） | SSL 证书、离线缓存 |

完整端间差异参见 [`uniapp-crossplatform-audit-skill`](../uniapp-crossplatform-audit-skill/)。

## 输出文件

- `src/utils/request.ts` — 请求层入口
- `src/utils/upload.ts` — 上传封装
- `src/utils/sse.ts` — SSE 流式封装
- `src/api/auth.ts` — Token 刷新队列示例

> 本 skill 不直接修改既有 request.ts，**用户确认差距清单后才实施改造**。

## 参考标准

- [`frontend-request-skill/references/uniapp-spec.md`](../../frontend-request-skill/references/uniapp-spec.md) — 权威规范
- [`uniapp-components-skill`](../uniapp-components-skill/) — 鉴权体系
- [`uniapp-crossplatform-audit-skill`](../uniapp-crossplatform-audit-skill/) — 跨端 API 兼容

## 自我审计

本 skill 升级后应核对：

- 触发词与 README.md 一致
- 权威规范位置 `frontend-request-skill/references/uniapp-spec.md` 无死链
- 不自动改造现有 request.ts