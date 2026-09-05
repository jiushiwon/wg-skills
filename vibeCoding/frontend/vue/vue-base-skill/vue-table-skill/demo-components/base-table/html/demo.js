/* ============================================
 * base-table / base-button / base-status / base-paginated / base-loading
 * 纯 JS 渲染（不依赖任何框架）
 * 全部使用 div / span + CSS3 实现，零 HTML5 标签
 * ============================================ */

// ============== 工具函数 ==============
const el = (tag, className, attrs = {}, children = []) => {
  const node = document.createElement(tag)
  if (className) node.className = className
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'style' && typeof value === 'object') {
      Object.assign(node.style, value)
    } else if (key.startsWith('on')) {
      node.addEventListener(key.slice(2).toLowerCase(), value)
    } else if (key === 'html') {
      node.innerHTML = value
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

// ============== base-status ==============
const Status = (text, type = 'default', variant = 'light', size = 'sm', extraClass = '') => {
  return el('span', `base-status base-status--type-${type} base-status--variant-${variant} base-status--size-${size} ${extraClass}`, {}, text)
}

// ============== base-button ==============
const Btn = (text, type = 'default', variant = 'solid', size = 'sm', onClick) => {
  const btn = el('span', `base-button base-button--type-${type} base-button--variant-${variant} base-button--size-${size}`, {
    role: 'button',
    tabindex: '0',
    onclick: onClick,
  }, text)
  return btn
}

// ============== base-paginated ==============
const Paginated = ({ current = 1, pageSize = 10, total = 0, mode = 'classic', position = 'right', showTotal = false, showSizeChanger = false, showQuickJumper = false, pageSizes = [10, 20, 50, 100], onChange, onSizeChange }) => {
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
      document.querySelectorAll('.base-paginated__size-select.is-open, .base-paginated__page-dropdown.is-open')
        .forEach(n => n.classList.remove('is-open'))
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

    // 上一页
    buttons.appendChild(Btn('‹', 'default', 'ghost', 'sm', () => onChange && onChange(current - 1)))

    // 页码
    const pages = []
    if (totalPages > 0) pages.push(1)
    if (current - 2 > 2) pages.push(-1)
    for (let i = Math.max(2, current - 2); i <= Math.min(totalPages - 1, current + 2); i++) {
      pages.push(i)
    }
    if (current + 2 < totalPages - 1) pages.push(-1)
    if (totalPages > 1) pages.push(totalPages)

    pages.forEach((p, idx) => {
      if (p === -1) {
        buttons.appendChild(Btn('...', 'default', 'ghost', 'sm', null))
      } else {
        const isActive = p === current
        buttons.appendChild(Btn(String(p), isActive ? 'primary' : 'default', isActive ? 'solid' : 'ghost', 'sm', () => onChange && onChange(p)))
      }
    })

    // 下一页
    buttons.appendChild(Btn('›', 'default', 'ghost', 'sm', () => onChange && onChange(current + 1)))

    root.appendChild(buttons)
  } else if (mode === 'button') {
    const group = el('div', 'base-paginated__button-group')
    group.appendChild(Btn('«', 'default', 'ghost', 'sm', () => onChange && onChange(1)))
    group.appendChild(Btn('‹', 'default', 'ghost', 'sm', () => onChange && onChange(current - 1)))
    group.appendChild(el('div', 'base-paginated__page-info', {}, [
      el('span', 'base-paginated__current', {}, String(current)),
      el('span', 'base-paginated__separator', {}, '/'),
      el('span', 'base-paginated__total-pages', {}, String(totalPages)),
    ]))
    group.appendChild(Btn('›', 'default', 'ghost', 'sm', () => onChange && onChange(current + 1)))
    group.appendChild(Btn('»', 'default', 'ghost', 'sm', () => onChange && onChange(totalPages)))
    root.appendChild(group)
  } else if (mode === 'dropdown') {
    const dropdown = el('div', 'base-paginated__dropdown')
    dropdown.appendChild(Btn('‹', 'default', 'ghost', 'sm', () => onChange && onChange(current - 1)))

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
      document.querySelectorAll('.base-paginated__size-select.is-open, .base-paginated__page-dropdown.is-open')
        .forEach(n => n.classList.remove('is-open'))
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
    dropdown.appendChild(Btn('›', 'default', 'ghost', 'sm', () => onChange && onChange(current + 1)))
    root.appendChild(dropdown)
  }

  if (showQuickJumper && mode !== 'simple') {
    const jumper = el('div', 'base-paginated__jumper', {}, [
      el('span', null, {}, '跳至'),
      el('div', 'base-paginated__jumper-input', {
        contenteditable: 'true',
        onblur: (e) => {
          const v = parseInt(e.target.textContent || '1', 10)
          if (v >= 1 && v <= totalPages) {
            if (onChange) onChange(v)
          } else {
            e.target.textContent = String(current)
          }
        },
        onkeydown: (e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            e.target.blur()
          }
        },
      }, String(current)),
      el('span', null, {}, '页'),
    ])
    root.appendChild(jumper)
  }

  return root
}

