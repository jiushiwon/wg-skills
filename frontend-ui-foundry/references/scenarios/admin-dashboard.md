# 场景：管理端中后台（Admin Dashboard）

SaaS 后台、企业内部系统、运维面板。**效率优先于视觉冲击**。

---

## 适用

- SaaS 控制台
- 企业 ERP / CRM
- 数据监控/运维面板
- CMS 后台
- 协同工具
- 业务工作台

## 不适用

- 营销/品牌页（用 `pc-corporate` 或 `landing-marketing`）
- 移动优先工具（用 `mobile-responsive`）
- 客户面向 App（用 `mobile-native`）

---

## 核心组件

| 组件 | 说明 |
|------|------|
| **Sidebar** | 左侧主导航，可折叠/展开，240px 展开/64px 收起 |
| **Top Bar** | 顶部操作区：面包屑 + 全局搜索 + 通知 + 用户菜单 |
| **Breadcrumb** | 多级路径 |
| **Data Table** | 数据表格，排序/筛选/分页/列控制 |
| **Filter Panel** | 筛选器侧栏或顶部 |
| **KPI Card** | 关键指标卡片（避免 hero-metric） |
| **Chart Container** | 折线、柱状、饼图、热力图 |
| **Form Sections** | 分组表单、字段标签、错误提示 |
| **Tabs** | 横向/纵向 tab |
| **Drawer** | 右侧详情抽屉 |
| **Modal** | 居中模态（确认、表单、详情） |
| **Toast** | 顶部/右下角通知 |
| **Empty State** | 空状态插画 + CTA |
| **Skeleton** | 表格/卡片骨架屏 |

---

## 布局基线

### 经典三栏布局

```css
.dashboard-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;
}

.dashboard-layout.with-right-panel {
  grid-template-columns: 240px 1fr 320px;
}

.dashboard-main {
  display: flex;
  flex-direction: column;
  min-width: 0;  /* 防止 grid 子项溢出 */
}

.dashboard-content {
  flex: 1;
  padding: var(--space-6);
  overflow-y: auto;
}
```

### 响应式断点

```css
/* 平板：折叠侧栏 */
@media (max-width: 1023px) {
  .dashboard-layout {
    grid-template-columns: 1fr;
  }
  .sidebar {
    position: fixed;
    z-index: var(--z-fixed);
    transform: translateX(-100%);
    transition: transform 300ms var(--ease-out-quart);
  }
  .sidebar.is-open {
    transform: translateX(0);
  }
}

/* 移动端：底部导航 + 单列 */
@media (max-width: 767px) {
  .dashboard-content {
    padding: var(--space-4);
  }
  .data-table {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}
```

---

## 侧边栏

```html
<aside class="sidebar">
  <div class="sidebar-header">
    <Logo />
    <button class="sidebar-toggle" aria-label="折叠侧栏">≡</button>
  </div>
  <nav class="sidebar-nav">
    <div class="nav-section">
      <h3 class="nav-section-title">主菜单</h3>
      <a class="nav-item active">
        <Icon class="nav-icon" />
        <span class="nav-label">仪表盘</span>
      </a>
      <a class="nav-item">
        <Icon class="nav-icon" />
        <span class="nav-label">用户管理</span>
        <span class="nav-badge">12</span>
      </a>
    </div>
    <div class="nav-section">
      <h3 class="nav-section-title">设置</h3>
      <a class="nav-item">...</a>
    </div>
  </nav>
  <div class="sidebar-footer">
    <a class="nav-item">帮助</a>
  </div>
</aside>
```

```css
.sidebar {
  background: var(--color-surface-elevated);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: sticky;
  top: 0;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  color: var(--color-on-surface-muted);
  transition: background-color 150ms var(--ease-out-quart),
              color 150ms var(--ease-out-quart);
  min-height: 36px;  /* 紧凑，但 ≥32 */
}

.nav-item:hover {
  background: var(--color-surface-tinted);
  color: var(--color-on-surface);
}

.nav-item.active {
  background: var(--color-primary);
  color: var(--color-primary-foreground);
  font-weight: var(--font-weight-medium);
}

.nav-item.active .nav-icon {
  color: var(--color-primary-foreground);
}

.nav-section-title {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-on-surface-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: var(--space-4) var(--space-3) var(--space-2);
}
```

---

## 顶部栏

```html
<header class="topbar">
  <div class="topbar-left">
    <button class="mobile-menu-toggle" aria-label="菜单">≡</button>
    <Breadcrumb />
  </div>
  <div class="topbar-center">
    <SearchInput placeholder="搜索..." />
  </div>
  <div class="topbar-right">
    <button class="icon-button" aria-label="通知">🔔</button>
    <button class="icon-button" aria-label="帮助">?</button>
    <UserMenu />
  </div>
</header>
```

