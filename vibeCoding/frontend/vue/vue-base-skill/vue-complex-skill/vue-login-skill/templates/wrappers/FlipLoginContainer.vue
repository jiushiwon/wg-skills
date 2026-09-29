<!--
  FlipLoginContainer.vue - 3D 翻转登录容器

  用法见 SKILL.md Wrappers 章节。

  设计：两个 LoginForm（正面登录 / 反面注册）+ .flip-container 包裹 + .flipped 切换。
  - perspective / transform-style 由容器 .flip-container 提供
  - 卡片本体走 .login-card--flip / .login-card--flip-back（LoginForm 内部 CSS）
  - 卡片配色沿用 frosted 风格（消费者可在外层 .flip-container 上自定义）

  ponytail：0.6s ease-in-out 比 SKILL.md 默认 0.8s 更跟手；height 480px 兼容最长登录表单。
-->
<template>
  <div class="flip-container" :class="{ flipped: isFlipped }">
    <!-- 正面：登录 -->
    <LoginForm
      variant="frosted"
      :title="loginTitle"
      :subtitle="loginSubtitle"
      :username-placeholder="loginUsernamePlaceholder"
      :password-placeholder="loginPasswordPlaceholder"
      :submit-text="loginSubmitText"
      :loading="loginLoading"
      :show-register="false"
      @submit="handleLogin"
    >
      <template #extraLinks>
        <slot name="loginExtra" />
      </template>
    </LoginForm>

    <!-- 反面：注册（自身 rotateY(180deg) 让翻过来时正对用户） -->
    <LoginForm
      variant="frosted"
      :title="registerTitle"
      :subtitle="registerSubtitle"
      :username-placeholder="registerUsernamePlaceholder"
      :password-placeholder="registerPasswordPlaceholder"
      :submit-text="registerSubmitText"
      :loading="registerLoading"
      :show-remember="false"
      :show-forgot="false"
      :show-register="false"
      @submit="handleRegister"
    >
      <template #extraLinks>
        <slot name="registerExtra" />
      </template>
    </LoginForm>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { LoginForm } from '../../components/index.ts'

interface Props {
  /** 容器宽度（默认 420px，对应卡片宽） */
  containerWidth?: string | number
  /** 容器高度（默认 480px，足够容纳登录表单） */
  containerHeight?: string | number
  /** 翻转动效时长 */
  transitionDuration?: string
  /** 正面标题 */
  loginTitle?: string
  /** 正面副标题 */
  loginSubtitle?: string
  /** 正面账号 placeholder */
  loginUsernamePlaceholder?: string
  /** 正面密码 placeholder */
  loginPasswordPlaceholder?: string
  /** 正面按钮文字 */
  loginSubmitText?: string
  /** 正面 loading */
  loginLoading?: boolean
  /** 反面标题 */
  registerTitle?: string
  /** 反面副标题 */
  registerSubtitle?: string
  /** 反面账号 placeholder */
  registerUsernamePlaceholder?: string
  /** 反面密码 placeholder */
  registerPasswordPlaceholder?: string
  /** 反面按钮文字 */
  registerSubmitText?: string
  /** 反面 loading */
  registerLoading?: boolean
  /** 默认朝哪面（'login' 正面 / 'register' 反面） */
  defaultSide?: 'login' | 'register'
}

const props = withDefaults(defineProps<Props>(), {
  containerWidth: '420px',
  containerHeight: '480px',
  transitionDuration: '0.6s',
  loginTitle: '登录',
  loginSubtitle: '欢迎回来',
  loginUsernamePlaceholder: '请输入用户名 / 邮箱',
  loginPasswordPlaceholder: '请输入密码',
  loginSubmitText: '登 录',
  loginLoading: false,
  registerTitle: '注册',
  registerSubtitle: '创建你的账号',
  registerUsernamePlaceholder: '请输入用户名',
  registerPasswordPlaceholder: '请输入密码',
  registerSubmitText: '注 册',
  registerLoading: false,
  defaultSide: 'login',
})

const emit = defineEmits<{
  login: [values: { username: string; password: string; remember: boolean }]
  register: [values: { username: string; password: string; remember: boolean }]
  flip: [side: 'login' | 'register']
}>()

const isFlipped = ref(props.defaultSide === 'register')

/* 暴露方法给消费者（ref + expose） */
defineExpose({
  flipToLogin: () => { isFlipped.value = false; emit('flip', 'login') },
  flipToRegister: () => { isFlipped.value = true; emit('flip', 'register') },
})

function handleLogin(values: { username: string; password: string; remember: boolean }) {
  emit('login', values)
}

function handleRegister(values: { username: string; password: string; remember: boolean }) {
  emit('register', values)
}
</script>

<style scoped>
.flip-container {
  position: relative;
  width: v-bind('containerWidth');
  height: v-bind('containerHeight');
  transform-style: preserve-3d;
  transition: transform v-bind('transitionDuration') ease-in-out;
}

.flip-container.flipped {
  transform: rotateY(180deg);
}

/* ponytail: 让卡片沿用 frosted 风格（半透明 + blur + 主题色边框），
     并把第二张卡片预旋 180° 让它翻过来时正面对着用户 */
.flip-container :deep(.login-card--flip),
.flip-container :deep(.login-card--flip-back) {
  background: color-mix(in srgb, var(--color-text-inverse) 12%, transparent) !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid color-mix(in srgb, var(--color-primary) 35%, transparent) !important;
  box-shadow: 0 8px 32px color-mix(in srgb, var(--color-primary) 15%, transparent) !important;
}
</style>