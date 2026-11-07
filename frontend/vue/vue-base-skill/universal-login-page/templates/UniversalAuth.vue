<template>
  <div class="universal-auth">
    <!-- 顶部自定义区域 -->
    <slot name="header">
      <div class="auth-header">
        <h2 class="auth-title">{{ title }}</h2>
      </div>
    </slot>

    <!-- 模式切换 -->
    <div v-if="showModeTabs" class="mode-tabs">
      <span
        v-for="tab in tabs"
        :key="tab.value"
        :class="['tab', { active: currentMode === tab.value }]"
        @click="switchMode(tab.value)"
      >
        {{ tab.label }}
      </span>
    </div>

    <!-- 登录页面 -->
    <base-card v-if="currentMode === 'login'" class="login-card">
      <div v-if="showApps && appList.length > 0" class="app-selector">
        <div class="app-label">选择登录方式</div>
        <div class="app-list">
          <div
            v-for="app in appList"
            :key="app.appKey"
            :class="['app-item', { active: selectedApp?.appKey === app.appKey }]"
            @click="selectApp(app)"
          >
            <img v-if="app.logo" :src="app.logo" class="app-logo" />
            <span v-else class="app-logo-placeholder">{{ app.appName[0] }}</span>
            <span class="app-name">{{ app.appName }}</span>
          </div>
        </div>
      </div>

      <base-form-render
        ref="loginFormRef"
        v-model="loginForm"
        :schema="loginSchema"
        @submit="handleLogin"
      >
        <template #footer>
          <div class="form-actions">
            <base-button type="primary" :loading="loginLoading" @click="handleLogin">
              登录
            </base-button>
            <base-button @click="switchMode('register')">注册主账户</base-button>
          </div>
        </template>
      </base-form-render>

      <!-- 已有账户绑定 -->
      <div class="bind-tip" v-if="selectedApp">
        <span>已有 {{ selectedApp.appName }} 账户？</span>
        <a @click="switchMode('bind')">绑定已有账户</a>
      </div>
    </base-card>

    <!-- 注册页面 -->
    <base-card v-if="currentMode === 'register'" class="register-card">
      <base-form-render
        ref="registerFormRef"
        v-model="registerForm"
        :schema="registerSchema"
        @submit="handleRegister"
      >
        <template #footer>
          <div class="form-actions">
            <base-button type="primary" :loading="registerLoading" @click="handleRegister">
              注册
            </base-button>
            <base-button @click="switchMode('login')">已有账户？去登录</base-button>
          </div>
        </template>
      </base-form-render>
    </base-card>

    <!-- 绑定页面 -->
    <base-card v-if="currentMode === 'bind'" class="bind-card">
      <div class="bind-tabs">
        <span
          :class="['bind-tab', { active: bindType === 'password' }]"
          @click="bindType = 'password'"
        >密码绑定</span>
        <span
          :class="['bind-tab', { active: bindType === 'qrcode' }]"
          @click="bindType = 'qrcode'"
        >扫码绑定</span>
        <span
          :class="['bind-tab', { active: bindType === 'sms' }]"
          @click="bindType = 'sms'"
        >验证码绑定</span>
      </div>

      <!-- 密码绑定 -->
      <base-form-render
        v-if="bindType === 'password'"
        ref="bindFormRef"
        v-model="bindForm"
        :schema="bindPasswordSchema"
        @submit="handleBind"
      >
        <template #footer>
          <div class="form-actions">
            <base-button type="primary" :loading="bindLoading" @click="handleBind">
              确认绑定
            </base-button>
            <base-button @click="switchMode('login')">取消</base-button>
          </div>
        </template>
      </base-form-render>

      <!-- 扫码绑定 -->
      <div v-if="bindType === 'qrcode'" class="qrcode-bind">
        <div class="qrcode-box">
          <img v-if="qrcodeUrl" :src="qrcodeUrl" alt="绑定二维码" />
          <div v-else class="qrcode-loading">生成中...</div>
        </div>
        <p class="qrcode-tip">请使用主账户应用扫描二维码确认绑定</p>
        <base-button @click="switchMode('login')">取消</base-button>
      </div>

      <!-- 验证码绑定 -->
      <base-form-render
        v-if="bindType === 'sms'"
        ref="smsBindFormRef"
        v-model="smsBindForm"
        :schema="bindSmsSchema"
        @submit="handleSmsBind"
      >
        <template #footer>
          <div class="form-actions">
            <base-button type="primary" :loading="bindLoading" @click="handleSmsBind">
              发送验证码
            </base-button>
            <base-button @click="switchMode('login')">取消</base-button>
          </div>
        </template>
      </base-form-render>
    </base-card>

    <!-- 绑定列表页面 -->
    <base-card v-if="currentMode === 'list'" class="list-card">
      <div class="list-header">
        <h3>已绑定的应用</h3>
        <base-button type="primary" size="sm" @click="switchMode('bind')">
          绑定新应用
        </base-button>
      </div>
      <base-table :data="bindingList" :columns="bindingColumns">
        <template #app="{ row }">
          <div class="app-cell">
            <img v-if="row.logo" :src="row.logo" class="app-logo-sm" />
            <span class="app-name-sm">{{ row.appName }}</span>
          </div>
        </template>
        <template #status="{ row }">
          <base-tag :type="row.isDefault ? 'success' : 'default'">
            {{ row.isDefault ? '默认' : '已绑定' }}
          </base-tag>
        </template>
        <template #action="{ row }">
          <base-button v-if="!row.isDefault" size="sm" @click="setDefault(row)">
            设为默认
          </base-button>
          <base-button size="sm" type="danger" @click="handleUnbind(row)">
            解绑
          </base-button>
        </template>
      </base-table>
    </base-card>

    <!-- 应用管理页面 -->
    <base-card v-if="currentMode === 'apps'" class="apps-card">
      <div class="list-header">
        <h3>我的应用</h3>
        <base-button type="primary" @click="openCreateApp">
          创建应用
        </base-button>
      </div>
      <base-table :data="myApps" :columns="appColumns">
        <template #action="{ row }">
          <base-button size="sm" @click="viewAppKey(row)">查看密钥</base-button>
          <base-button size="sm" type="danger" @click="deleteApp(row)">删除</base-button>
        </template>
      </base-table>
    </base-card>

    <!-- 账户设置页面 -->
    <base-card v-if="currentMode === 'settings'" class="settings-card">
      <base-form-render
        ref="settingsFormRef"
        v-model="settingsForm"
        :schema="settingsSchema"
        @submit="handleUpdateSettings"
      >
        <template #footer>
          <div class="form-actions">
            <base-button type="primary" :loading="settingsLoading" @click="handleUpdateSettings">
              保存设置
            </base-button>
          </div>
        </template>
      </base-form-render>
    </base-card>

    <!-- 底部自定义区域 -->
    <slot name="footer" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { post, get } from '@/api/request'
