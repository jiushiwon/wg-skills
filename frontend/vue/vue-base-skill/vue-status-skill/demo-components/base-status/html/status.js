/* base-status 完整 demo - 纯 JS + span 实现（零 HTML5 标签） */

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

// base-status 渲染
const Status = (text, type = 'default', variant = 'solid', size = 'md', options = {}) => {
  const cls = [
    'base-status',
    `base-status--type-${type}`,
    `base-status--variant-${variant}`,
    `base-status--size-${size}`,
  ]
  if (options.shape) cls.push(`base-status--shape-${options.shape}`)
  if (options.blink) cls.push('base-status--blink')
  if (options.icon) cls.push('base-status--has-icon')
  if (options.hasCount) cls.push('base-status--has-count')

  const span = el('span', cls.join(' '))

  if (options.icon) {
    span.appendChild(el('span', { style: { display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' } }))
  }

  if (typeof text === 'string' || typeof text === 'number') {
    span.appendChild(document.createTextNode(String(text)))
  } else {
    span.appendChild(text)
  }

  if (options.count !== undefined) {
    const overflow = options.overflow || 99
    const display = options.count > overflow ? `${overflow}+` : String(options.count)
    span.appendChild(el('span', 'base-status__count', {}, display))
  }

  if (options.closable) {
    const close = el('span', 'base-status__close', {
      role: 'button',
      tabindex: '0',
      'aria-label': '关闭',
      onclick: (e) => {
        e.stopPropagation()
        options.onClose && options.onClose()
        span.remove()
      }
    }, el('span', 'base-status__close-icon', {}, '×'))
    span.appendChild(close)
  }

  return span
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. 7 种 type
  const types = document.getElementById('s-types')
  if (types) {
    types.appendChild(el('div', 'demo-row', {}, [
      Status('主要', 'primary', 'solid', 'md'),
      Status('成功', 'success', 'solid', 'md'),
      Status('警告', 'warning', 'solid', 'md'),
      Status('危险', 'danger', 'solid', 'md'),
      Status('信息', 'info', 'solid', 'md'),
      Status('默认', 'default', 'solid', 'md'),
      Status('中性', 'neutral', 'solid', 'md'),
    ]))
  }

  // 2. 5 种 variant
  const variants = document.getElementById('s-variants')
  if (variants) {
    variants.appendChild(el('div', 'demo-row', {}, [
      Status('已支付（solid）', 'success', 'solid', 'md'),
      Status('已支付（light）', 'success', 'light', 'md'),
      Status('已支付（outline）', 'success', 'outline', 'md'),
      Status('已支付（ghost）', 'success', 'ghost', 'md'),
      Status('已支付（dot）', 'success', 'dot', 'md'),
    ]))
  }

  // 3. 3 种 size
  const sizes = document.getElementById('s-sizes')
  if (sizes) {
    sizes.appendChild(el('div', 'demo-row', {}, [
      Status('小号 sm', 'primary', 'light', 'sm'),
      Status('中号 md', 'primary', 'light', 'md'),
      Status('大号 lg', 'primary', 'light', 'lg'),
    ]))
  }

  // 4. 形状
  const shapes = document.getElementById('s-shapes')
  if (shapes) {
    shapes.appendChild(el('div', 'demo-row', {}, [
      Status('圆角 round', 'primary', 'light', 'md', { shape: 'round' }),
      Status('方形 square', 'primary', 'light', 'md', { shape: 'square' }),
    ]))
  }

  // 5. 可关闭
  const closable = document.getElementById('s-closable')
  if (closable) {
    closable.appendChild(el('div', 'demo-row', {}, [
      Status('可关闭 1', 'primary', 'light', 'md', { closable: true }),
      Status('可关闭 2', 'success', 'light', 'md', { closable: true }),
      Status('可关闭 3', 'warning', 'light', 'md', { closable: true }),
      Status('可关闭 4', 'danger', 'light', 'md', { closable: true }),
    ]))
  }

  // 6. 闪烁
  const blink = document.getElementById('s-blink')
  if (blink) {
    blink.appendChild(el('div', 'demo-row', {}, [
      Status('实时直播', 'danger', 'solid', 'md', { blink: true, icon: true }),
      Status('警告提示', 'warning', 'solid', 'md', { blink: true, icon: true }),
      Status('系统通知', 'info', 'solid', 'md', { blink: true, icon: true }),
    ]))
  }

  // 7. 带数字徽标
  const count = document.getElementById('s-count')
  if (count) {
    count.appendChild(el('div', 'demo-row', {}, [
      Status('消息', 'danger', 'light', 'md', { count: 5 }),
      Status('消息', 'danger', 'light', 'md', { count: 99 }),
      Status('消息', 'danger', 'light', 'md', { count: 150, overflow: 99 }),
      Status('通知', 'warning', 'light', 'md', { count: 12 }),
    ]))
  }

  // 8. 业务场景
  const business = document.getElementById('s-business')
  if (business) {
    business.appendChild(el('div', 'demo-row', {}, [
      Status('待支付', 'warning', 'light', 'md', { blink: true, icon: true }),
      Status('待发货', 'info', 'light', 'md', { icon: true }),
      Status('已发货', 'primary', 'light', 'md', { icon: true }),
      Status('已完成', 'success', 'light', 'md', { icon: true }),
      Status('已退款', 'danger', 'light', 'md', { icon: true }),
      Status('已取消', 'default', 'light', 'md'),
    ]))
  }
})