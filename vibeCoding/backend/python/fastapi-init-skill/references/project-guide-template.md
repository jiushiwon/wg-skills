# {{PROJECT_NAME}} 项目介绍 & 拓展性文档

本文件是 `fastapi-init-skill` 生成项目的默认项目指南模板，与根目录 `api-contract.md` 配套使用：本文件管「怎么跑、怎么加功能」，契约文件管「接口字段级事实」。

## 1. 项目简介

| 项 | 值 |
|----|-----|
| 定位 | {{PROJECT_DESC}} |
| 技术栈 | Python + FastAPI + SQLAlchemy 2.0 异步 + SSE（sse-starlette）（版本见根目录 `versions.md`） |
| 数据库 | {{DATABASE}}，表前缀 `{{DB_PREFIX}}_` |
| 中间件 | {{MIDDLEWARES}}（无则写"无"） |
| 默认端口 | {{APP_PORT}}（环境变量 `APP_PORT` 可改） |

## 2. 快速开始

```bash
# 1. 安装依赖、生成 .env 并启动（首次）
./restart.sh dev

# 或手动：
cp .env.example .env          # 按需修改 DB / JWT / CORS 配置
docker run -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=app_db mysql:8.0  # 起数据库（如选择数据库）
./restart.sh dev              # 开发模式启动

curl http://localhost:{{APP_PORT}}/api/health
# 期望：{ "code": 0, "message": "success", "data": { "status": "ok" } }
```

环境变量全量说明见 `.env.example`（命名规范：APP_/DB_/JWT_/CORS_ORIGINS + 可选 REDIS_/KAFKA_/S3_）。

## 3. 目录结构

```
{{DIRECTORY_TREE}}
```

分层职责：routers 接请求返回裸数据；models 表映射（SQLAlchemy ORM）；schemas 出入参校验（Pydantic v2）；services 业务逻辑（用户/上传）；utils 工具（JWT/密码）；main 注册中间件/异常/路由/SSE/静态文件。

## 4. 接口范式

- 基础路径：所有接口挂在 `/api` 下，路由为 `/api/<资源复数>`（如 `/api/users`、`/api/orders`）。
- 方法语义：

| 方法 | 语义 | 示例 |
|------|------|------|
| GET | 查询（列表/详情），无副作用 | `GET /api/users`、`GET /api/users/1` |
| POST | 新建资源 / 登录注册等业务动作 | `POST /api/auth/login`、`POST /api/upload` |
| PUT | 全量更新 | `PUT /api/users/profile` |
| PATCH | 部分更新（预留） | `PATCH /api/users/1` |
| DELETE | 删除（默认软删除，预留） | `DELETE /api/users/1` |

- Content-Type：JSON 接口统一 `application/json`；文件上传用 `multipart/form-data`；SSE 为 `text/event-stream`。
- 字段级定义一律以根目录 `api-contract.md` 为唯一事实来源，本文件不复述。

## 5. 入参范式

| 入参位置 | 用途 | 约定 |
|----------|------|------|
| 路径参数 | 定位单个资源 | 整数 ID，如 `/api/users/{id}` |
| 查询参数 | 过滤、分页、排序 | 分页固定 `page`（从 1 起）+ `pageSize`（≤ 100）；模糊搜索用 `keyword` |
| 请求体 | 创建/更新数据 | JSON；必填/可选/校验规则见契约 |
| 请求头 | 鉴权、链路 | `Authorization: Bearer {access_token}`；可传 `X-Request-Id` 做链路串联 |

规则：
1. 校验失败统一返 `-1001`，`message` 指出首个不合法字段；前端按 message 定位表单。
2. 时间入参用 ISO 8601（如 `2026-07-10T08:00:00Z`），时区 UTC。
3. 可选字段省略即取默认值，**禁止传 `null` 占位**（契约明确允许除外）。

## 6. 出参范式

所有接口返回统一信封（HTTP 状态码一律 200，业务状态看 `code`）：

```json
{ "code": 0, "message": "success", "data": {} }
```

