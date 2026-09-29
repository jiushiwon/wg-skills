<script setup lang="ts">
// src/views/Login.vue
// 登录页（完整示例：表单校验 + API 调用 + 错误处理 + 路由跳转）
//
// ponytail: 两种架构对应两种写法，AI 生成时必须先看 package.json 和 src/services/ 决定走哪一条：
//
// 【方案 A】标准四层架构（有 src/services/auth.service.ts）
//   import { login } from '@/services/auth.service';
//   await login({ username, password });
//
// 【方案 B】store-based 架构（无 services/，login 写在 src/store/user.ts）
//   const userStore = useUserStore();
//   await userStore.login({ username, password });
//
// ⚠️ 禁止：import 了 services/login() 但 await 了一个不存在的函数 —— 这是"API 逻辑丢失"的根因。
// 决策流程见 frontend-request-skill/references/auth-patterns.md 末尾。

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
