---
name: nodejs-backend-skill
description: Use when the user wants to generate a Node.js backend project (Express by default; NestJS when enterprise modular / decorator architecture is requested), or when routed from backend-select-skill with Node.js chosen. Follows backend-convention-skill. Triggers: "用 Node 写后端", "Express 项目", "NestJS 项目", "nodejs backend", "ts 后端", "node 骨架".
---

# Node.js Backend Skill

现场生成 Node.js 后端项目骨架。

**依赖**：backend-convention-skill（规范）、database-skill（DB）。本 skill 只写 Node.js 特定骨架与片段，规则文本不复制。

## 分支选择

- **Express（默认）**：轻量、MVP、快速启动。
- **NestJS（可选）**：用户明确要"企业模块化 / 装饰器架构 / 依赖注入"时走。

没明说就用 Express。MongoDB 仅 Express 分支支持。

## 版本获取（不写死）

优先级：本机已装版本 → 官方最新稳定/LTS → 用户可覆盖 → 写入 `versions.md`。

- Node.js：`node -v` / `npm -v`；否则 `curl https://nodejs.org/dist/index.json` 取 `lts !== false` 的最新。
- npm 包：`npm view <pkg> version`（express、typescript、typeorm、pg、mysql2、mongoose、jsonwebtoken、class-validator、eslint、prettier；NestJS 分支另取 `@nestjs/*`、`@nestjs/cli`）。

**禁止**：在 SKILL.md 写"Node 22 / Express 4.18"等具体数字。

## 生成步骤

1. 与用户确认 Express 还是 NestJS（默认 Express）。
2. 从 `spec.md` 读项目名、数据库、表前缀（默认 `wg`）。
3. Express：按 `references/skeleton-express.md`；NestJS：按 `references/skeleton-nestjs.md`。
4. 用下面最小片段生成关键文件，AI 扩写完整。
5. **落地两份强制交付物**（见下节），缺一不可。

## 强制交付物（文档）

生成项目时必须与代码**同时落地**两份文档，漏交视为生成未完成：

| 文档 | 位置 | 生成依据 |
|------|------|----------|
| 介绍 & 拓展性文档 | `docs/project-guide.md` | 按 backend-convention-skill `references/project-guide-template.md`，栈特定段按本 skill 对应 skeleton 末尾「project-guide 填充段」填 |
| 接口契约（接口 md） | 项目根目录 `api-contract.md` | 以 backend-convention-skill `references/default-api-contract.md` 为起点（已含 health/auth/users 全量接口），按 `api-contract-spec.md` 模板追加业务实体接口 |

要求：
- `project-guide.md` 第 4~10 节（接口范式/入参/出参/拦截器链路/鉴权/对接前端/错误码）不得省略，这是前端对接的最低信息量。
- `api-contract.md` 必须覆盖骨架自带接口 + 确认的全部业务实体接口，每个接口按模板写全。
- 两份文档字段细节不重复：范式进 guide，字段进 contract。

## 关键文件最小片段（Express）

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

## 关键文件最小片段（NestJS）

### 响应拦截器

```typescript
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, any> {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map(data => ({ code: 0, message: 'success', data: data ?? null })));
  }
}
```

### 异常过滤器

```typescript
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse();
    // 路由不存在(404)/方法不允许(405)是规范允许的 HTTP 状态码例外，保持原生透传，不转信封
    if (exception instanceof HttpException && [404, 405].includes(exception.getStatus())) {
      res.status(exception.getStatus()).json(exception.getResponse());
      return;
    }
    let code = -2000;
    let message = '系统繁忙，请稍后再试';
    if (exception instanceof BusinessException) {
      code = exception.getCode();
      message = exception.getMessage();
    } else if (exception instanceof HttpException) {
      code = -1001;
      message = exception.message;
    }
    res.status(200).json({ code, message, data: null });
  }
}
```

> 不加这段 404/405 透传时，`@Catch()` 会把"路由不存在"吞成 `200 + -1001`，违反 response-format.md 的"404/405 例外"红线，前端也无法区分"接口不存在"与"参数错误"。

## 验证

```bash
npm install
npm run build
npm run lint
npm run dev   # Express: ts-node-dev；NestJS: nest start --watch
curl http://localhost:8080/api/health
```

预期：`{ "code": 0, "message": "success", "data": { "status": "ok" } }`

## 不做

- NestJS 分支不引 MongoDB。
- 不加未请求的中间件。
- 不在 SKILL.md 锁定版本号。
- 不替用户提交。
