<template>
  <div class="page-user">
    <PageHeader title="用户管理" description="管理系统用户、分配角色与重置密码">
      <template #actions>
        <base-button v-permission="'system:user:create'" type="primary" @click="openCreate">新增用户</base-button>
      </template>
    </PageHeader>

    <!-- 搜索区：搜索区也是表单，必须包在 <base-form> 内（form-contract §十三 R1） -->
    <base-card>
      <base-form :model="query" layout="inline" @submit="handleSearch">
        <base-form-item label="用户名" prop="username">
          <base-input v-model="query.username" placeholder="请输入用户名" clearable />
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
          <base-button v-permission="'system:user:edit'" size="sm" @click="openEdit(row)">编辑</base-button>
          <base-button v-permission="'system:user:assign-role'" size="sm" @click="openAssignRoles(row)">分配角色</base-button>
          <base-button v-permission="'system:user:reset-pwd'" size="sm" @click="openResetPwd(row)">重置密码</base-button>
          <base-button v-permission="'system:user:delete'" size="sm" type="danger" @click="handleDelete(row)">删除</base-button>
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
      :title="editing ? '编辑用户' : '新增用户'"
      :footer="false"
    >
      <base-form :model="form" :rules="rules" @submit="handleSubmit">
        <base-form-item label="用户名" prop="username">
          <base-input v-model="form.username" :disabled="editing" placeholder="请输入用户名" />
        </base-form-item>
        <base-form-item v-if="!editing" label="密码" prop="password" :rules="passwordRules">
          <base-input v-model="form.password" type="password" show-password placeholder="不少于 6 位" />
        </base-form-item>
        <base-form-item label="昵称" prop="nickname">
          <base-input v-model="form.nickname" placeholder="请输入昵称" />
        </base-form-item>
        <!-- 手机号 / 邮箱是文本类的 subType（契约：{ type: 'input', subType: 'phone' } / 'email'） -->
        <base-form-item label="邮箱" prop="email">
          <base-input v-model="form.email" placeholder="请输入邮箱" />
        </base-form-item>
        <base-form-item label="手机号" prop="phone">
          <base-input v-model="form.phone" placeholder="请输入手机号" />
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

    <!-- 重置密码弹窗 -->
    <base-dialog v-model:visible="resetVisible" title="重置密码" :footer="false">
      <base-form :model="resetForm" :rules="resetRules" @submit="confirmResetPwd">
        <base-form-item label="新密码" prop="newPassword">
          <base-input v-model="resetForm.newPassword" type="password" show-password placeholder="不少于 6 位" />
        </base-form-item>
        <div class="dialog-actions">
          <base-button @click="resetVisible = false">取消</base-button>
          <base-button type="primary" native-type="submit">确定</base-button>
        </div>
      </base-form>
    </base-dialog>

    <!-- 分配角色弹窗：打开时先回填当前已选角色，避免点确定把已有分配清空 -->
    <base-dialog v-model:visible="assignVisible" title="分配角色" :footer="false">
      <base-form :model="assignForm" @submit="confirmAssignRoles">
        <p class="assign-tip">为 {{ currentRow?.nickname || currentRow?.username }} 分配角色</p>
        <CheckboxTree v-model="selectedRoleIds" :nodes="roleNodes" />
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
import * as userApi from '@/api/user';
import * as roleApi from '@/api/role';
import { STATUS_OPTIONS, emailRule, phoneRule, required } from '@/utils/validation';

const query = reactive<userApi.UserQuery>({ page: 1, pageSize: 10, username: '', status: undefined });
const rows = ref<userApi.UserVO[]>([]);
const total = ref(0);
const loading = ref(false);

/** 搜索用状态选项（含“全部”） */
const searchStatusOptions = [{ label: '全部', value: undefined }, ...STATUS_OPTIONS];
const statusOptions = STATUS_OPTIONS;

const dialogVisible = ref(false);
const editing = ref(false);
const form = reactive({
  id: undefined as number | undefined,
  username: '',
  password: '',
  nickname: '',
  email: '',
  phone: '',
  status: 1
});

const rules: FormRules = {
  username: [required('请输入用户名'), { min: 3, max: 20, message: '用户名长度需为 3-20 个字符' }],
  nickname: [required('请输入昵称')],
  email: [emailRule],
  phone: [phoneRule],
  status: [required('请选择状态', 'change')]
};

