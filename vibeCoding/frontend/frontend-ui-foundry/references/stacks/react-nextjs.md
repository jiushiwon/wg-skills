# 技术栈：React + Next.js

最主流的全栈 React 框架。App Router 默认。

---

## 项目结构（App Router）

```
project/
├── app/
│   ├── layout.tsx              # 根布局
│   ├── page.tsx                # 首页
│   ├── globals.css             # 全局样式（含 tokens.css 引入）
│   ├── (marketing)/            # 营销页路由组
│   │   ├── pricing/page.tsx
│   │   └── about/page.tsx
│   ├── (dashboard)/            # 后台路由组（独立 layout）
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── settings/page.tsx
│   └── api/                    # API 路由
├── components/
│   ├── ui/                     # 基础组件（Button、Card、Input）
│   ├── features/               # 业务组件
│   └── layout/                 # 布局组件（Header、Footer、Sidebar）
├── lib/
│   ├── utils.ts                # cn() 等工具
│   └── api.ts
├── hooks/
├── public/
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 初始化

```bash
npx create-next-app@latest my-app \
  --typescript --tailwind --app --src-dir=false \
  --import-alias "@/*" --use-npm

cd my-app
npm install @radix-ui/react-* lucide-react class-variance-authority clsx tailwind-merge
```

## Tailwind 配置

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss';
import { tokens } from './lib/tokens';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: tokens.colors,
      fontFamily: tokens.fonts,
      // ...
    },
  },
  plugins: [],
};

export default config;
```

## 根布局

```tsx
// app/layout.tsx
import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: { default: '项目名', template: '%s | 项目名' },
  description: '...',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafaf5' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-dvh bg-surface text-on-surface antialiased">
        {children}
      </body>
    </html>
  );
}
```

## cn 工具

```ts
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## 基础组件

```tsx
// components/ui/button.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary-hover',
        secondary: 'bg-surface-tinted text-on-surface hover:bg-border',
        ghost: 'hover:bg-surface-tinted',
        danger: 'bg-error text-error-foreground hover:opacity-90',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = 'Button';
```

## 页面

```tsx
// app/page.tsx
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="container py-24">
      <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
        让设计 <em className="italic">重新</em> 有趣
      </h1>
      <p className="mt-6 text-xl text-on-surface-muted max-w-2xl">
        把 6 周的工作量压缩到 6 分钟。
      </p>
      <div className="mt-8 flex gap-4">
        <Button size="lg">立即开始</Button>
        <Button size="lg" variant="ghost">观看演示</Button>
      </div>
    </main>
  );
}
```

## 暗色模式切换

```tsx
// components/theme-toggle.tsx
'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    setTheme(stored ?? prefers);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="rounded-md p-2 hover:bg-surface-tinted"
      aria-label="切换主题"
    >
      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
}
```

## 数据获取

```tsx
// app/dashboard/page.tsx
async function getData() {
  const res = await fetch('https://api.example.com/data', {
    next: { revalidate: 60 },  // ISR
  });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export default async function DashboardPage() {
  const data = await getData();
  return <div>{data.value}</div>;
}
```

## 关键约定

- **Server Components 默认**，需要交互才 `'use client'`
- **不直接 fetch**，用 React Query / SWR（客户端）或 Server Actions
- **图片**用 `next/image`
- **字体**用 `next/font`（自动子集化）
- **不引入状态管理库**直到必要（先用 useState / useReducer）

## 适用场景

- ✅ SaaS 产品
- ✅ 营销网站
- ✅ 后台系统
- ✅ 国际化项目
- ✅ SEO 重要的内容站

## 优化建议

- **图片**：`<Image>` 自动优化
- **字体**：`next/font` + display: swap
- **代码分割**：动态 `import()`
- **预取**：`<Link prefetch>`
- **缓存**：`revalidate` + `unstable_cache`
- **Server Components**：默认 RSC 减包体积

## 验证清单

- [ ] Server Components 默认
- [ ] next/image 用于图片
- [ ] next/font 加载字体
- [ ] viewport themeColor 配置
- [ ] 路由组（marketing / dashboard）分离
- [ ] 减弱动效模式
- [ ] 触摸目标 ≥44pt
- [ ] 暗色模式支持
- [ ] 没有 AI slop
