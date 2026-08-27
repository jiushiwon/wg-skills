# uniapp-request-skill 📡

uniapp 项目**请求层设计**技能入口。基于 `uni.request` / `uni.uploadFile` 建立统一、健壮、可维护的请求体系，覆盖鉴权拦截、Token 刷新、游客拦截、Mock、防抖、SSE 流式、上传进度。

> 权威规范位于 [`frontend-request-skill/references/uniapp-spec.md`](../../frontend-request-skill/references/uniapp-spec.md)。本 skill 是其在 uniapp 场景的触发词聚合与入口。

---

## 它能做什么

当你说：

- "uniapp 请求封装"
- "uniapp request.ts 怎么写"
- "uniapp 接口拦截"
- "uniapp Token 刷新衔接"
- "uniapp 游客模式拦截"
- "uniapp Mock 数据"
- "uniapp 接口防抖"
- "uniapp 文件上传进度"
- "uniapp SSE 流式 / AI 聊天打字机"
- "uniapp 跨端请求层改造"

这个 Skill 会引导你完成现状评估 → 规范对照 → 差距清单 → 用户确认 → 改造实施 → 三端验证。

---

## 与 frontend-request-skill 的关系

| 维度 | frontend-request-skill | uniapp-request-skill |
|------|----------------------|---------------------|
| **定位** | 通用前端请求层（含 Web/Vue/React/uniapp 四规范） | uniapp 场景的入口与触发词聚合 |
| **底层 API** | `fetch` / `axios` / `uni.request` 三套 | `uni.request` / `uni.uploadFile` / plus.net |
| **权威内容** | `references/uniapp-spec.md` 等 6 个 references | 指向上述 `uniapp-spec.md` |
| **触发场景** | 通用前端 | 仅 uniapp |

> 一般 uniapp 项目直接用本 skill 即可，内部仍引用 `frontend-request-skill/references/uniapp-spec.md`。

---

## 11 项核心要点

| # | 要点 | 位置 |
|---|------|------|
| 1 | 统一入口 `request.ts` | request 层 |
| 2 | 响应信封 `{ code, message, data }` | response 层 |
| 3 | 鉴权拦截 + Token 注入 | interceptor |
| 4 | 401 自动刷新 Token + 队列重试 | interceptor |
| 5 | 游客模式拦截 | interceptor |
| 6 | 请求防抖 / 重复拦截 | interceptor |
| 7 | Mock 数据机制 | dev 层 |
| 8 | 错误码统一映射与通知 | interceptor |
| 9 | 文件上传独立封装 + 进度回调 | upload 层 |
| 10 | SSE 流式请求 + 打字机效果 | stream 层 |
| 11 | 网络异常 / 超时重试策略 | interceptor |

完整规范与代码示例见 [`frontend-request-skill/references/uniapp-spec.md`](../../frontend-request-skill/references/uniapp-spec.md)。

---

## 跨端差异要点

| 端 | 网络 API | 关键注意点 |
|----|----------|-----------|
| **微信小程序** | `uni.request` / `uni.uploadFile` | 合法域名配置、请求并发限制 10 个、SSE 兼容方案 |
| **H5** | `uni.request`（底层 `fetch`） | CORS 跨域、SSE 原生支持 |
| **App** | `uni.request`（plus.net） | SSL 证书、离线缓存、plus.networkinfo |

完整端间差异与审计见 [`uniapp-crossplatform-audit-skill`](../uniapp-crossplatform-audit-skill/)。

---

## 输出文件

- `src/utils/request.ts` — 请求层入口
- `src/utils/upload.ts` — 上传封装（独立走进度回调）
- `src/utils/sse.ts` — SSE 流式封装
- `src/api/auth.ts` — Token 刷新队列示例

> 本 skill 不直接修改既有 request.ts，**用户确认差距清单后才实施改造**。

---

## 适用 vs 不适用

✅ **适用**：
- uniapp 新项目从零搭建请求层
- uniapp 老项目需要补齐 Token 刷新、SSE、上传等能力
- 跨端（小程序 / H5 / App）请求差异对齐

❌ **不适用**：
- 通用 Web/Vue/React 项目，应用 `frontend-request-skill`
- 完整登录鉴权体系设计，应用 `uniapp-components-skill`
- 跨平台兼容性审计，应用 `uniapp-crossplatform-audit-skill`

---

## 目录结构

```
uniapp-request-skill/
├── SKILL.md           # 技能定义（入口 + 触发词）
└── README.md          # 本文件
```

> 当前为入口骨架：权威规范在 `frontend-request-skill/references/uniapp-spec.md`，本 skill 仅承担入口与触发词聚合，避免内容重复。如需扩展 `references/uniapp-stream.md`、`references/uniapp-upload.md` 等专项文档，可后续补充。

---

## 维护记录

- 2026-08-27：骨架版本创建，作为 `frontend-request-skill` 在 uniapp 场景的入口。