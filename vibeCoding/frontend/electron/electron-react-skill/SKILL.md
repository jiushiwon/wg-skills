---
name: electron-react-skill
description: Electron + React 桌面应用开发技能。基于 electron-vite + React + TypeScript 构建跨平台桌面应用，支持数据库连接、SSH终端、文件管理等原生能力。触发词：Electron + React、桌面应用、electron-vite、跨平台客户端。
trigger: |
  Electron + React | 桌面应用
  electron-vite | electron-react
  跨平台客户端 | 桌面客户端
---

> **技术栈**：Electron + React + TypeScript + electron-vite
> **参考项目**：super-shell（生产级桌面客户端）

# electron-react-skill

> 基于 electron-vite + React + TypeScript 构建跨平台桌面应用

## 技术架构

```
┌─────────────────────────────────────────────────────┐
│                    Electron App                       │
├─────────────────────────────────────────────────────┤
│  Main Process (Node.js)                              │
│  ├── 数据库连接 (MySQL/PostgreSQL/MongoDB/Redis)   │
│  ├── SSH/SFTP 会话管理                              │
│  ├── 系统能力 (文件/剪切板/通知/托盘)               │
│  └── IPC Handler                                    │
├─────────────────────────────────────────────────────┤
│  Preload Script (桥接层)                             │
│  └── contextBridge.exposeInMainWorld                │
├─────────────────────────────────────────────────────┤
│  Renderer Process (React)                             │
│  ├── UI 组件 (React + CSS)                          │
│  ├── 状态管理 (Context/Hooks)                       │
│  └── IPC Invoke                                     │
└─────────────────────────────────────────────────────┘
```

## 项目结构

```
project/
├── electron/
│   ├── main/           # 主进程
│   │   ├── index.ts   # 入口
│   │   ├── database.ts # 数据库连接
│   │   ├── ssh.ts     # SSH 会话
│   │   └── ...
│   └── preload/        # 预加载
│       └── index.ts
├── src/
│   ├── renderer/      # React 应用
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── ...
├── electron.vite.config.ts
└── package.json
```

## 快速开始

### 1. 初始化项目

```bash
npm create @electron-vite/create@latest my-app -- --template react-ts
cd my-app
npm install
```

### 2. 核心配置

```typescript
// electron.vite.config.ts
import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        external: ['better-sqlite3', 'ssh2', 'mysql2', 'pg', 'redis', 'mongodb']
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: { '@': resolve('src/renderer') }
    },
    plugins: [react()]
  }
})
```

### 3. 主进程

```typescript
// electron/main/index.ts
import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join } from 'path'

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    },
    show: false
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // 打开外部链接
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // 加载页面
  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
```

### 4. 预加载脚本

```typescript
// electron/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron'

// 暴露 API 到渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 数据库操作
  query: (sql: string, params?: any[]) => ipcRenderer.invoke('db:query', sql, params),
  execute: (sql: string, params?: any[]) => ipcRenderer.invoke('db:execute', sql, params),

  // SSH 操作
  sshConnect: (config: SshConfig) => ipcRenderer.invoke('ssh:connect', config),
  sshExecute: (command: string) => ipcRenderer.invoke('ssh:execute', command),
  sshDisconnect: () => ipcRenderer.invoke('ssh:disconnect'),

  // 文件操作
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  saveFile: (content: string) => ipcRenderer.invoke('dialog:saveFile', content),

  // 系统
  getAppVersion: () => ipcRenderer.invoke('app:version'),
  showNotification: (title: string, body: string) => ipcRenderer.invoke('notification:show', title, body),

  // 事件监听
  onSshOutput: (callback: (data: string) => void) => {
    ipcRenderer.on('ssh:output', (_event, data) => callback(data))
  }
})

// 类型声明
declare global {
  interface Window {
    electronAPI: {
      query: (sql: string, params?: any[]) => Promise<any[]>
      execute: (sql: string, params?: any[]) => Promise<{ affectedRows: number }>
      sshConnect: (config: SshConfig) => Promise<{ success: boolean; error?: string }>
      sshExecute: (command: string) => Promise<{ stdout: string; stderr: string }>
      sshDisconnect: () => Promise<void>
      openFile: () => Promise<string | null>
      saveFile: (content: string) => Promise<boolean>
      getAppVersion: () => Promise<string>
      showNotification: (title: string, body: string) => Promise<void>
      onSshOutput: (callback: (data: string) => void) => void
    }
  }
}
```

### 5. React 应用入口

```tsx
// src/renderer/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

### 6. React 组件示例

```tsx
// src/renderer/App.tsx
import { useState, useEffect } from 'react'
import { ConnectionPanel } from './components/ConnectionPanel'
import { TabWorkspace } from './components/TabWorkspace'
import './styles/app.css'

