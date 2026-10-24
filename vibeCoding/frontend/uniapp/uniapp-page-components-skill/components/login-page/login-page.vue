<!--
  LoginPage 登录组件化页面
  ============================================================
  结构：logo/标题 + 表单区 + 微信一键登录 + 协议勾选 + 底部提交按钮
  默认实现：手机号 + 短信验证码登录（获取验证码按钮内置倒计时），
           可整体用 #form slot 替换为密码登录 / 第三方登录等。
  后端对接：走 auth-skill / uniapp-request-skill 的接口，组件只做前端骨架与交互。
-->
<template>
  <view class="login-page">
    <view class="lp-top">
      <slot name="logo">
        <view class="lp-logo">
          <text class="lp-logo-ph">LOGO</text>
        </view>
      </slot>
      <text class="lp-title">{{ title }}</text>
      <text v-if="subtitle" class="lp-subtitle">{{ subtitle }}</text>
    </view>

    <view class="lp-form">
      <view v-if="error" class="lp-error">
        <text class="lp-error-text">{{ error }}</text>
        <view class="lp-error-retry" @click="onRetry">
          <text class="lp-error-retry-text">{{ errorRetryText }}</text>
        </view>
      </view>

      <slot name="form">
        <view class="lp-field">
          <text class="lp-field-label">手机号</text>
          <input
            v-model="phone"
            class="lp-input"
            type="number"
            maxlength="11"
            placeholder="请输入手机号"
            placeholder-class="lp-input-ph"
            :adjust-position="adjustPosition"
            :cursor-spacing="cursorSpacing"
          />
        </view>

        <view class="lp-field">
          <text class="lp-field-label">验证码</text>
          <input
            v-model="code"
            class="lp-input"
            type="number"
            maxlength="6"
            placeholder="请输入验证码"
            placeholder-class="lp-input-ph"
            :adjust-position="adjustPosition"
            :cursor-spacing="cursorSpacing"
          />
          <view class="lp-code-btn" :class="{ 'is-counting': countdown > 0 }" @click="onGetCode">
            <text class="lp-code-btn-text">{{ countdown > 0 ? `${countdown}s 后重发` : '获取验证码' }}</text>
          </view>
        </view>
      </slot>
    </view>

    <view class="lp-footer">
      <slot name="footer" />

      <slot name="agreement">
        <view v-if="showAgreement" class="lp-agreement">
          <view class="lp-checkbox" :class="{ 'is-checked': agreed }" @click="onToggleAgreement">
            <text v-if="agreed" class="lp-checkbox-mark"></text>
          </view>
          <text class="lp-agreement-text">{{ agreementText }}</text>
        </view>
      </slot>

      <base-button type="primary" :block="true" :loading="loading" :disabled="disabled" @click="onSubmit">
        {{ submitText }}
      </base-button>

      <view v-if="showWechat" class="lp-wechat">
        <view class="lp-wechat-divider" />
        <view class="lp-wechat-btn" @click="$emit('wechatLogin')">
          <text class="lp-wechat-btn-text">微信一键登录</text>
        </view>
        <view class="lp-wechat-divider" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from 'vue'

interface Props {
  /** 主标题 */
  title?: string
  /** 副标题 */
  subtitle?: string
  /** 登录按钮文案 */
  submitText?: string
  /** 提交中 */
  loading?: boolean
  /** 禁用提交按钮 */
  disabled?: boolean
  /** 错误提示（非空即显示错误条 + 重试入口） */
  error?: string
  /** 错误条上的重试文案 */
  errorRetryText?: string
  /** 键盘弹起时是否自动上推页面（小程序端） */
  adjustPosition?: boolean
  /** 输入框与键盘的间距（px，仅 adjustPosition 为 true 时生效） */
  cursorSpacing?: number
  /** 是否显示微信一键登录 */
  showWechat?: boolean
  /** 是否显示协议勾选 */
  showAgreement?: boolean
  /** 协议文案 */
  agreementText?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '欢迎登录',
  subtitle: '',
  submitText: '登录',
  loading: false,
  disabled: false,
  error: '',
  errorRetryText: '重试',
  adjustPosition: true,
  cursorSpacing: 0,
  showWechat: true,
  showAgreement: true,
  agreementText: '我已阅读并同意《用户协议》和《隐私政策》',
})

const emit = defineEmits<{
  submit: [data: { phone: string; code: string }]
  wechatLogin: []
  agreementChange: [checked: boolean]
  getCode: [phone: string]
  retry: []
}>()

const phone = ref('')
const code = ref('')
const agreed = ref(false)
const countdown = ref(0)
let countdownTimer: ReturnType<typeof setInterval> | undefined

onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer)
})

