# SEO 策略指南

> Next.js App Router 提供内置的 Metadata API，无需第三方 SEO 库。

## 1. 静态 Metadata（layout.tsx）

```typescript
// app/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | MyApp',
    default: 'MyApp - 首页',
  },
  description: '我的 Next.js 全栈应用',
  keywords: ['next.js', 'react', 'typescript'],
  authors: [{ name: 'Team' }],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
  ),
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: 'MyApp',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};
```

## 2. 动态 Metadata（generateMetadata）

```typescript
// app/(dashboard)/users/[id]/page.tsx
import type { Metadata } from 'next';
import { fetchUser } from '@/lib/api/modules/user.server';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await fetchUser(params.id);

  return {
    title: `${user.nickname || user.username} - 用户详情`,
    description: `${user.nickname || user.username}的详细信息页面`,
    openGraph: {
      title: `${user.nickname || user.username}`,
      images: user.avatar ? [user.avatar] : [],
    },
  };
}

export default async function UserDetailPage({ params }: Props) {
  const user = await fetchUser(params.id);
  return <div>{/* ... */}</div>;
}
```

## 3. Open Graph / Twitter Cards

```typescript
// app/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '首页',
  description: '欢迎访问 MyApp',
  openGraph: {
    title: '首页',
    description: '欢迎访问 MyApp',
    url: 'https://example.com',
    siteName: 'MyApp',
    images: [
      {
        url: 'https://example.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MyApp',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '首页',
    description: '欢迎访问 MyApp',
    images: ['https://example.com/og-image.png'],
  },
};
```

## 4. 动态 Sitemap

```typescript
// src/app/sitemap.ts
import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 静态页面
  const staticPages = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
  ];

  // 动态页面（从数据库或 API 获取）
  try {
    const response = await fetch(`${process.env.API_BASE_URL}/api/users?page=1&pageSize=1000`);
    const data = await response.json();

    const userPages = (data.data?.items || []).map((user: { id: string; updatedAt: string }) => ({
      url: `${BASE_URL}/users/${user.id}`,
      lastModified: new Date(user.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    return [...staticPages, ...userPages];
  } catch {
    return staticPages;
  }
}
```

## 5. 动态 Robots

```typescript
// src/app/robots.ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/login'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

## 6. JSON-LD 结构化数据

```typescript
// components/JsonLd.tsx
interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

```typescript
// app/page.tsx
import { JsonLd } from '@/components/JsonLd';

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'MyApp',
    url: 'https://example.com',
    description: '我的 Next.js 全栈应用',
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      {/* ... */}
    </>
  );
}
```

## 7. SEO 检查清单

| 检查项 | 说明 |
|--------|------|
| 每个页面有 `title` | 通过 `metadata` 或 `generateMetadata` |
| 每个页面有 `description` | 150-160 字符 |
| Open Graph 图片 | 1200x630 推荐 |
| sitemap.ts 存在 | 包含所有公开页面 |
| robots.ts 存在 | 正确配置 disallow |
| JSON-LD 首页 | WebSite 类型 |
| JSON-LD 内容页 | Article / Product 等类型 |
| canonical URL | Next.js 自动生成（通过 `metadataBase`） |
