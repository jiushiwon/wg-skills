import { readBody, setCookie, createError } from 'h3'
import type { LoginParams, LoginResult } from '~/types/user'

export default defineEventHandler(async (event) => {
  const body = await readBody<LoginParams>(event)

  if (!body.username || !body.password) {
    throw createError({
      statusCode: 400,
      message: '用户名和密码不能为空',
    })
  }

  // 调用真实后端 API
  const config = useRuntimeConfig()
  const result = await $fetch<LoginResult>(`${config.apiBase}/auth/login`, {
    method: 'POST',
    body: {
      username: body.username,
      password: body.password,
    },
  })

  if (!result.token) {
    throw createError({
      statusCode: 401,
      message: '用户名或密码错误',
    })
  }

  // 将 token 写入 httpOnly cookie（服务端安全）
  setCookie(event, 'auth_token', result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 天
    path: '/',
  })

  setCookie(event, 'refresh_token', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 天
    path: '/',
  })

  // 返回用户信息和 token（前端 Pinia 存储用）
  return {
    code: 0,
    message: '登录成功',
    data: {
      token: result.token,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
      user: result.user,
    },
  }
})
