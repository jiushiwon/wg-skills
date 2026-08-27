---
name: nodejs-backend-skill
description: Use when the user wants to generate a Node.js + Express backend project, or when routed from backend-select-skill with Node.js chosen. Generates a runnable scaffold on the spot following backend-convention-skill. MongoDB is generated only for this stack and Python. Triggers: "用 Node 写后端", "Express 项目", "Express 脚手架", "nodejs backend", "ts 后端", "node 骨架".
---

# Node.js Backend Skill

现场生成 Node.js + Express 后端项目骨架。

**依赖**：backend-convention-skill（规范）、database-skill（DB）。本 skill 只写 Node.js + Express 特定骨架与片段，规则文本不复制。

## 版本获取（不写死）

优先级：本机已装版本 → 官方最新稳定/LTS → 用户可覆盖 → 写入 `versions.md`。

- Node.js：`node -v` / `npm -v`；否则 `curl https://nodejs.org/dist/index.json` 取 `lts !== false` 的最新。
- npm 包：`npm view <pkg> version`（express、cors、dotenv、express-async-errors、typescript、typeorm、pg、mysql2、mongoose、jsonwebtoken、bcryptjs、class-validator、class-transformer、uuid、eslint、prettier、ts-node-dev、@types/*）。

**禁止**：在 SKILL.md 写"Node 22 / Express 4.18"等具体数字。

## 生成步骤

1. 从 `spec.md` 读项目名、数据库、表前缀（默认 `wg`）。
2. 按 `references/skeleton.md` 的目录结构建文件。
3. 用下面最小片段生成关键文件，AI 扩写完整。
4. **落地两份强制交付物**（见下节），缺一不可。

## 强制交付物（文档）

生成项目时必须与代码**同时落地**两份文档，漏交视为生成未完成：

| 文档 | 位置 | 生成依据 |
|------|------|----------|
| 介绍 & 拓展性文档 | `docs/project-guide.md` | 按 backend-convention-skill `references/project-guide-template.md`，栈特定段按本 skill `references/skeleton.md` 末尾「project-guide 填充段」填 |
| 接口契约（接口 md） | 项目根目录 `api-contract.md` | 以 backend-convention-skill `references/default-api-contract.md` 为起点（已含 health/auth/users 全量接口），按 `api-contract-spec.md` 模板追加业务实体接口 |

要求：
- `project-guide.md` 第 4~10 节（接口范式/入参/出参/拦截器链路/鉴权/对接前端/错误码）不得省略，这是前端对接的最低信息量。
- `api-contract.md` 必须覆盖骨架自带接口 + 确认的全部业务实体接口，每个接口按模板写全（描述/鉴权/参数表/请求示例/响应结构/响应示例/错误码）。
- 两份文档字段细节不重复：范式进 guide，字段进 contract。

## 关键文件最小片段

### 统一响应中间件

```typescript
export function responseWrapperMiddleware(_req: Request, res: Response, next: NextFunction) {
  const originalJson = res.json.bind(res);
  res.json = function (data: any) {
    if (res.headersSent || (res as any).__wrapped) return originalJson(data);
    // 已是信封（errorHandler 等唯一包装点外的兜底出口）直接透传，禁止双包
    if (data && typeof data === 'object' && 'code' in data && 'message' in data) return originalJson(data);
    (res as any).__wrapped = true;
    return originalJson({ code: 0, message: 'success', data: data ?? null });
  };
  next();
}
```

> 注意注册顺序：`responseWrapperMiddleware` 在路由前、`errorHandlerMiddleware` 在最后。错误处理器调 `res.json({code, message, data})` 时必然经过上面的 patch，因此"已是信封则透传"这道判断是硬性要求，漏掉会把错误响应包成 `{code:0, data:{code:-1001,...}}`。

### 错误处理中间件

```typescript
export function errorHandlerMiddleware(err: any, _req: Request, res: Response, _next: NextFunction) {
  let code: number;
  let message: string;
  if (err instanceof BusinessException) {
    code = err.getCode();
    message = err.getMessage();
  } else if (err instanceof ValidationError || (Array.isArray(err) && err[0] instanceof ValidationError)) {
    const errors = Array.isArray(err) ? err : [err];
    code = -1001;
    message = (Object.values(errors[0].constraints || {})[0] as string | undefined) || '参数校验错误';
  } else {
    console.error('Unhandled error:', err);
    code = -2000;
    message = '系统繁忙，请稍后再试';
  }
  res.status(200).json({ code, message, data: null });
}
```

### app.ts 注册顺序硬约束

`app.ts` 必须按以下顺序 `app.use`：

```
cors → express.json() → requestLogMiddleware → responseWrapperMiddleware → 路由 → errorHandlerMiddleware
```

- `responseWrapperMiddleware` 必须在路由前：路由处理完后才能拦截 `res.json`。
- `errorHandlerMiddleware` 必须 4 参数且最后注册：Express 靠 arity 识别错误处理中间件，前面任何中间件 throw 都会落到这里。
- 错误处理内部调 `res.json({code, message, data})` 会再次经过响应包装 patch，"已是信封则透传"那行判断是双包防御，漏写就违规。

## 标准能力清单

生成项目必须内置以下能力，完整片段见 `references/skeleton.md` 的"开箱即用片段"节：

| 能力 | 关键文件 |
|------|----------|
| 统一响应 `{ code, message, data }` | `src/common/middlewares/response-wrapper.middleware.ts` |
| 全局异常（-1001 / -2000） | `src/common/middlewares/error-handler.middleware.ts` + `src/common/exceptions/business.exception.ts` |
| JWT 签发 / 验证 / 当前用户注入 | `src/common/utils/auth.util.ts` + `src/common/middlewares/auth.middleware.ts` |
| 请求日志（requestId / method / path / status / duration） | `src/common/middlewares/request-log.middleware.ts` |
| 参数校验 | `class-validator`，失败由 errorHandler 转 `-1001` |
| 分页列表 `{ page, pageSize, total, list }` | `src/modules/users/user.controller.ts` 的 `listUsers` |
| CORS | `src/app.ts` 的 `cors(...)` 配置 |
| 密码 bcrypt hash | `bcryptjs`（`src/modules/users/user.service.ts`） |
| 健康检查 `/api/health` | `src/modules/health/health.routes.ts` |
| Docker / docker-compose | `Dockerfile` + `docker-compose.yml` |
| 介绍 & 拓展性文档 | `docs/project-guide.md`（强制交付物，见上节） |
| api-contract.md（接口 md） | 项目根目录，以 convention `default-api-contract.md` 为起点按 `api-contract-spec.md` 补全 |

## 验证

```bash
npm install
npm run build
npm run dev   # ts-node-dev
curl http://localhost:8080/api/health
```

预期：`{ "code": 0, "message": "success", "data": { "status": "ok" } }`

## 不做

- **Express-only**：不引其他框架（NestJS / Koa / Fastify）。要企业级模块化请改用 java-backend-skill。
- MongoDB 仅本栈（与 Python 栈同），关系型默认 PostgreSQL / MySQL；详见 `references/skeleton.md` 的「依赖」节。
- 不加未请求的中间件；Redis / Kafka 等按需接入，变量见 backend-convention-skill `env-config-guide.md`。
- 不在 SKILL.md 锁定版本号（生成物 `versions.md` 写实际值；本 skill 不维护 boilerplate 与版本锁定文件，骨架现场生成）。
- 不替用户提交。