// ============== 表格列渲染 ==============
const Cell = (column, row, rowIndex) => {
  if (column.render) return column.render(row, rowIndex)

  if (column.key === '__action__' && column.actions) {
    const actions = el('div', 'base-table__actions')
    column.actions.forEach(action => {
      if (action.hidden && action.hidden(row)) return
      actions.appendChild(Btn(action.label, action.type || 'default', action.variant || 'solid', 'sm', () => action.onClick && action.onClick(row)))
    })
    return actions
  }

  const value = row[column.key]
  if (value === null || value === undefined) return el('span', null, {}, '-')
  return el('span', null, {}, String(value))
}

// ============== base-table 渲染器 ==============
const Table = ({
  data = [],
  columns = [],
  selectable = false,
  selectedKeys = [],
  expandable = false,
  striped = false,
  bordered = false,
  hover = false,
  compact = false,
  loading = false,
  emptyText = '暂无数据',
  rowKey = 'id',
  onSelectionChange,
  onRowClick,
  onAction,
}) => {
  const root = el('div', `base-table${striped ? ' base-table--striped' : ''}${bordered ? ' base-table--bordered' : ''}${hover ? ' base-table--hover' : ''}${compact ? ' base-table--compact' : ''}${loading ? ' base-table--loading' : ''}`)

  // 加载层
  if (loading) {
    const layer = el('div', 'base-loading__layer', {}, [
      el('div', 'base-loading__dots', {}, [
        el('span', 'base-loading__dot'),
        el('span', 'base-loading__dot'),
        el('span', 'base-loading__dot'),
      ]),
      el('div', 'base-loading__text', {}, '加载中...'),
    ])
    root.appendChild(layer)
  }

  const container = el('div', 'base-table__container')

  if (data.length === 0 && !loading) {
    container.appendChild(el('div', 'base-table__empty', {}, [
      el('div', 'base-table__empty-icon', {}, el('div', 'base-table__empty-icon-shape')),
      el('div', 'base-table__empty-text', {}, emptyText),
    ]))
    root.appendChild(container)
    return root
  }

  // 表头
  const header = el('div', 'base-table__row base-table__row--header')

  if (selectable) {
    const allChecked = data.length > 0 && data.every(r => selectedKeys.includes(r[rowKey]))
    const someChecked = data.some(r => selectedKeys.includes(r[rowKey])) && !allChecked

    header.appendChild(el('div', 'base-table__cell base-table__cell--checkbox', {}, [
      el('span', `base-table__checkbox${allChecked ? ' is-checked' : ''}${someChecked ? ' is-indeterminate' : ''}`, {
        role: 'checkbox',
        'aria-checked': allChecked ? 'true' : 'false',
        tabindex: '0',
        onclick: () => {
          if (onSelectionChange) {
            if (allChecked) {
              onSelectionChange([])
            } else {
              onSelectionChange(data.map(r => r[rowKey]))
            }
          }
        },
      }),
    ]))
  }

  columns.forEach(col => {
    header.appendChild(el('div', `base-table__cell base-table__cell--${col.align || 'left'}`, {}, [
      el('span', 'base-table__cell-content', {}, [
        col.title,
        col.sortable ? el('span', 'base-table__sort-icon', {}, [
          el('span', null, {}, '▲'),
          el('span', null, {}, '▼'),
        ]) : null,
      ]),
    ]))
  })

  container.appendChild(header)

  // 表体
  data.forEach((row, rowIndex) => {
    const dataRow = el('div', `base-table__row base-table__row--data${selectedKeys.includes(row[rowKey]) ? ' is-selected' : ''}`, {
      onclick: () => onRowClick && onRowClick(row, rowIndex),
    })

    if (selectable) {
      const checked = selectedKeys.includes(row[rowKey])
      dataRow.appendChild(el('div', 'base-table__cell base-table__cell--checkbox', {}, [
        el('span', `base-table__checkbox${checked ? ' is-checked' : ''}`, {
          role: 'checkbox',
          'aria-checked': checked ? 'true' : 'false',
          tabindex: '0',
          onclick: (e) => {
            e.stopPropagation()
            if (onSelectionChange) {
              const keys = [...selectedKeys]
              const idx = keys.indexOf(row[rowKey])
              if (idx > -1) keys.splice(idx, 1)
              else keys.push(row[rowKey])
              onSelectionChange(keys)
            }
          },
        }),
      ]))
    }

    columns.forEach(col => {
      dataRow.appendChild(el('div', `base-table__cell base-table__cell--${col.align || 'left'}`, {}, Cell(col, row, rowIndex)))
    })

    container.appendChild(dataRow)
  })

  root.appendChild(container)
  return root
}

