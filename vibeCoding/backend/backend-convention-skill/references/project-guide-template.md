# 项目介绍 & 拓展性文档模板（project-guide.md）

生成后端项目时，按本模板在**项目根目录 `docs/project-guide.md`** 落地一份介绍 & 拓展性文档。`{{...}}` 为占位符，栈特定段落（拦截器链路、启动命令、加模块步骤）由各后端 skill 的 `references/skeleton.md` 末尾「project-guide 填充段」提供，通用段落按本模板原文填写。

> 定位：这份文档回答「这个项目用什么做的、怎么跑起来、怎么对接前端、怎么加功能」。`api-contract.md` 管接口字段级事实，本文件管使用与拓展范式，两者不重复。

---

```markdown
# {{PROJECT_NAME}} 项目介绍 & 拓展性文档

## 1. 项目简介

| 项 | 值 |
|----|-----|
| 定位 | {{PROJECT_DESC}} |
| 技术栈 | {{STACK}}（版本见根目录 `versions.md`） |
| 数据库 | {{DATABASE}}，表前缀 `{{DB_PREFIX}}_` |
| 中间件 | {{MIDDLEWARES}}（无则写"无"） |
| 默认端口 | {{APP_PORT}}（环境变量 `APP_PORT` 可改） |

## 2. 快速开始

```bash
cp .env.example .env          # 按需修改 DB / JWT / CORS 配置
docker-compose up -d          # 起数据库
{{START_COMMAND}}             # 启动服务
curl http://localhost:{{APP_PORT}}/api/health
# 期望：{ "code": 0, "message": "success", "data": { "status": "ok" } }
```

环境变量全量说明见 `.env.example`（命名规范统一：APP_/DB_/JWT_/CORS_ORIGINS + 可选 REDIS_/KAFKA_/S3_）。

## 3. 目录结构

```
{{DIRECTORY_TREE}}
```

分层职责：{{LAYER_RESPONSIBILITY}}

## 4. 接口范式

- 基础路径：所有接口挂在 `/api` 下，路由为 `/api/<资源复数>`（如 `/api/users`、`/api/orders`）。
- 方法语义：

| 方法 | 语义 | 示例 |
|------|------|------|
| GET | 查询（列表/详情），无副作用 | `GET /api/users`、`GET /api/users/1` |
| POST | 新建资源 | `POST /api/users` |
| PUT | 全量更新 | `PUT /api/users/1` |
| PATCH | 部分更新 | `PATCH /api/users/1` |
| DELETE | 删除（默认软删除） | `DELETE /api/users/1` |

- Content-Type：JSON 接口统一 `application/json`；文件上传用 `multipart/form-data`。
- 字段级定义一律以根目录 `api-contract.md` 为唯一事实来源，本文件不复述。

## 5. 入参范式

| 入参位置 | 用途 | 约定 |
|----------|------|------|
| 路径参数 | 定位单个资源 | 整数 ID 或 UUID，如 `/api/users/{id}` |
| 查询参数 | 过滤、分页、排序 | 分页固定 `page`（从 1 起）+ `pageSize`（≤ 100）；模糊搜索用 `keyword` |
| 请求体 | 创建/更新数据 | JSON；必填/可选/校验规则见契约 |
| 请求头 | 鉴权、链路 | `Authorization: Bearer {token}`；可传 `X-Request-Id` 做链路串联 |

规则：
1. 校验失败统一返 `-1001`，`message` 指出首个不合法字段；前端按 message 定位表单。
2. 时间入参用 ISO 8601（如 `2026-07-10T08:00:00Z`），时区 UTC。
3. 可选字段省略即取默认值，**禁止传 `null` 占位**（契约明确允许除外）。

## 6. 出参范式

所有接口返回统一信封（HTTP 状态码一律 200，业务状态看 `code`）：

```json
{ "code": 0, "message": "success", "data": {} }
```

- `code >= 0` 成功，`< 0` 失败；`data` 永远存在，无数据为 `null`。
- 列表接口 `data` 固定四字段：

```json
{ "page": 1, "pageSize": 20, "total": 100, "list": [] }
```

- 时间字段：`createdAt` / `updatedAt`，ISO 8601 + UTC，前端展示时转本地时区。
- 枚举字段：取值是闭集，全集见 `api-contract.md` 第 3 节「枚举字典」，前端不得自造枚举值。
- 错误响应同样走信封：`{ "code": -1001, "message": "用户名不能为空", "data": null }`。

## 7. 请求生命周期（拦截器链路）

一个请求从进入到返回的处理顺序：

```
{{MIDDLEWARE_CHAIN}}
```

关键拦截器行为：

| 环节 | 行为 | 失败时 |
|------|------|--------|
| CORS | 按 `CORS_ORIGINS` 回写跨域头；`*` 时不开凭证 | 浏览器拦截 |
| 请求日志 | 生成 requestId，记录 method/path/status/耗时，回写响应头 `X-Request-Id` | - |
| 鉴权 | 校验 `Authorization: Bearer`，解析出当前用户注入上下文 | `-1002`（未登录/Token 失效） |
| 参数校验 | {{VALIDATION_WAY}} | `-1001` |
| 业务处理 | handler/controller 只返数据或抛业务异常 | 业务异常带 `code+message` |
| 信封包装 | {{ENVELOPE_WAY}}（唯一包装点） | - |
| 异常兜底 | 未捕获异常转 `-2000`「系统繁忙，请稍后再试」，不暴露堆栈 | `-2000` |

## 8. 鉴权范式

1. `POST /api/auth/login` 登录成功返回 `{ token, expiresIn, user }`。
2. 前端把 `token` 写入本地存储，后续请求在拦截器里统一加 `Authorization: Bearer {token}`，禁止逐接口手拼。
3. Token 过期/无效返 `-1002` → 前端清 token 并跳登录页；已登录但无权限返 `-1003`。
4. 免登白名单：`/api/auth/login`、`/api/auth/register`、`/api/health`，其余接口默认需登录。

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
        ...(options.auth === false ? {} : { Authorization: `Bearer ${uni.getStorageSync('token') || ''}` }),
      },
      success: (res) => {
        const body = res.data as { code: number; message: string; data: T };
        if (body.code >= 0) return resolve(body.data);
        if (body.code === -1002) {           // 未登录/Token 失效
          uni.removeStorageSync('token');
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
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (res) => {
    const body = res.data;
    if (body.code >= 0) return body.data;
    if (body.code === -1002) { localStorage.removeItem('token'); location.href = '/login'; }
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
| -1 | 通用失败 | 展示 message |
| -1001 | 参数校验错误 | 展示 message 并定位字段 |
| -1002 | 未授权（未登录/Token 失效） | 清 token，跳登录页 |
| -1003 | 无权限 | 提示无权限 |
| -1004 | 资源不存在 | 展示空态/404 页 |
| -1005 | 资源冲突（重复） | 提示重复操作 |
| -1006 | 频率限制 | 提示稍后重试 |
| -2000 | 内部错误 | 提示系统繁忙 |

## 11. 拓展指南

### 11.1 新增一个业务模块（以「文章 Post」为例）

{{MODULE_STEPS}}

每加一个接口，**先更新 `api-contract.md`**，再写实现，最后通知前端。

### 11.2 新增中间件/拦截器

{{MIDDLEWARE_STEPS}}

### 11.3 数据库变更

开发期可用 ORM 自动建表；**生产必须显式迁移**（迁移文件入库、可回滚）：{{MIGRATION_WAY}}

### 11.4 接入 Redis / Kafka / 对象存储

按需接入，连接信息只从环境变量读（REDIS_/KAFKA_/S3_），接入后同步更新 `.env.example`：{{EXTRA_MIDDLEWARE_WAY}}

## 12. 相关文档

| 文档 | 用途 |
|------|------|
| `api-contract.md` | 接口契约（字段级唯一事实来源，前端强制对齐） |
| `versions.md` | 运行时/框架/数据库版本锁定 |
| `AGENTS.md` | 完整开发规范（红线、流程） |
| `.env.example` | 环境变量全量说明 |
```

