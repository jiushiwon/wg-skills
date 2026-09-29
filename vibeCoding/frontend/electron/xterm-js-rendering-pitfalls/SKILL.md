---
name: xterm-js-rendering-pitfalls
description: |
  xterm.js 在 Electron 终端类项目里最容易踩的 4 个渲染坑：
  1) fontFamily 传 CSS 变量导致 vi gg/G 失效 + 字符越界
  2) 主题切换不生效（state 孤岛）
  3) canvas 重绘需 term.refresh()
  4) PTY 尺寸校正在字体加载完成前 fit → 偏大 rows/cols → 远端 vi 越界
  触发词：xterm 主题不切换、xterm 字体不生效、xterm 字符越界、vi 排版错乱、
  vi gg G 失效、vi :q 关不了、xterm 背景色不变、xterm canvas 没重绘、
  useTheme 主题不传播、useState 主题孤岛、PTY 尺寸不对、TIOCSWINSZ 偏大。
agent_created: true
---

# xterm.js 渲染坑合集

本类项目（Electron + SSH/本地终端、底层用 `@xterm/xterm` 6.x + `@xterm/addon-fit`）一整天的调试
最终归纳出 4 个反复出现的坑——都和"xterm 是 canvas 渲染"+"CSS 变量和 React state 的盲区"有关。

---

## 坑 1：fontFamily 传 `var(--font-mono)` → vi 越界、gg/G 失效

### 现象
- 终端字符排到视口外
- vi 里 `gg`（到头）/ `G`（到尾）看着"没反应"
- 内容已经铺满屏幕却到不了头尾

### 根因
- xterm 用 canvas 的 `ctx.font` 渲染文字，**`ctx.font` 不支持 CSS 变量**
- `'var(--font-mono)'` 对 canvas 是**非法值** → canvas 回退到浏览器默认字体
- 但 `fit()` 测量单元尺寸时走的是 DOM `getComputedStyle`，**能解析 `var()`**，按 JetBrains Mono 算
- **两个字体字形/字距不一致** → 终端"逻辑 rows/cols"和"实际显示"对不上
- 远端 vi 按 `TIOCSWINSZ` 拿到的窗口尺寸和真实可见区域错位 → vi 屏幕坐标算错

### 修复
```ts
function resolveMonoFont(): string {
  try {
    const v = getComputedStyle(document.documentElement)
      .getPropertyValue('--font-mono').trim()
    if (v) return v
  } catch { /* ignore */ }
  return "'JetBrains Mono', 'Courier New', monospace"
}

// 创建 Terminal 时
new Terminal({
  fontFamily: resolveMonoFont(),  // ← 运行期解析后的字面量字体栈
  ...
})
```

**关键**：传字面量字符串 `'JetBrains Mono', monospace` 让 canvas 与测量用同一字体，尺寸/对齐才一致。

---

## 坑 2：xterm 主题切换不生效——state 孤岛

### 现象
- 全局 `<html data-theme="dark">` 切了，**其他** UI 区域都跟随深色
- 但 xterm 画布**仍然是白色**（light 配色）

### 根因
最容易掉进的写法：

```ts
// ThemeToggle.tsx
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme)
  ...
  return { theme, setTheme }
}

// SshTerminal.tsx
const { theme } = useTheme()
useEffect(() => {
  term.options.theme = getXtermTheme(theme)
}, [theme])
```

**致命陷阱**：`useTheme()` 每个调用方各自 `useState`，**主题切换不会跨组件传播**——

- `ThemeToggle` 点 dark 时它自己变 dark，但 `SshTerminal` 自己的 `useState` 还是 light
- `<html data-theme>` 切了（CSS 变量全局生效，其他区域跟随）
- 但 `SshTerminal` 的 effect **没被触发**（依赖的 theme state 没变）
- `term.options.theme` 仍是 light，画布白底

### 修复（架构级 lift state up）

把主题 state 提升到**全局 Context/Reducer**，所有组件共享：

```ts
// store/appContext.tsx
interface AppState {
  ...,
  theme: Theme
}

// reducer
case 'SET_THEME': return { ...state, theme: action.payload }

// AppProvider 唯一持有
const toggleTheme = useCallback(() => {
  dispatch({ type: 'SET_THEME', payload: state.theme === 'light' ? 'dark' : 'light' })
}, [state.theme])

// 各组件用 useApp() 拿
const { theme, toggleTheme } = useApp()
```

**判断口诀**：任何需要"全应用一致 + 跨组件感知"的状态（主题、当前用户、当前连接）都不能放在 `useState`，必须放全局 store。

---

## 坑 3：xterm 主题切了但不重绘已存在的字符

### 现象
- 主题 effect 触发了，`term.options.theme = newTheme` 也设了
- **新写入**的字符是新色，但**已存在**的字符仍是旧色
- 看上去"画风"前后不统一，像漏切了

### 根因
xterm 是 canvas 渲染，`term.options.theme = X` 只**更新主题变量**，**不会自动重画已存在字符**。

### 修复
```ts
useEffect(() => {
  const term = terminalRef.current
  if (!term) return
  term.options.theme = getXtermTheme(theme)
  // 必须 refresh 全屏才能看到新主题
  term.refresh(0, Math.max(0, term.rows - 1))
  // 外层 .xterm div 的背景色 xterm 不会自动跟随
  const xtermEl = containerRef.current?.querySelector('.xterm') as HTMLElement | null
  if (xtermEl) {
    xtermEl.style.backgroundColor = getXtermTheme(theme).background ?? ''
  }
}, [theme])
```

