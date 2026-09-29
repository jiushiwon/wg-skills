import { getQuery, getCookie, createError } from 'h3'
import type { UserListParams, User } from '~/types/user'
import type { ApiResponse, ApiListResponse } from '~/types/api'

export default defineEventHandler(async (event) => {
  // 验证认证
  const token = getCookie(event, 'auth_token')
  if (!token) {
    throw createError({ statusCode: 401, message: '未登录' })
  }

  // 解析查询参数
  const query = getQuery(event)
  const params: UserListParams = {
    page: Number(query.page) || 1,
    pageSize: Number(query.pageSize) || 10,
    keyword: (query.keyword as string) || undefined,
    role: (query.role as User['role']) || undefined,
    status: (query.status as User['status']) || undefined,
  }

  // 调用真实后端 API
  const config = useRuntimeConfig()
  const result = await $fetch<ApiResponse<ApiListResponse<User>>>(
    `${config.apiBase}/users`,
    {
      method: 'GET',
      params,
      headers: { Authorization: `Bearer ${token}` },
    },
  )

  return result
})
