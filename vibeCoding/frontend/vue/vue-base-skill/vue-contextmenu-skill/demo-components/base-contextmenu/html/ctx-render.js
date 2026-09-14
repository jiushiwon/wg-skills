// === 右键菜单渲染器（vanilla 模拟 base-contextmenu 渲染逻辑）===

// === SVG 图标库（24x24 stroke-based，继承 currentColor） ===
const I = {
  view: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="1"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
  paste: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>',
  cut: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>',
  selectall: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><polyline points="9 12 11 14 15 10" stroke-width="2.4"/></svg>',
  format: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="1.5"/><circle cx="17.5" cy="10.5" r="1.5"/><circle cx="8.5" cy="7.5" r="1.5"/><circle cx="6.5" cy="12.5" r="1.5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.43-.668-.43-1.062 0-.94.746-1.688 1.688-1.688h1.999c3.078 0 5.532-2.453 5.532-5.531C23 5.094 17.5 2 12 2z"/></svg>',
  folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/></svg>',
  folderOpen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v1H3V7z"/><path d="M3 9h18l-2 8a2 2 0 0 1-2 1.5H5a2 2 0 0 1-2-2V9z"/></svg>',
  file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6z"/><path d="M14 3v6h6"/></svg>',
  md: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#2196f3"/><text x="12" y="17" font-family="Arial,sans-serif" font-weight="700" font-size="11" fill="#fff" text-anchor="middle">M</text></svg>',
  json: '<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="3" fill="#fbc02d"/><text x="12" y="17" font-family="Arial,sans-serif" font-weight="700" font-size="11" fill="#fff" text-anchor="middle">{}</text></svg>',
  zip: '<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="3" fill="#9e9e9e"/><path d="M8 4h4l4 4v12H8z" fill="#616161"/><text x="14" y="19" font-family="Arial,sans-serif" font-weight="700" font-size="10" fill="#fff" text-anchor="middle">ZIP</text></svg>',
  share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>',
  undo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>',
  redo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/></svg>',
  find: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
  export: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
  import: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  pack: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
  add: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  me: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/></svg>',
  team: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20v-1a6 6 0 0 1 12 0v1"/><path d="M16 20v-1a4 4 0 0 1 7 1v0"/></svg>',
  sort: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="7 4 7 20"/><polyline points="3 8 7 4 11 8"/><polyline points="17 20 17 4"/><polyline points="13 16 17 20 21 16"/></svg>',
  letterA: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 3 21 20 17 20 14.5 15 9.5 15 7 20 3 20" transform="translate(0,-2)"/><line x1="10" y1="11" x2="14" y2="11"/></svg>',
  letterB: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h7a4 4 0 0 1 0 8H5z"/><path d="M5 12h8a4 4 0 0 1 0 8H5z"/></svg>',
  letterC: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0v8a6 6 0 0 0 12 0"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  img: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
  web: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  pc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="13" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
  music: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  wallet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12V8H6a2 2 0 0 1 0-4h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></svg>',
  cancel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
};

// 通用：基于 list-item 渲染一个菜单（每项 = list-item + 嵌套处理）
function renderMenu(options, variant = 'basic') {
  let html = '';
  options.forEach((opt, idx) => {
    if (opt.divider) {
      html += '<div class="base-contextmenu__divider"></div>';
      return;
    }
    const cls = ['list-item', `list-item--${variant}`];
    if (opt.disabled) cls.push('is-disabled');
    if (opt.danger) cls.push('is-danger');
    if (opt._active) cls.push('is-active');

    const hasSub = opt.children && opt.children.length > 0;
    const iconHtml = opt.icon ? `<div class="list-item__icon">${opt.icon}</div>` : '';
    const shortcutHtml = opt.shortcut ? `<div class="list-item__shortcut">${opt.shortcut}</div>` : '';
    const arrowHtml = hasSub ? `<div class="list-item__meta" style="color: #9ca3af;">▸</div>` : '';

    if (hasSub) {
      html += `<div class="base-contextmenu__submenu" data-id="${opt.id}">
        <div class="${cls.join(' ')}" data-cmd="${opt.command || opt.id || ''}" data-danger="${!!opt.danger}">
          <div class="list-item__expander is-leaf"></div>
          ${iconHtml}
          <div class="list-item__label">${opt.label}</div>
          ${shortcutHtml}
          ${arrowHtml}
        </div>
      </div>`;
    } else {
      html += `<div class="${cls.join(' ')}" data-cmd="${opt.command || opt.id || ''}" data-danger="${!!opt.danger}">
        <div class="list-item__expander is-leaf"></div>
        ${iconHtml}
        <div class="list-item__label">${opt.label}</div>
        ${shortcutHtml}
        ${arrowHtml}
      </div>`;
    }
  });
  return html;
}

