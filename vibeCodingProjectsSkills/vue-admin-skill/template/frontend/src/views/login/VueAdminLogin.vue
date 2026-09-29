<!--
  VueAdminLogin — vue-admin-skill 本地"正常登录页"

  为什么不用 vue-login-skill？
  vue-login-skill 的 9 种风格只实现 3 种 CSS：
    - frosted（毛玻璃，老气）
    - dark（深色科技，不通用）
    - minimal（白底无框，"两个框"不明显）
  用户需要"白底 + 明显两个输入框 + 蓝色大按钮"的标准登录页——这种风格 vue-login-skill 没有。

  本组件完全用 vue-base-skill 已有组件（BaseCard + BaseForm + BaseFormItem + BaseInput + BaseButton）组装，
  符合"零第三方库" + "零 HTML5 标签" + "BaseCard 容器原则"三条铁律。
  表单必传 :rules（form-contract §十三 R2），提交按钮用 native-type="submit" 触发校验。
-->
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { BaseForm, BaseFormItem } from 'vue-form-skill'
import { BaseInput } from 'vue-input-skill'
import { BaseButton } from 'vue-button-skill'
import { BaseCard } from 'vue-card-skill'
import BaseIcon from '@/components/icons/BaseIcon.vue'
import { useUserStore } from '@/store/user'
import { required } from '@/utils/validation'
import { extractErrorMessage } from '@/utils/error'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const form = reactive({
  username: 'admin',
  password: 'admin123',
})

const rules: FormRules = {
  username: [required('请输入用户名')],
  password: [required('请输入密码')],
}

const loading = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  errorMsg.value = ''
  loading.value = true
  try {
    // userStore.login 内部已串行调用 fetchUserInfo + loadMenus
    await userStore.login({ username: form.username, password: form.password })
    const redirect = (route.query.redirect as string) || '/dashboard'
    router.push(redirect)
  } catch (e) {
    errorMsg.value = extractErrorMessage(e) || '登录失败，请检查用户名密码'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <BaseCard class="login-card">
      <template #header>
        <div class="login-card__brand">
          <div class="login-card__logo"><BaseIcon name="layout-dashboard" :size="28" /></div>
          <h1 class="login-card__title">Vue Admin</h1>
          <p class="login-card__subtitle">基于 wg-skills 技能矩阵</p>
        </div>
      </template>

      <BaseForm :model="form" :rules="rules" @submit="handleLogin">
        <BaseFormItem label="用户名" prop="username">
          <BaseInput
            v-model="form.username"
            placeholder="请输入用户名（如 admin）"
            clearable
            size="lg"
          />
        </BaseFormItem>

        <BaseFormItem label="密码" prop="password">
          <BaseInput
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
            size="lg"
          />
        </BaseFormItem>

        <div v-if="errorMsg" class="login-card__error">
          {{ errorMsg }}
        </div>

        <BaseButton
          type="primary"
          size="lg"
          block
          :loading="loading"
          class="login-card__submit"
          native-type="submit"
        >
          {{ loading ? '登录中...' : '登 录' }}
        </BaseButton>
      </BaseForm>

      <template #footer>
        <div class="login-card__hint">
          <span>默认账号：</span>
          <code>admin / admin123</code>
          <span class="login-card__hint-sep">|</span>
          <code>user_admin / admin123</code>
          <span class="login-card__hint-sep">|</span>
          <code>demo / admin123</code>
        </div>
      </template>
    </BaseCard>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  /* ponytail: 浅蓝渐变是品牌层，不走 token（一致性 < 设计感） */
  background: linear-gradient(135deg, #e0e7ff 0%, #f0f5ff 50%, #fef3f2 100%);
  padding: var(--space-6);
}

.login-card {
  width: 100%;
  max-width: 420px;
}

.login-card :deep(.base-card__header) {
  text-align: center;
  padding: var(--space-6) var(--space-4) var(--space-2);
  border-bottom: none;
}

.login-card__brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
}

.login-card__logo {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: var(--color-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.login-card__title {
  margin: var(--space-2) 0 0;
  font-size: var(--font-2xl);
  font-weight: var(--weight-semibold);
  color: var(--color-text);
}

.login-card__subtitle {
  margin: 0;
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
}

.login-card :deep(.base-card__body) {
  padding: var(--space-4) var(--space-6);
}

.login-card__error {
  margin-bottom: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  background: var(--color-danger-soft);
  color: var(--color-danger);
  font-size: var(--font-sm);
  text-align: center;
}

.login-card__submit {
  margin-top: var(--space-2);
}

.login-card :deep(.base-card__footer) {
  padding: var(--space-3) var(--space-6) var(--space-4);
  border-top: 1px solid var(--color-border);
  text-align: center;
}

.login-card__hint {
  font-size: var(--font-xs);
  color: var(--color-text-secondary);
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-1);
  align-items: center;
}

.login-card__hint code {
  padding: 2px 6px;
  background: var(--color-background);
  border-radius: var(--radius-sm);
  font-size: var(--font-xs);
  color: var(--color-primary);
}

.login-card__hint-sep {
  color: var(--color-border);
  margin: 0 var(--space-1);
}
</style>
