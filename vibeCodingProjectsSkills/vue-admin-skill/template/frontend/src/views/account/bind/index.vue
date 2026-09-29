<!--
  账户绑定（account/bind）

  ★ 显示当前登录用户的应用绑定列表（来自登录态，不接收 userId）。
  ★ 两条绑定流程：
    1. 应用发起：第三方应用后端调 POST /api/open/bind/apply 取得绑定码，
       宿主用户在前端输入码 → POST /api/bind/confirm
    2. 宿主发起：选应用 → POST /api/bind/code 取得绑定码（含 qrContent）
       → 应用侧扫码调 POST /api/open/bind/claim 完成
  ★ 旧版的 mainUsername/mainPassword 输入项已彻底删除。
-->
<template>
  <div class="page-bind">
    <PageHeader title="应用绑定" description="管理你已绑定的第三方应用，可发起新绑定或解绑">
      <template #actions>
        <base-button v-permission="'account:bind:create'" type="primary" @click="openCreate">发起绑定</base-button>
      </template>
    </PageHeader>

    <!-- 列表 -->
    <base-card>
      <base-table :data="rows" :columns="columns" :loading="loading">
        <template #_default="{ row }">
          <div class="bind-app">
            <span class="bind-app__name">{{ row.appName || `#${row.appId}` }}</span>
            <span v-if="row.isDefault === 1" class="bind-app__default">默认</span>
          </div>
        </template>
        <template #_action="{ row }">
          <base-button
            v-permission="'account:bind:set-default'"
            v-if="row.isDefault !== 1"
            size="sm"
            @click="handleSetDefault(row)"
          >设为默认</base-button>
          <base-button v-permission="'account:bind:delete'" size="sm" type="danger" @click="handleUnbind(row)">解绑</base-button>
        </template>
      </base-table>
      <p v-if="rows.length === 0 && !loading" class="empty-tip">暂无绑定，去右上角发起一个吧</p>
    </base-card>

    <!-- 发起绑定弹窗：选应用 + 选方向 -->
    <base-dialog v-model:visible="createVisible" title="发起绑定" :footer="false" width="520px">
      <base-form :model="createForm" :rules="createRules" @submit="confirmCreate">
        <base-form-item label="目标应用" prop="appId">
          <base-select
            v-model="createForm.appId"
            :options="appOptions"
            placeholder="请选择要绑定的应用"
            filterable
          />
        </base-form-item>
        <base-form-item label="绑定方向" prop="direction">
          <base-select v-model="createForm.direction" :options="directionOptions" />
          <p class="direction-tip">{{ directionTip }}</p>
        </base-form-item>
        <div class="dialog-actions">
          <base-button @click="createVisible = false">取消</base-button>
          <base-button type="primary" native-type="submit">生成绑定码</base-button>
        </div>
      </base-form>
    </base-dialog>

    <!-- 绑定码弹窗：根据方向区分展示 -->
    <base-dialog v-model:visible="codeVisible" title="请完成绑定" :footer="false" width="520px">
      <div v-if="lastCode">
        <p class="code-tip">
          {{ description }}
        </p>
        <div class="code-box">
          <span class="code-box__label">绑定码</span>
          <span class="code-box__value">{{ lastCode.code }}</span>
          <span class="code-box__expire">有效期至 {{ lastCode.expireAt }}</span>
        </div>
        <div v-if="lastCode.qrContent" class="qr-tip">
          扫码内容：<code>{{ lastCode.qrContent }}</code>
        </div>
      </div>
      <div class="dialog-actions">
        <base-button type="primary" @click="codeVisible = false">关闭</base-button>
      </div>
    </base-dialog>

    <!-- 确认绑定弹窗：宿主输入应用发来的绑定码 -->
    <base-dialog v-model:visible="confirmVisible" title="确认绑定" :footer="false" width="480px">
      <base-form :model="confirmForm" :rules="confirmRules" @submit="doConfirm">
        <base-form-item label="绑定码" prop="code">
          <base-input v-model="confirmForm.code" placeholder="请输入应用提供的绑定码" />
        </base-form-item>
        <div class="dialog-actions">
          <base-button @click="confirmVisible = false">取消</base-button>
          <base-button type="primary" native-type="submit">确认</base-button>
        </div>
      </base-form>
    </base-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { BaseCard } from 'vue-card-skill';
import { BaseButton } from 'vue-button-skill';
import { BaseTable } from 'vue-table-skill';
import { BaseDialog } from 'vue-dialog-skill';
import { BaseForm, BaseFormItem } from 'vue-form-skill';
import { BaseInput } from 'vue-input-skill';
import { BaseSelect } from 'vue-select-skill';
import PageHeader from '@/components/PageHeader.vue';
import * as bindApi from '@/api/bind';
import * as appApi from '@/api/app';
import { required } from '@/utils/validation';