// ============== 数据 ==============
const usersData = [
  { id: 1, name: '张三', age: 28, email: 'zhangsan@example.com', role: '管理员', status: 'active' },
  { id: 2, name: '李四', age: 32, email: 'lisi@example.com', role: '编辑', status: 'active' },
  { id: 3, name: '王五', age: 25, email: 'wangwu@example.com', role: '访客', status: 'inactive' },
  { id: 4, name: '赵六', age: 45, email: 'zhaoliu@example.com', role: '管理员', status: 'active' },
  { id: 5, name: '钱七', age: 29, email: 'qianqi@example.com', role: '编辑', status: 'inactive' },
  { id: 6, name: '孙八', age: 36, email: 'sunba@example.com', role: '管理员', status: 'active' },
  { id: 7, name: '周九', age: 22, email: 'zhoujiu@example.com', role: '访客', status: 'active' },
  { id: 8, name: '吴十', age: 41, email: 'wushi@example.com', role: '编辑', status: 'active' },
]

const ordersData = [
  { id: 'ORD001', user: '张三', amount: 1280, status: 'paid', method: '支付宝' },
  { id: 'ORD002', user: '李四', amount: 299, status: 'pending', method: '微信' },
  { id: 'ORD003', user: '王五', amount: 5980, status: 'shipped', method: '支付宝' },
  { id: 'ORD004', user: '赵六', amount: 199, status: 'done', method: '银行卡' },
  { id: 'ORD005', user: '钱七', amount: 888, status: 'refunded', method: '支付宝' },
]

// ============== Demo 渲染 ==============

// 1. 基础表格
const renderBasic = () => {
  const cols = [
    { key: 'name', title: '姓名', align: 'left' },
    { key: 'age', title: '年龄', align: 'center' },
    { key: 'email', title: '邮箱', align: 'left' },
    { key: 'role', title: '角色', align: 'center' },
  ]
  document.getElementById('t-basic').appendChild(Table({ data: usersData, columns: cols }))
}

// 2. 固定列
const renderFixed = () => {
  const cols = [
    { key: 'id', title: 'ID', align: 'center' },
    { key: 'name', title: '姓名', align: 'left', fixed: 'left' },
    { key: 'age', title: '年龄', align: 'center' },
    { key: 'email', title: '邮箱', align: 'left' },
    { key: 'address', title: '地址', align: 'left' },
    { key: 'role', title: '角色', align: 'center' },
    { key: '__action__', title: '操作', align: 'center', fixed: 'right', actions: [
      { label: '查看', type: 'primary', variant: 'outline', onClick: () => {} },
      { label: '编辑', type: 'primary', onClick: () => {} },
    ]},
  ],
  data = usersData.map(u => ({ ...u, address: '北京市朝阳区某街道 ' + u.id + ' 号' }))
  document.getElementById('t-fixed').appendChild(Table({ data, columns: cols }))
}

