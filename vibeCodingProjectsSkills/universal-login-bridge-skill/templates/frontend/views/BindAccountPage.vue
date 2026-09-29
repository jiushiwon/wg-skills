<!--
  BindAccountPage — 绑定页（接入侧模板）

  放在接入项目的 src/views/account/BindAccountPage.vue。
  职责：展示当前登录用户已绑定的应用列表 + 两种绑定方式 + 解绑 + 设为默认。

  已对齐 universal-login-api 2026-09-28 版设计：
    - 主体 = 当前登录用户（确认绑定只传 { code }，不收任何密码字段）
    - 确认绑定入参只有一个字段：code
    - 绑定码 5 分钟有效、一次性；方向分 app_initiated / user_initiated
    - 接口路径统一 /api 前缀（由 @/api/account 与请求层负责）

  组件依赖：vue-card-skill / vue-table-skill / vue-button-skill / vue-tag-skill /
            vue-dialog-skill / vue-form-skill / vue-input-skill / vue-select-skill
  API 依赖：@/api/account（内部走 @/utils/request 统一请求层，不得直接用 axios）
-->
<template>
  <div class="page">
    <PageHeader title="账户绑定" description="管理宿主账户与各应用账号的绑定关系">
      <template #actions>
        <!-- 应用发起 → 宿主确认：用户把第三方应用给的绑定码填进来 -->
        <base-button type="primary" @click="openConfirmDialog">确认绑定</base-button>
        <!-- 宿主发起 → 应用认领：生成绑定码交给第三方应用 -->
        <base-button @click="openCodeDialog">生成绑定码</base-button>
      </template>
    </PageHeader>

    <base-card>
      <base-table :data="rows" :columns="columns" :loading="loading">
        <template #bindType="{ row }">
          <base-tag type="info">{{ BIND_TYPE_TEXT[row.bindType] || row.bindType }}</base-tag>
        </template>

        <template #isDefault="{ row }">
          <base-tag v-if="row.isDefault" type="success">默认</base-tag>
          <base-button v-else size="sm" @click="handleSetDefault(row)">设为默认</base-button>
        </template>

        <template #_action="{ row }">
          <base-button size="sm" type="danger" @click="handleCancel(row)">解绑</base-button>
        </template>
      </base-table>
    </base-card>

    <!-- 确认绑定：只填绑定码，身份取自登录态 -->
    <base-dialog v-model:visible="confirmVisible" title="确认绑定">
      <base-form :model="confirmForm">
        <base-form-item label="绑定码" prop="code" required>
          <base-input v-model="confirmForm.code" placeholder="粘贴第三方应用提供的绑定码" />
        </base-form-item>
      </base-form>
      <p class="bind-hint">
        绑定码 5 分钟内有效且只能用一次；被绑定的账号就是当前登录账号，无需再输入任何密码。
      </p>

      <template #footer>
        <base-button @click="confirmVisible = false">取消</base-button>
        <base-button type="primary" :loading="submitting" @click="handleConfirm">确认绑定</base-button>
      </template>
    </base-dialog>

    <!-- 生成绑定码：宿主发起，交给第三方应用认领 -->
    <base-dialog v-model:visible="codeVisible" title="生成绑定码">
      <template v-if="!generatedCode">
        <base-form :model="codeForm">
          <base-form-item label="应用" prop="appId" required>
            <base-select v-model="codeForm.appId" :options="appOptions" placeholder="选择要绑定的应用" />
          </base-form-item>
        </base-form>
        <p class="bind-hint">生成后请把绑定码交给该应用的登录用户，由应用侧在 5 分钟内认领。</p>
      </template>

      <template v-else>
        <div class="bind-code">{{ generatedCode.code }}</div>
        <p class="bind-hint">
          方向：{{ BIND_CODE_DIRECTION_TEXT[generatedCode.direction] || generatedCode.direction }}<br />
          剩余有效时间：{{ generatedCode.expireSeconds }} 秒（一次性，用后即失效）
        </p>
      </template>

      <template #footer>
        <base-button @click="codeVisible = false">关闭</base-button>
        <base-button v-if="!generatedCode" type="primary" :loading="submitting" @click="handleGenerateCode">
          生成
        </base-button>
        <base-button v-else type="primary" @click="copyCode">复制绑定码</base-button>
      </template>
    </base-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { BaseCard } from 'vue-card-skill'