import type { FormSchema } from '../vue-form-skill/references/form-contract'

// Types
interface AppInfo {
  appKey: string
  appName: string
  logo?: string
  description?: string
}

interface BindingInfo {
  id: number
  appKey: string
  appName: string
  logo?: string
  bindTime: string
  isDefault: boolean
}

// Props
interface Props {
  mode?: string
  apiBase?: string
  appId?: string
  showApps?: boolean
  showModeTabs?: boolean
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'login',
  apiBase: '/api/auth',
  appId: '',
  showApps: true,
  showModeTabs: true,
  title: '统一登录',
})

const emit = defineEmits<{
  success: [payload: { token: string; user: Record<string, unknown>; appId: string }]
  error: [payload: { code: string; message: string }]
  'bind-success': [payload: { provider: string; account: string }]
  'unbind-success': [payload: { provider: string } ]
}>()

// 模式配置
const tabs = [
  { value: 'login', label: '登录' },
  { value: 'register', label: '注册' },
  { value: 'bind', label: '绑定' },
  { value: 'list', label: '绑定列表' },
  { value: 'apps', label: '应用管理' },
  { value: 'settings', label: '账户设置' },
]

// 状态
const currentMode = ref(props.mode)
const loginForm = ref<Record<string, unknown>>({})
const registerForm = ref<Record<string, unknown>>({})
const bindForm = ref<Record<string, unknown>>({})
const smsBindForm = ref<Record<string, unknown>>({})
const settingsForm = ref<Record<string, unknown>>({})

