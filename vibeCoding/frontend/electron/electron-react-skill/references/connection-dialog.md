# 连接对话框组件

基于 super-shell 项目的 ConnectionDialog 组件实现。

## 功能特性

- 支持多种数据库类型：SSH、MySQL、PostgreSQL、Redis、MongoDB
- SSH 鉴权方式：密码 / 公私钥
- 密码可见性切换
- 凭证安全管理
- 连接测试

## 代码示例

```tsx
import { useState, useEffect } from 'react'
import { Eye, EyeOff, Key, Lock, FileText } from 'lucide-react'

interface ConnectionDialogProps {
  connection: Connection | null
  onClose: () => void
  onSaved: () => Promise<void>
}

const DEFAULT_PORTS: Record<ConnectionType, string> = {
  ssh: '22',
  mysql: '3306',
  postgres: '5432',
  redis: '6379',
  mongodb: '27017'
}

export function ConnectionDialog({ connection, onClose, onSaved }: ConnectionDialogProps) {
  const [name, setName] = useState(connection?.name ?? '')
  const [type, setType] = useState<ConnectionType>(connection?.connection_type ?? 'ssh')
  const [host, setHost] = useState(connection?.host ?? '')
  const [port, setPort] = useState(connection?.port?.toString() ?? DEFAULT_PORTS[type])
  const [username, setUsername] = useState(connection?.username ?? '')

  // SSH 鉴权方式
  const [authMethod, setAuthMethod] = useState<'password' | 'privateKey'>('password')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [privateKey, setPrivateKey] = useState('')
  const [passphrase, setPassphrase] = useState('')

  const [database, setDatabase] = useState(connection?.database_name ?? '')
  const [groupId, setGroupId] = useState<number | ''>('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 切换类型时自动填默认端口
  useEffect(() => {
    if (!connection) {
      setPort(DEFAULT_PORTS[type])
      if (type === 'redis') setUsername('default')
    }
  }, [type])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const data = {
        name,
        connection_type: type,
        host,
        port: parseInt(port),
        username,
        auth_method: authMethod,
        password: authMethod === 'password' ? password : undefined,
        private_key: authMethod === 'privateKey' ? privateKey : undefined,
        passphrase: authMethod === 'privateKey' ? passphrase : undefined,
        database_name: database,
        group_id: groupId || null
      }
      await window.electronAPI.saveConnection(data)
      await onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <div className="dialog-header">
          <h2>{connection ? '编辑连接' : '新建连接'}</h2>
          <button onClick={onClose}>×</button>
        </div>

        <div className="dialog-body">
          {/* 连接类型 */}
          <div className="form-group">
            <label>类型</label>
            <select value={type} onChange={(e) => setType(e.target.value as ConnectionType)}>
              <option value="ssh">SSH</option>
              <option value="mysql">MySQL</option>
              <option value="postgres">PostgreSQL</option>
              <option value="redis">Redis</option>
              <option value="mongodb">MongoDB</option>
            </select>
          </div>

          {/* 名称 */}
          <div className="form-group">
            <label>名称</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="连接名称" />
          </div>

          {/* 主机端口 */}
          <div className="form-row">
            <div className="form-group">
              <label>主机</label>
              <input type="text" value={host} onChange={(e) => setHost(e.target.value)} placeholder="localhost" />
            </div>
            <div className="form-group" style={{ width: '100px' }}>
              <label>端口</label>
              <input type="text" value={port} onChange={(e) => setPort(e.target.value)} />
            </div>
          </div>

          {/* 用户名 */}
          {type !== 'redis' && (
            <div className="form-group">
              <label>用户名</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
          )}

          {/* SSH 鉴权方式 */}
          {type === 'ssh' && (
            <>
              <div className="form-group">
                <label>鉴权方式</label>
                <select value={authMethod} onChange={(e) => setAuthMethod(e.target.value as 'password' | 'privateKey')}>
                  <option value="password">密码</option>
                  <option value="privateKey">公私钥</option>
                </select>
              </div>

              {authMethod === 'password' ? (
                <div className="form-group">
                  <label>密码</label>
                  <div className="input-with-icon">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label>私钥</label>
                    <textarea value={privateKey} onChange={(e) => setPrivateKey(e.target.value)} rows={4} />
                  </div>
                  <div className="form-group">
                    <label> passphrase</label>
                    <input
                      type="password"
                      value={passphrase}
                      onChange={(e) => setPassphrase(e.target.value)}
                    />
                  </div>
                </>
              )}
            </>
          )}

          {/* 数据库名 */}
          {(type === 'mysql' || type === 'postgres' || type === 'mongodb') && (
            <div className="form-group">
              <label>数据库名</label>
              <input type="text" value={database} onChange={(e) => setDatabase(e.target.value)} />
            </div>
          )}

          {/* 错误提示 */}
          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="dialog-footer">
          <button onClick={onClose}>取消</button>
          <button className="primary" onClick={handleSave} disabled={saving}>
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

## 类型定义

```typescript
type ConnectionType = 'ssh' | 'mysql' | 'postgres' | 'redis' | 'mongodb'
type AuthMethod = 'password' | 'privateKey'

interface Connection {
  id: number
  name: string
  connection_type: ConnectionType
  host: string
  port: number
  username: string
  auth_method: AuthMethod
  credential_key?: string
  database_name?: string
  group_id?: number
}
```
