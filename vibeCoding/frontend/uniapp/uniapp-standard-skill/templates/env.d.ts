/// <reference types="vite/client" />
// 注意：此文件应放在 src/env.d.ts，Vite 会自动识别 src/ 下的类型声明

interface ImportMetaEnv {
  readonly VITE_APP_ENV: 'development' | 'test' | 'production';
  readonly VITE_APP_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
