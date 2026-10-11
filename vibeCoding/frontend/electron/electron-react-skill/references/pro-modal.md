# PRO 授权弹窗组件

基于 super-shell 项目的 ProModal 组件实现。

## 功能特性

- 三档身份：PRO > 已登录 > 游客
- 扫码登录 / 离线登录码
- 激活码管理
- 版本更新提示

## 代码示例

```tsx
import { useState } from 'react'
import { useApp } from '../store/appContext'
import { effectiveTier } from '../lib/access'
import { QrLoginPanel } from './QrLoginPanel'

interface ProModalProps {
  open: boolean
  onClose: () => void
}

/** 打码展示激活码 */
function maskKey(key: string): string {
  if (key.length <= 15) return key
  return `${key.slice(0, 11)}…${key.slice(-4)}`
}

/** 剩余天数文案 */
function daysText(days: number | null): string {
  if (days === null) return '永久'
  if (days <= 0) return '已到期'
  return `${days} 天`
}

const LOGIN_FEATURES = [
  '⚡ 自定义命令脚本库',
  '🖥️ 多服务器批量扫描',
  '🔁 多设备扫码同步'
]

const PRO_FEATURES = [
  '🧠 AI 一键诊断',
  '📊 批量扫描结果导出 CSV',
  '🤖 AI 命令解释、异常归因',
  '🔄 优先体验新功能'
]

export function ProModal({ open, onClose }: ProModalProps) {
  const { auth, license, activateLicense, deactivateLicense, login, logout, version, checkUpdate } = useApp()

  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // 登录区
  const [emailInput, setEmailInput] = useState('')
  const [loginKeyInput, setLoginKeyInput] = useState('')
  const [loginBusy, setLoginBusy] = useState(false)

  if (!open) return null

  const isPro = license.tier === 'pro'
  const loggedIn = auth.tier === 'user'
  const tier = effectiveTier(auth, license)

  // 激活 PRO
  const handleActivate = async () => {
    if (!input.trim()) return
    setBusy(true)
    setError(null)
    try {
      await activateLicense(input.trim())
    } catch (err) {
      setError(err instanceof Error ? err.message : '激活失败')
    } finally {
      setBusy(false)
    }
  }

  // 登录
  const handleLogin = async () => {
    if (!emailInput.trim() || !loginKeyInput.trim()) return
    setLoginBusy(true)
    setError(null)
    try {
      await login(emailInput.trim(), loginKeyInput.trim())
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败')
    } finally {
      setLoginBusy(false)
    }
  }

  // 登出
  const handleLogout = async () => {
    await logout()
  }

  // 取消 PRO
  const handleDeactivate = async () => {
    setBusy(true)
    try {
      await deactivateLicense()
    } catch (err) {
      setError(err instanceof Error ? err.message : '取消失败')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="modal-header">
          <h2>{isPro ? 'PRO 已激活' : '升级 PRO'}</h2>
          <p className="modal-subtitle">
            {isPro
              ? `到期时间：${license.expiresAt || '永久'} · 剩余 ${daysText(license.remainingDays)}`
              : '解锁全部功能，提升工作效率'}
          </p>
        </div>

        <div className="modal-body">
          {/* 身份展示 */}
          <div className="tier-badge">
            {tier === 'pro' && <span className="badge pro">PRO</span>}
            {tier === 'user' && <span className="badge user">已登录</span>}
            {tier === 'guest' && <span className="badge guest">游客</span>}
          </div>

          {/* 登录区域 */}
          {!isPro && !loggedIn && (
            <div className="login-section">
              <h3>登录账号</h3>
              <input
                type="email"
                placeholder="邮箱"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
              <input
                type="text"
                placeholder="离线登录码"
                value={loginKeyInput}
                onChange={(e) => setLoginKeyInput(e.target.value)}
              />
              <button onClick={handleLogin} disabled={loginBusy}>
                {loginBusy ? '登录中...' : '登录'}
              </button>

              <div className="divider">或</div>

              <QrLoginPanel />

              <ul className="feature-list">
                {LOGIN_FEATURES.map((f) => <li key={f}>{f}</li>)}
              </ul>
            </div>
          )}

          {/* PRO 介绍 */}
          {!isPro && (
            <div className="pro-section">
              <h3>PRO 专属功能</h3>
              <ul className="feature-list pro">
                {PRO_FEATURES.map((f) => <li key={f}>{f}</li>)}
              </ul>

              {/* 激活码输入 */}
              <div className="activate-section">
                <input
                  type="text"
                  placeholder="输入激活码"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <button onClick={handleActivate} disabled={busy || !input.trim()}>
                  {busy ? '激活中...' : '激活 PRO'}
                </button>
              </div>
              {error && <div className="error-message">{error}</div>}
            </div>
          )}

          {/* 已登录用户操作 */}
          {loggedIn && !isPro && (
            <div className="user-section">
              <p>当前登录：{auth.email}</p>
              <button onClick={handleLogout}>退出登录</button>
            </div>
          )}

          {/* PRO 用户操作 */}
          {isPro && (
            <div className="pro-user-section">
              <div className="license-info">
                <p>激活码：{maskKey(license.licenseKey || '')}</p>
                <p>到期时间：{license.expiresAt || '永久'}</p>
              </div>
              <button className="danger" onClick={handleDeactivate} disabled={busy}>
                {busy ? '处理中...' : '取消 PRO'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

## 样式

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 400px;
  max-width: 90vw;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.modal-header h2 {
  margin: 0 0 8px;
}

.modal-subtitle {
  color: #666;
  font-size: 14px;
}

.tier-badge {
  display: flex;
  justify-content: center;
  margin: 16px 0;
}

.badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.badge.pro {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.badge.user {
  background: #3b82f6;
  color: white;
}

.badge.guest {
  background: #e5e7eb;
  color: #666;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 16px 0;
}

.feature-list li {
  padding: 8px 0;
  color: #374151;
}

.feature-list.pro li {
  color: #1f2937;
  font-weight: 500;
}

.error-message {
  color: #ef4444;
  font-size: 14px;
  margin-top: 8px;
}
```