// 创建弹层（Teleport 到 body 模拟）
function showMenu(x, y, options, variant = 'basic') {
  // 关闭已有的
  const existing = document.querySelectorAll('.base-contextmenu');
  existing.forEach(m => m.remove());

  const menu = document.createElement('div');
  menu.className = 'base-contextmenu ctx-fade-enter-active';
  menu.style.left = x + 'px';
  menu.style.top = y + 'px';
  menu.innerHTML = renderMenu(options, variant);

  document.body.appendChild(menu);

  // 边缘检测（基于实际渲染高度）
  const vw = window.innerWidth, vh = window.innerHeight;
  const rect = menu.getBoundingClientRect();
  if (rect.right > vw) menu.style.left = (vw - rect.width - 8) + 'px';
  if (rect.bottom > vh) menu.style.top = (vh - rect.height - 8) + 'px';

  // 子菜单 hover
  menu.querySelectorAll('.base-contextmenu__submenu').forEach(sub => {
    const parentItem = sub.querySelector('.list-item');
    let subEl = null;
    sub.addEventListener('mouseenter', e => {
      if (subEl) return;
      const r = parentItem.getBoundingClientRect();
      subEl = document.createElement('div');
      subEl.className = 'base-contextmenu base-contextmenu--nested ctx-fade-enter-active';
      subEl.style.left = (r.right + 4) + 'px';
      subEl.style.top = r.top + 'px';
      const opt = options.find(o => o.id === sub.dataset.id);
      subEl.innerHTML = renderMenu(opt.children || [], variant);
      document.body.appendChild(subEl);
      // 子菜单边缘检测
      const sr = subEl.getBoundingClientRect();
      if (sr.right > vw) subEl.style.left = (r.left - subEl.offsetWidth - 4) + 'px';
      if (sr.bottom > vh) subEl.style.top = (vh - subEl.offsetHeight - 8) + 'px';
      bindMenuEvents(subEl, variant);
    });
    sub.addEventListener('mouseleave', () => {
      if (subEl) {
        subEl.remove();
        subEl = null;
      }
    });
  });

  bindMenuEvents(menu, variant);
  return menu;
}

// 关键：右键事件序列是 mousedown → contextmenu → mouseup → click，
// 全局 click 监听器会立刻关掉刚弹出的菜单，所以记录打开时间，200ms 内的 click 跳过。
let ctxOpenedAt = 0;

function bindMenuEvents(menu, variant) {
  menu.querySelectorAll('.list-item:not(.is-disabled)').forEach(item => {
    item.addEventListener('click', e => {
      e.stopPropagation();
      const cmd = item.dataset.cmd;
      const danger = item.dataset.danger === 'true';
      const label = item.querySelector('.list-item__label')?.textContent || '';
      log.textContent = (danger ? '⚠ ' : '✓ ') + label + ' → cmd: ' + cmd;
      // 关闭所有弹层
      document.querySelectorAll('.base-contextmenu').forEach(m => m.remove());
    });
  });
}

const log = document.getElementById('log');

function openAt(host, options, variant) {
  host.addEventListener('contextmenu', e => {
    e.preventDefault();
    ctxOpenedAt = Date.now();
    showMenu(e.clientX, e.clientY, options, variant);
  });
}

