<template>
  <div class="page">
    <PageHeader title="岗位管理" description="管理组织内的岗位，可分配给用户">
      <template #actions>
        <base-button v-permission="'system:post:create'" type="primary" @click="openCreate">新增岗位</base-button>
      </template>
    </PageHeader>

    <base-card>
      <base-table :data="rows" :columns="columns" :loading="loading">
        <template #_action="{ row }">
          <base-button v-permission="'system:post:edit'" size="sm" @click="openEdit(row)">编辑</base-button>
          <base-button v-permission="'system:post:delete'" size="sm" type="danger" @click="handleDelete(row)">删除</base-button>
        </template>
      </base-table>
    </base-card>

    <!-- 新增/编辑弹窗 -->
    <base-dialog
      v-model:visible="dialogVisible"
      :title="editing ? '编辑岗位' : '新增岗位'"
      :footer="false"
    >
      <base-form :model="form" :rules="rules" @submit="handleSubmit">
        <base-form-item label="名称" prop="name">
          <base-input v-model="form.name" placeholder="请输入岗位名称" />
        </base-form-item>
        <base-form-item label="编码" prop="code">
          <base-input v-model="form.code" :disabled="editing" placeholder="小写字母/数字/下划线，全局唯一" />
        </base-form-item>
        <base-form-item label="排序" prop="sortOrder">
          <base-input v-model="form.sortOrder" placeholder="请输入排序号" />
        </base-form-item>
        <base-form-item label="状态" prop="status">
          <base-select v-model="form.status" :options="statusOptions" />
        </base-form-item>

        <div class="dialog-actions">
          <base-button @click="dialogVisible = false">取消</base-button>
          <base-button type="primary" native-type="submit">确定</base-button>
        </div>
      </base-form>
    </base-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { BaseCard } from 'vue-card-skill';
import { BaseButton } from 'vue-button-skill';
import { BaseTable } from 'vue-table-skill';
import { BaseDialog } from 'vue-dialog-skill';
import { BaseForm, BaseFormItem } from 'vue-form-skill';
import { BaseInput } from 'vue-input-skill';
import { BaseSelect } from 'vue-select-skill';
import PageHeader from '@/components/PageHeader.vue';
import * as postApi from '@/api/post';
import { STATUS_OPTIONS, required } from '@/utils/validation';

const rows = ref<postApi.PostVO[]>([]);
const loading = ref(false);

const statusOptions = STATUS_OPTIONS;

const dialogVisible = ref(false);
const editing = ref(false);
const form = reactive({
  id: undefined as number | undefined,
  name: '',
  code: '',
  sortOrder: '1',
  status: 1
});

const rules: any = {
  name: [required('请输入岗位名称')],
  code: [
    required('请输入岗位编码'),
    { pattern: /^[a-zA-Z][a-zA-Z0-9_]{1,49}$/, message: '编码需以字母开头，仅含字母/数字/下划线，长度 2-50' }
  ],
  status: [required('请选择状态', 'change')]
};

const columns: any = [
  { key: 'id', title: 'ID', width: 80 },
  { key: 'name', title: '名称' },
  { key: 'code', title: '编码' },
  { key: 'sortOrder', title: '排序', width: 90 },
  {
    key: 'status',
    title: '状态',
    width: 100,
    render: (row: postApi.PostVO) =>
      row.status === 1
        ? '启用'
        : '禁用'
  },
  { key: 'createdAt', title: '创建时间', width: 180 },
  { key: '_action', title: '操作', width: 160 }
];

async function fetchList() {
  loading.value = true;
  try {
    // 后端返回裸数组，直接赋给 rows（勿取 res.list）
    rows.value = await postApi.listPosts();
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editing.value = false;
  Object.assign(form, { id: undefined, name: '', code: '', sortOrder: '1', status: 1 });
  dialogVisible.value = true;
}

function openEdit(row: postApi.PostVO) {
  editing.value = true;
  Object.assign(form, {
    id: row.id,
    name: row.name,
    code: row.code,
    sortOrder: String(row.sortOrder ?? 1),
    status: row.status ?? 1
  });
  dialogVisible.value = true;
}

async function handleSubmit() {
  const payload: postApi.CreatePostRequest = {
    name: form.name,
    code: form.code,
    sortOrder: Number(form.sortOrder) || 0,
    status: form.status
  };
  if (editing.value && form.id) {
    await postApi.updatePost(form.id, payload);
  } else {
    await postApi.createPost(payload);
  }
  dialogVisible.value = false;
  fetchList();
}

async function handleDelete(row: postApi.PostVO) {
  if (!confirm(`确认删除岗位 ${row.name}？`)) return;
  await postApi.deletePost(row.id);
  fetchList();
}

onMounted(fetchList);
</script>

<style scoped>
.page {
  padding: var(--space-4);
}
.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  padding-top: var(--space-2);
}
</style>
