# 环境探测与自动安装

本文件定义了生成项目前的环境检测流程和自动安装逻辑。

## 检测流程

### 第一步：检测 Node.js

```bash
# 检测是否安装
node --version

# 需要 >= 18.x LTS
# 示例输出：v18.20.0 / v20.11.0 / v22.x
```

**判断逻辑**：
- 未安装 → 提示用户下载：https://nodejs.org/zh-cn/ （推荐 LTS 版本）
- 版本 < 18 → 提示升级：https://nodejs.org/zh-cn/
- 版本 >= 18 → ✅ 通过

### 第二步：检测 npm

```bash
# 检测是否可用
npm --version

# 需要 >= 9.x
# 示例输出：9.8.1 / 10.x
```

**判断逻辑**：
- 未安装 → 提示用户重新安装 Node.js（npm 随 Node.js 附带）
- 版本 < 9 → 提示升级：`npm install -g npm@latest`
- 版本 >= 9 → ✅ 通过

### 第三步：检测操作系统

```bash
# Node.js 中检测
process.platform  # 'win32' | 'darwin' | 'linux'
```

**用途**：
- Windows → 打包生成 .exe（nsis）
- macOS → 打包生成 .dmg
- Linux → 打包生成 .AppImage

### 第四步：检测磁盘空间（可选）

```bash
# Windows
wmic logicaldisk where "DeviceID='C:'" get FreeSpace

# macOS / Linux
df -h .
```

**判断逻辑**：
- 可用空间 < 500MB → 警告：磁盘空间不足，建议清理
- 可用空间 >= 500MB → ✅ 通过

---

## 自动安装流程

### 安装依赖

```bash
# 进入项目目录
cd {{project-name}}

# 安装所有依赖
npm install
```

**常见问题处理**：

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| `npm ERR! code ERESOLVE` | 依赖版本冲突 | 使用 `npm install --legacy-peer-deps` |
| `npm ERR! code ENOENT` | 路径问题 | 检查目录是否存在 |
| `npm ERR! code EACCES` | 权限问题 | macOS/Linux 用 `sudo`，或修复 npm 权限 |
| `npm WARN deprecated` | 依赖过期 | 忽略，不影响功能 |
| `electron` 下载慢 | 网络问题 | 设置镜像：`ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/` |

### Electron 镜像加速（国内用户）

```bash
# 设置 Electron 下载镜像（在 npm install 前执行）
# Windows PowerShell
$env:ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"

# Windows CMD
set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/

# macOS / Linux
export ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
```

---

## 检测结果输出格式

```
🔍 环境检测结果：

  ✅ Node.js：v20.11.0（>= 18，满足要求）
  ✅ npm：10.2.4（>= 9，满足要求）
  ✅ 操作系统：Windows 11
  ✅ 磁盘空间：128.5 GB 可用

  📦 开始安装依赖...
```

或

```
🔍 环境检测结果：

  ❌ Node.js：未安装

  💡 请先安装 Node.js（>= 18 LTS）：
     下载地址：https://nodejs.org/zh-cn/
     安装后重新运行此命令。
```

---

## 脚本实现参考

```typescript
import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { join } from 'path'

interface EnvCheckResult {
  nodeVersion: string | null
  npmVersion: string | null
  platform: NodeJS.Platform
  diskFreeGB: number | null
  allPassed: boolean
  errors: string[]
}

/**
 * 检测环境
 */
function checkEnvironment(): EnvCheckResult {
  const result: EnvCheckResult = {
    nodeVersion: null,
    npmVersion: null,
    platform: process.platform,
    diskFreeGB: null,
    allPassed: false,
    errors: []
  }

  // 检测 Node.js
  try {
    const nodeVer = execSync('node --version', { encoding: 'utf-8' }).trim()
    result.nodeVersion = nodeVer
    const major = parseInt(nodeVer.replace('v', '').split('.')[0])
    if (major < 18) {
      result.errors.push(`Node.js 版本过低：${nodeVer}（需要 >= 18）`)
    }
  } catch {
    result.errors.push('Node.js 未安装')
  }

  // 检测 npm
  try {
    const npmVer = execSync('npm --version', { encoding: 'utf-8' }).trim()
    result.npmVersion = npmVer
    const major = parseInt(npmVer.split('.')[0])
    if (major < 9) {
      result.errors.push(`npm 版本过低：${npmVer}（需要 >= 9）`)
    }
  } catch {
    result.errors.push('npm 未安装')
  }

  result.allPassed = result.errors.length === 0
  return result
}

/**
 * 安装依赖
 */
async function installDependencies(projectDir: string): Promise<boolean> {
  try {
    // 设置 Electron 镜像（国内加速）
    const env = {
      ...process.env,
      ELECTRON_MIRROR: 'https://npmmirror.com/mirrors/electron/'
    }

    execSync('npm install', {
      cwd: projectDir,
      stdio: 'inherit',
      env
    })
    return true
  } catch (err) {
    console.error('依赖安装失败:', err)
    return false
  }
}
```