function onGetCode() {
  if (countdown.value > 0 || !phone.value) return
  emit('getCode', phone.value)
  countdown.value = 60
  countdownTimer = setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0 && countdownTimer) clearInterval(countdownTimer)
  }, 1000)
}

function onToggleAgreement() {
  agreed.value = !agreed.value
  emit('agreementChange', agreed.value)
}

function onSubmit() {
  if (props.loading || props.disabled) return
  if (props.showAgreement && !agreed.value) return
  emit('submit', { phone: phone.value, code: code.value })
}

function onRetry() {
  emit('retry')
}
</script>

<style lang="scss" scoped>
.login-page {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: var(--space-24, 96rpx) var(--space-12, 48rpx) var(--space-16, 64rpx);
  box-sizing: border-box;
  background: var(--bg-page, #fafafa);
}

/* ---- 顶部 ---- */
.lp-top {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.lp-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--height-avatar-lg, 120rpx);
  height: var(--height-avatar-lg, 120rpx);
  border-radius: var(--radius-lg, 24rpx);
  background: var(--bg-light, #f5f5f5);
}

.lp-logo-ph {
  font-size: var(--font-sm, 26rpx);
  color: var(--color-primary, #14b8a6);
}

.lp-title {
  margin-top: var(--space-8, 32rpx);
  font-size: var(--font-2xl, 40rpx);
  font-weight: 700;
  color: var(--text-primary, #171717);
}

.lp-subtitle {
  margin-top: var(--space-4, 16rpx);
  font-size: var(--font-sm, 26rpx);
  color: var(--text-tertiary, #a3a3a3);
}

/* ---- 表单 ---- */
.lp-form {
  margin-top: var(--space-16, 64rpx);
}

/* ---- 错误条 ---- */
.lp-error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-8, 32rpx);
  padding: var(--space-6, 24rpx) var(--space-8, 32rpx);
  border-radius: var(--radius-sm, 8rpx);
  background: var(--bg-light, #f5f5f5);
  border: 1rpx solid var(--color-error, #ef4444);
}

.lp-error-text {
  flex: 1;
  min-width: 0;
  font-size: var(--font-sm, 26rpx);
  color: var(--color-error, #ef4444);
}

.lp-error-retry {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  min-height: 56rpx;
  padding-left: var(--space-8, 32rpx);
}

.lp-error-retry-text {
  font-size: var(--font-sm, 26rpx);
  color: var(--color-error, #ef4444);
  text-decoration: underline;
}

.lp-field {
  display: flex;
  align-items: center;
  min-height: var(--height-btn-xl, 96rpx);
  border-bottom: 1rpx solid var(--border-light, #f5f5f5);
}

.lp-field-label {
  flex-shrink: 0;
  width: 160rpx;
  font-size: var(--font-md, 28rpx);
  color: var(--text-primary, #171717);
}

.lp-input {
  flex: 1;
  min-width: 0;
  height: var(--height-btn-xl, 96rpx);
  font-size: var(--font-md, 28rpx);
  color: var(--text-primary, #171717);
}

.lp-input-ph {
  color: var(--text-tertiary, #a3a3a3);
}

.lp-code-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 88rpx;
  min-height: 88rpx;
  margin-right: calc(-1 * var(--space-4, 16rpx));
}

.lp-code-btn-text {
  font-size: var(--font-sm, 26rpx);
  color: var(--color-primary, #14b8a6);

  .is-counting & {
    color: var(--text-tertiary, #a3a3a3);
  }
}

/* ---- 底部 ---- */
.lp-footer {
  margin-top: auto;
  padding-top: var(--space-16, 64rpx);
}

.lp-agreement {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-8, 32rpx);
}

.lp-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--icon-sm, 36rpx);
  height: var(--icon-sm, 36rpx);
  margin-right: var(--space-4, 16rpx);
  border: 1rpx solid var(--border, #e5e5e5);
  border-radius: var(--radius-sm, 8rpx);
  box-sizing: border-box;

  &.is-checked {
    background: var(--color-primary, #14b8a6);
    border-color: var(--color-primary, #14b8a6);
  }
}

.lp-checkbox-mark {
  font-size: var(--font-xs, 24rpx);
  color: var(--text-inverse, #ffffff);
  line-height: 1;
}

.lp-agreement-text {
  font-size: var(--font-xs, 24rpx);
  color: var(--text-tertiary, #a3a3a3);
}

.lp-wechat {
  display: flex;
  align-items: center;
  margin-top: var(--space-12, 48rpx);
}

.lp-wechat-divider {
  flex: 1;
  height: 1rpx;
  background: var(--border-light, #f5f5f5);
}

.lp-wechat-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 240rpx;
  min-height: 88rpx;
}

.lp-wechat-btn-text {
  font-size: var(--font-sm, 26rpx);
  color: var(--text-secondary, #525252);
}
</style>
