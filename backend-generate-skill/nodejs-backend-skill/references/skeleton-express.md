# Node.js + Express 骨架（默认分支）

生成 Express 项目时按本骨架现场写代码。版本号一律不写，由 SKILL.md 的版本获取策略动态决定。

## 依赖（package.json）

关系型：
- `express`、`cors`、`dotenv`、`express-async-errors`（Express 4 把 async handler 异常抛给错误中间件；Express 5 原生支持可不加）
- `typeorm`、`pg`、`mysql2`、`reflect-metadata`
- `class-validator`、`class-transformer`
- `bcryptjs`、`jsonwebtoken`、`uuid`
- dev：`typescript`、`ts-node-dev`、`eslint`、`@typescript-eslint/*`、`@types/*`

MongoDB 变体（替换 TypeORM）：
- `mongoose`

## 目录结构

```
{{project}}/
├── src/
│   ├── server.ts          # 入口（bootstrap）
│   ├── app.ts             # Express 应用配置、中间件注册
│   ├── config/
│   │   └── data-source.ts # TypeORM DataSource（或 mongoose 连接）
│   ├── common/
│   │   ├── exceptions/    # BusinessException
│   │   ├── middlewares/   # 响应包装、错误、日志、JWT
│   │   └── utils/         # auth.util 等
│   └── modules/
│       ├── health/        # GET /api/health
│       ├── auth/          # 注册/登录
│       └── users/         # CRUD
│           ├── user.entity.ts (或 user.model.ts)
│           ├── user.dto.ts
│           ├── user.service.ts
│           ├── user.controller.ts
│           └── user.routes.ts
├── .env.example
├── .gitignore
├── docker-compose.yml     # PostgreSQL 默认
├── docker-compose.mysql.yml
├── Dockerfile
├── package.json
├── tsconfig.json
├── README.md
├── api-contract.md
└── versions.md
```

## 关键文件清单

| 文件 | 责任 |
|------|------|
| `src/server.ts` | 启动入口，初始化数据源，监听端口 |
| `src/app.ts` | 注册 cors/json/日志/响应包装/错误处理中间件，挂载路由 |
| `src/common/middlewares/response-wrapper.middleware.ts` | 统一响应信封 |
| `src/common/middlewares/error-handler.middleware.ts` | 异常转信封；仅 `ValidationError` 转 `-1001`，其他非业务异常转 `-2000` |
| `src/common/exceptions/business.exception.ts` | BusinessException |
| `src/config/data-source.ts` | TypeORM DataSource，postgres/mysql 二选一 |
| `src/modules/users/*` | User CRUD 示例 |

## app.ts 模板

```typescript
import 'reflect-metadata';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';

import { AppDataSource } from './config/data-source';
import { requestLogMiddleware } from './common/middlewares/request-log.middleware';
import { responseWrapperMiddleware } from './common/middlewares/response-wrapper.middleware';
import { errorHandlerMiddleware } from './common/middlewares/error-handler.middleware';
import healthRoutes from './modules/health/health.routes';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';

const app = express();
// CORS 策略见 backend-convention-skill env-config-guide.md（禁 *+凭证同开）
const corsOrigins = process.env.CORS_ORIGINS || '*';
const allowAllOrigins = corsOrigins === '*';
app.use(cors({
  origin: allowAllOrigins ? '*' : corsOrigins.split(',').map((o) => o.trim()),
  credentials: !allowAllOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type', 'X-Request-Id'],
  exposedHeaders: ['X-Request-Id'],
}));
app.use(express.json());
app.use(requestLogMiddleware);
app.use(responseWrapperMiddleware);

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use(errorHandlerMiddleware);

export { app };
```

## 开箱即用片段

### JWT 工具