// === 1. 基础菜单 ===
openAt(document.getElementById('s-basic'), [
  { id: 'view', label: '查看', icon: I.view },
  { id: 'edit', label: '编辑', icon: I.edit },
  { divider: true },
  { id: 'copy', label: '复制', icon: I.copy, shortcut: 'Ctrl+C' },
  { id: 'paste', label: '粘贴', icon: I.paste, shortcut: 'Ctrl+V' },
  { divider: true },
  { id: 'del', label: '删除', icon: I.trash, danger: true }
]);

// === 2. 嵌套菜单 ===
openAt(document.getElementById('s-nested'), [
  {
    id: 'edit', label: '编辑', icon: I.edit, children: [
      { id: 'undo', label: '撤销', icon: I.undo, shortcut: 'Ctrl+Z' },
      { id: 'redo', label: '重做', icon: I.redo, shortcut: 'Ctrl+Y' },
      { divider: true },
      { id: 'find', label: '查找替换', icon: I.find, shortcut: 'Ctrl+H' }
    ]
  },
  {
    id: 'view', label: '视图', icon: I.view, children: [
      { id: 'large', label: '大图标' },
      { id: 'medium', label: '中等图标' },
      { id: 'small', label: '小图标' }
    ]
  },
  { divider: true },
  { id: 'refresh', label: '刷新', icon: I.refresh }
]);

// === 3. 编辑器式 ===
openAt(document.getElementById('s-editor'), [
  { id: 'cut', label: '剪切', icon: I.cut, shortcut: 'Ctrl+X' },
  { id: 'copy', label: '复制', icon: I.copy, shortcut: 'Ctrl+C' },
  { id: 'paste', label: '粘贴', icon: I.paste, shortcut: 'Ctrl+V' },
  { divider: true },
  { id: 'selectall', label: '全选', icon: I.selectall, shortcut: 'Ctrl+A' },
  { divider: true },
  { id: 'format', label: '格式化', icon: I.format, shortcut: 'Shift+Alt+F' }
]);

// === 4. 危险项 ===
openAt(document.getElementById('s-danger'), [
  { id: 'open', label: '打开', icon: I.folderOpen },
  { id: 'rename', label: '重命名', icon: I.edit },
  { id: 'move', label: '移动到...', icon: I.pack },
  { id: 'copy', label: '复制', icon: I.copy },
  { divider: true },
  { id: 'share', label: '分享', icon: I.share },
  { id: 'prop', label: '属性', icon: I.info },
  { divider: true },
  { id: 'del', label: '删除', icon: I.trash, shortcut: 'Del', danger: true }
]);

// === 5. 动态条件 ===
let isAdmin = true;
function dynamicOptions() {
  const opts = [
    { id: 'view', label: '查看', icon: I.view },
    { id: 'edit', label: '编辑', icon: I.edit, show: isAdmin },
    { id: 'export', label: '导出', icon: I.export, show: isAdmin },
    { divider: true },
    { id: 'log', label: '审计日志', icon: I.file, show: isAdmin },
    { id: 'del', label: '删除', icon: I.trash, danger: true, show: isAdmin }
  ];
  return opts.filter(o => o.show !== false);
}
openAt(document.getElementById('s-dynamic'), dynamicOptions());
document.getElementById('role-toggle').addEventListener('click', () => {
  isAdmin = !isAdmin;
  document.getElementById('role-tag').textContent = '当前角色：' + (isAdmin ? '管理员' : '访客');
  document.getElementById('role-toggle').textContent = isAdmin ? '切换为访客' : '切换为管理员';
});

