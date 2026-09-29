// 用户列表页（Server Component —— 混合模式）

// 页面本身是 Server Component，负责数据预取
// 交互部分拆为 Client Component（UserTable）

import type { Metadata } from 'next';
import { UserTable } from './UserTable';
import type { User, ApiListResponse } from '@/types';

export const metadata: Metadata = {
  title: '用户管理',
  description: '系统用户管理页面',
};

// Server Component 可以直接 async + fetch
async function getUsers(
  page: number,
  pageSize: number
): Promise<ApiListResponse<User>> {
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:3001';

  const response = await fetch(
    `${baseUrl}/api/users?page=${page}&pageSize=${pageSize}`,
    {
      next: { revalidate: 60 }, // ISR：每 60 秒重验证
    }
  );

  if (!response.ok) {
    return { items: [], total: 0, page, pageSize };
  }

  const data = await response.json();
  return data.data;
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { page?: string; pageSize?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const pageSize = Number(searchParams.pageSize) || 10;

  const { items, total } = await getUsers(page, pageSize);

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>用户管理</h2>
      {/* Server Component 获取数据后，通过 props 传给 Client Component */}
      <UserTable initialData={items} initialTotal={total} />
    </div>
  );
}
