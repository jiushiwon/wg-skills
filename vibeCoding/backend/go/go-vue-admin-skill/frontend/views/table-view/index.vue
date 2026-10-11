<template>
  <base-layout :mode="layoutMode" :menus="menus">
    <base-card title="用户列表">
      <div class="table-toolbar">
        <base-button type="primary" @click="handleAdd">新增</base-button>
      </div>
      <base-table :data="tableData" :columns="columns">
        <template #status="{ row }">
          <base-switch v-model="row.status" :active-value="1" :inactive-value="2" />
        </template>
        <template #action="{ row }">
          <base-button type="link" @click="handleEdit(row)">编辑</base-button>
          <base-button type="link" danger @click="handleDelete(row)">删除</base-button>
        </template>
      </base-table>
    </base-card>
  </base-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const layoutMode = 'sidebar'
const menus = [
  { key: 'dashboard', label: '控制台', path: '/dashboard' },
  { key: 'system', label: '系统管理', children: [{ key: 'user', label: '用户管理', path: '/system/user' }]}
]

const columns = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'username', label: '用户名', width: 120 },
  { prop: 'nickname', label: '昵称', width: 120 },
  { prop: 'phone', label: '手机号', width: 130 },
  { prop: 'email', label: '邮箱', minWidth: 150 },
  { prop: 'status', label: '状态', width: 80, slot: 'status' },
  { label: '操作', width: 150, slot: 'action' }
]

const tableData = ref([
  { id: 1, username: 'admin', nickname: '管理员', phone: '13800138000', email: 'admin@example.com', status: 1 },
  { id: 2, username: 'user1', nickname: '用户1', phone: '13800138001', email: 'user1@example.com', status: 1 },
])

function handleAdd() { console.log('新增') }
function handleEdit(row: any) { console.log('编辑', row) }
function handleDelete(row: any) { console.log('删除', row) }
</script>

<style scoped>
.table-toolbar { margin-bottom: 16px; }
</style>
