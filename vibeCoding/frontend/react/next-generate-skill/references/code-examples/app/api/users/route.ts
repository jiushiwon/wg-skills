// 用户列表 Route Handler —— GET /api/users, POST /api/users

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

// GET /api/users?page=1&pageSize=10&keyword=xxx
export async function GET(request: NextRequest) {
  // 验证认证
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json(
      { code: -1002, message: '未登录', data: null },
      { status: 401 }
    );
  }

  const { searchParams } = request.nextUrl;
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;
  const keyword = searchParams.get('keyword') || '';

  // TODO: 调用实际后端 API
  // const backendResponse = await fetch(
  //   `${process.env.API_BASE_URL}/users?page=${page}&pageSize=${pageSize}&keyword=${keyword}`,
  //   { headers: { Authorization: `Bearer ${token}` } }
  // );

  // 模拟数据
  const mockUsers = Array.from({ length: pageSize }, (_, i) => ({
    id: String((page - 1) * pageSize + i + 1),
    username: `user${(page - 1) * pageSize + i + 1}`,
    nickname: `用户${(page - 1) * pageSize + i + 1}`,
    email: `user${(page - 1) * pageSize + i + 1}@example.com`,
    role: i === 0 ? 'admin' : 'user',
    status: 'active' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  const filteredUsers = keyword
    ? mockUsers.filter(
        (u) =>
          u.username.includes(keyword) || u.nickname.includes(keyword)
      )
    : mockUsers;

  return NextResponse.json({
    code: 0,
    message: 'success',
    data: {
      items: filteredUsers,
      total: 100,
      page,
      pageSize,
    },
  });
}

// POST /api/users —— 创建用户
export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json(
      { code: -1002, message: '未登录', data: null },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    // 参数校验
    if (!body.username) {
      return NextResponse.json(
        { code: -1001, message: '用户名不能为空', data: null },
        { status: 400 }
      );
    }

    // TODO: 调用实际后端 API 创建用户

    return NextResponse.json({
      code: 0,
      message: 'success',
      data: {
        id: String(Date.now()),
        ...body,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      { code: -1, message: '请求参数错误', data: null },
      { status: 400 }
    );
  }
}
