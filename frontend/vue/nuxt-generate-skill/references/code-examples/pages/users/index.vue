<script setup lang="ts">
import type { User, UserListParams } from '~/types/user'
import type { ApiResponse, ApiListResponse } from '~/types/api'

definePageMeta({
  middleware: 'auth',
})

useHead({
  title: '用户管理',
})

const query = reactive<UserListParams>({
  page: 1,
  pageSize: 10,
  keyword: '',
  role: undefined,
  status: undefined,
})

const { data, pending, refresh } = useAsyncData(
  'user-list',
  () => $fetch<ApiResponse<ApiListResponse<User>>>('/api/users', { query }),
  { watch: [() => query.page, () => query.pageSize] },
)

const tableData = computed(() => data.value?.data?.items ?? [])
const total = computed(() => data.value?.data?.total ?? 0)

function handleSearch(): void {
  query.page = 1
  refresh()
}

function handlePageChange(page: number): void {
  query.page = page
}

function handleSizeChange(size: number): void {
  query.pageSize = size
  query.page = 1
}

const roleMap: Record<string, string> = {
  admin: '管理员',
  editor: '编辑',
  viewer: '查看者',
}

const statusMap: Record<string, { label: string; type: string }> = {
  active: { label: '正常', type: 'success' },
  inactive: { label: '停用', type: 'info' },
  banned: { label: '封禁', type: 'danger' },
}
</script>

<template>
  <div class="user-list">
    <h1 class="page-title">用户管理</h1>

    <div class="search-bar">
      <input
        v-model="query.keyword"
        type="text"
        placeholder="搜索用户名/昵称"
        @keyup.enter="handleSearch"
      />
      <select v-model="query.role" @change="handleSearch">
        <option value="">全部角色</option>
        <option value="admin">管理员</option>
        <option value="editor">编辑</option>
        <option value="viewer">查看者</option>
      </select>
      <button @click="handleSearch">搜索</button>
    </div>

    <div v-if="pending" class="loading">加载中...</div>

    <table v-else class="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>用户名</th>
          <th>昵称</th>
          <th>邮箱</th>
          <th>角色</th>
          <th>状态</th>
          <th>创建时间</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in tableData" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.username }}</td>
          <td>{{ user.nickname }}</td>
          <td>{{ user.email }}</td>
          <td>{{ roleMap[user.role] ?? user.role }}</td>
          <td>
            <span :class="['status-tag', statusMap[user.status]?.type]">
              {{ statusMap[user.status]?.label ?? user.status }}
            </span>
          </td>
          <td>{{ user.createdAt }}</td>
        </tr>
      </tbody>
    </table>

    <div class="pagination">
      <span>共 {{ total }} 条</span>
      <button :disabled="query.page! <= 1" @click="handlePageChange(query.page! - 1)">上一页</button>
      <span>第 {{ query.page }} 页</span>
      <button @click="handlePageChange(query.page! + 1)">下一页</button>
      <select :value="query.pageSize" @change="handleSizeChange(Number(($event.target as HTMLSelectElement).value))">
        <option :value="10">10 条/页</option>
        <option :value="20">20 条/页</option>
        <option :value="50">50 条/页</option>
      </select>
    </div>
  </div>
</template>

<style scoped>
.page-title {
  font-size: 20px;
  margin-bottom: 20px;
}

.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.search-bar input,
.search-bar select {
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
}

.search-bar button {
  padding: 8px 20px;
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ebeef5;
  font-size: 14px;
}

.data-table th {
  background: #fafafa;
  font-weight: 600;
}

.status-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-tag.success {
  background: #f0f9eb;
  color: #67c23a;
}

.status-tag.info {
  background: #f4f4f5;
  color: #909399;
}

.status-tag.danger {
  background: #fef0f0;
  color: #f56c6c;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
  padding: 12px 0;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #999;
}
</style>