// === 6. 左键触发 ===
document.getElementById('s-click').addEventListener('click', e => {
  ctxOpenedAt = Date.now();
  showMenu(e.clientX, e.clientY, [
    { id: 'a', label: '选项 A', icon: I.letterA },
    { id: 'b', label: '选项 B', icon: I.letterB },
    { id: 'c', label: '选项 C', icon: I.letterC },
    { divider: true },
    { id: 'cancel', label: '取消', icon: I.cancel }
  ]);
});
document.getElementById('s-click').addEventListener('contextmenu', e => {
  e.preventDefault();
  ctxOpenedAt = Date.now();
  showMenu(e.clientX, e.clientY, [
    { id: 'ctx', label: '右键专用：刷新', icon: I.refresh }
  ]);
});

// === 7. 键盘导航 + 边缘检测 ===
document.getElementById('s-keyboard').addEventListener('contextmenu', e => {
  e.preventDefault();
  ctxOpenedAt = Date.now();
  const menu = showMenu(e.clientX, e.clientY, [
    { id: 'new', label: '新建任务', icon: I.add },
    { id: 'mine', label: '只看我负责', icon: I.me },
    { id: 'all', label: '查看全部', icon: I.team },
    { divider: true },
    { id: 'sort', label: '排序方式', icon: I.sort, children: [
      { id: 'time', label: '按时间' },
      { id: 'priority', label: '按优先级' },
      { id: 'name', label: '按名称' }
    ]},
    { divider: true },
    { id: 'export', label: '导出', icon: I.export }
  ]);
  // 简单键盘导航
  const items = Array.from(menu.querySelectorAll('.list-item:not(.is-disabled):not(.list-item__expander.is-leaf)')).filter(it => !it.closest('.base-contextmenu--nested'));
  let idx = -1;
  function focus(i) {
    items.forEach(it => it.classList.remove('is-active'));
    idx = (i + items.length) % items.length;
    items[idx]?.classList.add('is-active');
    items[idx]?.scrollIntoView({ block: 'nearest' });
  }
  function onKey(e) {
    if (!document.body.contains(menu)) { document.removeEventListener('keydown', onKey); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); focus(idx + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); focus(idx - 1); }
    else if (e.key === 'Enter' && idx >= 0) { items[idx].click(); }
    else if (e.key === 'Escape') { menu.remove(); document.removeEventListener('keydown', onKey); }
  }
  document.addEventListener('keydown', onKey);
});

// === 8. variant 风格 ===
document.querySelectorAll('[data-variant]').forEach(host => {
  const variant = host.dataset.variant;
  const opts = [
    { id: 'v1', label: '查看', icon: I.view },
    { id: 'v2', label: '编辑', icon: I.edit },
    { id: 'v3', label: '复制', icon: I.copy, shortcut: 'Ctrl+C' },
    { divider: true },
    { id: 'v4', label: '删除', icon: I.trash, danger: true }
  ];
  host.addEventListener('contextmenu', e => {
    e.preventDefault();
    ctxOpenedAt = Date.now();
    showMenu(e.clientX, e.clientY, opts, variant);
  });
});

// === 联动 01 · 树节点右键菜单 ===
const TREE_FOR_CTX = [
  { id: 'root', label: '项目', icon: I.folderOpen, open: true, children: [
    { id: 'fe', label: '前端', icon: I.folderOpen, open: true, children: [
      { id: 'login', label: '登录页', icon: I.file },
      { id: 'home', label: '首页', icon: I.file }
    ]},
    { id: 'be', label: '后端', icon: I.folder, children: [
      { id: 'api', label: 'API 服务', icon: I.file }
    ]}
  ]}
];

function renderTreeForCtx(data, variant = 'basic') {
  let html = '';
  data.forEach(item => {
    const hasChildren = item.children && item.children.length > 0;
    const cls = ['list-item', `list-item--${variant}`];
    const expanderCls = ['list-item__expander'];
    if (!hasChildren) expanderCls.push('is-leaf');
    if (item.open) expanderCls.push('is-open');
    const expanderIcon = item.open ? '▾' : '▸';
    html += `<div class="${cls.join(' ')}" data-id="${item.id}" data-tree="1">
      <div class="${expanderCls.join(' ')}">${hasChildren ? expanderIcon : ''}</div>
      <div class="list-item__icon">${item.icon}</div>
      <div class="list-item__label">${item.label}</div>
    </div>`;
    if (hasChildren) {
      const childCls = ['list-children'];
      if (!item.open) childCls.push('is-collapsed');
      html += `<div class="${childCls.join(' ')}">`;
      html += renderTreeForCtx(item.children, variant);
      html += '</div>';
    }
  });
  return html;
}

