/**
 * main.js 入口文件示例
 *
 * 引入全局主题样式
 */

import { createSSRApp } from 'vue';
import App from './App.vue';

// 引入全局主题 CSS 变量
import './styles/index.less';

export function createApp() {
  const app = createSSRApp(App);
  return {
    app
  };
}
