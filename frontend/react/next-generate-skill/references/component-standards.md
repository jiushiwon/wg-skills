# 共享组件规范（Next.js App Router）

> Next.js 项目中的组件需要区分 Server/Client 渲染环境。

## 3 次复用原则

> 组件被复用 **>= 3 次** 才抽到 `components/`。

| 场景 | 处理 |
|------|------|
| 组件只用到 1 次 | 写在页面文件内 |
| 组件用到 2 次 | 复制粘贴，不抽象 |
| 组件用到 3 次+ | 抽到 `components/` |

## Server/Client 组件分类

### 默认为 Server Component

```typescript
// components/UserCard.tsx —— Server Component（无需指令）
import { fetchUser } from '@/lib/api/modules/user.server';

interface Props {
  userId: string;
}

// 这是 Server Component：可以 async，可以直接 fetch
export async function UserCard({ userId }: Props) {
  const user = await fetchUser(userId);

  return (
    <div>
      <h3>{user.nickname || user.username}</h3>
      <p>{user.email}</p>
    </div>
  );
}
```

### 需要交互的标记为 Client Component

```typescript
// components/UserCard.tsx —— Client Component
'use client';

import { useState } from 'react';
import { Card, Button } from 'antd';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';

interface Props {
  userId: string;
  name: string;
  email: string;
}

// 这是 Client Component：需要 useState 和 onClick
export function UserCard({ userId, name, email }: Props) {
  const [liked, setLiked] = useState(false);

  return (
    <Card title={name}>
      <p>{email}</p>
      <Button
        icon={liked ? <HeartFilled /> : <HeartOutlined />}
        onClick={() => setLiked(!liked)}
      >
        {liked ? '已收藏' : '收藏'}
      </Button>
    </Card>
  );
}
```

### 混合模式（Server 获取数据 + Client 交互）

```typescript
// components/UserCard/index.tsx —— 组合层（Server Component）
import { fetchUser } from '@/lib/api/modules/user.server';
import { UserCardClient } from './UserCardClient';

interface Props {
  userId: string;
}

// Server Component 负责数据获取
export async function UserCard({ userId }: Props) {
  const user = await fetchUser(userId);

  // 数据通过 props 传给 Client Component
  return (
    <UserCardClient
      userId={user.id}
      name={user.nickname || user.username}
      email={user.email || ''}
      avatar={user.avatar}
    />
  );
}
```

```typescript
// components/UserCard/UserCardClient.tsx —— 交互层（Client Component）
'use client';

import { Card, Avatar, Button } from 'antd';

interface Props {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
}

export function UserCardClient({ name, email, avatar }: Props) {
  return (
    <Card>
      <Avatar src={avatar} />
      <h3>{name}</h3>
      <p>{email}</p>
    </Card>
  );
}
```

## 必备共享组件

| 组件 | 渲染方式 | 说明 |
|------|---------|------|
| `AppLayout` | Client | 全局布局（侧边栏 + Header） |
| `AppButton` | Client | 按钮封装 |
| `AppTable` | Client | 表格封装 |
| `AppModal` | Client | 弹窗封装 |
| `JsonLd` | Server | JSON-LD 结构化数据 |
| `ErrorBoundary` | Client | 错误边界（配合 error.tsx） |

## 组件目录结构

```
components/
├── AppLayout/
│   ├── index.tsx           # 导出入口（可能是 Server 包裹层）
│   ├── AppLayout.tsx       # Client Component 实现
│   └── AppLayout.module.css
├── UserCard/
│   ├── index.tsx           # Server Component（数据获取）
│   ├── UserCardClient.tsx  # Client Component（交互）
│   └── UserCard.module.css
└── index.ts                # 统一导出
```

## antd 在 Server Component 中的处理

antd 的大部分组件需要 `'use client'`（因为使用了 Hooks、事件处理）。

**策略**：将 antd 交互组件封装在 Client Component 中，Server Component 负责数据获取。

```typescript
// ❌ 错误：Server Component 中直接用 antd 交互组件
// 会报错：useState 只能在 Client Component 中使用
import { Table } from 'antd';

export default async function UsersPage() {
  const data = await fetchUsers();
  return <Table dataSource={data} />;
}

// ✅ 正确：拆分为 Server + Client
// app/(dashboard)/users/page.tsx（Server Component）
import { fetchUsers } from '@/lib/api/modules/user.server';
import { UserTable } from '@/components/UserTable';

export default async function UsersPage() {
  const data = await fetchUsers({ page: 1, pageSize: 10 });
  return <UserTable initialData={data.items} />;
}
```

```typescript
// components/UserTable.tsx（Client Component）
'use client';

import { Table } from 'antd';
import type { User } from '@/types/user';

interface Props {
  initialData: User[];
}

export function UserTable({ initialData }: Props) {
  const columns = [
    { title: '用户名', dataIndex: 'username' },
    { title: '昵称', dataIndex: 'nickname' },
  ];

  return <Table dataSource={initialData} columns={columns} rowKey="id" />;
}
```

## 反模式

- ❌ 不要为只有 1-2 个地方用的组件创建目录
- ❌ 不要创建 `common/`、`shared/` 等模糊目录
- ❌ 不要把 antd 组件直接导出当共享组件（应封装业务逻辑）
- ❌ 不要在共享组件里写死业务逻辑（应该 props 传入）
- ❌ 不要在 Server Component 中导入使用了 `'use client'` 的模块的内部状态
- ❌ 不要在 Client Component 中使用 `async` 函数作为组件