const loginLoading = ref(false)
const registerLoading = ref(false)
const bindLoading = ref(false)
const settingsLoading = ref(false)

// 绑定
const bindType = ref<'password' | 'qrcode' | 'sms'>('password')
const qrcodeUrl = ref('')

// 应用列表
const appList = ref<AppInfo[]>([])
const selectedApp = ref<AppInfo | null>(null)

// 绑定列表
const bindingList = ref<BindingInfo[]>([])
const bindingColumns = [
  { label: '应用', slot: 'app' },
  { label: '绑定时间', prop: 'bindTime' },
  { label: '状态', slot: 'status' },
  { label: '操作', slot: 'action', width: 200 },
]

// 我的应用
const myApps = ref<any[]>([])
const appColumns = [
  { label: '应用名称', prop: 'appName' },
  { label: 'AppKey', prop: 'appKey' },
  { label: '状态', prop: 'status' },
  { label: '创建时间', prop: 'createTime' },
  { label: '操作', slot: 'action', width: 200 },
]

// 表单引用
const loginFormRef = ref()
const registerFormRef = ref()
const bindFormRef = ref()
const smsBindFormRef = ref()
const settingsFormRef = ref()

// 表单契约
const loginSchema = computed<FormSchema>(() => ({
  layout: 'vertical',
  fields: [
    { prop: 'loginType', label: '登录方式', type: 'select', required: true,
      options: [
        { label: '用户名', value: 'username' },
        { label: '手机号', value: 'phone' },
        { label: '邮箱', value: 'email' },
      ]},
    { prop: 'username', label: '用户名', type: 'input', required: true,
      placeholder: '请输入用户名/手机号/邮箱' },
    { prop: 'password', label: '密码', type: 'password', required: true,
      placeholder: '请输入密码' },
    { prop: 'captcha', label: '验证码', type: 'input',
      placeholder: '请输入验证码' },
    { prop: 'captchaId', type: 'hidden' as any },
  ],
}))

const registerSchema: FormSchema = {
  layout: 'vertical',
  fields: [
    { prop: 'username', label: '用户名', type: 'input', required: true,
      pattern: '^[a-zA-Z0-9_]{4,16}$', message: '4-16位字母数字下划线' },
    { prop: 'password', label: '密码', type: 'password', required: true },
    { prop: 'confirmPassword', label: '确认密码', type: 'password', required: true },
    { prop: 'nickname', label: '昵称', type: 'input' },
    { prop: 'phone', label: '手机号', type: 'input', subType: 'phone' },
    { prop: 'email', label: '邮箱', type: 'input', subType: 'email' },
    { prop: 'avatar', label: '头像', type: 'upload', subType: 'image' },
  ],
}

const bindPasswordSchema: FormSchema = {
  layout: 'vertical',
  fields: [
    { prop: 'mainUsername', label: '主账户', type: 'input', required: true,
      placeholder: '输入主账户用户名' },
    { prop: 'mainPassword', label: '密码', type: 'password', required: true,
      placeholder: '输入主账户密码' },
  ],
}

const bindSmsSchema: FormSchema = {
  layout: 'vertical',
  fields: [
    { prop: 'phone', label: '手机号', type: 'input', subType: 'phone', required: true },
    { prop: 'code', label: '验证码', type: 'input', required: true, pattern: '^\\d{4,6}$', message: '请输入4-6位验证码' },
    { prop: 'sendCode', type: 'hidden' as any },
  ],
}

const settingsSchema: FormSchema = {
  layout: 'vertical',
  fields: [
    { prop: 'nickname', label: '昵称', type: 'input' },
    { prop: 'email', label: '邮箱', type: 'input', subType: 'email' },
    { prop: 'phone', label: '手机号', type: 'input', subType: 'phone' },
    { prop: 'avatar', label: '头像', type: 'upload', subType: 'image' },
  ],
}

// 方法
function switchMode(mode: string) {
  currentMode.value = mode
  if (mode === 'bind' && bindType.value === 'qrcode') {
    generateQrcode()
  }
  if (mode === 'list') {
    fetchBindingList()
  }
  if (mode === 'apps') {
    fetchMyApps()
  }
  emit('switch-mode', mode)
}

function selectApp(app: AppInfo) {
  selectedApp.value = app
}

