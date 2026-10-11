<template>
  <base-layout :mode="layoutMode" :menus="menus">
    <base-card :title="pageTitle">
      <base-form-render v-model="formData" :schema="formSchema" @submit="handleSubmit">
        <template #footer>
          <div class="form-actions">
            <base-button type="primary" @click="handleSubmit">提交</base-button>
            <base-button @click="handleReset">重置</base-button>
          </div>
        </template>
      </base-form-render>
    </base-card>
  </base-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const pageTitle = '用户管理'
const layoutMode = 'sidebar'

const menus = [
  { key: 'dashboard', label: '控制台', icon: 'dashboard', path: '/dashboard' },
  { key: 'system', label: '系统管理', icon: 'setting', children: [
    { key: 'user', label: '用户管理', icon: 'user', path: '/system/user' },
    { key: 'role', label: '角色管理', icon: 'team', path: '/system/role' },
  ]}
]

const formSchema = {
  title: '用户信息',
  fields: [
    { field: 'username', label: '用户名', type: 'input', required: true },
    { field: 'nickname', label: '昵称', type: 'input' },
    { field: 'phone', label: '手机号', type: 'input', subType: 'phone' },
    { field: 'email', label: '邮箱', type: 'input', subType: 'email' },
    { field: 'roleId', label: '角色', type: 'select', dict: 'role' },
    { field: 'status', label: '状态', type: 'switch' }
  ]
}

const formData = ref({})

function handleSubmit() {
  console.log('提交:', formData.value)
}

function handleReset() {
  formData.value = {}
}
</script>

<style scoped>
.form-actions { display: flex; gap: 12px; justify-content: flex-end; padding-top: 16px; border-top: 1px solid var(--color-border); }
</style>
