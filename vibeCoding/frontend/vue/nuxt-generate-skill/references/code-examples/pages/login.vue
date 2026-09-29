<script setup lang="ts">
import { useUserStore } from '~/stores/user'
import type { LoginParams } from '~/types/user'

definePageMeta({
  layout: false,
})

useHead({
  title: '登录',
})

const userStore = useUserStore()
const router = useRouter()

const form = reactive<LoginParams>({
  username: '',
  password: '',
})

const loading = ref(false)
const errorMessage = ref('')

async function handleLogin(): Promise<void> {
  if (!form.username || !form.password) {
    errorMessage.value = '请输入用户名和密码'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    await userStore.login(form)
    router.push('/')
  } catch (error: unknown) {
    const err = error as { data?: { message?: string } }
    errorMessage.value = err?.data?.message || '登录失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <h1 class="login-card__title">系统登录</h1>
      <p class="login-card__subtitle">请输入账号密码</p>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="login-form__field">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            placeholder="请输入用户名"
            autocomplete="username"
          />
        </div>

        <div class="login-form__field">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            autocomplete="current-password"
          />
        </div>

        <p v-if="errorMessage" class="login-form__error">{{ errorMessage }}</p>

        <button type="submit" class="login-form__submit" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f0f2f5;
}

.login-card {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.login-card__title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 4px;
}

.login-card__subtitle {
  color: #999;
  margin-bottom: 32px;
}

.login-form__field {
  margin-bottom: 20px;
}

.login-form__field label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  color: #333;
}

.login-form__field input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.login-form__field input:focus {
  border-color: #409eff;
}

.login-form__error {
  color: #f56c6c;
  font-size: 13px;
  margin-bottom: 16px;
}

.login-form__submit {
  width: 100%;
  padding: 12px;
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.login-form__submit:hover {
  opacity: 0.85;
}

.login-form__submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