---

## 占位符填写指引

| 占位符 | 来源 |
|--------|------|
| `{{PROJECT_NAME}}` `{{PROJECT_DESC}}` `{{DATABASE}}` `{{DB_PREFIX}}` `{{MIDDLEWARES}}` | `spec.md` |
| `{{STACK}}` `{{START_COMMAND}}` `{{DIRECTORY_TREE}}` `{{LAYER_RESPONSIBILITY}}` `{{MIDDLEWARE_CHAIN}}` `{{VALIDATION_WAY}}` `{{ENVELOPE_WAY}}` `{{MODULE_STEPS}}` `{{MIDDLEWARE_STEPS}}` `{{MIGRATION_WAY}}` `{{EXTRA_MIDDLEWARE_WAY}}` | 各后端 skill `references/skeleton.md` 末尾「project-guide 填充段」 |
| `{{APP_PORT}}` | `.env.example`（默认 8080） |

## 红线

1. 生成本文件时**不得省略第 4~10 节**（接口范式/入参/出参/拦截器/鉴权/对接前端），这是前端对接的最低信息量。
2. 接口字段细节写 `api-contract.md`，本文件只写范式，禁止两边重复字段表导致漂移。
3. 错误码表必须与 `response-format.md` 一致，新增错误码先改规范再同步本文件。