document.getElementById('s-tree').innerHTML = renderTreeForCtx(TREE_FOR_CTX);
document.getElementById('s-tree').addEventListener('click', e => {
  const exp = e.target.closest('.list-item__expander');
  if (exp && !exp.classList.contains('is-leaf')) {
    e.stopPropagation();
    const item = exp.closest('.list-item');
    const children = item.nextElementSibling;
    if (children && children.classList.contains('list-children')) {
      children.classList.toggle('is-collapsed');
      exp.classList.toggle('is-open');
    }
  }
});
document.getElementById('s-tree').addEventListener('contextmenu', e => {
  const node = e.target.closest('[data-tree="1"]');
  if (!node) return;
  e.preventDefault();
  const label = node.querySelector('.list-item__label').textContent;
  ctxOpenedAt = Date.now();
  showMenu(e.clientX, e.clientY, [
    { id: 'add', label: '新增子节点', icon: I.add },
    { id: 'rename', label: '重命名', icon: I.edit },
    { id: 'copy', label: '复制节点', icon: I.copy },
    { divider: true },
    { id: 'paste', label: '粘贴到此处', icon: I.paste, disabled: true },
    { divider: true },
    { id: 'del', label: '删除节点', icon: I.trash, danger: true }
  ]);
  log.textContent = '✦ tree node right-click: ' + label;
});

// === 联动 02 · 表格行右键 ===
const TABLE_ROWS = [
  { id: 'r1', no: '#1001', customer: '考拉', amount: '¥ 1,280', status: '已支付' },
  { id: 'r2', no: '#1002', customer: '周八', amount: '¥ 520', status: '待发货' },
  { id: 'r3', no: '#1003', customer: '麦麦', amount: '¥ 3,400', status: '已完成' },
  { id: 'r4', no: '#1004', customer: '杰西', amount: '¥ 88', status: '已取消' }
];
document.getElementById('s-table').innerHTML = TABLE_ROWS.map(r =>
  `<div class="ctx-row" data-row="${r.id}">
    <span><strong>${r.no}</strong> · ${r.customer}</span>
    <span style="color: var(--color-text-muted);">${r.amount} · ${r.status}</span>
  </div>`
).join('');
document.getElementById('s-table').addEventListener('contextmenu', e => {
  const row = e.target.closest('[data-row]');
  if (!row) return;
  e.preventDefault();
  const id = row.dataset.row;
  const orderId = id.toUpperCase();
  ctxOpenedAt = Date.now();
  showMenu(e.clientX, e.clientY, [
    { id: 'view', label: '查看详情', icon: I.view },
    { id: 'edit', label: '编辑订单', icon: I.edit },
    { id: 'refund', label: '申请退款', icon: I.wallet },
    { divider: true },
    { id: 'copy', label: '复制订单号', icon: I.copy, shortcut: orderId },
    { id: 'export', label: '导出 PDF', icon: I.export },
    { divider: true },
    { id: 'cancel', label: '取消订单', icon: I.cancel, danger: true }
  ]);
});

