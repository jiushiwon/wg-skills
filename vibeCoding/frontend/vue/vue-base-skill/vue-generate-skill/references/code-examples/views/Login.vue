<script setup lang="ts">
// src/views/Login.vue
// 登录页（完整示例：表单校验 + API 调用 + 错误处理 + 路由跳转）

import { reactive, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import type { FormInstance, FormRules } from 'element-plus';
import { login } from '@/services/auth.service';
import { showError } from '@/utils/toast';
import type { LoginRequest } from '@/types/api';

interface LoginForm {
  username: string;
  password: string;
}

const router = useRouter();
const route = useRoute();

const formRef = ref<FormInstance>();
const loading = ref(false);

const form = reactive<LoginForm>({
  username: '',
  password: '',
});

const rules: FormRules<LoginForm> = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 32, message: '长度 3-32 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 64, message: '长度 6-64 个字符', trigger: 'blur' },
  ],
};

async function handleSubmit(): Promise<void> {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
  } catch {
    return;
  }

  loading.value = true;
  try {
    const credentials: LoginRequest = {
      username: form.username,
      password: form.password,
    };
    await login(credentials);

    const redirect = (route.query.redirect as string) || '/';
    await router.push(redirect);
  } catch (err) {
    // 业务错误由 request.ts → utils/toast.showError 显示；
    // 401 由 request.ts → auth.service.handleUnauthorized 处理（清状态 + 跳登录）
    showError(err);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="login-page">
    <el-card class="login-card">
      <h2 class="login-title">登录</h2>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @keyup.enter="handleSubmit"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" class="login-submit" @click="handleSubmit">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: var(--color-bg-secondary);
}

.login-card {
  width: 400px;
  padding: var(--space-6);
}

.login-title {
  margin: 0 0 var(--space-6);
  text-align: center;
  font-size: var(--font-2xl);
  color: var(--color-text-primary);
}

.login-submit {
  width: 100%;
}
</style>
