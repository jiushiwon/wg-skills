# IPC 通信指南

Electron 的 IPC（Inter-Process Communication）是主进程与渲染进程之间的通信机制。
本指南基于 **contextBridge + invoke/handle** 安全模式。

## 安全原则

| 原则 | 说明 |
|------|------|
| **禁止 nodeIntegration** | 渲染进程不能直接访问 Node.js API |
| **必须 contextIsolation** | 预加载脚本与渲染进程隔离 |
| **使用 invoke/handle** | 请求-响应模式，比 send/on 更安全 |
| **最小暴露原则** | 只暴露必要的 API，不暴露整个 ipcRenderer |

---

## 通信架构

```
┌─────────────────┐     invoke()      ┌─────────────────┐
│   渲染进程       │ ───────────────→  │   主进程         │
│  (Vue3 App)     │                    │  (Node.js)      │
│                 │ ←───────────────  │                 │
│  window.api.xxx │     返回结果       │  ipcMain.handle │
└─────────────────┘                    └─────────────────┘
        │                                      │
        │  contextBridge                       │
        │  (安全桥梁)                            │
        ▼                                      ▼
┌─────────────────┐                    ┌─────────────────┐
│   预加载脚本     │                    │  系统 API       │
│  preload/index  │                    │  文件/网络/进程  │
└─────────────────┘                    └─────────────────┘
```

---

## 实现步骤

### 1. 主进程注册处理器（src/main/index.ts）

```typescript
import { ipcMain, app, dialog, shell } from 'electron'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'

// 注册 IPC 处理器
// 注意：所有处理器在 app.whenReady() 之后注册

// 获取应用版本
ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

// 获取系统信息
ipcMain.handle('get-system-info', () => {
  return {
    platform: process.platform,
    arch: process.arch,
    electronVersion: process.versions.electron,
    nodeVersion: process.versions.node,
    chromeVersion: process.versions.chrome
  }
})

// 打开文件对话框
ipcMain.handle('dialog:open-file', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: '文本文件', extensions: ['txt', 'md', 'json'] },
      { name: '所有文件', extensions: ['*'] }
    ]
  })

  if (result.canceled || result.filePaths.length === 0) {
    return null
  }

  const filePath = result.filePaths[0]
  const content = await readFile(filePath, 'utf-8')
  return { filePath, content }
})

// 保存文件
ipcMain.handle('dialog:save-file', async (_event, content: string) => {
  const result = await dialog.showSaveDialog({
    filters: [
      { name: '文本文件', extensions: ['txt'] },
      { name: '所有文件', extensions: ['*'] }
    ]
  })

  if (result.canceled || !result.filePath) {
    return false
  }

  await writeFile(result.filePath, content, 'utf-8')
  return true
})

// 打开外部链接
ipcMain.handle('shell:open-external', async (_event, url: string) => {
  await shell.openExternal(url)
  return true
})
```

### 2. 预加载脚本暴露 API（src/preload/index.ts）

```typescript
import { contextBridge, ipcRenderer } from 'electron'

/**
 * 自定义 API
 * 只暴露必要的方法，不暴露整个 ipcRenderer
 */
const api = {
  // 应用信息
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),

  // 文件操作
  openFile: () => ipcRenderer.invoke('dialog:open-file'),
  saveFile: (content: string) => ipcRenderer.invoke('dialog:save-file', content),

  // 系统操作
  openExternal: (url: string) => ipcRenderer.invoke('shell:open-external', url)
}

// 安全暴露
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error('暴露 API 失败:', error)
  }
} else {
  // @ts-ignore
  window.api = api
}
```

### 3. 类型声明（src/preload/electron.d.ts）

```typescript
interface CustomAPI {
  /** 获取应用版本 */
  getAppVersion: () => Promise<string>
  /** 获取系统信息 */
  getSystemInfo: () => Promise<{
    platform: string
    arch: string
    electronVersion: string
    nodeVersion: string
    chromeVersion: string
  }>
  /** 打开文件对话框 */
  openFile: () => Promise<{ filePath: string; content: string } | null>
  /** 保存文件对话框 */
  saveFile: (content: string) => Promise<boolean>
  /** 打开外部链接 */
  openExternal: (url: string) => Promise<boolean>
}

declare interface Window {
  api: CustomAPI
}
```

### 4. 渲染进程使用（Vue 组件中）

```vue
<script setup lang="ts">
import { ref } from 'vue'

const version = ref('')
const fileInfo = ref<{ filePath: string; content: string } | null>(null)

// 获取版本
async function getVersion(): Promise<void> {
  version.value = await window.api.getAppVersion()
}

// 打开文件
async function handleOpenFile(): Promise<void> {
  const result = await window.api.openFile()
  if (result) {
    fileInfo.value = result
  }
}

// 保存文件
async function handleSaveFile(content: string): Promise<void> {
  const success = await window.api.saveFile(content)
  if (success) {
    console.log('保存成功')
  }
}

// 打开外部链接
async function handleOpenLink(url: string): Promise<void> {
  await window.api.openExternal(url)
}
</script>
```

---

## 高级场景

### 双向通信（主进程主动推送）

如果需要主进程主动向渲染进程发送消息（如托盘点击事件），使用 `webContents.send`：

```typescript
// 主进程
import { ipcMain, BrowserWindow } from 'electron'

// 主动推送消息（主进程 → 渲染进程）
function notifyRenderer(channel: string, ...args: unknown[]): void {
  const windows = BrowserWindow.getAllWindows()
  windows.forEach(win => {
    win.webContents.send(channel, ...args)
  })
}

// 示例：托盘点击时通知渲染进程
ipcMain.handle('tray-clicked', () => {
  notifyRenderer('tray:clicked')
})
```

```typescript
// 预加载脚本
import { contextBridge, ipcRenderer } from 'electron'

const api = {
  // ... 其他 API

  // 监听主进程消息
  onTrayClicked: (callback: () => void) => {
    ipcRenderer.on('tray:clicked', () => callback())
    // 返回清理函数
    return () => {
      ipcRenderer.removeAllListeners('tray:clicked')
    }
  }
}

contextBridge.exposeInMainWorld('api', api)
```

```vue
<!-- 渲染进程 -->
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

let cleanup: (() => void) | undefined

onMounted(() => {
  cleanup = window.api.onTrayClicked(() => {
    console.log('托盘被点击了')
    // 处理托盘点击事件
  })
})

onUnmounted(() => {
  cleanup?.()
})
</script>
```

---

## 常见错误

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| `window.api is undefined` | 预加载脚本未正确加载 | 检查 `webPreferences.preload` 路径 |
| `ipcRenderer.invoke is not a function` | 直接在渲染进程使用 ipcRenderer | 必须通过 contextBridge 暴露 |
| `Blocked a frame with origin` | CSP 策略阻止 | 检查 index.html 的 CSP 配置 |
| `Error: No handler registered` | 主进程未注册处理器 | 确保 `ipcMain.handle` 在 `app.whenReady()` 后执行 |
| `Could not call remote function` | 远程模块被禁用 | 使用 contextBridge 替代 |

---

## 安全检查清单

- [ ] `nodeIntegration: false`（禁止渲染进程使用 Node.js）
- [ ] `contextIsolation: true`（启用上下文隔离）
- [ ] `enableRemoteModule: false`（禁用远程模块）
- [ ] 只暴露必要 API（不暴露整个 ipcRenderer）
- [ ] 使用 `invoke/handle`（不使用 `send/on`，除非主进程主动推送）
- [ ] 输入验证（主进程处理渲染进程传来的数据时，必须验证）
- [ ] CSP 配置正确（限制资源加载来源）