// 3. 操作列
const renderActions = () => {
  const cols = [
    { key: 'name', title: '姓名', align: 'left' },
    { key: 'role', title: '角色', align: 'center' },
    { key: 'email', title: '邮箱', align: 'left' },
    { key: '__action__', title: '操作', align: 'center', actions: [
      { label: '查看', type: 'primary', variant: 'outline', onClick: (row) => alert('查看 ' + row.name) },
      { label: '编辑', type: 'primary', onClick: (row) => alert('编辑 ' + row.name) },
      { label: '删除', type: 'danger', variant: 'outline', onClick: (row) => alert('删除 ' + row.name) },
    ]},
  ]
  document.getElementById('t-actions').appendChild(Table({ data: usersData, columns: cols }))
}

// 4. 状态列
const renderStatus = () => {
  const statusMap = {
    paid: { type: 'success', text: '已支付' },
    pending: { type: 'warning', text: '待支付', blink: true },
    shipped: { type: 'info', text: '已发货' },
    done: { type: 'primary', text: '已完成' },
    refunded: { type: 'danger', text: '已退款' },
  }
  const cols = [
    { key: 'id', title: '订单号', align: 'center' },
    { key: 'user', title: '用户', align: 'left' },
    { key: 'amount', title: '金额', align: 'right',
      render: (row) => el('span', null, {}, '¥' + row.amount.toFixed(2))
    },
    { key: 'method', title: '方式', align: 'center' },
    { key: 'status', title: '状态', align: 'center',
      render: (row) => {
        const cfg = statusMap[row.status]
        return Status(cfg.text, cfg.type, 'light', 'sm', cfg.blink ? 'base-status--blink' : '')
      }
    },
  ]
  document.getElementById('t-status').appendChild(Table({ data: ordersData, columns: cols }))
}

// 5. 可选择行
const renderSelectable = () => {
  const cols = [
    { key: 'name', title: '姓名', align: 'left' },
    { key: 'age', title: '年龄', align: 'center' },
    { key: 'email', title: '邮箱', align: 'left' },
    { key: 'role', title: '角色', align: 'center' },
  ]
  const state = { selectedKeys: [] }
  const root = Table({
    data: usersData,
    columns: cols,
    selectable: true,
    selectedKeys: state.selectedKeys,
    onSelectionChange: (keys) => {
      state.selectedKeys = keys
      document.getElementById('selected-count').textContent = String(keys.length)
      renderSelectable.refresh()
    },
  })
  const container = document.getElementById('t-selectable')
  container.innerHTML = ''
  container.appendChild(root)
  renderSelectable.refresh = () => {
    const newRoot = Table({
      data: usersData,
      columns: cols,
      selectable: true,
      selectedKeys: state.selectedKeys,
      onSelectionChange: (keys) => {
        state.selectedKeys = keys
        document.getElementById('selected-count').textContent = String(keys.length)
        renderSelectable.refresh()
      },
    })
    container.innerHTML = ''
    container.appendChild(newRoot)
  }
}

// 6. 可排序
const renderSortable = () => {
  const cols = [
    { key: 'name', title: '姓名', align: 'left', sortable: true },
    { key: 'age', title: '年龄', align: 'center', sortable: true },
    { key: 'role', title: '角色', align: 'center' },
    { key: 'email', title: '邮箱', align: 'left' },
  ]
  document.getElementById('t-sortable').appendChild(Table({ data: usersData, columns: cols }))
}

// 7. 可筛选
const renderFilterable = () => {
  const cols = [
    { key: 'name', title: '姓名', align: 'left' },
    { key: 'role', title: '角色', align: 'center', filterable: true },
    { key: 'status', title: '状态', align: 'center',
      render: (row) => Status(row.status === 'active' ? '启用' : '禁用', row.status === 'active' ? 'success' : 'default', 'light', 'sm')
    },
  ]
  document.getElementById('t-filterable').appendChild(Table({ data: usersData, columns: cols }))
}