// === 联动 03 · 桌面图标右键 ===
const DESKTOP_ICONS = [
  { name: '回收站', icon: I.trash },
  { name: '项目', icon: I.folder },
  { name: '截图', icon: I.img },
  { name: '笔记', icon: I.md },
  { name: '浏览器', icon: I.web },
  { name: '终端', icon: I.pc },
  { name: '音乐', icon: I.music },
  { name: '下载', icon: I.download }
];
document.getElementById('s-desktop').innerHTML = DESKTOP_ICONS.map((it, i) =>
  `<div class="ctx-icon" data-icon="${i}">
    <div class="ctx-icon__img">${it.icon}</div>
    <div>${it.name}</div>
  </div>`
).join('');
document.getElementById('s-desktop').addEventListener('contextmenu', e => {
  const ic = e.target.closest('[data-icon]');
  if (!ic) return;
  e.preventDefault();
  const name = DESKTOP_ICONS[ic.dataset.icon].name;
  ctxOpenedAt = Date.now();
  showMenu(e.clientX, e.clientY, [
    { id: 'open', label: '打开', icon: I.folderOpen },
    { id: 'openwith', label: '打开方式', icon: I.settings, children: [
      { id: 'vscode', label: 'VS Code' },
      { id: 'sublime', label: 'Sublime Text' },
      { id: 'notepad', label: '记事本' }
    ]},
    { divider: true },
    { id: 'move', label: '移到废纸篓', icon: I.trash },
    { id: 'rename', label: '重命名', icon: I.edit },
    { divider: true },
    { id: 'info', label: '显示简介', icon: I.info }
  ]);
  log.textContent = '✦ desktop icon right-click: ' + name;
});

// === 联动 04 · 文件浏览器右键（按类型动态菜单）===
const FILES = [
  { id: 'f1', name: '项目文档.md', type: 'file', icon: I.md },
  { id: 'f2', name: '设计图', type: 'dir', icon: I.folder },
  { id: 'f3', name: '源码.zip', type: 'file', icon: I.zip },
  { id: 'f4', name: 'README.md', type: 'file', icon: I.md }
];
document.getElementById('s-files').innerHTML = FILES.map(f =>
  `<div class="ctx-row" data-file="${f.id}" data-type="${f.type}">
    <span class="ctx-row__icon">${f.icon}</span>
    <span>${f.name}</span>
    <span style="color: var(--color-text-muted); font-size: 11px;">${f.type === 'dir' ? '文件夹' : '文件'}</span>
  </div>`
).join('');
document.getElementById('s-files').addEventListener('contextmenu', e => {
  const row = e.target.closest('[data-file]');
  if (!row) return;
  e.preventDefault();
  const isDir = row.dataset.type === 'dir';
  ctxOpenedAt = Date.now();
  if (isDir) {
    showMenu(e.clientX, e.clientY, [
      { id: 'open', label: '打开', icon: I.folderOpen },
      { id: 'new', label: '在此新建', icon: I.add, children: [
        { id: 'newfile', label: '新建文件' },
        { id: 'newdir', label: '新建文件夹' }
      ]},
      { divider: true },
      { id: 'rename', label: '重命名', icon: I.edit },
      { id: 'move', label: '移动', icon: I.pack },
      { id: 'copy', label: '复制', icon: I.copy },
      { divider: true },
      { id: 'del', label: '删除', icon: I.trash, danger: true }
    ]);
  } else {
    showMenu(e.clientX, e.clientY, [
      { id: 'open', label: '打开', icon: I.file },
      { id: 'preview', label: '预览', icon: I.view },
      { divider: true },
      { id: 'edit', label: '编辑', icon: I.edit },
      { id: 'rename', label: '重命名', icon: I.edit },
      { id: 'copy', label: '复制', icon: I.copy },
      { id: 'move', label: '移动', icon: I.pack },
      { divider: true },
      { id: 'zip', label: '压缩', icon: I.zip },
      { id: 'del', label: '删除', icon: I.trash, danger: true }
    ]);
  }
});

// 全局点击关闭弹层（200ms 缓冲避免与右键 click 风暴冲突）
document.addEventListener('click', e => {
  if (Date.now() - ctxOpenedAt < 200) return;
  if (e.target.closest('.base-contextmenu')) return;
  document.querySelectorAll('.base-contextmenu').forEach(m => {
    if (!m.classList.contains('base-contextmenu--nested')) m.remove();
  });
});

// Esc 关闭
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.base-contextmenu').forEach(m => m.remove());
  }
});