async function fetchAppList() {
  if (!props.showApps) return
  try {
    const res = await get<AppInfo[]>(`${props.apiBase}/apps`)
    appList.value = res
    if (props.appId) {
      selectedApp.value = appList.value.find(a => a.appKey === props.appId) || null
    }
  } catch (e) {
    console.error('获取应用列表失败', e)
  }
}

async function handleLogin() {
  const valid = await loginFormRef.value?.validate()
  if (!valid) return

  loginLoading.value = true
  try {
    const res = await post<{ token: string; user: Record<string, unknown> }>(
      `${props.apiBase}/login`,
      { ...loginForm.value, appKey: selectedApp.value?.appKey }
    )
    emit('success', { token: res.token, user: res.user, appId: selectedApp.value?.appKey || '' })
  } catch (err: any) {
    emit('error', { code: err.code || 'LOGIN_FAILED', message: err.message || '登录失败' })
  } finally {
    loginLoading.value = false
  }
}

async function handleRegister() {
  const valid = await registerFormRef.value?.validate()
  if (!valid) return

  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    emit('error', { code: 'PASSWORD_MISMATCH', message: '两次密码不一致' })
    return
  }

  registerLoading.value = true
  try {
    const res = await post<{ token: string; user: Record<string, unknown> }>(
      `${props.apiBase}/register`,
      registerForm.value
    )
    emit('success', { token: res.token, user: res.user, appId: '' })
  } catch (err: any) {
    emit('error', { code: err.code || 'REGISTER_FAILED', message: err.message || '注册失败' })
  } finally {
    registerLoading.value = false
  }
}

async function handleBind() {
  const valid = await bindFormRef.value?.validate()
  if (!valid) return

  bindLoading.value = true
  try {
    await post(`${props.apiBase}/bind/confirm`, {
      ...bindForm.value,
      appKey: selectedApp.value?.appKey,
    })
    emit('bind-success', { provider: selectedApp.value?.appKey || '', account: bindForm.value.mainUsername })
    switchMode('list')
  } catch (err: any) {
    emit('error', { code: err.code || 'BIND_FAILED', message: err.message || '绑定失败' })
  } finally {
    bindLoading.value = false
  }
}

async function handleSmsBind() {
  const valid = await smsBindFormRef.value?.validate()
  if (!valid) return

  bindLoading.value = true
  try {
    await post(`${props.apiBase}/bind/confirm`, {
      ...smsBindForm.value,
      bindType: 'sms',
      appKey: selectedApp.value?.appKey,
    })
    emit('bind-success', { provider: selectedApp.value?.appKey || '', account: smsBindForm.value.phone })
    switchMode('list')
  } catch (err: any) {
    emit('error', { code: err.code || 'BIND_FAILED', message: err.message || '绑定失败' })
  } finally {
    bindLoading.value = false
  }
}

async function generateQrcode() {
  try {
    const res = await get<{ qrcode: string }>(`${props.apiBase}/bind/qrcode`, {
      appKey: selectedApp.value?.appKey,
    })
    qrcodeUrl.value = res.qrcode
  } catch (e) {
    console.error('生成二维码失败', e)
  }
}

async function fetchBindingList() {
  try {
    const res = await get<BindingInfo[]>(`${props.apiBase}/bind/list`)
    bindingList.value = res
  } catch (e) {
    console.error('获取绑定列表失败', e)
  }
}

async function handleUnbind(row: BindingInfo) {
  try {
    await post(`${props.apiBase}/bind/cancel`, { bindingId: row.id })
    emit('unbind-success', { provider: row.appKey })
    fetchBindingList()
  } catch (err: any) {
    emit('error', { code: err.code || 'UNBIND_FAILED', message: err.message || '解绑失败' })
  }
}

async function setDefault(row: BindingInfo) {
  try {
    await post(`${props.apiBase}/bind/set-default`, { bindingId: row.id })
    fetchBindingList()
  } catch (err: any) {
    emit('error', { code: err.code || 'SET_DEFAULT_FAILED', message: err.message || '设置失败' })
  }
}

async function fetchMyApps() {
  try {
    const res = await get<any[]>(`${props.apiBase}/apps`)
    myApps.value = res
  } catch (e) {
    console.error('获取应用列表失败', e)
  }
}