// 8. 可展开行
const renderExpandable = () => {
  const cols = [
    { key: 'name', title: '姓名', align: 'left' },
    { key: 'age', title: '年龄', align: 'center' },
    { key: 'email', title: '邮箱', align: 'left' },
  ]
  const root = el('div', 'base-table')
  const container = el('div', 'base-table__container')
  const header = el('div', 'base-table__row base-table__row--header')
  header.appendChild(el('div', 'base-table__cell base-table__cell--expand'))
  cols.forEach(c => header.appendChild(el('div', `base-table__cell base-table__cell--${c.align || 'left'}`, {}, c.title)))
  container.appendChild(header)

  usersData.slice(0, 4).forEach(row => {
    const dataRow = el('div', 'base-table__row base-table__row--data')
    const expandBtn = el('span', 'base-table__expand-btn', {
      role: 'button',
      tabindex: '0',
      onclick: () => {
        expandBtn.classList.toggle('is-expanded')
        const expanded = container.querySelector('.expanded-' + row.id)
        if (expanded) expanded.remove()
        else {
          const expRow = el('div', 'base-table__row base-table__row--data', {}, [
            el('div', { style: { flex: 1, padding: 'var(--space-4) var(--space-6)', background: 'var(--color-bg-secondary)' } },
              `详细信息：${row.name}，${row.email}，${row.role}`)
          ])
          expRow.classList.add('expanded-' + row.id)
          dataRow.parentNode.insertBefore(expRow, dataRow.nextSibling)
        }
      }
    }, el('span', 'base-table__expand-btn-shape'))
    dataRow.appendChild(el('div', 'base-table__cell base-table__cell--expand', {}, expandBtn))
    cols.forEach(c => {
      dataRow.appendChild(el('div', `base-table__cell base-table__cell--${c.align || 'left'}`, {}, String(row[c.key])))
    })
    container.appendChild(dataRow)
  })

  root.appendChild(container)
  document.getElementById('t-expandable').appendChild(root)
}

// 9. 表头分组
const renderGrouped = () => {
  const cols = [
    { key: 'name', title: '姓名', align: 'left' },
    { key: 'age', title: '年龄', align: 'center' },
    { key: 'gender', title: '性别', align: 'center' },
    { key: 'email', title: '邮箱', align: 'left' },
    { key: 'phone', title: '电话', align: 'left' },
  ]
  const root = el('div', 'base-table base-table--bordered')
  const container = el('div', 'base-table__container')

  // 头部分组
  const headerGroup = el('div', 'base-table__row base-table__row--header')
  headerGroup.appendChild(el('div', 'base-table__cell base-table__cell--left', {}, [
    el('span', null, {}, '姓名'),
  ]))
  headerGroup.appendChild(el('div', 'base-table__cell base-table__cell--center', { colspan: 2 },
    el('span', 'base-table__cell-content', {}, '个人信息')))
  headerGroup.appendChild(el('div', 'base-table__cell base-table__cell--left', { colspan: 2 },
    el('span', 'base-table__cell-content', {}, '联系方式')))
  container.appendChild(headerGroup)

  // 详细表头
  const header = el('div', 'base-table__row base-table__row--header')
  cols.forEach(c => header.appendChild(el('div', `base-table__cell base-table__cell--${c.align || 'left'}`, {}, c.title)))
  container.appendChild(header)

  // 数据
  usersData.slice(0, 5).forEach(row => {
    const dataRow = el('div', 'base-table__row base-table__row--data')
    cols.forEach(c => {
      dataRow.appendChild(el('div', `base-table__cell base-table__cell--${c.align || 'left'}`, {},
        c.key === 'gender' ? (row.id % 2 === 0 ? '男' : '女') : String(row[c.key] || (c.key === 'phone' ? '138' + (1000 + row.id) + '0000' : '-'))))
    })
    container.appendChild(dataRow)
  })

  root.appendChild(container)
  document.getElementById('t-grouped').appendChild(root)
}

