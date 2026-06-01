# TypeScript 审查规则

本文档定义 TypeScript 项目的代码审查规则。

---

## 1. any 类型（必须修复）

### 检查项

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| TS-001 | 变量声明为 `any` | Error |
| TS-002 | 函数参数为 `any` | Error |
| TS-003 | 返回类型为 `any` | Warning |

### 正确示例

```typescript
// 错误
const data: any = getData();

// 正确：明确类型
interface UserData {
  id: number;
  name: string;
}
const data: UserData = getData();
```

---

## 2. 类型推断

### 检查项

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| TS-010 | 省略类型导致推断错误 | Warning |

### 正确示例

```typescript
// 正确的类型推断
const list: string[] = [];

// 问题：list 被推断为 never[]
const list = [];
```

---

## 3. 严格模式

### 检查项

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| TS-050 | `@ts-ignore` 滥用 | Error |

### 推荐 tsconfig

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

---

## 4. null vs undefined

### 检查项

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| TS-060 | 混用 null 和 undefined | Warning |
| TS-061 | 可选参数未处理 | Error |

### 正确示例

```typescript
// 可选链 + 空值合并
const name = obj?.user?.name ?? 'Unknown';
```