function openCreateApp() {
  // TODO: 打开创建应用弹窗
}

function viewAppKey(row: any) {
  // TODO: 查看 API 密钥
}

function deleteApp(row: any) {
  // TODO: 删除应用
}

async function handleUpdateSettings() {
  const valid = await settingsFormRef.value?.validate()
  if (!valid) return

  settingsLoading.value = true
  try {
    await put(`${props.apiBase}/user/me`, settingsForm.value)
    emit('success', { token: '', user: settingsForm.value, appId: '' })
  } catch (err: any) {
    emit('error', { code: err.code || 'UPDATE_FAILED', message: err.message || '更新失败' })
  } finally {
    settingsLoading.value = false
  }
}

// 初始化
onMounted(() => {
  fetchAppList()
})

// 暴露
defineExpose({
  switchMode,
  loginForm,
  registerForm,
  bindForm,
})
</script>

<style scoped>
.universal-auth {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  padding: var(--space-6, 24px);
}

.auth-header {
  text-align: center;
  margin-bottom: var(--space-6, 24px);
}

.auth-title {
  font-size: 24px;
  font-weight: 600;
}

.mode-tabs {
  display: flex;
  justify-content: center;
  gap: var(--space-4, 16px);
  margin-bottom: var(--space-6, 24px);
}

.tab {
  color: var(--color-text-secondary, #666);
  cursor: pointer;
  padding: var(--space-1, 4px) var(--space-2, 8px);
  transition: color 0.2s;
}

.tab:hover,
.tab.active {
  color: var(--color-primary, #4f46e5);
  font-weight: 500;
}

.app-selector {
  margin-bottom: var(--space-6, 24px);
}

.app-label {
  font-size: 14px;
  color: var(--color-text-secondary, #666);
  margin-bottom: var(--space-3, 12px);
}

.app-list {
  display: flex;
  gap: var(--space-3, 12px);
  flex-wrap: wrap;
}

.app-item {
  display: flex;
  align-items: center;
  gap: var(--space-2, 8px);
  padding: var(--space-2, 8px) var(--space-3, 12px);
  border: 1px solid var(--color-border, #ddd);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.app-item:hover,
.app-item.active {
  border-color: var(--color-primary, #4f46e5);
  background: var(--color-primary-light, #f5f3ff);
}

.app-logo {
  width: 32px;
  height: 32px;
  border-radius: 8px;
}

.app-logo-placeholder {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary, #4f46e5);
  color: #fff;
  border-radius: 8px;
  font-weight: 600;
}

.app-name {
  font-size: 14px;
}

.bind-tip {
  margin-top: var(--space-4, 16px);
  text-align: center;
  font-size: 14px;
  color: var(--color-text-secondary, #666);
}

.bind-tip a {
  color: var(--color-primary, #4f46e5);
  cursor: pointer;
  margin-left: var(--space-2, 8px);
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-3, 12px);
}

.form-actions :deep(.base-button) {
  width: 100%;
}

.bind-tabs {
  display: flex;
  gap: var(--space-4, 16px);
  margin-bottom: var(--space-6, 24px);
  border-bottom: 1px solid var(--color-border, #ddd);
}

.bind-tab {
  padding: var(--space-2, 8px) var(--space-3, 12px);
  cursor: pointer;
  color: var(--color-text-secondary, #666);
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.bind-tab.active {
  color: var(--color-primary, #4f46e5);
  border-bottom-color: var(--color-primary, #4f46e5);
}

.qrcode-bind {
  text-align: center;
  padding: var(--space-6, 24px);
}

.qrcode-box {
  width: 200px;
  height: 200px;
  margin: 0 auto var(--space-4, 16px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg, #f5f5f5);
  border-radius: 8px;
}

.qrcode-box img {
  max-width: 100%;
}

.qrcode-tip {
  color: var(--color-text-secondary, #666);
  font-size: 14px;
  margin-bottom: var(--space-4, 16px);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4, 16px);
}

.list-header h3 {
  font-size: 16px;
  font-weight: 500;
}

.app-cell {
  display: flex;
  align-items: center;
  gap: var(--space-2, 8px);
}

.app-logo-sm {
  width: 28px;
  height: 28px;
  border-radius: 6px;
}

.app-name-sm {
  font-size: 14px;
}
</style>