// 10. 行编辑
const renderEditable = () => {
  const cols = [
    { key: 'name', title: '姓名（可编辑）', align: 'left', editable: true, editType: 'input' },
    { key: 'age', title: '年龄（可编辑）', align: 'center', editable: true, editType: 'number' },
    { key: 'role', title: '角色（可编辑）', align: 'center', editable: true, editType: 'select', editOptions: [
      { label: '管理员', value: '管理员' },
      { label: '编辑', value: '编辑' },
      { label: '访客', value: '访客' },
    ]},
    { key: '__action__', title: '操作', align: 'center', actions: [
      { label: '保存', type: 'primary', onClick: () => alert('保存成功') },
    ]},
  ]
  const root = el('div', 'base-table')
  const container = el('div', 'base-table__container')
  const header = el('div', 'base-table__row base-table__row--header')
  cols.forEach(c => header.appendChild(el('div', `base-table__cell base-table__cell--${c.align || 'left'}`, {}, c.title)))
  container.appendChild(header)

  usersData.slice(0, 4).forEach(row => {
    const dataRow = el('div', 'base-table__row base-table__row--data')
    cols.forEach(col => {
      const cell = el('div', `base-table__cell base-table__cell--${col.align || 'left'}`)

      if (col.__action__ || col.key === '__action__') {
        cell.appendChild(Btn('编辑', 'primary', 'solid', 'sm', () => {
          cell.innerHTML = ''
          cell.classList.add('base-table__cell--editable')
          const input = el('div', 'base-table__edit-input', {
            contenteditable: 'true',
          }, String(row[col.key === 'name' ? 'name' : 'role']))
          cell.appendChild(input)
        }))
      } else if (col.editable) {
        const content = el('span', null, {}, String(row[col.key]))
        cell.appendChild(content)
        cell.addEventListener('click', () => {
          cell.innerHTML = ''
          if (col.editType === 'select') {
            const selectWrap = el('div', 'base-table__edit-select', { tabindex: '0' }, [
              el('span', null, {}, String(row[col.key])),
              el('span', 'base-table__edit-select-arrow', {}, '▾'),
            ])
            cell.appendChild(selectWrap)
            selectWrap.addEventListener('click', () => {
              const existing = selectWrap.querySelector('.select-panel')
              if (existing) { existing.remove(); return }
              const panel = el('div', 'select-panel', {
                style: { position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', zIndex: 100, marginTop: '4px' }
              })
              col.editOptions.forEach(opt => {
                panel.appendChild(el('div', { style: { padding: 'var(--space-2) var(--space-3)', cursor: 'pointer' },
                  onmousedown: (e) => {
                    e.preventDefault()
                    row[col.key] = opt.value
                    cell.innerHTML = ''
                    cell.appendChild(el('span', null, {}, String(opt.value)))
                  }
                }, opt.label))
              })
              selectWrap.appendChild(panel)
            })
          } else {
            const input = el('div', 'base-table__edit-input', {
              contenteditable: 'true',
              onblur: () => {
                cell.innerHTML = ''
                cell.appendChild(el('span', null, {}, input.textContent || String(row[col.key])))
                row[col.key] = input.textContent || row[col.key]
              },
            }, String(row[col.key]))
            cell.appendChild(input)
            input.focus()
          }
        })
      }
      dataRow.appendChild(cell)
    })
    container.appendChild(dataRow)
  })

  root.appendChild(container)
  document.getElementById('t-editable').appendChild(root)
}

// 11. 树形数据
const renderTree = () => {
  const treeData = [
    {
      id: 1, name: '研发部', _level: 0, _expanded: true,
      children: [
        { id: 11, name: '前端组', _level: 1, _expanded: true,
          children: [
            { id: 111, name: '张三', _level: 2, role: '前端工程师' },
            { id: 112, name: '李四', _level: 2, role: '高级前端' },
          ]
        },
        { id: 12, name: '后端组', _level: 1, _expanded: true,
          children: [
            { id: 121, name: '王五', _level: 2, role: '后端工程师' },
          ]
        },
      ]
    },
    { id: 2, name: '产品部', _level: 0, _expanded: true,
      children: [
        { id: 21, name: '赵六', _level: 1, role: '产品经理' },
      ]
    },
    { id: 3, name: '设计部', _level: 0, _expanded: false,
      children: [
        { id: 31, name: '钱七', _level: 1, role: '设计师' },
      ]
    },
  ]
  const cols = [
    { key: 'name', title: '部门 / 员工', align: 'left' },
    { key: 'role', title: '职位', align: 'center' },
  ]

  const renderFlat = (data) => {
    const result = []
    const walk = (nodes) => {
      nodes.forEach(n => {
        result.push(n)
        if (n._expanded && n.children) walk(n.children)
      })
    }
    walk(data)
    return result
  }

  const container = el('div', 'base-table__container')
  const header = el('div', 'base-table__row base-table__row--header')
  header.appendChild(el('div', 'base-table__cell base-table__cell--tree'))
  cols.forEach(c => header.appendChild(el('div', `base-table__cell base-table__cell--${c.align || 'left'}`, {}, c.title)))
  container.appendChild(header)

  const renderRows = () => {
    Array.from(container.querySelectorAll('.base-table__row--data')).forEach(n => n.remove())
    renderFlat(treeData).forEach(row => {
      const dataRow = el('div', 'base-table__row base-table__row--data')
      const treeCell = el('div', 'base-table__cell base-table__cell--tree')
      for (let i = 0; i < row._level; i++) {
        treeCell.appendChild(el('span', 'base-table__tree-indent', { style: { width: '24px' } }))
      }
      if (row.children) {
        const toggle = el('span', `base-table__tree-toggle${row._expanded ? ' is-expanded' : ''}`, {
          role: 'button',
          tabindex: '0',
          onclick: () => {
            row._expanded = !row._expanded
            toggle.classList.toggle('is-expanded')
            renderRows()
          }
        }, el('span', 'base-table__tree-toggle-shape'))
        treeCell.appendChild(toggle)
      }
      dataRow.appendChild(treeCell)
      cols.forEach(c => {
        dataRow.appendChild(el('div', `base-table__cell base-table__cell--${c.align || 'left'}`, {}, String(row[c.key] || '-')))
      })
      container.appendChild(dataRow)
    })
  }
  renderRows()

  const root = el('div', 'base-table')
  root.appendChild(container)
  document.getElementById('t-tree').appendChild(root)
}

// 12. 拖拽排序
const renderDrag = () => {
  const data = usersData.slice(0, 5).map(u => ({ ...u, order: u.id }))
  const cols = [
    { key: '__drag__', title: '', align: 'center' },
    { key: 'name', title: '姓名', align: 'left' },
    { key: 'role', title: '角色', align: 'center' },
  ]
  const root = el('div', 'base-table')
  const container = el('div', 'base-table__container')
  const header = el('div', 'base-table__row base-table__row--header')
  cols.forEach(c => header.appendChild(el('div', `base-table__cell base-table__cell--${c.align || 'left'}`, {}, c.title)))
  container.appendChild(header)

  const renderRows = () => {
    Array.from(container.querySelectorAll('.base-table__row--data')).forEach(n => n.remove())
    data.forEach(row => {
      const dataRow = el('div', 'base-table__row base-table__row--data base-table__row--draggable', {
        draggable: 'true',
        ondragstart: (e) => {
          e.dataTransfer.setData('text/plain', String(row.id))
          dataRow.style.opacity = '0.5'
        },
        ondragend: () => { dataRow.style.opacity = '1' },
        ondragover: (e) => e.preventDefault(),
        ondrop: (e) => {
          e.preventDefault()
          const fromId = parseInt(e.dataTransfer.getData('text/plain'), 10)
          const fromIdx = data.findIndex(r => r.id === fromId)
          const toIdx = data.findIndex(r => r.id === row.id)
          if (fromIdx > -1 && toIdx > -1 && fromIdx !== toIdx) {
            const [moved] = data.splice(fromIdx, 1)
            data.splice(toIdx, 0, moved)
            renderRows()
          }
        }
      })
      dataRow.appendChild(el('div', 'base-table__cell base-table__cell--center', {}, '⋮⋮'))
      cols.slice(1).forEach(c => dataRow.appendChild(el('div', `base-table__cell base-table__cell--${c.align || 'left'}`, {}, String(row[c.key]))))
      container.appendChild(dataRow)
    })
  }
  renderRows()
  root.appendChild(container)
  document.getElementById('t-drag').appendChild(root)
}

// 13. 汇总行
const renderSummary = () => {
  const data = ordersData
  const cols = [
    { key: 'id', title: '订单号', align: 'center' },
    { key: 'user', title: '用户', align: 'left' },
    { key: 'amount', title: '金额', align: 'right' },
    { key: 'method', title: '方式', align: 'center' },
  ]
  const total = data.reduce((sum, r) => sum + r.amount, 0)
  const summaryRow = el('div', 'base-table__row base-table__row--summary')
  summaryRow.appendChild(el('div', 'base-table__cell base-table__cell--center', {}, '汇总'))
  summaryRow.appendChild(el('div', 'base-table__cell base-table__cell--left', {}, `${data.length} 笔`))
  summaryRow.appendChild(el('div', 'base-table__cell base-table__cell--right', {}, [
    el('strong', null, {}, '¥' + total.toFixed(2))
  ]))
  summaryRow.appendChild(el('div', 'base-table__cell base-table__cell--center', {}, '-'))

  const root = Table({ data, columns: cols, bordered: true })
  root.querySelector('.base-table__container').appendChild(summaryRow)
  document.getElementById('t-summary').appendChild(root)
}

// 14. styled
const renderStyled = () => {
  const cols = [
    { key: 'id', title: 'ID', align: 'center' },
    { key: 'name', title: '姓名', align: 'left' },
    { key: 'age', title: '年龄', align: 'center' },
    { key: 'role', title: '角色', align: 'center' },
    { key: 'email', title: '邮箱', align: 'left' },
  ]
  document.getElementById('t-styled').appendChild(Table({ data: usersData, columns: cols, striped: true, bordered: true, hover: true, compact: true }))
}

// 15. 加载中 + 空状态
const renderLoadingAndEmpty = () => {
  const cols = [
    { key: 'id', title: 'ID', align: 'center' },
    { key: 'name', title: '姓名', align: 'left' },
    { key: 'role', title: '角色', align: 'center' },
  ]
  document.getElementById('t-loading').appendChild(Table({ data: [], columns: cols, loading: true, emptyText: '' }))
  document.getElementById('t-empty').appendChild(Table({ data: [], columns: cols, emptyText: '暂无数据' }))
}

// 16. 完整示例
const renderComplete = () => {
  const statusMap = {
    paid: { type: 'success', text: '已支付' },
    pending: { type: 'warning', text: '待支付' },
    shipped: { type: 'info', text: '已发货' },
    done: { type: 'primary', text: '已完成' },
    refunded: { type: 'danger', text: '已退款' },
  }
  const cols = [
    { key: 'id', title: '订单号', align: 'center' },
    { key: 'user', title: '用户', align: 'left' },
    { key: 'amount', title: '金额', align: 'right',
      render: (row) => '¥' + row.amount.toFixed(2)
    },
    { key: 'method', title: '方式', align: 'center' },
    { key: 'status', title: '状态', align: 'center',
      render: (row) => {
        const cfg = statusMap[row.status]
        return Status(cfg.text, cfg.type, 'light', 'sm')
      }
    },
    { key: '__action__', title: '操作', align: 'center', actions: [
      { label: '查看', type: 'primary', variant: 'outline', onClick: () => {} },
      { label: '编辑', type: 'primary', onClick: () => {} },
      { label: '删除', type: 'danger', variant: 'outline', onClick: () => {} },
    ]},
  ]
  const state = { current: 1, pageSize: 10, total: ordersData.length }

  const container = document.getElementById('t-complete')
  container.innerHTML = ''

  const refresh = () => {
    container.innerHTML = ''
    const root = Table({
      data: ordersData,
      columns: cols,
      selectable: true,
      selectedKeys: [],
      hover: true,
      onSelectionChange: () => {},
    })
    container.appendChild(root)

    const paginated = Paginated({
      current: state.current,
      pageSize: state.pageSize,
      total: state.total,
      showTotal: true,
      showSizeChanger: true,
      showQuickJumper: true,
      position: 'right',
      onChange: (page) => { state.current = page; refresh() },
      onSizeChange: (size) => { state.pageSize = size; refresh() },
    })
    container.parentNode.querySelector('#p-complete').innerHTML = ''
    container.parentNode.querySelector('#p-complete').appendChild(paginated)
  }
  refresh()
}

// ============== 启动 ==============
document.addEventListener('DOMContentLoaded', () => {
  renderBasic()
  renderFixed()
  renderActions()
  renderStatus()
  renderSelectable()
  renderSortable()
  renderFilterable()
  renderExpandable()
  renderGrouped()
  renderEditable()
  renderTree()
  renderDrag()
  renderSummary()
  renderStyled()
  renderLoadingAndEmpty()
  renderComplete()
})