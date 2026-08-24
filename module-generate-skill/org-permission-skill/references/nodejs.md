# org-permission-skill — Node.js (Express / NestJS) 实现要点

骨架已有的（auth-skill / nodejs-backend-skill 生成，**不要重写**）：JWT 中间件注入当前用户、信封拦截器、`BizError`、全局异常、Redis 客户端。本模块只补权限业务。默认 Express；NestJS 用 Guard，逻辑不变。

## 新增依赖

无（复用骨架的 Redis 与 Prisma/TypeORM）。

## 关键文件（Express 布局）

| 文件 | 职责 |
|------|------|
| `src/models/perm.ts` | `Dept` / `Role` / `Permission` / 三个关联（Prisma 或 TypeORM） |
| `src/middleware/requirePerm.ts` | 中间件工厂 `requirePerm("user:add")`，校验当前用户 perms |
| `src/services/permCacheService.ts` | 计算并缓存 `perm:user:{userId}`，变更时失效 |
| `src/services/dataScope.ts` | 数据权限唯一拼接点：按 scope 生成查询条件 |
| `src/controllers/deptController.ts` 等 4 个 controller | 参数校验（zod）+ 调 service，返回裸数据 |

## 关键片段

### 权限校验中间件（Express）

```ts
import type { RequestHandler } from 'express';

export const requirePerm = (perm: string): RequestHandler =>
  async (req, _res, next) => {
    const user = (req as any).currentUser;             // 骨架注入
    if (!user) return next(new BizError(-1002, '未登录'));
    if (await permCache.isAdmin(user.id)) return next(); // 超管唯一判断点
    const perms = await permCache.getPerms(user.id);
    if (!perms.includes(perm)) return next(new BizError(-1003, '无权限'));
    next();
  };

// 路由注册：
router.post('/api/user', requirePerm('user:add'), userController.create);
```

NestJS 版：把同样逻辑写进 `PermGuard implements CanActivate`，用 `@SetMetadata('perm', 'user:add')` + `Reflector` 取所需标识，`canActivate` 里超管放行、校验集合，无权限抛 `BizError(-1003)`。

### 数据权限过滤拼接（唯一拼接点，Prisma）

```ts
export function applyDataScope(userId: number): Record<string, unknown> {
  const ds = permCache.getDataScope(userId); // { scope, deptIds, userDeptId, userDeptAncestors }
  switch (ds.scope) {
    case 1: return {};                                   // 全部，不加条件
    case 2: return { deptId: { in: ds.deptIds } };       // 自定义部门
    case 3: return { deptId: ds.userDeptId };            // 本部门
    case 4: return {                                     // 本部门及子部门
      OR: [
        { deptId: ds.userDeptId },
        { dept: { ancestors: { startsWith: `${ds.userDeptAncestors},${ds.userDeptId},` } } },
      ],
    };
    case 5: return { createdBy: userId };                // 仅本人
    default: return {};
  }
}
// 用法：prisma.user.findMany({ where: { ...applyDataScope(userId), name: { contains: q } } })
```

### 权限树构建（递归）

```ts
interface PermNode extends Permission { children: PermNode[]; }

export function buildTree(all: Permission[], parentId = 0): PermNode[] {
  return all
    .filter((p) => p.parentId === parentId)
    .sort((a, b) => a.sort - b.sort)
    .map((p) => ({ ...p, children: buildTree(all, p.id) }));
}
```

## 坑位

- `ancestors` 匹配严格子树务必带尾部 `,`（`startsWith: path + ','`），否则 `0,1` 误中 `0,12`；Prisma 无 `LIKE`，用 `startsWith` 或 `$queryRaw`。
- 移动部门必须在 `prisma.$transaction` 内级联刷新所有子孙 `ancestors`，漏一条子树查询就错。
- 权限缓存失效按影响面批量删（ioredis `scan` + `del`，或维护反向索引），改角色权限别只删一个用户的 key。
- `buildTree` 递归前先按 `parentId` 分组成 `Map` 再建树，避免 O(n²)；`sort` 只排当前层。
- 中间件里校验失败要 `return next(err)` 把错误交给全局异常处理器包信封，禁止在中间件里 `res.json` 手写响应。
