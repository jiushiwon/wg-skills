// === SVG 图标库（替换 emoji，专用于文件浏览器场景）===
const SVG = {
  folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/></svg>',
  folderOpen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v1H3V7z"/><path d="M3 9h18l-2 8a2 2 0 0 1-2 1.5H5a2 2 0 0 1-2-2V9z"/></svg>',
  file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6z"/><path d="M14 3v6h6"/></svg>',
  vue: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 19h6l4-8 4 8h6L12 2z" fill="#42b883"/><path d="M12 8l-3 6h6l-3-6z" fill="#35495e"/></svg>',
  ts: '<svg viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="3" fill="#3178c6"/><text x="12" y="17" font-family="Arial,sans-serif" font-weight="700" font-size="13" fill="#fff" text-anchor="middle">TS</text></svg>',
  json: '<svg viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="3" fill="#fbc02d"/><text x="12" y="17" font-family="Arial,sans-serif" font-weight="700" font-size="11" fill="#fff" text-anchor="middle">{}</text></svg>',
  md: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#2196f3"/><text x="12" y="17" font-family="Arial,sans-serif" font-weight="700" font-size="11" fill="#fff" text-anchor="middle">M</text></svg>'
};

// === 树渲染器（vanilla 模拟 base-tree 渲染逻辑）===

function renderListItem(item, variant, opts = {}) {
  const cls = ['list-item', `list-item--${variant}`];
  if (item.disabled) cls.push('is-disabled');
  if (item.danger) cls.push('is-danger');
  if (item._active) cls.push('is-active');

  const hasChildren = item.children && item.children.length > 0;
  const expanderCls = ['list-item__expander'];
  if (!hasChildren) expanderCls.push('is-leaf');
  if (item.open) expanderCls.push('is-open');

  const expanderIcon = item.open ? '▾' : '▸';
  let iconHtml = '';
  if (opts.beforeIcon) iconHtml += opts.beforeIcon;
  else if (item.icon) iconHtml = `<div class="list-item__icon">${item.icon}</div>`;

  // 标签（支持高亮 / 编辑）
  let labelHtml = `<div class="list-item__label">${item.label}</div>`;
  if (item._edit) {
    labelHtml = `<input class="tree-edit-input" value="${item.label}" data-id="${item.id}" />`;
  } else if (item._highlight) {
    labelHtml = `<div class="list-item__label">${highlightLabel(item.label, item._highlight)}</div>`;
  }

  const shortcutHtml = item.shortcut ? `<div class="list-item__shortcut">${item.shortcut}</div>` : '';
  const metaHtml = item.meta ? `<div class="list-item__meta">${item.meta}</div>` : '';
  const badgeHtml = item.badge ? `<div class="list-item__badge">${item.badge}</div>` : '';

  let html = `<div class="${cls.join(' ')}" data-id="${item.id}" data-variant="${variant}">
    <div class="${expanderCls.join(' ')}">${hasChildren ? expanderIcon : ''}</div>
    ${iconHtml}
    ${labelHtml}
    ${shortcutHtml}
    ${metaHtml}
    ${badgeHtml}
  </div>`;

  if (hasChildren) {
    const childCls = ['list-children'];
    if (!item.open) childCls.push('is-collapsed');
    html += `<div class="${childCls.join(' ')}">`;
    item.children.forEach(c => { html += renderListItem(c, variant, opts); });
    html += '</div>';
  }

  return html;
}

