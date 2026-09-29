<template>
  <div class="page">
    <PageHeader title="角色管理" description="管理角色、分配菜单权限与数据权限">
      <template #actions>
        <base-button v-permission="'system:role:create'" type="primary" @click="openCreate">新增角色</base-button>
      </template>
    </PageHeader>

    <!-- 搜索区：搜索区也是表单，必须包在 <base-form> 内（form-contract §十三 R1） -->
    <base-card>
      <base-form :model="query" layout="inline" @submit="handleSearch">
        <base-form-item label="关键字" prop="keyword">
          <base-input v-model="query.keyword" placeholder="角色名/编码" clearable />
        </base-form-item>
        <base-form-item>
          <div class="form-actions">
            <base-button type="primary" @click="handleSearch">查询</base-button>
            <base-button @click="handleReset">重置</base-button>
          </div>
        </base-form-item>
      </base-form>
    </base-card>

    <base-card>
      <base-table :data="rows" :columns="columns" :loading="loading">
        <template #_action="{ row }">
          <base-button v-permission="'system:role:assign-menu'" size="sm" @click="openAssignMenus(row)">分配菜单</base-button>
          <base-button v-permission="'system:role:edit'" size="sm" @click="openEdit(row)">编辑</base-button>
          <base-button v-permission="'system:role:delete'" size="sm" type="danger" @click="handleDelete(row)">删除</base-button>
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

    <!-- 新增/编辑弹窗：按钮放在 base-form 内，native-type="submit" 才会触发 :rules 校验 -->
    <base-dialog
      v-model:visible="dialogVisible"
      :title="editing ? '编辑角色' : '新增角色'"
      :footer="false"
    >
      <base-form :model="form" :rules="rules" @submit="handleSubmit">
        <base-form-item label="名称" prop="name">
          <base-input v-model="form.name" placeholder="请输入角色名称" />
        </base-form-item>
        <base-form-item label="编码" prop="code">
          <base-input v-model="form.code" :disabled="editing" placeholder="小写字母开头，可含数字与下划线" />
        </base-form-item>
        <base-form-item label="描述" prop="description">
          <base-input v-model="form.description" type="textarea" />
        </base-form-item>
        <base-form-item label="数据权限" prop="dataScope">
          <base-select v-model="form.dataScope" :options="dataScopeOptions" />
        </base-form-item>
        <base-form-item label="排序" prop="sortOrder">
          <base-input v-model="form.sortOrder" placeholder="请输入排序号" />
        </base-form-item>
        <base-form-item label="状态" prop="status">
          <!-- 后端 status 是 Integer(0/1)，数值型字段禁止用 switch（form-contract §十三 R3） -->
          <base-select v-model="form.status" :options="statusOptions" />
        </base-form-item>

        <div class="dialog-actions">
          <base-button @click="dialogVisible = false">取消</base-button>
          <base-button type="primary" native-type="submit">确定</base-button>
        </div>
      </base-form>
    </base-dialog>

    <!-- 分配菜单弹窗 -->
    <base-dialog v-model:visible="assignVisible" title="分配菜单" width="520px" :footer="false">
      <base-form :model="assignForm" @submit="confirmAssignMenus">
        <CheckboxTree v-model="selectedMenuIds" :nodes="menuNodes" />
        <div class="dialog-actions">
          <base-button @click="assignVisible = false">取消</base-button>
          <base-button type="primary" native-type="submit">确定</base-button>
        </div>
      </base-form>
    </base-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, h, onMounted } from 'vue';
import { BaseCard } from 'vue-card-skill';
import { BaseButton } from 'vue-button-skill';
import { BaseTag } from 'vue-tag-skill';
import { BaseTable, BasePaginated } from 'vue-table-skill';
import { BaseDialog } from 'vue-dialog-skill';
import { BaseForm, BaseFormItem } from 'vue-form-skill';
import { BaseInput } from 'vue-input-skill';
import { BaseSelect } from 'vue-select-skill';
import PageHeader from '@/components/PageHeader.vue';
import CheckboxTree from '@/components/CheckboxTree.vue';
import * as roleApi from '@/api/role';
import * as menuApi from '@/api/menu';
import { STATUS_OPTIONS, required } from '@/utils/validation';

const query = reactive<roleApi.RoleQuery>({ page: 1, pageSize: 10, keyword: '' });
const rows = ref<roleApi.RoleVO[]>([]);
const total = ref(0);
const loading = ref(false);

/** 数据权限 4 档（与后端 DataScope 一致） */
const dataScopeOptions = [
  { label: '全部数据', value: 'ALL' },
  { label: '本部门及以下', value: 'DEPT_AND_BELOW' },
  { label: '本部门', value: 'DEPT_ONLY' },
  { label: '仅本人', value: 'SELF_ONLY' }
];
const dataScopeLabels: Record<roleApi.DataScope, string> = {
  ALL: '全部数据',
  DEPT_AND_BELOW: '本部门及以下',
  DEPT_ONLY: '本部门',
  SELF_ONLY: '仅本人'
};

