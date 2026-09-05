/* ============================================
 * base-loading 完整 demo
 * 纯 JS + div/span 实现（零 HTML5 标签）
 * ============================================ */

const el = (tag, className, attrs = {}, children = []) => {
  const node = document.createElement(tag)
  if (className) node.className = className
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'style' && typeof value === 'object') {
      Object.assign(node.style, value)
    } else if (key.startsWith('on')) {
      node.addEventListener(key.slice(2).toLowerCase(), value)
    } else if (value !== null && value !== undefined && value !== false) {
      node.setAttribute(key, value === true ? '' : value)
    }
  }
  for (const c of [].concat(children)) {
    if (c == null || c === false) continue
    if (typeof c === 'string' || typeof c === 'number') {
      node.appendChild(document.createTextNode(String(c)))
    } else {
      node.appendChild(c)
    }
  }
  return node
}

// 加载动画生成器
const Animations = {
  dots: () => el('div', 'base-loading__dots', {}, [
    el('span', 'base-loading__dot'),
    el('span', 'base-loading__dot'),
    el('span', 'base-loading__dot'),
  ]),
  bar: () => el('div', 'base-loading__bar'),
  ring: () => el('div', 'base-loading__ring'),
  pulse: () => el('div', 'base-loading__pulse', {}, [
    el('span'),
    el('span'),
    el('span'),
  ]),
  wave: () => {
    const wave = el('div', { style: { display: 'flex', gap: '4px', alignItems: 'center', height: '32px' } })
    for (let i = 0; i < 5; i++) {
      const bar = el('span', {
        style: {
          display: 'inline-block',
          width: '4px',
          height: '100%',
          background: 'var(--color-primary)',
          borderRadius: '2px',
          animation: 'wave 1.2s infinite ease-in-out',
          animationDelay: `${-0.4 + i * 0.1}s`,
        }
      })
      wave.appendChild(bar)
    }
    // 注入 CSS 动画
    if (!document.getElementById('wave-anim')) {
      const style = document.createElement('style')
      style.id = 'wave-anim'
      style.textContent = `
        @keyframes wave {
          0%, 40%, 100% { transform: scaleY(0.4); }
          20% { transform: scaleY(1); }
        }
      `
      document.head.appendChild(style)
    }
    return wave
  },
  cube: () => {
    const cube = el('div', {
      style: {
        width: '32px',
        height: '32px',
        position: 'relative',
        perspective: '200px',
      }
    })
    const inner = el('div', {
      style: {
        position: 'absolute',
        inset: 0,
        transformStyle: 'preserve-3d',
        animation: 'cube-rotate 2s infinite ease-in-out',
      }
    })
    for (let i = 0; i < 6; i++) {
      const face = el('div', {
        style: {
          position: 'absolute',
          inset: 0,
          background: 'color-mix(in srgb, var(--color-primary) 30%, transparent)',
          border: '2px solid var(--color-primary)',
        }
      })
      inner.appendChild(face)
    }
    cube.appendChild(inner)

    if (!document.getElementById('cube-anim')) {
      const style = document.createElement('style')
      style.id = 'cube-anim'
      style.textContent = `
        @keyframes cube-rotate {
          0% { transform: rotateY(0deg) rotateX(0deg); }
          50% { transform: rotateY(180deg) rotateX(180deg); }
          100% { transform: rotateY(360deg) rotateX(360deg); }
        }
        [style*="cube-rotate"] > div:nth-child(1) { transform: translateZ(16px); }
        [style*="cube-rotate"] > div:nth-child(2) { transform: rotateY(180deg) translateZ(16px); }
        [style*="cube-rotate"] > div:nth-child(3) { transform: rotateY(90deg) translateZ(16px); }
        [style*="cube-rotate"] > div:nth-child(4) { transform: rotateY(-90deg) translateZ(16px); }
        [style*="cube-rotate"] > div:nth-child(5) { transform: rotateX(90deg) translateZ(16px); }
        [style*="cube-rotate"] > div:nth-child(6) { transform: rotateX(-90deg) translateZ(16px); }
      `
      document.head.appendChild(style)
    }
    return cube
  },
  ripple: () => {
    const ripple = el('div', {
      style: {
        position: 'relative',
        width: '32px',
        height: '32px',
      }
    })
    for (let i = 0; i < 3; i++) {
      ripple.appendChild(el('div', {
        style: {
          position: 'absolute',
          inset: 0,
          border: '2px solid var(--color-primary)',
          borderRadius: '50%',
          animation: 'ripple 1.5s infinite cubic-bezier(0, 0.2, 0.8, 1)',
          animationDelay: `${i * 0.5}s`,
        }
      }))
    }
    if (!document.getElementById('ripple-anim')) {
      const style = document.createElement('style')
      style.id = 'ripple-anim'
      style.textContent = `
        @keyframes ripple {
          0% { transform: scale(0.3); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `
      document.head.appendChild(style)
    }
    return ripple
  },
}