import { BaseTable } from 'vue-table-skill'
import { BaseButton } from 'vue-button-skill'
import { BaseTag } from 'vue-tag-skill'
import { BaseDialog } from 'vue-dialog-skill'
import { BaseForm, BaseFormItem } from 'vue-form-skill'
import { BaseInput } from 'vue-input-skill'
import { BaseSelect } from 'vue-select-skill'
import PageHeader from '@/components/PageHeader.vue'
import { extractErrorMessage } from '@/utils/error'
import * as accountApi from '@/api/account'
import type { AppVO, BindVO, BindCodeVO } from '@/api/account'

/** 绑定方式（= 绑定码方向） */
const BIND_TYPE_TEXT: Record<string, string> = {
  app_initiated: '应用发起',
  user_initiated: '宿主发起'
}

const BIND_CODE_DIRECTION_TEXT: Record<string, string> = {
  app_initiated: '应用发起 → 待宿主确认',
  user_initiated: '宿主发起 → 待应用认领'
}

const columns = [
  { key: 'appName', title: '应用' },
  { key: 'appUserId', title: '应用侧用户 ID' },
  { key: 'appUserName', title: '应用侧用户名' },
  { key: 'bindType', title: '绑定方式' },
  { key: 'bindAt', title: '绑定时间' },
  { key: 'isDefault', title: '默认' },
  { key: '_action', title: '操作', width: 110 }
]

const rows = ref<BindVO[]>([])
const apps = ref<AppVO[]>([])
const loading = ref(false)
const submitting = ref(false)

const confirmVisible = ref(false)
const codeVisible = ref(false)

const confirmForm = reactive({ code: '' })
const codeForm = reactive({ appId: null as number | null })
const generatedCode = ref<BindCodeVO | null>(null)

const appOptions = computed(() => apps.value.map((a) => ({ label: a.appName, value: a.id })))

async function fetchAll() {
  loading.value = true
  try {
    const [bindings, appPage] = await Promise.all([
      accountApi.listBindings(),
      accountApi.listApps({ page: 1, pageSize: 100 })
    ])
    apps.value = appPage.list
    rows.value = bindings
  } catch (e) {
    alert(extractErrorMessage(e))
  } finally {
    loading.value = false
  }
}

function openConfirmDialog() {
  confirmForm.code = ''
  confirmVisible.value = true
}

function openCodeDialog() {
  codeForm.appId = null
  generatedCode.value = null
  codeVisible.value = true
}

/** 确认绑定：只传 { code }，身份由宿主登录态决定 */
async function handleConfirm() {
  if (!confirmForm.code.trim()) {
    alert('请填写绑定码')
    return
  }
  submitting.value = true
  try {
    await accountApi.confirmBind({ code: confirmForm.code.trim() })
    confirmVisible.value = false
    await fetchAll()
  } catch (e) {
    alert(extractErrorMessage(e))
  } finally {
    submitting.value = false
  }
}

/** 宿主发起：生成绑定码，交给应用认领 */
async function handleGenerateCode() {
  if (!codeForm.appId) {
    alert('请选择应用')
    return
  }
  submitting.value = true
  try {
    generatedCode.value = await accountApi.createBindCode(codeForm.appId)
  } catch (e) {
    alert(extractErrorMessage(e))
  } finally {
    submitting.value = false
  }
}

async function copyCode() {
  if (!generatedCode.value) return
  await navigator.clipboard.writeText(generatedCode.value.code)
  alert('已复制绑定码')
}

async function handleSetDefault(row: BindVO) {
  try {
    await accountApi.setDefaultBinding(row.id)
    await fetchAll()
  } catch (e) {
    alert(extractErrorMessage(e))
  }
}

async function handleCancel(row: BindVO) {
  if (!confirm(`确认解绑「${row.appUserName || row.appUserId}」？解绑后两个系统各自独立。`)) return
  try {
    await accountApi.cancelBind(row.id)
    await fetchAll()
  } catch (e) {
    alert(extractErrorMessage(e))
  }
}

onMounted(fetchAll)
</script>

<style scoped>
.bind-hint {
  margin: var(--space-3) 0 0;
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.bind-code {
  padding: var(--space-4);
  border: 1px dashed var(--color-border);
  border-radius: 6px;
  font-family: var(--font-mono, monospace);
  font-size: 20px;
  letter-spacing: 2px;
  text-align: center;
  word-break: break-all;
}
</style>
