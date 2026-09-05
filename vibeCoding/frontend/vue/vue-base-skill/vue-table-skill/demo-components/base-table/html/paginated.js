/* ============================================
 * base-paginated 完整 demo
 * 纯 JS + div/span 实现（零 HTML5 标签）
 * ============================================ */

// 工具函数
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

// base-button
const Btn = (text, type = 'default', variant = 'ghost', size = 'sm', onClick) => {
  const cls = ['base-button', `base-button--type-${type}`, `base-button--variant-${variant}`, `base-button--size-${size}`]
  return el('span', cls.join(' '), {
    role: 'button',
    tabindex: '0',
    onclick: onClick,
  }, text)
}

// 分页组件
const Paginated = ({ id, current = 1, pageSize = 10, total = 0, mode = 'classic', position = 'right', size = 'md', showTotal = false, showSizeChanger = false, showQuickJumper = false, pageSizes = [10, 20, 50, 100], disabled = false, onChange, onSizeChange }) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const root = el('div', `base-paginated base-paginated--position-${position} base-paginated--mode-${mode}`)

  if (showTotal) {
    root.appendChild(el('span', 'base-paginated__total', {}, [
      '共 ',
      el('strong', null, {}, String(total)),
      ' 条',
    ]))
  }

  if (showSizeChanger) {
    const sizeSelect = el('div', 'base-paginated__size-select', { tabindex: '0' }, [
      el('span', null, {}, `${pageSize} 条/页`),
      el('span', 'base-paginated__size-select-arrow'),
    ])

    const renderPanel = () => {
      const existing = sizeSelect.querySelector('.base-paginated__size-select-panel')
      if (existing) existing.remove()
      const panel = el('div', 'base-paginated__size-select-panel')
      pageSizes.forEach(s => {
        panel.appendChild(el('div', `base-paginated__size-select-option ${s === pageSize ? 'is-active' : ''}`, {
          onmousedown: (e) => {
            e.preventDefault()
            sizeSelect.classList.remove('is-open')
            if (onSizeChange) onSizeChange(s)
          }
        }, `${s} 条/页`))
      })
      sizeSelect.appendChild(panel)
    }

    sizeSelect.addEventListener('click', (e) => {
      e.stopPropagation()
      const isOpen = sizeSelect.classList.contains('is-open')
      document.querySelectorAll('.is-open').forEach(n => n.classList.remove('is-open'))
      if (!isOpen) {
        sizeSelect.classList.add('is-open')
        renderPanel()
      }
    })
    sizeSelect.addEventListener('blur', () => setTimeout(() => sizeSelect.classList.remove('is-open'), 150))
    root.appendChild(el('div', 'base-paginated__size-changer', {}, sizeSelect))
  }

  if (mode === 'classic') {
    const buttons = el('div', 'base-paginated__buttons')
    buttons.appendChild(Btn('‹', 'default', 'ghost', size, () => !disabled && onChange && onChange(current - 1)))

    const pages = []
    if (totalPages > 0) pages.push(1)
    if (current - 2 > 2) pages.push(-1)
    for (let i = Math.max(2, current - 2); i <= Math.min(totalPages - 1, current + 2); i++) pages.push(i)
    if (current + 2 < totalPages - 1) pages.push(-1)
    if (totalPages > 1) pages.push(totalPages)

    pages.forEach(p => {
      if (p === -1) {
        buttons.appendChild(Btn('...', 'default', 'ghost', size, null))
      } else {
        const isActive = p === current
        buttons.appendChild(Btn(String(p), isActive ? 'primary' : 'default', isActive ? 'solid' : 'ghost', size,
          () => !disabled && !isActive && onChange && onChange(p)))
      }
    })

    buttons.appendChild(Btn('›', 'default', 'ghost', size, () => !disabled && onChange && onChange(current + 1)))
    root.appendChild(buttons)
  } else if (mode === 'button') {
    const group = el('div', 'base-paginated__button-group')
    group.appendChild(Btn('«', 'default', 'ghost', size, () => !disabled && onChange && onChange(1)))
    group.appendChild(Btn('‹', 'default', 'ghost', size, () => !disabled && onChange && onChange(current - 1)))
    group.appendChild(el('div', 'base-paginated__page-info', {}, [
      el('span', 'base-paginated__current', {}, String(current)),
      el('span', 'base-paginated__separator', {}, '/'),
      el('span', 'base-paginated__total-pages', {}, String(totalPages)),
    ]))
    group.appendChild(Btn('›', 'default', 'ghost', size, () => !disabled && onChange && onChange(current + 1)))
    group.appendChild(Btn('»', 'default', 'ghost', size, () => !disabled && onChange && onChange(totalPages)))
    root.appendChild(group)
  } else if (mode === 'dropdown') {
    const dropdown = el('div', 'base-paginated__dropdown')
    dropdown.appendChild(Btn('‹', 'default', 'ghost', size, () => !disabled && onChange && onChange(current - 1)))

    const pageDropdown = el('div', 'base-paginated__page-dropdown', { tabindex: '0' }, [
      el('span', null, {}, [
        '第 ',
        el('strong', null, {}, String(current)),
        ` 页 / 共 ${totalPages} 页`,
      ]),
      el('span', 'base-paginated__page-dropdown-arrow'),
    ])

    pageDropdown.addEventListener('click', (e) => {
      e.stopPropagation()
      const isOpen = pageDropdown.classList.contains('is-open')
      document.querySelectorAll('.is-open').forEach(n => n.classList.remove('is-open'))
      if (!isOpen) {
        pageDropdown.classList.add('is-open')
        const existing = pageDropdown.querySelector('.base-paginated__page-dropdown-panel')
        if (existing) existing.remove()
        const panel = el('div', 'base-paginated__page-dropdown-panel')
        for (let i = 1; i <= totalPages; i++) {
          panel.appendChild(el('div', `base-paginated__size-select-option ${i === current ? 'is-active' : ''}`, {
            onmousedown: (e) => {
              e.preventDefault()
              pageDropdown.classList.remove('is-open')
              if (onChange) onChange(i)
            }
          }, `第 ${i} 页`))
        }
        pageDropdown.appendChild(panel)
    }
    })
    pageDropdown.addEventListener('blur', () => setTimeout(() => pageDropdown.classList.remove('is-open'), 150))

    dropdown.appendChild(pageDropdown)
    dropdown.appendChild(Btn('›', 'default', 'ghost', size, () => !disabled && onChange && onChange(current + 1)))
    root.appendChild(dropdown)
  } else if (mode === 'simple') {
    const simple = el('div', 'base-paginated__button-group')
    simple.appendChild(Btn('‹', 'default', 'ghost', size, () => !disabled && onChange && onChange(current - 1)))
    simple.appendChild(el('div', 'base-paginated__page-info', {}, [
      el('div', 'base-paginated__jumper-input', {
        contenteditable: 'true',
        onblur: (e) => {
          const v = parseInt(e.target.textContent || '1', 10)
          if (v >= 1 && v <= totalPages && !disabled) {
            if (onChange) onChange(v)
          } else {
            e.target.textContent = String(current)
          }
        },
      }, String(current)),
      el('span', 'base-paginated__separator', {}, '/'),
      el('span', 'base-paginated__total-pages', {}, String(totalPages)),
    ]))
    simple.appendChild(Btn('›', 'default', 'ghost', size, () => !disabled && onChange && onChange(current + 1)))
    root.appendChild(simple)
  }

  if (showQuickJumper && mode !== 'simple') {
    root.appendChild(el('div', 'base-paginated__jumper', {}, [
      el('span', null, {}, '跳至'),
      el('div', 'base-paginated__jumper-input', {
        contenteditable: 'true',
        onblur: (e) => {
          const v = parseInt(e.target.textContent || '1', 10)
          if (v >= 1 && v <= totalPages && !disabled) {
            if (onChange) onChange(v)
          } else {
            e.target.textContent = String(current)
          }
        },
        onkeydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur() } },
      }, String(current)),
      el('span', null, {}, '页'),
    ]))
  }

  if (disabled) root.style.opacity = '0.5'

  return root
}

