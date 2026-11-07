# next.config.js 配置模板

## 基础配置

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ---- 图片优化 ----
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.example.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },

  // ---- 路由重写（API 代理） ----
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_BASE_URL || 'http://localhost:3001'}/api/:path*`,
      },
    ];
  },

  // ---- 响应头（安全 + CORS） ----
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' }, // 生产环境需收紧为具体域名
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },

  // ---- 实验性功能 ----
  experimental: {
    // Server Actions（Next.js 14+ 默认开启）
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // 优化 CSS
    optimizeCss: true,
  },

  // ---- 编译配置 ----
  // 输出模式：standalone（Docker 部署）或默认
  // output: 'standalone',

  // 严格模式（开发环境）
  reactStrictMode: true,

  // SWC 压缩
  swcMinify: true,
};

module.exports = nextConfig;
```

## 环境变量说明

| 变量 | 用途 | 可见范围 |
|------|------|---------|
| `API_BASE_URL` | 后端 API 地址 | 仅服务端 |
| `NEXT_PUBLIC_API_BASE_URL` | 客户端 API 地址 | 客户端 + 服务端 |
| `NEXT_PUBLIC_APP_NAME` | 应用名称 | 客户端 + 服务端 |

## Docker 部署配置

```javascript
// 需要 Docker 部署时，添加：
const nextConfig = {
  output: 'standalone',
  // ...
};
```

## ESLint 配置

```json
// .eslintrc.json
{
  "extends": ["next/core-web-vitals", "next/typescript"],
  "rules": {
    "@typescript-eslint/no-unused-vars": [
      "error",
      { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }
    ],
    "@typescript-eslint/no-explicit-any": "error",
    "no-console": ["error", { "allow": ["warn", "error"] }]
  }
}
```

## Prettier 配置

```json
// .prettierrc.json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```