- `code === 0` 成功，`< 0` 失败；`data` 永远存在，无数据为 `null`。
- 列表接口 `data` 固定四字段：

```json
{ "page": 1, "pageSize": 20, "total": 100, "list": [] }
```

- 时间字段：`created_at` / `updated_at`，ISO 8601 + UTC；后端存储 snake_case，API 契约字段见 `api-contract.md`。
- 错误响应同样走信封：`{ "code": -1001, "message": "用户名不能为空", "data": null }`。

## 7. 请求生命周期（拦截器链路）

一个请求从进入到返回的处理顺序：

```
security_headers_middleware 安全头 → request_log_middleware 日志 → CORSMiddleware → 路由匹配 → get_current_user 鉴权依赖 → Pydantic v2 校验 → EnvelopeRoute 信封包装（StreamingResponse 自动透传）→ exception_handler 异常兜底
```

关键拦截器行为：

| 环节 | 行为 | 失败时 |
|------|------|--------|
| CORS | 按 `CORS_ORIGINS` 回写跨域头；`*` 时不开凭证 | 浏览器拦截 |
| 请求日志 | 生成 requestId，记录 method/path/status/耗时，回写响应头 `X-Request-Id` | - |
| 鉴权 | 校验 `Authorization: Bearer`，解析出当前用户注入上下文 | `-1002`（未登录/Token 失效） |
| 参数校验 | 请求体/查询参数用 Pydantic v2 模型 + 类型注解 + Field 约束，失败由 `RequestValidationError` handler 转 `-1001` | `-1001` |
| 业务处理 | handler/controller 只返数据或抛业务异常 | 业务异常带 `code+message` |
| 信封包装 | `EnvelopeRoute` 为唯一包装点，handler 返回裸数据；`api_response` 仅供 exception_handler 兜底；SSE/文件下载等非 JSON 响应自动透传 | - |
| 异常兜底 | 未捕获异常转 `-2000`「系统繁忙，请稍后再试」，不暴露堆栈 | `-2000` |

## 8. 鉴权范式

1. `POST /api/auth/login` 登录成功返回 `{ access_token, refresh_token, token_type }`。
2. 前端把 `access_token` 写入本地存储，后续请求在拦截器里统一加 `Authorization: Bearer {access_token}`，禁止逐接口手拼。
3. `access_token` 过期/无效返 `-1002` → 前端用 `refresh_token` 调 `POST /api/auth/refresh` 换取新 `access_token`；若 `refresh_token` 也失效，则清 token 并跳登录页。
4. SSE 等无法带 Header 的场景，可将 `access_token` 通过 URL 查询参数 `?token=` 传递。
5. 免登白名单：`/api/auth/login`、`/api/auth/register`、`/api/health`、`/api/health/db`、`/api/sse/chat`，其余接口默认需登录。

## 9. 如何对接前端

前端只需要记住三件事：**统一 baseURL、拦截器里读 `code`、`-1002` 跳登录**。

### 9.1 uni-app（小程序 / H5 / App）

```typescript
// utils/request.ts —— 与 api-contract.md 对齐的最小封装
const BASE_URL = 'http://localhost:{{APP_PORT}}/api';

export function request<T>(options: {
  url: string; method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data?: any; auth?: boolean; // auth 默认 true
}): Promise<T> {
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        ...(options.auth === false ? {} : { Authorization: `Bearer ${uni.getStorageSync('access_token') || ''}` }),
      },
      success: (res) => {
        const body = res.data as { code: number; message: string; data: T };
        if (body.code === 0) return resolve(body.data);
        if (body.code === -1002) {
          uni.removeStorageSync('access_token');
          uni.removeStorageSync('refresh_token');
          uni.navigateTo({ url: '/pages/login/index' });
        } else {
          uni.showToast({ title: body.message, icon: 'none' });
        }
        reject(body);
      },
      fail: (err) => { uni.showToast({ title: '网络异常', icon: 'none' }); reject(err); },
    });
  });
}
```

### 9.2 Web 管理端（axios）

