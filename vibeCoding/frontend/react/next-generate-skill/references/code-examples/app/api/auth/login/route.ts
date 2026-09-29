// 登录 Route Handler —— POST /api/auth/login

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface LoginBody {
  username: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as LoginBody;
    const { username, password } = body;

    // 参数校验
    if (!username || !password) {
      return NextResponse.json(
        { code: -1001, message: '用户名和密码不能为空', data: null },
        { status: 400 }
      );
    }

    // TODO: 调用实际后端 API 进行认证
    // const backendResponse = await fetch(`${process.env.API_BASE_URL}/auth/login`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ username, password }),
    // });

    // 模拟认证逻辑
    if (username === 'admin' && password === '123456') {
      const mockUser = {
        id: '1',
        username: 'admin',
        nickname: '管理员',
        role: 'admin',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const response = NextResponse.json({
        code: 0,
        message: 'success',
        data: {
          token: 'mock-jwt-token-' + Date.now(),
          refreshToken: 'mock-refresh-token-' + Date.now(),
          user: mockUser,
        },
      });

      // 设置 httpOnly cookie（服务端安全存储）
      response.cookies.set('token', 'mock-jwt-token-' + Date.now(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 天
        path: '/',
      });

      response.cookies.set(
        'refreshToken',
        'mock-refresh-token-' + Date.now(),
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30, // 30 天
          path: '/',
        }
      );

      return response;
    }

    // 认证失败
    return NextResponse.json(
      { code: -1002, message: '用户名或密码错误', data: null },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { code: -1, message: '服务器内部错误', data: null },
      { status: 500 }
    );
  }
}