```css
.topbar {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  height: 56px;
  background: var(--color-surface-elevated);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  padding: 0 var(--space-6);
  gap: var(--space-4);
}
```

---

## 数据表格

### 基础表格

```html
<div class="data-table-wrapper">
  <div class="data-table-toolbar">
    <div class="toolbar-left">
      <SearchInput />
      <FilterDropdown />
    </div>
    <div class="toolbar-right">
      <button class="btn-secondary">导出</button>
      <button class="btn-primary">新建</button>
    </div>
  </div>

  <table class="data-table">
    <thead>
      <tr>
        <th class="checkbox-cell"><input type="checkbox" /></th>
        <th class="sortable">名称</th>
        <th>状态</th>
        <th class="sortable">创建时间</th>
        <th>操作</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><input type="checkbox" /></td>
        <td>用户 1</td>
        <td><span class="badge badge-success">活跃</span></td>
        <td>2024-01-15</td>
        <td>
          <button>编辑</button>
          <button>删除</button>
        </td>
      </tr>
    </tbody>
  </table>

  <div class="data-table-pagination">
    <Pagination />
  </div>
</div>
```

```css
.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: var(--font-size-sm);
}

.data-table th {
  text-align: left;
  font-weight: var(--font-weight-semibold);
  color: var(--color-on-surface-muted);
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface-tinted);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 1;
}

.data-table th.sortable {
  cursor: pointer;
  user-select: none;
}

.data-table td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.data-table tbody tr {
  transition: background-color 100ms var(--ease-out-quart);
}

.data-table tbody tr:hover {
  background: var(--color-surface-tinted);
}

.data-table tbody tr.selected {
  background: oklch(from var(--color-primary) l c h / 0.08);
}

/* 数字列右对齐，等宽数字 */
.data-table .numeric {
  text-align: right;
  font-variant-numeric: tabular-nums;
}
```

### 表格响应式

```html
<!-- 移动端：横向滚动 + 关键列优先 -->
<div class="data-table-scroll">
  <table class="data-table">...</table>
</div>
```

```css
.data-table-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

@media (max-width: 767px) {
  .data-table .hide-mobile { display: none; }
  .data-table th, .data-table td {
    padding: var(--space-2) var(--space-3);
    font-size: var(--font-size-xs);
  }
}
```

---

## KPI 卡片（避免 hero-metric）

```html
<!-- ❌ 经典 hero-metric -->
<div class="kpi">
  <div class="kpi-number">$2.4M</div>
  <div class="kpi-label">Revenue</div>
  <div class="kpi-trend">+12%</div>
  <div class="kpi-gradient"></div>
</div>

<!-- ✅ 上下文叙述 + 数据可视化 -->
<a class="kpi-card" href="/revenue">
  <div class="kpi-header">
    <h3>本季度营收</h3>
    <span class="kpi-trend-up">+12%</span>
  </div>
  <div class="kpi-value">$2.4M</div>
  <div class="kpi-context">
    <p>环比增长，主要来自企业合同签约。</p>
    <MiniChart :data="revenue" />
  </div>
</a>
```

---

## 关键 Token 偏向

```css
/* 间距紧凑（信息密度高） */
--space-section: var(--space-8);    /* 32px 区块间距 */
--padding-card: var(--space-4);     /* 16px 卡片内边距 */
--gap-list: var(--space-2);         /* 8px 列表项 */

/* 圆角小（工业感） */
--radius-button: var(--radius-sm);  /* 4px */
--radius-card: var(--radius-md);    /* 8px */

/* 字体偏小（密集） */
--font-size-body: 14px;
--font-size-min: 13px;              /* 表格内文字可小 */
```

---

## 推荐调色板

- **2B 灰蓝**（企业 SaaS 默认）— CRM、ERP、协同工具
- **数据深色**（Supabase / Grafana）— 监控、运维
- **冷调极简**（Linear）— 开发者工具、项目管理
- **金融稳重** — 银行、支付后台

---

## 反模式

- ❌ 大数字 + 渐变（hero-metric）
- ❌ 装饰性动效（管理后台要快）
- ❌ 缺少搜索和筛选
- ❌ 表格无排序/分页
- ❌ 操作无确认
- ❌ 错误提示不明确
- ❌ 加载用 spinner（用骨架屏）
- ❌ 表单字段全堆一屏（分组、stepper）
- ❌ 嵌套卡片

---

## 验证清单

- [ ] 侧栏可折叠/展开
- [ ] 表格支持排序、筛选、分页
- [ ] 触摸目标 ≥44pt
- [ ] 数字列等宽
- [ ] 错误提示明确且近源
- [ ] 加载用骨架屏
- [ ] 操作有反馈（成功/失败）
- [ ] 减弱动效模式
- [ ] 焦点环可见
- [ ] 键盘可达（Tab、Enter、Esc）
- [ ] 移动端可用（不破版）
- [ ] 没有 AI slop
