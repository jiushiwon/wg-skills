import { defineStore } from 'pinia'
import type { User, LoginParams, LoginResult } from '~/types/user'

export const useUserStore = defineStore('user', () => {
  // --------------- State ---------------
  const token = useCookie('auth_token', { maxAge: 60 * 60 * 24 * 7 })
  const refreshToken = useCookie('refresh_token', { maxAge: 60 * 60 * 24 * 30 })
  const user = useState<User | null>('current_user', () => null)

  // --------------- Getters ---------------
  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  // --------------- Actions ---------------
  async function login(params: LoginParams): Promise<void> {
    const { data } = await useFetch<LoginResult>('/api/auth/login', {
      method: 'POST',
      body: params,
    })

    if (!data.value) {
      throw createError({ statusCode: 401, message: '登录失败' })
    }

    token.value = data.value.token
    refreshToken.value = data.value.refreshToken
    user.value = data.value.user
  }

  async function fetchUserInfo(): Promise<void> {
    if (!token.value) return

    const { data } = await useFetch<User>('/api/auth/me', {
      headers: { Authorization: `Bearer ${token.value}` },
    })

    if (data.value) {
      user.value = data.value
    }
  }

  function logout(): void {
    token.value = null
    refreshToken.value = null
    user.value = null
    navigateTo('/login')
  }

  return {
    token,
    refreshToken,
    user,
    isLoggedIn,
    isAdmin,
    login,
    fetchUserInfo,
    logout,
  }
})