**双保险**：canvas 重绘（`term.refresh`）+ 外层 div 背景色（`xtermEl.style`）。
xterm.css 里 `.xterm-viewport` 有 `background-color: #000;` 硬编码，需要运行时盖掉。

---

## 坑 4：PTY 尺寸校正在字体加载完成前 fit → vi 越界

### 现象
- vi 打开文档后命令行排在视口外，看不见自己输入的 `:q`
- 终端看上去"全屏"，输不进也退不出
- 单屏正好放下时不踩，文档内容多/窗口大小变化时必踩

### 根因
- PTY 经 `TIOCSWINSZ` 把窗口尺寸告诉远端 shell，vi 据此排版
- 首屏 `fit()` 在 web 字体未加载完成时按 fallback 字体算，**rows 偏大**
- `document.fonts.ready` promise 在字体 404 / 加载极慢时**不 resolve**
- 偏大的 rows 一旦传给远端，vi 以为屏幕超高，`gg/G` 定位错乱（看上去"没反应"）

### 修复（多重兜底校正）
```ts
async function waitForLayoutStable() {
  // 1. 字体就绪
  if (document.fonts?.ready) {
    await document.fonts.ready.catch(() => {})
  }
  // 2. 双 rAF（确保 layout 已结束）
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
}

const startResizeSettling = () => {
  // 3. 定时多次 fit（覆盖字体晚加载 / 布局抖动）
  const delays = [0, 120, 300, 600, 1200, 2500]
  for (const d of delays) {
    setTimeout(() => { if (!disposed) fitAndResize() }, d)
  }
  // 4. window load 兜底
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => { if (!disposed) fitAndResize() }).catch(() => {})
  }
  window.addEventListener('load', onLoad)
}

const fitAndResize = () => {
  fitAddon.fit()
  // 直接用 xterm 实际渲染的尺寸（不要用 proposeDimensions() 二次计算，会偏大）
  const cols = Math.max(1, term.cols || 80)
  const rows = Math.max(1, term.rows || 24)
  // 尺寸没变就不重发 SIGWINCH
  if (!lastDims.current || lastDims.current.cols !== cols || lastDims.current.rows !== rows) {
    sshPtyResize(localSessionId.current, cols, rows)
    lastDims.current = { cols, rows }
  }
}
```

**关键**：
- 用 `term.cols/term.rows` 而**不是** `proposeDimensions()`（后者会偏大）
- 尺寸去重，避免重复 `SIGWINCH`
- 多重兜底（字体 + 定时 + window.load），单一信号失败也能正确

---

## 不做

- 不要在 xterm fontFamily 里用任何 CSS 变量
- 不要把"全应用感知"的状态放进局部 `useState`
- 不要只设 `term.options.theme = X` 而忘记 `term.refresh(0, term.rows-1)`
- 不要在首屏 `fit()` 前不 `waitForLayoutStable`
- 不要用 `proposeDimensions()` 代替 `term.cols/rows`

## 红线

1. **fontFamily 必须字面量**：`ctx.font` 不解析 CSS 变量，传 `var(--xxx)` 直接踩坑
2. **主题状态必须全局**：每个 `useState` 都是孤岛，跨组件不传播
3. **主题切换必须 refresh**：`term.options.theme = X` 不重绘已有字符
4. **PTY 尺寸必须 waitForLayoutStable**：首屏 fit 在字体未就绪时算错

## 自检 checklist

调试 xterm 时按顺序问：

- [ ] `fontFamily` 是字面量字符串，不是 `var(--xxx)`？
- [ ] 主题 state 在全局 context，不是各组件 `useState`？
- [ ] 主题 effect 里调了 `term.refresh(0, term.rows-1)`？
- [ ] 外层 `.xterm` div 的 `backgroundColor` 同步覆盖了？
- [ ] 首屏 fit 前等了 `document.fonts.ready` + 双 rAF？
- [ ] fit 后用 `term.cols/rows` 不是 `proposeDimensions()`？
- [ ] 改了渲染端后**重启 Electron**了？（参见 `electron-dev-restart` 技能）

## 引用索引

| 文件 | 内容 |
|---|---|
| `references/font-resolver.md` | `resolveMonoFont()` 的实现细节、为什么 ctx.font 不支持 var() |
| `references/theme-state-lift.md` | useTheme → AppContext 迁移的步骤 + before/after 对比 |
| `references/pty-size-settling.md` | 三重兜底校正的完整实现 + 为什么单信号不够 |

## 触发关键词清单

```
xterm 主题不切换、xterm 字体不生效、xterm 字符越界、vi 排版错乱、
vi gg G 失效、vi :q 关不了、xterm 背景色不变、xterm canvas 没重绘、
useTheme 主题不传播、useState 主题孤岛、PTY 尺寸不对、TIOCSWINSZ 偏大、
xterm fit 算错、xterm theme 没生效、xterm 还是白色
```

## 关联技能

- **`vibeCoding/frontend/electron/electron-dev-restart`**：改完渲染端必须重启 Electron 才生效
- **`vibeCoding/frontend/vue/vue-style-skill`**：CSS 变量与主题系统规范（本 skill 涉及的部分）