```typescript
import jwt from 'jsonwebtoken';

// 变量名与 backend-convention-skill env-config-guide.md 统一：JWT_SECRET + JWT_EXPIRES_IN（秒）
const SECRET = process.env.JWT_SECRET || 'change-me';
const EXPIRES_IN = parseInt(process.env.JWT_EXPIRES_IN || '86400', 10);

export function signToken(payload: { userId: number; username: string }): string {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token: string): { userId: number; username: string } {
  return jwt.verify(token, SECRET) as { userId: number; username: string };
}
```

### JWT 中间件

```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth.util';
import { BusinessException } from '../exceptions/business.exception';

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new BusinessException(-1002, '未登录');
  }
  try {
    const payload = verifyToken(header.substring(7));
    (req as any).currentUserId = payload.userId;
    next();
  } catch {
    throw new BusinessException(-1002, 'Token 无效或已过期');
  }
}
```

### 请求日志中间件

```typescript
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export function requestLogMiddleware(req: Request, res: Response, next: NextFunction) {
  const requestId = randomUUID().slice(0, 16);
  const start = Date.now();
  (req as any).requestId = requestId;
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${requestId}] ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
}
```

### 分页列表

```typescript
export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize as string, 10) || 20, 100);
    const { users, total } = await userService.findAllUsers(page, pageSize);
    res.json({ page, pageSize, total, list: users });
  } catch (err) {
    next(err);
  }
}
```

## 关键约定

- 表名：`{DB_PREFIX}_user`，snake_case。
- 路由前缀：`/api`；健康检查 `GET /api/health` 返回信封。
- 校验：`class-validator`，失败由 errorHandler 转 `-1001`。
- MongoDB：选 MongoDB 时用 `mongoose`（仅 Express 分支支持，NestJS 分支不引 MongoDB）。

## project-guide 填充段

生成 `docs/project-guide.md` 时，按 backend-convention-skill `references/project-guide-template.md` 的占位符填入以下本栈内容：

| 占位符 | 本栈填充值 |
|--------|-----------|
| `{{STACK}}` | Node.js + Express + TypeScript + TypeORM（MongoDB 时为 Mongoose） |
| `{{START_COMMAND}}` | `npm run dev` |
| `{{DIRECTORY_TREE}}` | 上文「目录结构」节 |
| `{{LAYER_RESPONSIBILITY}}` | modules 按业务域组织（entity/dto/service/controller/routes）；controller 接请求返数据；service 业务逻辑；common 信封/异常/中间件/工具 |
| `{{MIDDLEWARE_CHAIN}}` | `cors → express.json → requestLogMiddleware 日志 → responseWrapperMiddleware 信封包装 → 路由（authMiddleware 鉴权 → class-validator 校验 → controller/service）→ errorHandlerMiddleware 异常兜底（必须最后注册）` |
| `{{VALIDATION_WAY}}` | DTO 上加 class-validator 装饰器，controller 中校验，失败由 errorHandler 转 `-1001` |
| `{{ENVELOPE_WAY}}` | `responseWrapperMiddleware` 拦截 `res.json` 统一包装（已是信封则透传，禁双包）；路由在包装之后、错误处理在最后，顺序不可乱 |
| `{{MODULE_STEPS}}` | ① 更新 `api-contract.md` → ② `src/modules/posts/` 下建 `post.entity.ts`、`post.dto.ts`、`post.service.ts`、`post.controller.ts`、`post.routes.ts` → ③ `app.ts` 挂载 `app.use('/api/posts', postRoutes)` → ④ `npx typeorm migration:create -n AddPosts` → ⑤ `npm run build` + curl 验证 |
| `{{MIDDLEWARE_STEPS}}` | 写 `(req, res, next) => {}` → `app.ts` 中按序 `app.use`；错误处理中间件（4 参数）必须保持最后注册 |
| `{{MIGRATION_WAY}}` | TypeORM CLI：`npx typeorm migration:create -n {Name}` → `migration:run`；生产关 `synchronize` |
| `{{EXTRA_MIDDLEWARE_WAY}}` | 按需接 Redis/Kafka/Mongoose，连接信息只从环境变量读，命名见 backend-convention-skill `env-config-guide.md` |
