# 系统托盘集成指南

系统托盘（System Tray）让应用可以最小化到任务栏通知区域，提供快捷操作入口。

## 实现步骤

### 1. 准备托盘图标

- Windows：256x256 PNG 或 ICO
- macOS：22x22 / 44x44 PNG（Template Image，自动适配深色/浅色菜单栏）
- Linux：256x256 PNG

将图标放在 `resources/` 目录下。

### 2. 创建托盘（src/main/index.ts）

```typescript
import { app, BrowserWindow, Tray, Menu, nativeImage, Notification } from 'electron'
import { join } from 'path'
import { is, electronApp } from '@electron-toolkit/utils'

let tray: Tray | null = null
let mainWindow: BrowserWindow | null = null

/**
 * 创建系统托盘
 */
function createTray(): void {
  // 加载图标
  const iconPath = join(__dirname, '../../resources/icon.png')
  const icon = nativeImage.createFromPath(iconPath)

  // macOS 需要 Template Image
  if (process.platform === 'darwin') {
    icon.setTemplateImage(true)
  }

  tray = new Tray(icon)

  // 托盘右键菜单
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示主窗口',
      click: () => {
        if (mainWindow) {
          mainWindow.show()
          mainWindow.focus()
        }
      }
    },
    {
      label: '关于',
      click: () => {
        if (mainWindow) {
          mainWindow.show()
          mainWindow.webContents.send('show-about')
        }
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.quit()
      }
    }
  ])

  // 设置托盘属性
  tray.setToolTip('{{project-name}}')
  tray.setContextMenu(contextMenu)

  // 托盘双击事件（Windows）
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show()
      mainWindow.focus()
    }
  })
}
```

### 3. 修改窗口关闭行为（最小化到托盘）

```typescript
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  // 窗口准备好后显示
  mainWindow.on('ready-to-show', () => {
    mainWindow!.show()
  })

  // 拦截关闭事件 → 最小化到托盘
  mainWindow.on('close', (event) => {
    // macOS 点击关闭按钮时隐藏窗口而不是退出
    if (process.platform === 'darwin') {
      event.preventDefault()
      mainWindow!.hide()
      return
    }

    // Windows/Linux：最小化到托盘（不退出）
    if (!app.isQuitting) {
      event.preventDefault()
      mainWindow!.hide()
    }
  })

  // 加载页面
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// 应用退出标记
app.on('before-quit', () => {
  ;(app as any).isQuitting = true
})
```

### 4. 完整初始化流程

```typescript
app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.{{project-name}}.app')

  createWindow()
  createTray()

  // macOS：点击 dock 图标时重新显示窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    } else {
      mainWindow?.show()
    }
  })
})

// 所有窗口关闭时退出（macOS 除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
```

---

## 高级功能

### 动态更新托盘菜单

```typescript
function updateTrayMenu(isRunning: boolean): void {
  if (!tray) return

  const contextMenu = Menu.buildFromTemplate([
    {
      label: isRunning ? '服务运行中' : '服务已停止',
      enabled: false
    },
    { type: 'separator' },
    {
      label: isRunning ? '停止服务' : '启动服务',
      click: () => {
        // 切换服务状态
        const newState = !isRunning
        updateTrayMenu(newState)
      }
    },
    { type: 'separator' },
    {
      label: '显示主窗口',
      click: () => mainWindow?.show()
    },
    {
      label: '退出',
      click: () => app.quit()
    }
  ])

  tray.setContextMenu(contextMenu)
}
```

### 托盘通知（闪烁提示）

```typescript
/**
 * 托盘图标闪烁（Windows）
 */
function flashTrayIcon(flash: boolean): void {
  if (!mainWindow || process.platform !== 'win32') return

  mainWindow.flashFrame(flash)
}

/**
 * 显示系统通知
 */
function showNotification(title: string, body: string): void {
  // Notification 已在文件顶部从 'electron' 导入
  if (Notification.isSupported()) {
    const notification = new Notification({
      title,
      body,
      icon: join(__dirname, '../../resources/icon.png')
    })

    notification.show()

    notification.on('click', () => {
      mainWindow?.show()
      mainWindow?.focus()
    })
  }
}
```

---

## 常见问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 托盘图标不显示 | 图标路径错误或格式不对 | 使用绝对路径，PNG 格式 |
| macOS 托盘图标太暗 | 未设置 Template Image | `icon.setTemplateImage(true)` |
| 点击关闭后应用退出 | 未拦截 close 事件 | 在 close 事件中 `event.preventDefault()` |
| 托盘菜单不更新 | Tray 对象未保存引用 | 将 tray 变量提升到模块作用域 |
| Windows 退出不干净 | 未设置 isQuitting 标记 | 在 before-quit 中设置标记 |

---

## 跨平台注意事项

| 平台 | 图标要求 | 行为差异 |
|------|----------|----------|
| Windows | 256x256 PNG/ICO | 双击托盘图标显示窗口 |
| macOS | 22x22 Template PNG | 点击关闭按钮隐藏到 Dock |
| Linux | 256x256 PNG | 某些桌面环境不支持托盘 |