/** 密码仅在新增时出现，规则放在表单项上（表单项级 rules 优先级高于表单级） */
const passwordRules: FormRule[] = [required('请输入密码'), { min: 6, max: 32, message: '密码长度需为 6-32 位' }];

const resetVisible = ref(false);
const resetForm = reactive({ newPassword: '' });
const resetRules: FormRules = {
  newPassword: [required('请输入新密码'), { min: 6, max: 32, message: '密码长度需为 6-32 位' }]
};

const currentRow = ref<userApi.UserVO | null>(null);

const assignVisible = ref(false);
const assignForm = reactive({});
const roleNodes = ref<CheckboxTreeNode[]>([]);
const selectedRoleIds = ref<number[]>([]);

const columns = computed(() => [
  { key: 'id', title: 'ID', width: 80 },
  { key: 'username', title: '用户名' },
  { key: 'nickname', title: '昵称' },
  { key: 'email', title: '邮箱' },
  { key: 'phone', title: '手机号' },
  { key: 'orgName', title: '所属组织', width: 140 },
  {
    key: 'status',
    title: '状态',
    width: 100,
    render: (row: userApi.UserVO) =>
      h(BaseTag, { type: row.status === 1 ? 'success' : 'danger' }, () => (row.status === 1 ? '启用' : '禁用'))
  },
  { key: 'createdAt', title: '创建时间', width: 180 },
  { key: '_action', title: '操作', width: 280 }
]);

async function fetchList() {
  loading.value = true;
  try {
    const res = await userApi.getUserList({ ...query });
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
  query.username = '';
  query.status = undefined;
  query.page = 1;
  fetchList();
}

function onPageChange(page: number) {
  query.page = page;
  fetchList();
}

function openCreate() {
  editing.value = false;
  Object.assign(form, { id: undefined, username: '', password: '', nickname: '', email: '', phone: '', status: 1 });
  dialogVisible.value = true;
}

function openEdit(row: userApi.UserVO) {
  editing.value = true;
  Object.assign(form, {
    id: row.id,
    username: row.username,
    password: '',
    nickname: row.nickname ?? '',
    email: row.email ?? '',
    phone: row.phone ?? '',
    status: row.status
  });
  dialogVisible.value = true;
}

async function handleSubmit() {
  if (editing.value && form.id) {
    // 更新接口不处理 username / password / roleIds / postIds
    const payload: userApi.UpdateUserRequest = {
      nickname: form.nickname,
      email: form.email || undefined,
      phone: form.phone || undefined,
      status: form.status
    };
    await userApi.updateUser(form.id, payload);
  } else {
    const payload: userApi.CreateUserRequest = {
      username: form.username,
      password: form.password,
      nickname: form.nickname,
      email: form.email || undefined,
      phone: form.phone || undefined,
      status: form.status
    };
    await userApi.createUser(payload);
  }
  dialogVisible.value = false;
  fetchList();
}

async function handleDelete(row: userApi.UserVO) {
  if (!confirm(`确认删除用户 ${row.username}？`)) return;
  await userApi.deleteUser(row.id);
  fetchList();
}

function openResetPwd(row: userApi.UserVO) {
  currentRow.value = row;
  resetForm.newPassword = '';
  resetVisible.value = true;
}

async function confirmResetPwd() {
  if (!currentRow.value) return;
  await userApi.resetUserPassword(currentRow.value.id, resetForm.newPassword);
  resetVisible.value = false;
}

async function openAssignRoles(row: userApi.UserVO) {
  currentRow.value = row;
  // ★ 必须先回填：列表项不含 roles，不回填会把已有角色分配覆盖清空
  const [roles, checkedIds] = await Promise.all([
    roleApi.getRoleList({ page: 1, pageSize: 100 }),
    userApi.getUserRoles(row.id)
  ]);
  roleNodes.value = roles.list.map((role) => ({ id: role.id, name: `${role.name}（${role.code}）` }));
  selectedRoleIds.value = checkedIds;
  assignVisible.value = true;
}

async function confirmAssignRoles() {
  if (!currentRow.value) return;
  await userApi.assignUserRoles(currentRow.value.id, selectedRoleIds.value);
  assignVisible.value = false;
  fetchList();
}

onMounted(fetchList);
</script>

<style scoped>
.page-user {
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
.assign-tip {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-sm);
}
</style>
