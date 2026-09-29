<template>
  <div class="login-page">
    <!-- 本地"正常"登录页（不用 vue-login-skill：其内置风格都偏老/科技，不通用） -->
    <VueAdminLogin />
  </div>
</template>

<script setup lang="ts">
import VueAdminLogin from './VueAdminLogin.vue';
</script>

<style scoped>
/* ponytail: 全部样式由 VueAdminLogin.vue 提供 */
</style>
