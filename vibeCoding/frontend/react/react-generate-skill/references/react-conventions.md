# React 18 + TypeScript 编码约定

## 组件规范

### 函数组件

```tsx
// ✅ 正确：函数组件 + TypeScript
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps): React.JSX.Element {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {label}
    </button>
  );
}
```

### 禁止 class 组件

```tsx
// ❌ 错误：禁止使用 class 组件
class Button extends React.Component<ButtonProps> {
  render() {
    return <button>{this.props.label}</button>;
  }
}
```

## Hooks 规范

### 自定义 Hooks 命名

```tsx
// ✅ 正确：use 前缀
function useAuth() { ... }
function useFetch<T>(url: string) { ... }

// ❌ 错误：没有 use 前缀
function getAuth() { ... }
```

### useEffect 依赖

```tsx
// ✅ 正确：完整依赖数组
useEffect(() => {
  const subscription = api.subscribe(id, handler);
  return () => subscription.unsubscribe();
}, [id, handler]);

// ❌ 错误：空依赖数组可能导致过期闭包
useEffect(() => {
  api.subscribe(id, handler);
}, []);
```

## 类型规范

### 不用 any

```tsx
// ❌ 错误：使用 any
function parse(data: any): any { ... }

// ✅ 正确：使用 unknown + 类型守卫
function parse(data: unknown): User | null {
  if (isUser(data)) return data;
  return null;
}

function isUser(data: unknown): data is User {
  return typeof data === 'object' && data !== null && 'id' in data;
}
```

### 接口 vs 类型

```tsx
// 用于对象类型
interface User {
  id: string;
  name: string;
}

// 用于联合类型
type Status = 'loading' | 'success' | 'error';

// 用于函数类型
type Handler = (event: Event) => void;
```

## 状态管理

### Zustand 使用

```tsx
// ✅ 正确：Zustand Setup 风格
interface CounterState {
  count: number;
  increment: () => void;
}

export const useCounterStore = create<CounterState>()(
  persist(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
    }),
    { name: 'counter-storage' }
  )
);
```

### 不在组件里直接调 localStorage

```tsx
// ❌ 错误：在组件里直接调 localStorage
function Login() {
  const handleLogin = () => {
    localStorage.setItem('token', token); // 禁止
  };
}

// ✅ 正确：走 utils/auth.ts
import { setToken } from '@/utils/auth';
function Login() {
  const handleLogin = () => {
    setToken(token); // 正确
  };
}
```

## 错误处理

### try/catch + unknown

```tsx
// ✅ 正确：unknown 类型 + 类型守卫
async function loadData() {
  try {
    const res = await fetch('/api/user');
    const data = await res.json();
    setUser(data);
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'message' in err) {
      showError((err as Error).message);
    } else {
      showError('未知错误');
    }
  }
}
```

## 渲染优化

### React.memo

```tsx
// 仅在必要时使用
const UserCard = React.memo(function UserCard({ user }: { user: User }) {
  return <div>{user.name}</div>;
});
```

### useMemo / useCallback

```tsx
// 仅在依赖稳定时使用
const computed = useMemo(() => expensiveCalculation(a, b), [a, b]);
const handleClick = useCallback(() => { ... }, [dependency]);
```

## 禁止

1. ❌ 不用 `any`
2. ❌ 不用 `console.log`
3. ❌ 不用 class 组件
4. ❌ 不用 `.jsx`
5. ❌ 不用内联对象作为 props

```tsx
// ❌ 错误：内联样式对象
<button style={{ color: 'red', fontSize: 14 }}>

// ✅ 正确：CSS 模块
import styles from './Button.module.css';
<button className={styles.button}>
```
