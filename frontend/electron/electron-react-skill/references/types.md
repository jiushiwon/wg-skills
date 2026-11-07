# 类型定义参考

基于 super-shell 项目的类型定义。

## 连接相关

```typescript
export type ConnectionType = 'ssh' | 'mysql' | 'postgres' | 'redis' | 'mongodb'
export type AuthMethod = 'password' | 'privateKey'

export interface Connection {
  id: number
  group_id: number | null
  name: string
  connection_type: ConnectionType
  host: string
  port: number
  username: string
  credential_key: string | null
  private_key_credential_key: string | null
  passphrase_credential_key: string | null
  auth_method: AuthMethod
  database_name: string | null
  sort_order: number
  created_at: number
  updated_at: number
}

export interface ConnectionInput {
  group_id?: number | null
  name: string
  connection_type: ConnectionType
  host: string
  port: number
  username: string
  credential_key?: string | null
  private_key_credential_key?: string | null
  passphrase_credential_key?: string | null
  auth_method?: AuthMethod
  database_name?: string | null
  password?: string
  sort_order?: number
}
```

## 查询结果

```typescript
export interface QueryResult {
  columns: Array<{ name: string; type: string }>
  rows: unknown[][]
  affectedRows: number
  durationMs: number
  raw?: string
}

export interface DbPageResult {
  columns: Array<{ name: string; type: string }>
  rows: unknown[][]
  ids: Array<string | null>
  total: number
  page: number
  pageSize: number
  durationMs: number
}

export interface MongoPageResult {
  columns: Array<{ name: string; type: string }>
  rows: unknown[][]
  ids: Array<string | null>
  docs: string[]
  total: number
  page: number
  pageSize: number
  durationMs: number
}
```

## Redis

```typescript
export interface RedisKeyInfo {
  key: string
  type: string
  ttl: number
  preview: string
}

export interface RedisKeyList {
  keys: RedisKeyInfo[]
  nextCursor: string
}
```

## MongoDB

```typescript
export type MongoOperation =
  | 'find'
  | 'findOne'
  | 'insertOne'
  | 'updateOne'
  | 'deleteOne'
  | 'countDocuments'

export interface MongoQueryInput {
  collection: string
  operation: MongoOperation
  filter?: string
  update?: string
  document?: string
}
```

## Tab

```typescript
export type TabType = 'welcome' | 'ssh' | 'mysql' | 'postgres' | 'redis' | 'mongodb' | 'local' | 'command' | 'dashboard' | 'files' | 'multiscan'

export interface Tab {
  id: string
  title: string
  type: TabType
  connectionId?: number
  sessionId?: string
}
```

## 认证

```typescript
interface Auth {
  userId: string
  email?: string
  nickname?: string
  provider: 'wechat' | 'offline'
  tier: 'pro' | 'user' | 'guest'
}

interface License {
  tier: 'pro' | 'free'
  licenseKey?: string
  expiresAt?: string
  remainingDays: number | null
}
```