// 主题颜色
const themeColors = {
  primary: '#1890ff',
  success: '#52c41a',
  warning: '#faad14',
  danger: '#ff4d4f',
  info: '#1890ff',
}

// 渲染加载动画
const renderLoading = (containerId, mode, options = {}) => {
  const { size: sizeMd = 32, theme = 'primary', text, textPosition = 'bottom' } = options
  const container = document.getElementById(containerId)
  if (!container) return

  // 注入主题色变量
  if (theme !== 'primary') {
    container.style.setProperty('--color-primary', themeColors[theme])
  } else {
    container.style.removeProperty('--color-primary')
  }

  const anim = Animations[mode]()

  container.innerHTML = ''

  const layer = el('div', 'base-loading__layer')
  layer.style.fontSize = `${sizeMd}px`

  if (textPosition === 'top' || textPosition === 'left') {
    if (text) layer.appendChild(el('div', 'base-loading__text', {}, text))
  }

  layer.appendChild(anim)

  if (textPosition === 'bottom' || textPosition === 'right' || (!textPosition && text)) {
    if (text) layer.appendChild(el('div', 'base-loading__text', {}, text))
  }

  container.appendChild(layer)
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. 7 种动画
  renderLoading('l-dots', 'dots')
  renderLoading('l-bar', 'bar')
  renderLoading('l-ring', 'ring')
  renderLoading('l-pulse', 'pulse')
  renderLoading('l-wave', 'wave')
  renderLoading('l-cube', 'cube')
  renderLoading('l-ripple', 'ripple')

  // 2. 不同尺寸
  renderLoading('l-xs', 'ring', { sizeMd: 16 })
  renderLoading('l-sm', 'ring', { sizeMd: 24 })
  renderLoading('l-md', 'ring', { sizeMd: 32 })
  renderLoading('l-lg', 'ring', { sizeMd: 48 })
  renderLoading('l-xl', 'ring', { sizeMd: 64 })

  // 3. 不同主题
  renderLoading('l-primary', 'dots', { theme: 'primary', sizeMd: 32 })
  renderLoading('l-success', 'dots', { theme: 'success', sizeMd: 32 })
  renderLoading('l-warning', 'dots', { theme: 'warning', sizeMd: 32 })
  renderLoading('l-danger', 'dots', { theme: 'danger', sizeMd: 32 })
  renderLoading('l-info', 'dots', { theme: 'info', sizeMd: 32 })

  // 4. 容器加载
  const lContainer = document.getElementById('l-container')
  const lToggle = document.getElementById('l-toggle')
  let isLoading4 = false
  lToggle.addEventListener('click', () => {
    isLoading4 = !isLoading4
    if (isLoading4) {
      lContainer.innerHTML = ''
      const layer = el('div', 'base-loading__layer', {}, [
        Animations.dots(),
        el('div', 'base-loading__text', {}, '加载中...'),
      ])
      lContainer.appendChild(layer)
      lToggle.textContent = '关闭加载'
    } else {
      lContainer.innerHTML = `
        <div style="padding: 16px;">
          <div style="margin-bottom: 8px;">用户：张三 / 李四 / 王五</div>
          <div style="margin-bottom: 8px;">邮箱：zhangsan@example.com</div>
          <div>状态：活跃</div>
        </div>
      `
      lToggle.textContent = '显示加载'
    }
  })

  // 5. 全屏加载
  const lFsTrigger = document.getElementById('l-fs-trigger')
  lFsTrigger.addEventListener('click', () => {
    const overlay = el('div', {
      style: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '12px',
      }
    }, [
      Animations.ring(),
      el('div', 'base-loading__text', {}, '全屏加载中...'),
    ])
    document.body.appendChild(overlay)
    setTimeout(() => overlay.remove(), 2000)
  })

  // 6. 带文案
  renderLoading('l-text-top', 'ring', { text: '上方文案', textPosition: 'top' })
  renderLoading('l-text-bottom', 'ring', { text: '下方文案', textPosition: 'bottom' })
  renderLoading('l-text-left', 'dots', { text: '左侧文案', textPosition: 'left' })
})