const rows = ref<bindApi.BindVO[]>([]);
const loading = ref(false);

async function loadList() {
  loading.value = true;
  try {
    const res = await bindApi.listMyBindings({ page: 1, pageSize: 100 });
    rows.value = res.list;
  } finally {
    loading.value = false;
  }
}

const columns = [
  { key: 'id', title: 'ID', width: 80 },
  { key: '_default', title: '应用' },            // 由 #_default slot 渲染
  { key: 'bindType', title: '方式', render: (r: bindApi.BindVO) => r.bindType === 'app_initiated' ? '应用发起' : '宿主发起' },
  { key: 'appUserName', title: '应用用户名' },
  { key: 'bindAt', title: '绑定时间' },
];

// ─────────── 发起绑定 ───────────
const createVisible = ref(false);
const appOptions = ref<{ label: string; value: number }[]>([]);

async function loadAppOptions() {
  const res = await appApi.pageApps({ page: 1, pageSize: 200, status: 1 });
  appOptions.value = res.list.map(a => ({ label: `${a.appName} · ${a.appKey}`, value: a.id }));
}

const directionOptions = [
  { label: '应用发起（我输入应用提供的码）', value: 'app_initiated' },
  { label: '宿主发起（我提供码给应用认领）', value: 'user_initiated' },
];

const directionTip = computed(() => {
  if (createForm.direction === 'app_initiated') {
    return '请先在第三方应用中触发绑定流程，获取绑定码后粘贴到下方确认。';
  }
  return '系统会生成绑定码 + 二维码，交给第三方应用扫描即可完成绑定。';
});

const createForm = reactive<bindApi.CreateBindCodeRequest>({
  appId: undefined as number | undefined,
  direction: 'app_initiated',
});

const createRules = {
  appId: [required('请选择应用', 'change')],
  direction: [required('请选择方向', 'change')],
};

function openCreate() {
  createForm.appId = undefined;
  createForm.direction = 'app_initiated';
  createVisible.value = true;
  loadAppOptions();
}

const codeVisible = ref(false);
const lastCode = ref<bindApi.BindCodeVO | null>(null);
const description = ref('');

async function confirmCreate() {
  const result = await bindApi.createBindCode({
    appId: createForm.appId,
    direction: createForm.direction,
  });
  lastCode.value = result;
  description.value = result.direction === 'app_initiated'
    ? '将下方绑定码填回应用，完成绑定。'
    : '把下方绑定码或二维码交给应用扫码完成绑定。';
  createVisible.value = false;
  codeVisible.value = true;
}

// ─────────── 确认绑定（应用发起 → 宿主填码） ───────────
const confirmVisible = ref(false);
const confirmForm = reactive<bindApi.BindConfirmRequest>({ code: '' });
const confirmRules = {
  code: [required('请输入绑定码')],
};

function openConfirm() {
  confirmForm.code = '';
  confirmVisible.value = true;
}

async function doConfirm() {
  await bindApi.confirmBind({ code: confirmForm.code });
  confirmVisible.value = false;
  loadList();
}

async function handleUnbind(row: bindApi.BindVO) {
  if (!window.confirm(`确定解绑「${row.appName || row.appId}」？`)) return;
  await bindApi.unbind(row.id);
  loadList();
}

async function handleSetDefault(row: bindApi.BindVO) {
  await bindApi.setDefault(row.id);
  loadList();
}

onMounted(loadList);
</script>

<style scoped>
.page-bind { padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-4); }
.dialog-actions { display: flex; justify-content: flex-end; gap: var(--space-2); margin-top: var(--space-4); }
.bind-app { display: flex; align-items: center; gap: var(--space-2); }
.bind-app__name { font-weight: 500; }
.bind-app__default { font-size: 12px; padding: 0 6px; border-radius: 4px; background: var(--color-primary-soft); color: var(--color-primary); }
.direction-tip { margin: 4px 0 0; font-size: 12px; color: var(--color-text-secondary); }
.code-tip { margin: 0 0 var(--space-3); }
.code-box { display: flex; flex-direction: column; gap: 4px; padding: var(--space-3); border: 1px dashed var(--color-border); border-radius: 4px; }
.code-box__label { font-size: 12px; color: var(--color-text-secondary); }
.code-box__value { font-family: monospace; font-size: 16px; font-weight: 600; word-break: break-all; color: var(--color-primary); }
.code-box__expire { font-size: 12px; color: var(--color-warning); }
.qr-tip { margin-top: var(--space-2); font-size: 12px; color: var(--color-text-secondary); word-break: break-all; }
.empty-tip { text-align: center; color: var(--color-text-secondary); padding: var(--space-6); }
</style>