```typescript
// utils/http.ts
import axios from 'axios';

const http = axios.create({ baseURL: 'http://localhost:{{APP_PORT}}/api' });

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (res) => {
    const body = res.data;
    if (body.code === 0) return body.data;
    if (body.code === -1002) { localStorage.removeItem('access_token'); localStorage.removeItem('refresh_token'); location.href = '/login'; }
    return Promise.reject(body);
  },
  (err) => Promise.reject({ code: -2000, message: '网络异常' }),
);
```

### 9.3 对接检查清单

- [ ] 路径/方法/字段严格按 `api-contract.md`，未声明字段不访问
- [ ] 业务成败只看 `code`，不看 HTTP 状态码
- [ ] `-1002` 清 token 跳登录；`-1001` 展示 message 定位字段；未列错误码按「系统繁忙」兜底
- [ ] 分页读 `page/pageSize/total/list` 四字段
- [ ] 时间按 UTC ISO 8601 解析，展示转本地

## 10. 错误码

| 错误码 | 含义 | 前端处理建议 |
|--------|------|--------------|
| 0 | 成功 | 正常处理 data |
| -1001 | 参数校验错误 | 展示 message 并定位字段 |
| -1002 | 未授权（未登录/Token 失效） | 清 token，跳登录页 |
| -1003 | 无权限 | 提示无权限 |
| -1004 | 资源不存在 | 展示空态/404 页 |
| -1005 | 资源冲突（重复/旧密码错误） | 提示重复操作 |
| -1006 | 频率限制 | 提示稍后重试 |
| -1031 | 请求体过大（上传文件超限） | 提示文件过大 |
| -1032 | 不支持的文件类型 | 提示更换文件格式 |
| -2000 | 内部错误 | 提示系统繁忙 |

## 11. 拓展指南

### 11.1 新增一个业务模块（以「文章 Post」为例）

1. 更新 `api-contract.md`，追加 Post 的字段、接口、错误码
2. 创建 `app/models/post.py` 定义 SQLAlchemy ORM 模型（表名 `{{DB_PREFIX}}_posts`）
3. 创建 `app/schemas/post.py` 定义 Pydantic v2 出入参模型
4. 创建 `app/services/post.py` 实现业务逻辑（CRUD、权限、复杂查询）
5. 创建 `app/routers/post.py`，使用 `APIRouter(route_class=EnvelopeRoute)` 注册路由
6. 在 `app/main.py` 中 `include_router`，路径前缀 `/api/posts`
7. 运行 `python -m compileall app` 做语法检查，再用 curl/前端联调验证

每加一个接口，**先更新 `api-contract.md`**，再写实现，最后通知前端。

### 11.2 新增中间件/拦截器

横切逻辑优先用 `@app.middleware("http")`；鉴权/权限类优先用 `Depends` 依赖注入。新增中间件后：
1. 在 `app/main.py` 中按正确顺序注册
2. 更新 `.env.example` 中相关环境变量
3. 在本文档「请求生命周期」中补充该中间件位置

### 11.3 数据库变更

开发阶段 `lifespan` 中 `create_all()` 自动建表；**生产环境必须显式迁移**（推荐使用 Alembic，迁移文件入库、可回滚）。

### 11.4 接入 Redis / Kafka / 对象存储

按需接入，连接信息只从环境变量读（REDIS_/KAFKA_/S3_），接入后同步更新 `.env.example`。

### 11.5 SSE 流式对接

使用 `sse-starlette` 的 `EventSourceResponse`，在路由中 `yield` 字典即可流式推送；前端用 `EventSource` API 接收。受保护 SSE 端点通过 URL 参数 `?token={access_token}` 传递令牌。

## 12. 相关文档

| 文档 | 用途 |
|------|------|
| `api-contract.md` | 接口契约（字段级唯一事实来源，前端强制对齐） |
| `versions.md` | 运行时/框架/数据库版本锁定 |
| `AGENTS.md` | 完整开发规范（红线、流程） |
| `.env.example` | 环境变量全量说明 |
| `references/skeleton.md` | FastAPI 脚手架生成模板（本 skill 内部参考） |
