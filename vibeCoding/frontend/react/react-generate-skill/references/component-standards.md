# 共享组件规范

## 3 次复用原则

> 组件被复用 **≥3 次** 才抽到 `src/components/`。

| 场景 | 处理 |
|------|------|
| 组件只用到 1 次 | 写在页面文件内 |
| 组件用到 2 次 | 复制粘贴，不抽象 |
| 组件用到 3 次+ | 抽到 `src/components/` |

## 必备共享组件

| 组件 | 说明 |
|------|------|
| `AppLayout` | 全局布局（侧边栏 + Header） |
| `AppButton` | 按钮（primary/secondary/ghost） |
| `AppInput` | 输入框 |
| `AppTable` | 表格（封装 Ant Design Table） |
| `AppModal` | 弹窗 |
| `AppPagination` | 分页 |

## 组件目录结构

```
src/components/
├── AppLayout/
│   ├── index.tsx
│   └── AppLayout.module.css
├── AppButton/
│   ├── index.tsx
│   └── AppButton.module.css
└── index.ts           # 统一导出
```

## 组件模板

```tsx
// src/components/AppButton/index.tsx
import React from 'react';
import { Button, ButtonProps } from 'antd';
import styles from './AppButton.module.css';

interface AppButtonProps extends ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
}

export function AppButton({
  variant = 'primary',
  className,
  ...props
}: AppButtonProps): React.JSX.Element {
  return (
    <Button
      className={`${styles.button} ${styles[variant]} ${className || ''}`}
      {...props}
    />
  );
}
```

## 组件 index.ts 统一导出

```typescript
// src/components/index.ts
export { AppLayout } from './AppLayout';
export { AppButton } from './AppButton';
export { AppInput } from './AppInput';
```

## 页面使用

```tsx
// ✅ 正确：使用共享组件
import { AppButton, AppInput } from '@/components';

function UserForm() {
  return (
    <form>
      <AppInput placeholder="请输入用户名" />
      <AppButton type="submit">提交</AppButton>
    </form>
  );
}

// ❌ 错误：手写相同 UI
function UserForm() {
  return (
    <form>
      <input placeholder="请输入用户名" />
      <button>提交</button>
    </form>
  );
}
```

## 反模式

- ❌ 不要为只有 1-2 个地方用的组件创建目录
- ❌ 不要创建 `src/common/`、`src/shared/` 等模糊目录
- ❌ 不要把 Ant Design 组件直接导出当共享组件（应封装业务逻辑）
- ❌ 不要在共享组件里写死业务逻辑（应该 props 传入）
