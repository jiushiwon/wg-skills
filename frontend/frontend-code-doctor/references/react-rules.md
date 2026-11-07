# React Hooks 审查规则

本文档定义 React + TypeScript 项目的代码审查规则。

---

## 1. Hooks Rules of Use

### 检查项

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| RH-001 | useState 初始值为函数时未使用 lazy init | Warning |
| RH-002 | useEffect 依赖数组缺失或错误 | Error |
| RH-003 | useCallback/useMemo 未指定依赖数组 | Error |
| RH-004 | 在循环/条件/嵌套中调用 hooks | Error |

### 正确示例

```typescript
// lazy init - 避免每次渲染都执行
const [state] = useState(() => expensive calculation());

// 依赖数组完整
useEffect(() => {
  document.title = name;
}, [name]);

// 空依赖 = 仅执行一次
useEffect(() => {
  const sub = subscribe();
  return () => sub.unsubscribe();
}, []);
```

---

## 2. useEffect 常见陷阱

### 检查项

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| RH-010 | useEffect 异步函数未包装 | Warning |
| RH-011 | setState 在 unmount 组件后执行 | Error |
| RH-012 | useEffect 缺少 cleanup | Warning |

### 正确示例

```typescript
// 异步 effect
useEffect(() => {
  let active = true;
  async function fetch() {
    const data = await api();
    if (active) setData(data);
  }
  fetch();
  return () => { active = false; };
}, [id]);
```

---

## 3. useRef 正确使用

### 检查项

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| RH-020 | ref.current 在 render 时读取 | Error |
| RH-021 | 使用 ref 而非 useState 做响应式数据 | Warning |

### 正确示例

```typescript
// ref 存 mutable 数据，不触发重渲染
const countRef = useRef(0);

// 需要响应式
const [count, setCount] = useState(0);
```

---

## 4. 自定义 Hook 规则

### 检查项

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| RH-030 | 自定义 hook 未以 use 开头 | Error |
| RH-031 | 自定义 hook 内部 hooks 放在条件之后 | Error |

### 正确示例

```typescript
// 必须以 use 开头
function useToggle(initial = false) {
  const [state, setState] = useState(initial);
  const toggle = useCallback(() => setState(s => !s), []);
  return [state, toggle];
}
```

---

## 5. React Query / SWR

### 检查项

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| RH-040 | queryKey 缺少依赖数组 | Error |
| RH-041 | 缺少 enabled: false 关闭自动获取 | Warning |
| RH-042 | mutation 后未调用 invalidate | Warning |

### 正确示例

```typescript
// queryKey 包含依赖
const { data } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
});

// invalidation
const mutation = useMutation(updateUser, {
  onSuccess: () => queryClient.invalidateQueries(['users']),
});
```