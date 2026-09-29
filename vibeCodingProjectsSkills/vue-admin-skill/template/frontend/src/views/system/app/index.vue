<!--
  应用管理（system/app）

  ★ 权限码：`system:app:list` / `:create` / `:edit` / `:delete` / `:key-manage`
    与后端 AuthPerms、DB wg_sys_menu 三处一致。

  ★ 密钥流程：创建应用时**不**返回密钥；
    在密钥管理弹窗里点「创建密钥」→ 后端返回 { apiKey, apiSecret }
    其中 apiSecret **只在此次响应里返回一次**，必须当场展示给用户并提示保存。
-->
<template>
  <div class="page-app">
    <PageHeader title="应用管理" description="管理接入的第三方应用，每个应用可签发多对密钥">
      <template #actions>
        <base-button v-permission="'system:app:create'" type="primary" @click="openCreate">新增应用</base-button>
      </template>
    </PageHeader>

    <!-- 搜索区 -->
    <base-card>
      <base-form :model="query" layout="inline" @submit="handleSearch">
        <base-form-item label="应用名" prop="appName">
          <base-input v-model="query.appName" placeholder="按应用名筛选" clearable />
        </base-form-item>
        <base-form-item label="状态" prop="status">
          <base-select
            v-model="query.status"
            :options="searchStatusOptions"
            placeholder="全部"
            clearable
          />
        </base-form-item>
        <base-form-item>
          <div class="form-actions">
            <base-button type="primary" @click="handleSearch">查询</base-button>
            <base-button @click="handleReset">重置</base-button>
          </div>
        </base-form-item>
      </base-form>
    </base-card>

    <!-- 表格 -->
    <base-card>
      <base-table :data="rows" :columns="columns" :loading="loading">
        <template #_action="{ row }">
          <base-button v-permission="'system:app:edit'" size="sm" @click="openEdit(row)">编辑</base-button>
          <base-button v-permission="'system:app:key-manage'" size="sm" @click="openKeyManager(row)">密钥管理</base-button>
          <base-button v-permission="'system:app:delete'" size="sm" type="danger" @click="handleDelete(row)">删除</base-button>
        </template>
      </base-table>

      <base-paginated
        v-model:page="query.page"
        v-model:page-size="query.pageSize"
        :total="total"
        show-total
        position="right"
        @change="onPageChange"
      />
    </base-card>

    <!-- 新增/编辑弹窗 -->
    <base-dialog
      v-model:visible="dialogVisible"
      :title="editing ? '编辑应用' : '新增应用'"
      :footer="false"
    >
      <base-form :model="form" :rules="rules" @submit="handleSubmit">
        <base-form-item label="应用名" prop="appName">
          <base-input v-model="form.appName" placeholder="请输入应用名称" />
        </base-form-item>
        <base-form-item label="公开标识" prop="appKey">
          <base-input v-model="form.appKey" placeholder="留空则自动生成（小写字母+数字）" :disabled="editing" />
        </base-form-item>
        <base-form-item label="描述" prop="description">
          <base-input v-model="form.description" type="textarea" :rows="2" placeholder="应用用途说明" />
        </base-form-item>
        <base-form-item label="回调地址" prop="callbackUrl">
          <base-input v-model="form.callbackUrl" placeholder="https://" />
        </base-form-item>
        <base-form-item v-if="editing" label="状态" prop="status">
          <base-select v-model="form.status" :options="STATUS_OPTIONS" />
        </base-form-item>
        <div class="dialog-actions">
          <base-button @click="dialogVisible = false">取消</base-button>
          <base-button type="primary" native-type="submit">确定</base-button>
        </div>
      </base-form>
    </base-dialog>

    <!-- 密钥管理弹窗 -->
    <base-dialog
      v-model:visible="keyVisible"
      :title="`密钥管理 · ${currentApp?.appName ?? ''}`"
      :footer="false"
      width="640px"
    >
      <div class="key-toolbar">
        <base-button v-permission="'system:app:key-manage'" type="primary" @click="openCreateKey">创建密钥</base-button>
        <p class="key-tip">每个应用可签发多对密钥；密钥一旦创建，其 Secret 仅显示一次。</p>
      </div>
      <base-table :data="keys" :columns="keyColumns" :loading="keysLoading">
        <template #_action="{ row }">
          <base-button v-permission="'system:app:key-manage'" size="sm" type="danger" @click="handleDisableKey(row)">禁用</base-button>
        </template>
      </base-table>
    </base-dialog>

    <!-- 创建密钥返回 secret 的一次性展示 -->
    <base-dialog v-model:visible="secretVisible" title="⚠️ 请立即保存 Secret" :footer="false" width="520px">
      <p class="secret-warn">Secret 仅在本次创建中返回一次，关闭此弹窗后无法再查看。</p>
      <div class="secret-row">
        <span class="secret-label">AppKey</span>
        <span class="secret-value">{{ lastCreatedKey?.apiKey }}</span>
      </div>
      <div class="secret-row">
        <span class="secret-label">AppSecret</span>
        <span class="secret-value secret-value--critical">{{ lastCreatedKey?.apiSecret }}</span>
      </div>
      <div class="dialog-actions">
        <base-button type="primary" @click="secretVisible = false">我已保存</base-button>
      </div>
    </base-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { BaseCard } from 'vue-card-skill';
import { BaseButton } from 'vue-button-skill';
import { BaseTable, BasePaginated } from 'vue-table-skill';
import { BaseDialog } from 'vue-dialog-skill';
import { BaseForm, BaseFormItem } from 'vue-form-skill';
import { BaseInput } from 'vue-input-skill';
import { BaseSelect } from 'vue-select-skill';
import PageHeader from '@/components/PageHeader.vue';
import * as appApi from '@/api/app';
import { STATUS_OPTIONS, required, urlRule } from '@/utils/validation';

