<script setup lang="ts">
// src/views/UserManagement.vue
// 用户管理页（表格 + 分页 + 搜索 + 增删改查）

import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance } from 'element-plus';
import { userApi } from '@/api/modules/user';
import { showError } from '@/utils/toast';
import type { User, UserListParams, UserCreateRequest } from '@/types/user';

const loading = ref(false);
const tableData = ref<User[]>([]);
const total = ref(0);

const query = reactive<UserListParams>({
  page: 1,
  pageSize: 10,
  keyword: '',
});

const dialogVisible = ref(false);
const dialogMode = ref<'create' | 'edit'>('create');
const formRef = ref<FormInstance>();
const form = reactive<UserCreateRequest>({
  username: '',
  nickname: '',
  roles: [],
  tenantId: 1,
});

async function loadData(): Promise<void> {
  loading.value = true;
  try {
    const res = await userApi.list(query);
    tableData.value = res.data.items;
    total.value = res.data.total;
  } catch (err) {
    showError(err);
  } finally {
    loading.value = false;
  }
}

function handleSearch(): void {
  query.page = 1;
  loadData();
}

function handlePageChange(page: number): void {
  query.page = page;
  loadData();
}

function handleAdd(): void {
  dialogMode.value = 'create';
  dialogVisible.value = true;
}

async function handleDelete(row: User): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定删除用户「${row.nickname}」？`, '提示', {
      type: 'warning',
    });
    await userApi.remove(row.id);
    ElMessage.success('删除成功');
    await loadData();
  } catch (err) {
    if (err !== 'cancel') showError(err);
  }
}

async function handleSubmit(): Promise<void> {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    if (dialogMode.value === 'create') {
      await userApi.create(form);
      ElMessage.success('创建成功');
    }
    dialogVisible.value = false;
    await loadData();
  } catch (err) {
    if (err instanceof Error) showError(err);
  }
}

onMounted(loadData);
</script>

<template>
  <div class="user-management">
    <AppPageHeader title="用户管理" description="管理系统用户、角色与权限" />

    <el-card>
      <div class="toolbar">
        <el-input
          v-model="query.keyword"
          placeholder="搜索用户名 / 昵称"
          clearable
          style="width: 280px"
          @keyup.enter="handleSearch"
        />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button type="primary" plain @click="handleAdd">新增用户</el-button>
      </div>

      <el-table v-loading="loading" :data="tableData" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="nickname" label="昵称" />
        <el-table-column label="角色">
          <template #default="{ row }: { row: User }">
            <el-tag v-for="r in row.roles" :key="r" size="small" class="role-tag">
              {{ r }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }: { row: User }">
            <el-button text type="primary" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="query.page"
        v-model:page-size="query.pageSize"
        :total="total"
        layout="total, prev, pager, next, jumper"
        class="pagination"
        @current-change="handlePageChange"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogMode === 'create' ? '新增用户' : '编辑用户'" width="500px">
      <el-form ref="formRef" :model="form" label-width="80px">
        <el-form-item label="用户名" prop="username" required>
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname" required>
          <el-input v-model="form.nickname" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.role-tag {
  margin-right: var(--space-1);
}

.pagination {
  margin-top: var(--space-4);
  justify-content: flex-end;
}
</style>
