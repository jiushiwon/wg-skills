# TypeScript 严格配置模板

> **TypeScript 严格模式是本 Skill 的硬性要求。** 所有 Vue3 + TS 项目必须按此模板配置 `tsconfig.json`。

---

## 1. 强约束（不可放宽）

```jsonc
{
  "compilerOptions": {
    "strict": true,                  // ✅ 必须开启（开启全部严格选项）
    "noImplicitAny": true,           // ✅ 禁止隐式 any
    "strictNullChecks": true,        // ✅ 严格空检查
    "strictFunctionTypes": true,     // ✅ 严格函数类型
    "strictBindCallApply": true,     // ✅ 严格 bind/call/apply
    "strictPropertyInitialization": true,  // ✅ class 属性必初始化
    "noImplicitThis": true,          // ✅ 禁止隐式 this
    "alwaysStrict": true,            // ✅ 严格模式
    "useUnknownInCatchVariables": true, // ✅ catch 用 unknown

    "noUnusedLocals": true,          // ✅ 禁止未使用的局部变量
    "noUnusedParameters": true,      // ✅ 禁止未使用的参数
    "noImplicitReturns": true,       // ✅ 禁止隐式 return
    "noFallthroughCasesInSwitch": true, // ✅ switch 必 break

    "exactOptionalPropertyTypes": false,  // ⚠️ Vue 生态兼容，关闭

    "esModuleInterop": true,         // ✅ ESM 互操作
    "skipLibCheck": true,            // ✅ 跳过 .d.ts 检查
    "forceConsistentCasingInFileNames": true,  // ✅ 文件名大小写一致
    "isolatedModules": true,         // ✅ 单文件独立编译
    "resolveJsonModule": true        // ✅ 支持 JSON 导入
  }
}
```

---

## 2. 完整 `tsconfig.json`

```jsonc
{
  "compilerOptions": {
    /* 严格模式（全开） */
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "useUnknownInCatchVariables": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,

    /* 模块 */
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,

    /* 路径别名（与 vite.config.ts 一致） */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },

    /* 类型声明 */
    "types": ["vite/client", "element-plus/global"],

    /* JSX（可选） */
    "jsx": "preserve",

    /* 装饰器（Pinia 等） */
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,

    /* 编译输出 */
    "noEmit": true
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.vue",
    "vite.config.ts"
  ],
  "exclude": ["node_modules", "dist"],
  "references": [
    { "path": "./tsconfig.node.json" }
  ]
}
```

---

## 3. `tsconfig.node.json`（Vite 配置专用）

```jsonc
{
  "extends": "@tsconfig/node22/tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "types": ["node"]
  },
  "include": ["vite.config.ts"]
}
```

---

## 4. `package.json` scripts（强制）

```jsonc
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .vue,.ts,.tsx --fix",
    "lint:check": "eslint . --ext .vue,.ts,.tsx",
    "type-check": "vue-tsc --noEmit",
    "format": "prettier --write \"src/**/*.{vue,ts,tsx,css,scss,json,md}\""
  }
}
```

**关键**：
- ✅ `build` 之前先跑 `vue-tsc --noEmit`（类型检查失败则构建失败）
- ✅ `type-check` 独立脚本（CI 可单独跑）
- ❌ 不要省略 `vue-tsc`（它检查 `.vue` 文件里的 `<script setup lang="ts">`）

---

## 5. 类型错误的红线

### ❌ 错误 1：使用 `any`

```typescript
function load(data: any) {  // ❌
  return data.user.name;
}
```

```typescript
function load(data: unknown) {  // ✅
  if (isUser(data)) {
    return data.user.name;
  }
  throw new Error('Invalid data');
}
```

### ❌ 错误 2：可选属性不处理 undefined

```typescript
interface User {
  name: string;
  avatar?: string;
}

const user: User = { name: 'Tom' };
console.log(user.avatar.length);  // ❌ Object is possibly 'undefined'
```

```typescript
const user: User = { name: 'Tom' };
console.log(user.avatar?.length ?? 0);  // ✅
```

### ❌ 错误 3：catch 用未声明类型

```typescript
try {
  await api.list();
} catch (err) {  // ❌ any
  console.log(err.message);
}
```

```typescript
try {
  await api.list();
} catch (err: unknown) {  // ✅
  if (err instanceof Error) {
    console.log(err.message);
  }
}
```

### ❌ 错误 4：函数返回值类型不一致

```typescript
function getUser(id: number) {
  if (id <= 0) return null;
  return { id, name: 'Tom' };  // ❌ 类型推导：{ id: number; name: string } | null
}
```

```typescript
function getUser(id: number): User | null {  // ✅ 显式声明
  if (id <= 0) return null;
  return { id, name: 'Tom' };
}
```

### ❌ 错误 5：Props/Emits 不用类型声明

```vue
<!-- ❌ 运行时声明（丢失类型） -->
<script setup>
const props = defineProps({ title: String });
</script>
```

```vue
<!-- ✅ 泛型声明（类型完整） -->
<script setup lang="ts">
interface Props {
  title: string;
  count?: number;
}
const { title, count = 0 } = defineProps<Props>();
</script>
```

---

## 6. 类型声明文件（`.d.ts`）

### `src/shims-vue.d.ts`

```typescript
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}
```

### `src/auto-imports.d.ts`（由 unplugin-auto-import 生成，不要手改）

```typescript
// 由 unplugin-auto-import 自动生成
// 参考 vite.config.ts 的 AutoImport 配置
```

---

## 7. ESLint + TypeScript 协同配置

`.eslintrc.cjs` 关键项：

```javascript
module.exports = {
  root: true,
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2022,
    sourceType: 'module',
    extraFileExtensions: ['.vue'],
  },
  rules: {
    // ✅ 推荐开启
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off', // 太严格，关闭
    '@typescript-eslint/no-non-null-assertion': 'warn', // ! 断言警告
    'vue/component-api-style': ['error', ['script-setup']],
  },
};
```

---

## 8. 验证清单（提交前必跑）

```bash
npm run type-check    # vue-tsc --noEmit（必须 0 error）
npm run lint          # eslint（必须 0 error）
npm run build         # 包含 type-check + vite build
```

**红线**：
- ❌ `type-check` 有 error → 不允许提交
- ❌ `lint` 有 error → 不允许提交
- ❌ 任何 `any` 类型（除非有 `@ts-expect-error` + 理由注释）
- ❌ 任何 `@ts-ignore`（必须用 `@ts-expect-error` 并写明原因）
