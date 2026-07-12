# Node.js + NestJS 骨架（可选分支）

用户明确要"企业模块化 / 装饰器架构"时走 NestJS 分支。版本号一律不写，由 SKILL.md 的版本获取策略动态决定。

## 依赖（package.json）

- `@nestjs/core`、`@nestjs/common`、`@nestjs/platform-express`
- `@nestjs/config`、`@nestjs/typeorm`、`@nestjs/jwt`、`@nestjs/passport`
- `typeorm`、`pg`、`mysql2`、`reflect-metadata`、`rxjs`
- `class-validator`、`class-transformer`
- `bcryptjs`、`passport`、`passport-jwt`
- dev：`@nestjs/cli`、`@nestjs/schematics`、`typescript`、`jest`、`eslint`、`prettier`

## 目录结构

```
{{project}}/
├── src/
│   ├── main.ts            # 全局管道、过滤器、拦截器、前缀
│   ├── app.module.ts      # ConfigModule + TypeOrmModule + 业务模块
│   ├── common/
│   │   ├── exceptions/    # BusinessException
│   │   ├── filters/       # HttpExceptionFilter（异常转信封）
│   │   ├── interceptors/  # TransformInterceptor（响应包装）
│   │   └── middlewares/   # 请求日志
│   └── modules/
│       ├── health/        # GET /api/health
│       ├── auth/          # JWT 登录
│       └── users/         # CRUD
│           ├── dto/
│           ├── entities/
│           ├── users.controller.ts
│           ├── users.service.ts
│           └── users.module.ts
├── test/
├── .env.example
├── .gitignore
├── docker-compose.yml     # PostgreSQL 默认
├── docker-compose.mysql.yml
├── Dockerfile
├── nest-cli.json
├── package.json
├── tsconfig.json
├── README.md
├── api-contract.md
└── versions.md
```

## 关键文件清单

| 文件 | 责任 |
|------|------|
| `src/main.ts` | `setGlobalPrefix('api')`、注册 `ValidationPipe`、`TransformInterceptor`、`HttpExceptionFilter` |
| `src/app.module.ts` | `ConfigModule.forRoot` + `TypeOrmModule.forRoot` + 业务模块 |
| `src/common/interceptors/transform.interceptor.ts` | 统一响应信封 |
| `src/common/filters/http-exception.filter.ts` | 异常转信封；404/405 原生透传，其余 `HttpException` 转 `-1001`，未识别异常转 `-2000` |
| `src/common/exceptions/business.exception.ts` | BusinessException |

## main.ts 模板

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  // CORS 策略见 backend-convention-skill env-config-guide.md（禁 *+凭证同开）
  const corsOrigins = process.env.CORS_ORIGINS || '*';
  const allowAllOrigins = corsOrigins === '*';
  app.enableCors({
    origin: allowAllOrigins ? '*' : corsOrigins.split(',').map((o) => o.trim()),
    credentials: !allowAllOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
  });
  await app.listen(process.env.APP_PORT || 8080);
}
bootstrap();
```

## 开箱即用片段

### JWT 策略

签发侧 `JwtModule.register({ secret: process.env.JWT_SECRET, signOptions: { expiresIn: parseInt(process.env.JWT_EXPIRES_IN || '86400', 10) } })`——变量名与 env-config-guide.md 统一（秒）。

```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'change-me',
    });
  }

  async validate(payload: { sub: number; username: string }) {
    return { userId: payload.sub, username: payload.username };
  }
}
```

### JWT 守卫

```typescript
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BusinessException } from '../exceptions/business.exception';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      throw new BusinessException(-1002, 'Token 无效或已过期');
    }
    return user;
  }
}
```

### 请求日志中间件

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class RequestLogMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestId = randomUUID().slice(0, 16);
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[${requestId}] ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
    });
    next();
  }
}
```

### 分页列表

```typescript
@Get()
async findAll(
  @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
) {
  const size = Math.min(pageSize, 100);
  const { users, total } = await this.usersService.findAll(page, size);
  return { page, pageSize: size, total, list: users };
}
```

## 关键约定

- 表名：`{DB_PREFIX}_user`，snake_case。
- 路由前缀：`/api`（`setGlobalPrefix`）；健康检查 `GET /api/health` 返回信封。
- 校验：`ValidationPipe`，失败由 `HttpExceptionFilter` 转 `-1001`。
- **NestJS 分支不引 MongoDB**（关系型默认 PostgreSQL / MySQL）。

## project-guide 填充段

生成 `docs/project-guide.md` 时，按 backend-convention-skill `references/project-guide-template.md` 的占位符填入以下本栈内容：

| 占位符 | 本栈填充值 |
|--------|-----------|
| `{{STACK}}` | Node.js + NestJS + TypeScript + TypeORM |
| `{{START_COMMAND}}` | `npm run start:dev` |
| `{{DIRECTORY_TREE}}` | 上文「目录结构」节 |
| `{{LAYER_RESPONSIBILITY}}` | modules 按业务域组织（controller/service/dto/entities/module）；common 放拦截器/过滤器/守卫/中间件；依赖注入贯穿各层 |
| `{{MIDDLEWARE_CHAIN}}` | `CORS → RequestLogMiddleware 日志 → ValidationPipe 校验 → JwtAuthGuard 鉴权 → Controller → Service → TransformInterceptor 信封包装 → HttpExceptionFilter 异常兜底（404/405 原生透传）` |
| `{{VALIDATION_WAY}}` | DTO 上加 class-validator 装饰器 + 全局 `ValidationPipe({ transform: true })`，失败转 `-1001` |
| `{{ENVELOPE_WAY}}` | `TransformInterceptor` 统一包装，controller 只返数据；异常由 `HttpExceptionFilter` 产出信封 |
| `{{MODULE_STEPS}}` | ① 更新 `api-contract.md` → ② `nest g module posts && nest g controller posts && nest g service posts` → ③ 建 `entities/post.entity.ts` 与 `dto/` → ④ 在 `app.module.ts` 引入 → ⑤ `npx typeorm migration:create -n AddPosts` → ⑥ `npm run build` + curl 验证 |
| `{{MIDDLEWARE_STEPS}}` | 横切逻辑按职责选 Interceptor（响应变换）/ Guard（鉴权）/ Filter（异常）/ Middleware（请求前置），全局在 `main.ts` 注册，模块级在 module 中声明 |
| `{{MIGRATION_WAY}}` | TypeORM CLI：`npx typeorm migration:create -n {Name}` → `migration:run`；生产关 `synchronize` |
| `{{EXTRA_MIDDLEWARE_WAY}}` | 按需接 Redis/Kafka，连接信息只从环境变量读，命名见 backend-convention-skill `env-config-guide.md`；本分支不引 MongoDB |
