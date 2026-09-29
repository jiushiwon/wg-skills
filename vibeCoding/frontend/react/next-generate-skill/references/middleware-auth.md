# 认证中间件指南

## 1. 文件位置

middleware.ts 必须放在**项目根目录**（或 `src/` 根目录，取决于是否使用 `--src-dir`）：

```
my-next-app/
├── middleware.ts          # 项目根目录
├── src/
│   └── ...
```

**不要**放在 `app/` 或 `src/app/` 内部。

## 2. 基础实现

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 需要认证的路由前缀
const PROTECTED_ROUTES = ['/dashboard', '/settings', '/users', '/profile'];

// 公开路由（无需认证）
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 读取 cookie 中的 token
  const token = request.cookies.get('token')?.value;

  // 判断是否为受保护路由
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // 判断是否为公开路由
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // 未登录 + 访问受保护路由 → 重定向到登录页
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 已登录 + 访问登录页 → 重定向到首页
  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// matcher 配置：排除静态资源
export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了：
     * - api（API Routes）
     * - _next/static（静态文件）
     * - _next/image（图片优化）
     * - favicon.ico（网站图标）
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

## 3. 高级：RBAC 角色控制

```typescript
// middleware.ts（含角色控制）
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface TokenPayload {
  role: string;
  exp: number;
}

// 简易 JWT 解码（不验证签名，中间件在 Edge Runtime 运行）
function decodeToken(token: string): TokenPayload | null {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload)) as TokenPayload;
  } catch {
    return null;
  }
}

const ROLE_ROUTES: Record<string, string[]> = {
  admin: ['/dashboard', '/settings', '/users'],
  user: ['/dashboard', '/profile'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = decodeToken(token);
  if (!payload) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }

  // 检查 token 是否过期
  if (payload.exp * 1000 < Date.now()) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }

  // 角色检查
  const allowedRoutes = ROLE_ROUTES[payload.role] || [];
  const isAllowed = allowedRoutes.some((route) => pathname.startsWith(route));

  if (!isAllowed) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}
```

## 4. Edge Runtime 兼容性

middleware.ts 在 **Edge Runtime** 中运行，有以下限制：

| 限制 | 说明 |
|------|------|
| 不能用 `node:` 模块 | 如 `fs`、`path`、`crypto`（Node.js 版本） |
| 不能用 `localStorage` | 仅浏览器环境可用 |
| 不能用 `cookies()` from `next/headers` | 用 `request.cookies` 代替 |
| 不能用 `async` 函数 | middleware 函数本身不能是 async（Next.js 14+） |
| 不能访问数据库 | 直接访问 ORM 通常不兼容 Edge |
| JWT 验证 | 用 `jose` 库（Edge 兼容）代替 `jsonwebtoken` |

**推荐**：中间件只做路由守卫（读 cookie + 重定向），复杂鉴权逻辑放到 Server Component 或 Route Handler 中。

## 5. 配置 matcher

```typescript
export const config = {
  matcher: [
    // 匹配所有路径（排除静态资源）
    '/((?!api|_next/static|_next/image|favicon.ico).*)',

    // 或者精确匹配
    // '/dashboard/:path*',
    // '/settings/:path*',
    // '/users/:path*',
  ],
};
```

## 6. 注意事项

- 中间件对每个匹配的请求都会执行，注意性能
- 不要在中间件中做耗时操作（数据库查询、外部 API 调用）
- `NextResponse.redirect()` 会自动设置 307 状态码
- `NextResponse.rewrite()` 可以透明地重写 URL（不改变地址栏）