const searchStatusOptions = [{ label: '全部', value: undefined }, ...STATUS_OPTIONS];
const STATUS_OPTIONS_ = STATUS_OPTIONS;

const query = reactive<appApi.AppQuery>({ page: 1, pageSize: 10, appName: '', status: undefined });
const rows = ref<appApi.AppVO[]>([]);
const total = ref(0);
const loading = ref(false);

async function loadList() {
  loading.value = true;
  try {
    const res = await appApi.pageApps(query);
    rows.value = res.list;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  query.page = 1;
  loadList();
}

function handleReset() {
  query.appName = '';
  query.status = undefined;
  query.page = 1;
  loadList();
}

function onPageChange() {
  loadList();
}

// ─────────── 增/改 ───────────
const dialogVisible = ref(false);
const editing = ref(false);
const form = reactive<appApi.CreateAppRequest & { id?: number; status?: 0 | 1 }>({
  appName: '',
  appKey: '',
  description: '',
  callbackUrl: '',
});

const rules = {
  appName: [required('请输入应用名'), { min: 2, max: 100, message: '长度 2-100' }],
  callbackUrl: [urlRule],
};

function resetForm() {
  form.appName = '';
  form.appKey = '';
  form.description = '';
  form.callbackUrl = '';
  form.id = undefined;
  form.status = undefined;
}

function openCreate() {
  resetForm();
  editing.value = false;
  dialogVisible.value = true;
}

function openEdit(row: appApi.AppVO) {
  resetForm();
  form.appName = row.appName;
  form.appKey = row.appKey;
  form.description = row.description ?? '';
  form.callbackUrl = row.callbackUrl ?? '';
  form.status = row.status;
  form.id = row.id;
  editing.value = true;
  dialogVisible.value = true;
}

async function handleSubmit() {
  if (editing.value && form.id) {
    await appApi.updateApp(form.id, {
      appName: form.appName,
      description: form.description,
      callbackUrl: form.callbackUrl,
      status: form.status,
    });
  } else {
    await appApi.createApp({
      appName: form.appName,
      appKey: form.appKey || undefined,
      description: form.description,
      callbackUrl: form.callbackUrl,
    });
  }
  dialogVisible.value = false;
  loadList();
}

async function handleDelete(row: appApi.AppVO) {
  if (!window.confirm(`确定删除应用「${row.appName}」？该操作会同时解绑所有账户。`)) return;
  await appApi.deleteApp(row.id);
  loadList();
}

// ─────────── 密钥管理 ───────────
const keyVisible = ref(false);
const currentApp = ref<appApi.AppVO | null>(null);
const keys = ref<appApi.AppKeyVO[]>([]);
const keysLoading = ref(false);
const secretVisible = ref(false);
const lastCreatedKey = ref<appApi.CreatedAppKeyVO | null>(null);

const keyColumns = [
  { key: 'keyName', title: '密钥名' },
  { key: 'apiKey', title: 'AppKey' },
  { key: 'status', title: '状态', render: (row: appApi.AppKeyVO) => row.status === 1 ? '启用' : '禁用' },
  { key: 'lastUsedAt', title: '最后调用' },
  { key: 'createdAt', title: '创建时间' },
];

async function openKeyManager(row: appApi.AppVO) {
  currentApp.value = row;
  keyVisible.value = true;
  await loadKeys();
}

async function loadKeys() {
  if (!currentApp.value) return;
  keysLoading.value = true;
  try {
    const res = await appApi.pageAppKeys(currentApp.value.id, { page: 1, pageSize: 100 });
    keys.value = res.list;
  } finally {
    keysLoading.value = false;
  }
}

async function openCreateKey() {
  if (!currentApp.value) return;
  const result = await appApi.createAppKey(currentApp.value.id, {});
  lastCreatedKey.value = result;
  secretVisible.value = true;
  await loadKeys();
}

async function handleDisableKey(row: appApi.AppKeyVO) {
  if (!currentApp.value) return;
  if (!window.confirm(`确定禁用密钥「${row.apiKey}」？禁用后该密钥无法恢复，需重新创建。`)) return;
  await appApi.disableAppKey(currentApp.value.id, row.id);
  await loadKeys();
}

// ─────────── 表格列 ───────────
const columns = computed(() => [
  { key: 'id', title: 'ID', width: 80 },
  { key: 'appName', title: '应用名' },
  { key: 'appKey', title: '公开标识' },
  { key: 'description', title: '描述' },
  { key: 'status', title: '状态', render: (row: appApi.AppVO) => row.status === 1 ? '启用' : '禁用' },
  { key: 'createdAt', title: '创建时间' },
]);

onMounted(loadList);
</script>

<style scoped>
.page-app { padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-4); }
.form-actions { display: flex; gap: var(--space-2); }
.dialog-actions { display: flex; justify-content: flex-end; gap: var(--space-2); margin-top: var(--space-4); }
.key-toolbar { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-3); }
.key-tip { color: var(--color-warning); font-size: 13px; margin: 0; }
.secret-warn { color: var(--color-danger); font-size: 13px; }
.secret-row { display: flex; gap: var(--space-2); padding: var(--space-2); border-bottom: 1px dashed var(--color-border); font-family: monospace; }
.secret-label { color: var(--color-text-secondary); width: 100px; }
.secret-value { word-break: break-all; }
.secret-value--critical { color: var(--color-danger); font-weight: 600; }
</style>