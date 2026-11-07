# tsconfig.json 严格模式配置

```jsonc
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## 必须开启的 strict 规则

| 规则 | 说明 |
|------|------|
| `strict: true` | 启用所有严格类型检查 |
| `noUnusedLocals` | 报告未使用的局部变量 |
| `noUnusedParameters` | 报告未使用的参数 |
| `noFallthroughCasesInSwitch` | switch case 必须 break/return |

## 路径别名

```json
{
  "paths": {
    "@/*": ["src/*"]
  }
}
```

配合 vite.config.ts：

```ts
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
```
