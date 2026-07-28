// src/main.ts — 应用入口
import { createSSRApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import { setupRouteGuard } from './utils/router-guard';

export function createApp() {
  const app = createSSRApp(App);
  const pinia = createPinia();

  // 使用 Pinia
  app.use(pinia);

  // 设置路由守卫
  setupRouteGuard();

  return { app };
}
