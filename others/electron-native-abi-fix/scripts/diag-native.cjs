/**
 * diag-native.cjs — Electron 原生模块（native addon）加载诊断
 *
 * 用途：判断原生模块的 ABI 是否与当前 Electron 主进程匹配。
 *
 * 用法（必须在【项目根目录】执行，且必须用【electron 二进制】而不是 node）：
 *   env -u ELECTRON_RUN_AS_NODE ./node_modules/electron/dist/electron.exe \
 *     --no-sandbox <skill目录>/scripts/diag-native.cjs better-sqlite3 keytar ssh2
 *
 * 结果写入当前目录的 diag-native-result.txt。
 *
 * 为什么必须用 electron 跑：node 与 electron 的 ABI 不同。
 * 用 node 跑会得到 node 的 ABI，从而完全看不出"electron 加载不了"的问题。
 * 为什么必须 unset ELECTRON_RUN_AS_NODE：该变量会把 electron 降级成纯 node，
 * 让诊断结果再次失真（曾导致误判为"electron 装错了版本"）。
 *
 * 模块解析：显式从 process.cwd()/node_modules 解析，
 * 因此脚本可以存放在任意位置（如技能目录），但 cwd 必须是项目根。
 */
const fs = require('fs')
const path = require('path')

// Electron 下 argv 会把【脚本自身路径】也作为参数传进来，
// 且不同调用形态里脚本可能落在 argv[1] 或 argv[2]，必须用多重规则过滤：
// 1) 排除脚本自身（argv[1]）及其 basename
// 2) 排除含路径分隔符的项（脚本通常带路径）
// 3) 排除 .js/.cjs/.mjs 结尾的项
// 只保留裸模块名。
const scriptPath = process.argv[1] || ''
const scriptBase = path.basename(scriptPath)
const modules = process.argv
  .slice(2)
  .filter(
    (a) =>
      a !== scriptBase &&
      !/[/\\]/.test(a) &&
      !/\.(c|m)?js$/i.test(a)
  )
const lines = []

lines.push('=== Electron native module diagnostic ===')
lines.push('runtime ABI (process.versions.modules): ' + process.versions.modules)
lines.push('node: ' + process.version)
lines.push('ELECTRON_RUN_AS_NODE: ' + (process.env.ELECTRON_RUN_AS_NODE || '(unset)'))
lines.push('cwd: ' + process.cwd())
lines.push('')

if (modules.length === 0) {
  lines.push('[warn] 未指定要诊断的模块。用法: diag-native.cjs <module1> [module2] ...')
} else {
  for (const name of modules) {
    try {
      // 显式从项目根的 node_modules 解析，避免脚本自身位置影响查找
      const mod = require(path.join(process.cwd(), 'node_modules', name))

      // sqlite 类模块额外做一次真实建库/写入，确保不只是"能 require"
      if (/sqlite/i.test(name) && typeof mod === 'function') {
        const db = new mod(':memory:')
        db.exec('CREATE TABLE t (x)')
        db.prepare('INSERT INTO t VALUES (1)').run()
        const row = db.prepare('SELECT x FROM t').get()
        lines.push(`OK   ${name}  (建库+写入+读取实测通过, x=${row.x})`)
      } else {
        lines.push(`OK   ${name}`)
      }
    } catch (err) {
      // ABI 报错是多行文本，压成一行保留关键片段
      const msg = String(err && err.message ? err.message : err)
        .replace(/\s+/g, ' ')
        .slice(0, 400)
      lines.push(`ERR  ${name}: ${msg}`)
    }
  }
}

lines.push('')
lines.push('=== 判读 ===')
lines.push('ERR 且含 "NODE_MODULE_VERSION" → 原生模块 ABI 与 Electron 不匹配，需换为提供该 ABI 预编译的版本')
lines.push('全部 OK → 原生模块正常，问题在别处（回查 whenReady 初始化 / IPC 注册顺序）')

fs.writeFileSync(path.join(process.cwd(), 'diag-native-result.txt'), lines.join('\n'))
process.exit(0)
