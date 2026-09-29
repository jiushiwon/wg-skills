// 根 Layout（Server Component —— 不加 'use client'）

import type { Metadata } from 'next';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { AppLayout } from '@/components/AppLayout';
import '@/styles/global.css';

export const metadata: Metadata = {
  title: {
    template: '%s | MyApp',
    default: 'MyApp',
  },
  description: '我的 Next.js 全栈应用',
  keywords: ['next.js', 'react', 'typescript'],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
  ),
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: 'MyApp',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <AntdRegistry>
          <ConfigProvider
            locale={zhCN}
            theme={{
              token: {
                colorPrimary: '#10b981',
                borderRadius: 6,
              },
            }}
          >
            <AppLayout>{children}</AppLayout>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