function highlightLabel(label, kw) {
  if (!kw) return label;
  const re = new RegExp(`(${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return label.replace(re, '<span class="tree-highlight">$1</span>');
}

// 深度克隆（避免污染原始数据）
function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

// 共享：组织架构
const ORG_DATA = [
  { id: 'ceo', label: '考拉（CEO）', icon: '👤', open: true, children: [
    { id: 'tech', label: '技术中心', icon: '📁', open: true, children: [
      { id: 'fe', label: '前端组', icon: '👥', meta: '12 人' },
      { id: 'be', label: '后端组', icon: '👥', meta: '18 人' },
      { id: 'ops', label: '运维组', icon: '👥', meta: '5 人' }
    ]},
    { id: 'prod', label: '产品部', icon: '📁', open: true, children: [
      { id: 'pm', label: '周八（PM）', icon: '👤' },
      { id: 'design', label: '设计组', icon: '📁', meta: '6 人' }
    ]}
  ]},
  { id: 'hr', label: '人力资源', icon: '📁', meta: '3 人' }
];

const PERM_DATA = [
  { id: 'sys', label: '系统管理', open: true, children: [
    { id: 'user-mgmt', label: '用户管理' },
    { id: 'role-mgmt', label: '角色管理', open: true, children: [
      { id: 'role-list', label: '角色列表' },
      { id: 'role-assign', label: '角色分配' }
    ]},
    { id: 'menu-mgmt', label: '菜单管理' }
  ]},
  { id: 'biz', label: '业务管理', open: true, children: [
    { id: 'order', label: '订单管理' },
    { id: 'product', label: '商品管理' },
    { id: 'report', label: '报表管理' }
  ]}
];

const FILE_DATA = [
  { id: 'root', label: 'wg-skills', icon: SVG.folderOpen, open: true, children: [
    { id: 'src', label: 'src', icon: SVG.folderOpen, open: true, children: [
      { id: 'comp', label: 'components', icon: SVG.folderOpen, open: true, children: [
        { id: 'f1', label: 'BaseButton.vue', icon: SVG.vue, meta: '2.1KB' },
        { id: 'f2', label: 'BaseListItem.vue', icon: SVG.vue, meta: '4.5KB' },
        { id: 'f3', label: 'BaseTree.vue', icon: SVG.vue, meta: '6.8KB' }
      ]},
      { id: 'app', label: 'App.vue', icon: SVG.vue, meta: '1.2KB' }
    ]},
    { id: 'docs', label: 'docs', icon: SVG.folder, open: true, children: [
      { id: 'readme', label: 'README.md', icon: SVG.md, meta: '5.1KB' },
      { id: 'changelog', label: 'CHANGELOG.md', icon: SVG.md, meta: '3.4KB' }
    ]},
    { id: 'pkg', label: 'package.json', icon: SVG.json, meta: '2.4KB' }
  ]}
];

const EDIT_DATA = clone(ORG_DATA);

const DOC_TREE = [
  { id: 'ai', label: 'AI 学习手册', icon: '📖', open: true, children: [
    { id: 'ml', label: '机器学习基础', icon: '📝' },
    { id: 'dl', label: '深度学习进阶', icon: '📝' },
    { id: 'llm', label: '大模型应用', icon: '📝', open: true, children: [
      { id: 'gpt', label: 'GPT 原理', icon: '📝' },
      { id: 'prompt', label: 'Prompt 工程', icon: '📝', badge: '新' }
    ]}
  ]},
  { id: 'work', label: '工作笔记', icon: '📖' },
  { id: 'life', label: '个人日记', icon: '❤️' }
];

const FINDER_DATA = [
  { id: 'desk', label: '桌面', icon: SVG.folderOpen, open: true, children: [
    { id: 'p1', label: '项目', icon: SVG.folder },
    { id: 'p2', label: '截图', icon: SVG.folder, badge: '23' }
  ]},
  { id: 'doc', label: '文稿', icon: SVG.folder },
  { id: 'dl', label: '下载', icon: SVG.folder, meta: '128 项' }
];

// === 渲染各形态 ===

// 01 基础树
document.getElementById('s-basic').innerHTML = renderListItem(
  { id: 'root', label: '组织架构', icon: '🏢', open: true, children: ORG_DATA }, 'basic');

// 02 复选框树（扩展 beforeIcon）
document.getElementById('s-checkbox').innerHTML = renderListItem(
  { id: 'root', label: '权限分配', open: true, children: PERM_DATA }, 'basic',
  { beforeIcon: '<div class="tree-checkbox is-checked"></div>' });

// 03 懒加载树
document.getElementById('s-lazy').innerHTML = renderListItem(
  { id: 'root', label: '服务器目录', icon: '💽', open: true, children: [
    { id: 'logs', label: 'logs', icon: '📁', meta: '懒加载' },
    { id: 'uploads', label: 'uploads', icon: '📁', meta: '懒加载', open: true, children: [
      { id: 'u1', label: '2025-01', icon: '📁' },
      { id: 'u2', label: '2025-02', icon: '📁' }
    ]},
    { id: 'cache', label: 'cache', icon: '📁', meta: '懒加载' }
  ]}, 'basic');

// 04 拖拽树（beforeIcon 用 handle）
document.getElementById('s-drag').innerHTML = renderListItem(
  { id: 'root', label: '拖拽排序', icon: '📁', open: true, children: [
    { id: 'a', label: '优先级 P0', icon: '🔴', meta: '紧急', open: true, children: [
      { id: 'a1', label: '登录页重构', icon: '📌' },
      { id: 'a2', label: '支付链路优化', icon: '📌' }
    ]},
    { id: 'b', label: '优先级 P1', icon: '🟡', meta: '重要', open: true, children: [
      { id: 'b1', label: '会员等级体系', icon: '📌' },
      { id: 'b2', label: '消息推送', icon: '📌' }
    ]},
    { id: 'c', label: '优先级 P2', icon: '🟢', open: true, children: [
      { id: 'c1', label: 'UI 微调', icon: '📌' }
    ]}
  ]}, 'basic',
  { beforeIcon: '<div class="tree-handle">⋮⋮</div>' });

// 05 树 + 右键菜单联动
document.getElementById('s-context').innerHTML = renderListItem(
  { id: 'root', label: '文件树', icon: SVG.folderOpen, open: true, children: FILE_DATA[0].children[0].children ? FILE_DATA : FILE_DATA }, 'basic');

// 06 搜索树（高亮）
let searchKw = '';
function renderSearch() {
  const data = clone(DOC_TREE);
  function applyHighlight(nodes, kw) {
    nodes.forEach(n => {
      if (kw && n.label.toLowerCase().includes(kw.toLowerCase())) n._highlight = kw;
      if (n.children) applyHighlight(n.children, kw);
    });
  }
  applyHighlight(data, searchKw);
  document.getElementById('s-search').innerHTML = renderListItem(
    { id: 'root', label: '我的文档', icon: '📚', open: true, children: data }, 'basic');
}
renderSearch();
document.getElementById('search-input').addEventListener('input', e => {
  searchKw = e.target.value.trim();
  renderSearch();
});

// 07 可编辑树
function renderEdit() {
  document.getElementById('s-edit').innerHTML = renderListItem(
    { id: 'root', label: '组织架构（单击编辑）', icon: '🏢', open: true, children: EDIT_DATA }, 'basic');
}
renderEdit();

// 08 节点图标树（每级不同图标）
document.getElementById('s-icon').innerHTML = renderListItem(
  { id: 'root', label: '知识体系', icon: '🌐', open: true, children: DOC_TREE }, 'basic');

// 09 finder
document.getElementById('s-finder').innerHTML = renderListItem(
  { id: 'root', label: '位置', icon: '📍', open: true, children: FINDER_DATA }, 'finder');

// 10 vscode
document.getElementById('s-vscode').innerHTML = renderListItem(
  { id: 'root', label: '资源管理器', icon: SVG.folderOpen, open: true, children: FILE_DATA }, 'vscode');

// === 全局事件 ===

const log = document.getElementById('log');

// 单击编辑
document.addEventListener('click', e => {
  const exp = e.target.closest('.list-item__expander');
  if (exp && !exp.classList.contains('is-leaf')) {
    e.stopPropagation();
    const item = exp.closest('.list-item');
    const children = item.nextElementSibling;
    if (children && children.classList.contains('list-children')) {
      children.classList.toggle('is-collapsed');
      exp.classList.toggle('is-open');
    }
    return;
  }

  // 编辑态输入框失焦
  const input = e.target.closest('.tree-edit-input');
  if (input) {
    const id = input.dataset.id;
    const newLabel = input.value.trim();
    function findAndUpdate(nodes) {
      for (const n of nodes) {
        if (n.id === id) { n.label = newLabel || n.label; return true; }
        if (n.children && findAndUpdate(n.children)) return true;
      }
      return false;
    }
    findAndUpdate(EDIT_DATA);
    renderEdit();
    log.textContent = '✓ edit: ' + id + ' → ' + newLabel;
    return;
  }

  const cb = e.target.closest('.tree-checkbox');
  if (cb) {
    cb.classList.toggle('is-checked');
    log.textContent = '✓ check: ' + (cb.classList.contains('is-checked') ? '勾选' : '取消');
    return;
  }

  const handle = e.target.closest('.tree-handle');
  if (handle) {
    log.textContent = '⋮⋮ drag start';
    return;
  }

  const node = e.target.closest('.list-item');
  if (!node || node.classList.contains('is-disabled')) return;
  const root = node.parentElement.closest('.section__body, .list--vscode-wrap') || node.parentElement;
  root.querySelectorAll('.list-item.is-active').forEach(n => n.classList.remove('is-active'));
  node.classList.add('is-active');
  const label = node.querySelector('.list-item__label')?.textContent || '(编辑中)';
  log.textContent = '✓ select: ' + label;
});

// 右键菜单（仅在 s-context 容器内）
const CTX_SVG = {
  add: SVG.folderOpen,
  rename: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="1"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14l-2-7V4H7v6l-2 7z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>'
};

// 关键：右键事件序列是 mousedown → contextmenu → mouseup → click，
// 全局 click 监听器会立刻关掉刚弹出的菜单，所以记录打开时间，200ms 内的 click 跳过。
let ctxOpenedAt = 0;

document.getElementById('s-context').addEventListener('contextmenu', e => {
  e.preventDefault();
  const node = e.target.closest('.list-item');
  if (!node) return;
  const label = node.querySelector('.list-item__label')?.textContent || '';

  // 移除旧菜单
  const old = document.getElementById('ctx-menu');
  if (old) old.remove();

  const menu = document.createElement('div');
  menu.id = 'ctx-menu';
  menu.className = 'context-menu-popup';
  menu.style.cssText = 'position:fixed;left:' + e.clientX + 'px;top:' + e.clientY + 'px;';
  menu.innerHTML = [
    { icon: CTX_SVG.add, label: '新增子节点' },
    { icon: CTX_SVG.rename, label: '重命名' },
    { icon: CTX_SVG.copy, label: '复制节点' },
    { divider: true },
    { icon: CTX_SVG.pin, label: '置顶' },
    { icon: CTX_SVG.trash, label: '删除', danger: true }
  ].map(item => {
    if (item.divider) return '<div class="popup-divider"></div>';
    return `<div class="popup-item ${item.danger ? 'is-danger' : ''}">
      <span class="popup-icon">${item.icon}</span><span class="popup-label">${item.label}</span>
    </div>`;
  }).join('');
  document.body.appendChild(menu);

  // 边缘检测
  const vw = window.innerWidth, vh = window.innerHeight;
  const rect = menu.getBoundingClientRect();
  if (rect.right > vw) menu.style.left = (vw - rect.width - 8) + 'px';
  if (rect.bottom > vh) menu.style.top = (vh - rect.height - 8) + 'px';

  menu.addEventListener('click', ev => {
    const it = ev.target.closest('.popup-item');
    if (!it) return;
    const cmd = it.querySelector('.popup-label').textContent;
    log.textContent = '✦ ctx: ' + label + ' → ' + cmd;
    menu.remove();
  });

  ctxOpenedAt = Date.now();
  log.textContent = '✦ ctx-menu opened at: ' + label;
});

// 关闭菜单（跳过刚弹出后的 200ms click 风暴）
document.addEventListener('click', e => {
  if (Date.now() - ctxOpenedAt < 200) return;
  const menu = document.getElementById('ctx-menu');
  if (menu && !menu.contains(e.target) && !e.target.closest('#s-context')) {
    menu.remove();
  }
});
</script>
<style>
.context-menu-popup {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  padding: 4px 0;
  min-width: 160px;
  z-index: 9999;
}
.popup-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 4px 0;
}
.popup-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 13px;
  color: #1f2937;
}
.popup-item:hover { background: #f3f4f6; }
.popup-item.is-danger { color: #ef4444; }
.popup-item.is-danger:hover { background: #fef2f2; }
.popup-icon { width: 16px; text-align: center; display: inline-flex; align-items: center; justify-content: center; }
.popup-icon svg { width: 14px; height: 14px; color: #6b7280; }
.popup-item:hover .popup-icon svg { color: #4f46e5; }
.popup-item.is-danger .popup-icon svg { color: #ef4444; }
.popup-label { flex: 1; }
</style>