<!--
  LoginForm.vue - 标准登录表单组件

  所有 9 种风格共用此组件，通过 class 切换视觉风格：
  - login-card--frosted    毛玻璃
  - login-card--particles  粒子背景
  - login-card--flip       3D 翻转
  - login-card--split      分屏
  - login-card--split-pro  品牌分屏
  - login-card--dark       暗黑科技
  - login-card--minimal    极简
  - login-card--typewriter 打字机
  - login-card--puzzle     滑块拼图

  容器：base-card
  表单：base-form + base-form-item
  输入：base-input
  按钮：base-button
  复选：base-checkbox

  零 HTML5 标签铁律：模板内只用 div + role，禁止 input/button/label/form。
-->
<template>
  <base-card class="login-card" :class="cardClass">
    <!-- 头部 -->
    <template #header>
      <div class="login-card__title">{{ title }}</div>
      <div v-if="subtitle" class="login-card__subtitle">{{ subtitle }}</div>
    </template>

    <!-- 表单主体 -->
    <base-form :model="form" :rules="rules" @submit="handleSubmit">
      <!-- 账号 -->
      <base-form-item label="账号" prop="username">
        <base-input
          v-model="form.username"
          placeholder="用户名 / 邮箱"
          clearable
        >
          <template #prefix>
            <svg class="login-card__icon" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"/>
            </svg>
          </template>
        </base-input>
      </base-form-item>

      <!-- 密码 -->
      <base-form-item label="密码" prop="password">
        <base-input
          v-model="form.password"
          type="password"
          show-password
          placeholder="请输入密码"
        >
          <template #prefix>
            <svg class="login-card__icon" viewBox="0 0 24 24">
              <rect x="4" y="11" width="16" height="10" rx="2"/>
              <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
            </svg>
          </template>
        </base-input>
      </base-form-item>

      <!-- 验证码（可选插槽）-->
      <base-form-item v-if="showCaptcha" label="验证码" prop="captcha">
        <div class="login-card__captcha-row">
          <base-input v-model="form.captcha" placeholder="请输入验证码">
            <template #prefix>
              <svg class="login-card__icon" viewBox="0 0 24 24">
                <path d="M12 2L4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-4z"/>
              </svg>
            </template>
          </base-input>
          <slot name="captcha-extra" />
        </div>
      </base-form-item>

      <!-- 滑块拼图（可选插槽）-->
      <slot name="captcha-puzzle" />

      <!-- 选项行 -->
      <div v-if="showRemember || showForgot" class="login-card__options">
        <base-checkbox v-if="showRemember" v-model="form.remember">记住我</base-checkbox>
        <base-button v-if="showForgot" variant="link" size="sm" @click="$emit('forgot')">
          忘记密码？
        </base-button>
      </div>

      <!-- 登录按钮 -->
      <base-button
        type="primary"
        block
        size="lg"
        :loading="loading"
        :disabled="disabled"
        native-type="submit"
      >
        {{ submitText || '登 录' }}
      </base-button>
    </base-form>

    <!-- 底部 -->
    <template #footer>
      <div v-if="showRegister" class="login-card__register">
        还没有账号？
        <base-button variant="link" size="sm" @click="$emit('register')">立即注册</base-button>
      </div>
      <slot name="social" />
    </template>
  </base-card>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'

interface LoginFormProps {
  /** 视觉风格 */
  variant?:
    | 'frosted' | 'particles' | 'flip' | 'split'
    | 'split-pro' | 'dark' | 'minimal' | 'typewriter' | 'puzzle'
  /** 标题 */
  title?: string
  /** 副标题 */
  subtitle?: string
  /** 提交按钮文字 */
  submitText?: string
  /** 是否显示验证码 */
  showCaptcha?: boolean
  /** 是否显示记住我 */
  showRemember?: boolean
  /** 是否显示忘记密码 */
  showForgot?: boolean
  /** 是否显示注册链接 */
  showRegister?: boolean
  /** 加载中 */
  loading?: boolean
  /** 禁用 */
  disabled?: boolean
}

