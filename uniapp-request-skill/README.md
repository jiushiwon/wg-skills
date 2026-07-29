# uniapp 请求层设计 Skill

> uniapp 微信小程序统一请求封装：从 request.ts 出发，解决鉴权、Token、游客、防抖、Mock、错误处理等实战问题。

## 功能

- **统一请求封装**：request.ts 入口，get/post/put/del/upload
- **鉴权拦截**：自动注入 Token、401 统一处理
- **Token 刷新**：队列式刷新设计（可选）
- **游客模式**：请求层直接拦截未登录请求
- **防抖去重**：同一请求避免重复发送
- **Mock 机制**：开发期不依赖后端
- **错误处理**：统一错误信息提取与提示
- **文件上传**：基于 uni.uploadFile 的封装

## 使用方式

### 触发词

```
请求封装
request.ts 怎么写
uniapp 请求统一处理
Token 刷新设计
游客模式拦截
Mock 数据配置
接口防抖
```

### 前置依赖

建议配合 [uniapp-standard-skill](../uniapp-standard-skill/) 使用（目录结构、通用规范）。

## 文档结构

```
uniapp-request-skill/
├── SKILL.md                    # 主文件
└── README.md                   # 本文件
```

## 核心设计

### request.ts

```typescript
import { get, post } from '@/api/request';

const res = await get<UserInfo>('/user/info');
await post<void>('/user/update', { nickname: '张三' });
```

### 游客拦截

```typescript
const { checkLogin } = useAuth();

function handleLike() {
  if (!checkLogin()) return;
  post('/api/like', { id });
}
```

### 防抖

```typescript
// 默认防抖 1000ms
await post('/api/order', data);

// 跳过防抖
await post('/api/order', data, { skipDebounce: true });
```