export default function App() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadConnections()
  }, [])

  const loadConnections = async () => {
    try {
      const data = await window.electronAPI.query('SELECT * FROM connections')
      setConnections(data)
    } catch (err) {
      console.error('加载失败:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-shell">
      <ConnectionPanel connections={connections} />
      <div className="workspace">
        <TabWorkspace />
      </div>
    </div>
  )
}
```

## 核心功能

### 1. 数据库连接

```typescript
// electron/main/database.ts
import mysql from 'mysql2/promise'
import pg from 'pg'
import { MongoClient } from 'mongodb'
import redis from 'redis'

export class DatabaseManager {
  private connections = new Map<string, any>()

  async connectMySQL(config: MySQLConfig) {
    const conn = await mysql.createConnection(config)
    this.connections.set(`mysql:${config.id}`, conn)
    return conn
  }

  async connectPostgres(config: PGConfig) {
    const conn = new pg.Pool(config)
    this.connections.set(`pg:${config.id}`, conn)
    return conn
  }

  async connectMongo(config: MongoConfig) {
    const client = new MongoClient(config.uri)
    await client.connect()
    this.connections.set(`mongo:${config.id}`, client)
    return client
  }

  async connectRedis(config: RedisConfig) {
    const client = redis.createClient(config)
    await client.connect()
    this.connections.set(`redis:${config.id}`, client)
    return client
  }

  getConnection(id: string) {
    return this.connections.get(id)
  }

  async closeAll() {
    for (const conn of this.connections.values()) {
      await conn.end?.() || await conn.close?.()
    }
    this.connections.clear()
  }
}

export const dbManager = new DatabaseManager()
```

### 2. SSH 终端

```typescript
// electron/main/ssh-session.ts
import { Client } from 'ssh2'

export class SSHSession {
  private client: Client
  private shell: NodeJS.ReadableStream | null = null

  async connect(config: SSHConfig): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      this.client = new Client()

      this.client.on('ready', () => {
        this.client.shell((err, stream) => {
          if (err) {
            resolve({ success: false, error: err.message })
            return
          }
          this.shell = stream
          resolve({ success: true })
        })
      })

      this.client.on('error', (err) => {
        resolve({ success: false, error: err.message })
      })

      this.client.connect(config)
    })
  }

  execute(command: string): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve) => {
      this.client.exec(command, (err, stream) => {
        if (err) {
          resolve({ stdout: '', stderr: err.message })
          return
        }
        let stdout = ''
        let stderr = ''
        stream.on('data', (data: Buffer) => { stdout += data.toString() })
        stream.stderr.on('data', (data: Buffer) => { stderr += data.toString() })
        stream.on('close', () => resolve({ stdout, stderr }))
      })
    })
  }

  write(data: string) {
    this.shell?.write(data)
  }

  disconnect() {
    this.client.end()
    this.shell = null
  }
}
```

### 3. IPC 处理器

```typescript
// electron/main/ipc-handlers.ts
import { ipcMain, dialog, Notification, app } from 'electron'
import { dbManager } from './database'
import { SSHSession } from './ssh-session'

export function setupIpcHandlers() {
  // 数据库
  ipcMain.handle('db:query', async (_event, sql: string, params?: any[]) => {
    // 查询逻辑
  })

  ipcMain.handle('db:execute', async (_event, sql: string, params?: any[]) => {
    // 执行逻辑
  })

  // SSH
  ipcMain.handle('ssh:connect', async (_event, config) => {
    const session = new SSHSession()
    return await session.connect(config)
  })

  ipcMain.handle('ssh:execute', async (_event, command) => {
    return await currentSshSession.execute(command)
  })

  // 文件对话框
  ipcMain.handle('dialog:openFile', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'All Files', extensions: ['*'] }
      ]
    })
    return result.filePaths[0] || null
  })

  // 通知
  ipcMain.handle('notification:show', async (_event, title: string, body: string) => {
    new Notification({ title, body }).show()
  })

  // 版本
  ipcMain.handle('app:version', () => {
    return app.getVersion()
  })
}
```

## 状态管理

```typescript
// src/renderer/store/appContext.tsx
import { createContext, useContext, useReducer, ReactNode } from 'react'

interface AppState {
  connections: Connection[]
  tabs: Tab[]
  activeTabId: string | null
  loading: boolean
  error: string | null
}

type Action =
  | { type: 'SET_CONNECTIONS'; payload: Connection[] }
  | { type: 'SET_TABS'; payload: Tab[] }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_CONNECTIONS':
      return { ...state, connections: action.payload }
    case 'SET_TABS':
      return { ...state, tabs: action.payload }
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTabId: action.payload }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    default:
      return state
  }
}

const initialState: AppState = {
  connections: [],
  tabs: [],
  activeTabId: null,
  loading: false,
  error: null
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<Action>
} | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
```

## 样式规范

```css
/* src/renderer/styles/app.css */
:root {
  --color-primary: #3b82f6;
  --color-bg: #ffffff;
  --color-bg-secondary: #f3f4f6;
  --color-text: #1f2937;
  --color-text-secondary: #6b7280;
  --color-border: #e5e7eb;
  --radius-md: 8px;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.app-shell {
  display: flex;
  height: 100vh;
  background: var(--color-bg);
}

.sidebar {
  width: 280px;
  border-right: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
}

.workspace {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tab-bar {
  display: flex;
  gap: 2px;
  padding: 8px;
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
}

.tab {
  padding: 8px 16px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background 0.2s;
}

.tab:hover {
  background: var(--color-bg);
}

.tab.is-active {
  background: var(--color-primary);
  color: white;
}
```

## 打包配置

```json
// package.json
{
  "build": {
    "appId": "com.superShell.app",
    "productName": "Super Shell",
    "directories": {
      "output": "dist"
    },
    "files": [
      "out/**/*"
    ],
    "win": {
      "target": ["nsis"],
      "icon": "build/icon.ico"
    },
    "mac": {
      "target": ["dmg"],
      "icon": "build/icon.icns"
    },
    "linux": {
      "target": ["AppImage"],
      "icon": "build/icon.png"
    }
  }
}
```

## 万能守则

- 禁止主进程直接操作 DOM
- 禁止渲染进程直接使用 Node.js API
- 所有主进程能力通过 IPC 暴露
- 使用 contextBridge 隔离上下文
- 生产环境必须使用 contextIsolation: true
- 数据库连接池必须复用
- SSH 会话必须支持多并发
- 敏感信息存储使用 keytar

## 触发词

- "Electron + React"
- "桌面应用"
- "electron-vite"
- "跨平台客户端"
- "桌面客户端"