// 创建带状态的分页实例
const createPaginated = (config) => {
  const state = { current: config.current || 1, pageSize: config.pageSize || 10, total: config.total || 0 }
  const container = document.getElementById(config.id)
  if (!container) return

  const refresh = () => {
    container.innerHTML = ''
    container.appendChild(Paginated({
      ...config,
      current: state.current,
      pageSize: state.pageSize,
      total: state.total,
      onChange: (page) => {
        state.current = page
        refresh()
      },
      onSizeChange: (size) => {
        state.pageSize = size
        state.current = 1
        refresh()
      },
    }))
  }
  refresh()
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. 经典
  createPaginated({ id: 'p-classic', current: 1, pageSize: 10, total: 100, mode: 'classic', position: 'right' })
  // 2. 按钮
  createPaginated({ id: 'p-button', current: 3, pageSize: 10, total: 100, mode: 'button', position: 'center' })
  // 3. 下拉
  createPaginated({ id: 'p-dropdown', current: 1, pageSize: 10, total: 1000, mode: 'dropdown', position: 'right' })
  // 4. 简洁
  createPaginated({ id: 'p-simple', current: 1, pageSize: 10, total: 100, mode: 'simple', position: 'center' })
  // 5. 尺寸
  createPaginated({ id: 'p-sm', current: 1, pageSize: 10, total: 100, size: 'sm', position: 'left' })
  createPaginated({ id: 'p-md', current: 1, pageSize: 10, total: 100, size: 'md', position: 'left' })
  createPaginated({ id: 'p-lg', current: 1, pageSize: 10, total: 100, size: 'lg', position: 'left' })
  // 6. 位置
  createPaginated({ id: 'p-left', current: 3, pageSize: 10, total: 100, position: 'left' })
  createPaginated({ id: 'p-center', current: 3, pageSize: 10, total: 100, position: 'center' })
  createPaginated({ id: 'p-right', current: 3, pageSize: 10, total: 100, position: 'right' })
  // 7. 完整
  createPaginated({
    id: 'p-full', current: 1, pageSize: 10, total: 256,
    showTotal: true, showSizeChanger: true, showQuickJumper: true,
    position: 'right',
  })
  // 8. 大量
  createPaginated({ id: 'p-large', current: 5, pageSize: 10, total: 200, position: 'right' })
  // 9. 禁用
  createPaginated({ id: 'p-disabled', current: 1, pageSize: 10, total: 100, disabled: true, position: 'right' })
})