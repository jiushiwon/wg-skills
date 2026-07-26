/**
 * Vite 配置示例 - 自动注入主题变量
 *
 * 将 variables.scss 自动注入到每个 .scss/.vue 文件，
 * 业务代码无需手动引入即可使用主题变量。
 *
 * 使用方式：
 * 1. 复制本文件到项目根目录
 * 2. 修改 path 指向你的 variables.scss 路径
 * 3. 重启开发服务器
 */

import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';
import path from 'path';

export default defineConfig({
  plugins: [uni()],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "${path.resolve(__dirname, 'src/styles/variables.scss')}" as *;`
      }
    }
  }
});