const statusOptions = STATUS_OPTIONS;

const dialogVisible = ref(false);
const editing = ref(false);
/** sortOrder 用文本输入承载，提交时再转 number（base-input 不支持 number 类型） */
const form = reactive({
  id: undefined as number | undefined,
  name: '',
  code: '',
  description: '',
  dataScope: 'ALL' as roleApi.DataScope,
  sortOrder: '1',
  status: 1
});

const rules: FormRules = {
  name: [required('请输入角色名称'), { min: 2, max: 20, message: '角色名称长度需为 2-20 个字符' }],
  code: [
    required('请输入角色编码'),
    { pattern: /^[a-z][a-z0-9_]{1,29}$/, message: '编码需以小写字母开头，仅含小写字母/数字/下划线，长度 2-30' }
  ],
  dataScope: [required('请选择数据权限', 'change')],
  status: [required('请选择状态', 'change')]
};

const assignVisible = ref(false);
const assignForm = reactive({});
const menuNodes = ref<CheckboxTreeNode[]>([]);
const selectedMenuIds = ref<number[]>([]);
const currentRow = ref<roleApi.RoleVO | null>(null);

const columns = computed(() => [
  { key: 'id', title: 'ID', width: 80 },
  { key: 'name', title: '名称' },
  { key: 'code', title: '编码' },
  { key: 'description', title: '描述' },
  {
    key: 'dataScope',
    title: '数据权限',
    width: 130,
    render: (row: roleApi.RoleVO) => dataScopeLabels[row.dataScope] ?? row.dataScope
  },
  { key: 'menuCount', title: '菜单数', width: 90 },
  {
    key: 'status',
    title: '状态',
    width: 100,
    render: (row: roleApi.RoleVO) =>
      h(BaseTag, { type: row.status === 1 ? 'success' : 'danger' }, () => (row.status === 1 ? '启用' : '禁用'))
  },
  { key: 'createdAt', title: '创建时间', width: 180 },
  { key: '_action', title: '操作', width: 240 }
]);

async function fetchList() {
  loading.value = true;
  try {
    const res = await roleApi.getRoleList({ ...query });
    rows.value = res.list;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  query.page = 1;
  fetchList();
}

function handleReset() {
  query.keyword = '';
  query.page = 1;
  fetchList();
}

function onPageChange(page: number) {
  query.page = page;
  fetchList();
}

function openCreate() {
  editing.value = false;
  Object.assign(form, { id: undefined, name: '', code: '', description: '', dataScope: 'ALL', sortOrder: '1', status: 1 });
  dialogVisible.value = true;
}

function openEdit(row: roleApi.RoleVO) {
  editing.value = true;
  Object.assign(form, {
    id: row.id,
    name: row.name,
    code: row.code,
    description: row.description ?? '',
    dataScope: row.dataScope,
    sortOrder: String(row.sortOrder ?? 1),
    status: row.status
  });
  dialogVisible.value = true;
}

async function handleSubmit() {
  const payload = {
    name: form.name,
    description: form.description,
    dataScope: form.dataScope,
    sortOrder: Number(form.sortOrder) || 0,
    status: form.status
  };
  if (editing.value && form.id) {
    await roleApi.updateRole(form.id, payload);
  } else {
    await roleApi.createRole({ ...payload, code: form.code });
  }
  dialogVisible.value = false;
  fetchList();
}

async function handleDelete(row: roleApi.RoleVO) {
  if (!confirm(`确认删除角色 ${row.name}？`)) return;
  await roleApi.deleteRole(row.id);
  fetchList();
}

/** 菜单树 → 复选树节点 */
function toCheckboxTree(list: menuApi.MenuVO[]): CheckboxTreeNode[] {
  return list.map((node) => ({
    id: node.id,
    name: node.name,
    children: node.children?.length ? toCheckboxTree(node.children) : undefined
  }));
}

async function openAssignMenus(row: roleApi.RoleVO) {
  currentRow.value = row;
  // ★ 必须先回填：不回填则每次点确定都会把该角色的菜单权限覆盖清空
  const [tree, checkedIds] = await Promise.all([menuApi.getMenuTree(), roleApi.getRoleMenus(row.id)]);
  menuNodes.value = toCheckboxTree(tree);
  selectedMenuIds.value = checkedIds;
  assignVisible.value = true;
}

async function confirmAssignMenus() {
  if (!currentRow.value) return;
  await roleApi.assignRoleMenus(currentRow.value.id, selectedMenuIds.value);
  assignVisible.value = false;
  fetchList();
}

onMounted(fetchList);
</script>

<style scoped>
.page {
  padding: var(--space-4);
}
.form-actions {
  display: flex;
  gap: var(--space-2);
}
.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  padding-top: var(--space-2);
}
</style>
