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
            <text v-if="agreed" class="lp-checkbox-mark">✓</text>
          </view>
          <text class="lp-agreement-text">{{ agreementText }}</text>
        </view>
      </slot>

      <base-button type="primary" :block="true" :loading="loading" @click="onSubmit">
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
  showWechat: true,
  showAgreement: true,
  agreementText: '我已阅读并同意《用户协议》和《隐私政策》',
})

const emit = defineEmits<{
  submit: [data: { phone: string; code: string }]
  wechatLogin: []
  agreementChange: [checked: boolean]
  getCode: [phone: string]
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
  if (props.showAgreement && !agreed.value) return
  emit('submit', { phone: phone.value, code: code.value })
}
</script>

<style lang="scss" scoped>
.login-page {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: var(--spacing-3xl) var(--spacing-xl) var(--spacing-2xl);
  box-sizing: border-box;
  background: var(--color-bg-page);
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
  width: var(--height-avatar-lg);
  height: var(--height-avatar-lg);
  border-radius: var(--radius-lg);
  background: var(--color-bg-tinted);
}

.lp-logo-ph {
  font-size: var(--font-sm);
  color: var(--color-primary);
}

.lp-title {
  margin-top: var(--spacing-lg);
  font-size: var(--font-2xl);
  font-weight: 700;
  color: var(--color-text-primary);
}

.lp-subtitle {
  margin-top: var(--spacing-sm);
  font-size: var(--font-sm);
  color: var(--color-text-tertiary);
}

/* ---- 表单 ---- */
.lp-form {
  margin-top: var(--spacing-2xl);
}

.lp-field {
  display: flex;
  align-items: center;
  min-height: var(--height-btn-xl);
  border-bottom: 1rpx solid var(--color-border-light);
}

.lp-field-label {
  flex-shrink: 0;
  width: 160rpx;
  font-size: var(--font-md);
  color: var(--color-text-primary);
}

.lp-input {
  flex: 1;
  min-width: 0;
  height: var(--height-btn-xl);
  font-size: var(--font-md);
  color: var(--color-text-primary);
}

.lp-input-ph {
  color: var(--color-text-tertiary);
}

.lp-code-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 88rpx;
  min-height: 88rpx;
  margin-right: calc(-1 * var(--spacing-sm));
}

.lp-code-btn-text {
  font-size: var(--font-sm);
  color: var(--color-primary);

  .is-counting & {
    color: var(--color-text-tertiary);
  }
}

/* ---- 底部 ---- */
.lp-footer {
  margin-top: auto;
  padding-top: var(--spacing-2xl);
}

.lp-agreement {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-lg);
}

.lp-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--icon-sm);
  height: var(--icon-sm);
  margin-right: var(--spacing-sm);
  border: 1rpx solid var(--color-border);
  border-radius: var(--radius-sm);
  box-sizing: border-box;

  &.is-checked {
    background: var(--color-primary);
    border-color: var(--color-primary);
  }
}

.lp-checkbox-mark {
  font-size: var(--font-xs);
  color: var(--white);
  line-height: 1;
}

.lp-agreement-text {
  font-size: var(--font-xs);
  color: var(--color-text-tertiary);
}

.lp-wechat {
  display: flex;
  align-items: center;
  margin-top: var(--spacing-xl);
}

.lp-wechat-divider {
  flex: 1;
  height: 1rpx;
  background: var(--color-border-light);
}

.lp-wechat-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 240rpx;
  min-height: 88rpx;
}

.lp-wechat-btn-text {
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
}
</style>