const props = withDefaults(defineProps<LoginFormProps>(), {
  variant: 'frosted',
  title: '欢迎回来',
  subtitle: '登录以继续访问',
  showCaptcha: false,
  showRemember: true,
  showForgot: true,
  showRegister: true,
  loading: false,
  disabled: false,
})

const emit = defineEmits<{
  submit: [values: LoginValues]
  forgot: []
  register: []
}>()

interface LoginValues {
  username: string
  password: string
  captcha?: string
  remember: boolean
}

const form = reactive<LoginValues>({
  username: '',
  password: '',
  captcha: '',
  remember: false,
})

const rules = {
  username: [{ required: true, message: '请输入用户名' }],
  password: [{ required: true, message: '请输入密码' }],
  captcha: [{ required: props.showCaptcha, message: '请输入验证码' }],
}

const cardClass = computed(() => `login-card--${props.variant}`)

function handleSubmit() {
  emit('submit', { ...form })
}
</script>

<style>
/* 全局变量（被各风格覆写）*/
.login-card {
  --login-card-width: 420px;
  --login-card-padding: 48px;
  --login-card-radius: 16px;
  --login-card-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  --login-card-title-color: #1a1a2e;
  --login-card-subtitle-color: #6b7280;
  --login-card-input-bg: #fff;
  --login-card-input-color: #1a1a2e;
  --login-card-input-border: #e5e7eb;
  --login-card-button-bg: #6366f1;
  --login-card-button-color: #fff;

  width: var(--login-card-width);
  padding: var(--login-card-padding);
}

.login-card__title {
  font-size: 24px;
  font-weight: 600;
  color: var(--login-card-title-color);
  margin-bottom: 8px;
}

.login-card__subtitle {
  font-size: 14px;
  color: var(--login-card-subtitle-color);
  margin-bottom: 24px;
}

.login-card__icon {
  width: 18px;
  height: 18px;
  stroke: #9ca3af;
  fill: none;
  stroke-width: 1.8;
}

.login-card__options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.login-card__register {
  text-align: center;
  font-size: 14px;
  color: #6b7280;
}

.login-card__captcha-row {
  display: flex;
  gap: 12px;
}

/* ===================== 风格覆写 ===================== */

/* 1. 毛玻璃 */
.login-card--frosted {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  --login-card-title-color: #fff;
  --login-card-subtitle-color: rgba(255, 255, 255, 0.8);
  --login-card-input-bg: rgba(255, 255, 255, 0.1);
  --login-card-input-color: #fff;
  --login-card-input-border: rgba(255, 255, 255, 0.2);
  --login-card-button-bg: rgba(255, 255, 255, 0.25);
}

/* 2. 暗黑科技 */
.login-card--dark {
  background: rgba(10, 10, 15, 0.9);
  border: 1px solid rgba(0, 255, 255, 0.3);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.1);
  --login-card-title-color: #0ff;
  --login-card-subtitle-color: rgba(0, 255, 255, 0.6);
  --login-card-input-bg: rgba(0, 255, 255, 0.05);
  --login-card-input-color: #0ff;
  --login-card-input-border: rgba(0, 255, 255, 0.3);
  --login-card-button-bg: transparent;
  --login-card-button-color: #0ff;
}

/* 3. 极简 */
.login-card--minimal {
  --login-card-shadow: none;
  border: none;
  --login-card-title-color: #1a1a2e;
  --login-card-button-bg: #1a1a2e;
}

/* 4. 打字机 */
.login-card--typewriter {
  background: #161b22;
  border: 1px solid #30363d;
  font-family: 'JetBrains Mono', monospace;
  --login-card-title-color: #3fb950;
  --login-card-subtitle-color: #8b949e;
  --login-card-input-bg: #0d1117;
  --login-card-input-color: #c9d1d9;
  --login-card-input-border: #30363d;
  --login-card-button-bg: #238636;
  --login-card-button-color: #fff;
}
</style>