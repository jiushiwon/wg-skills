<template>
  <div class="error-page">
    <base-card>
      <div class="error-content">
        <h1>403</h1>
        <p>无权访问该页面</p>
        <router-link to="/" class="btn btn-primary">返回首页</router-link>
      </div>
    </base-card>
  </div>
</template>

<script setup lang="ts">
import { BaseCard } from 'vue-card-skill';
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
}
.error-content {
  text-align: center;
  /* ponytail: 320px 容纳按钮宽度，非通用 token */
  min-width: 320px;
  padding: var(--space-6);
}
h1 {
  /* ponytail: 72px 错误码大数字超出 vue-theme-skill 字号阶梯，保留视觉冲击 */
  font-size: 72px;
  color: var(--color-danger);
  margin-bottom: var(--space-4);
}
p {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-6);
}
</style>