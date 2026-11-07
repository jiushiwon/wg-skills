# 场景：文档站点（Docs Site）

API 文档、帮助中心、技术博客、开源项目。**内容可读性 > 视觉华丽**。

---

## 适用

- API 文档（OpenAPI / GraphQL）
- 技术博客
- 帮助中心
- 开源项目文档
- 知识库

## 不适用

- 营销页（用 `landing-marketing`）
- 后台系统（用 `admin-dashboard`）
- 移动端 App 文档（用 `mobile-responsive`）

---

## 核心组件

| 组件 | 说明 |
|------|------|
| **Top Bar** | Logo + 顶部 nav + 搜索 + GitHub 链接 |
| **Sidebar (Left)** | 多级导航，可折叠 |
| **TOC (Right)** | 页面内目录，sticky |
| **Main Content** | 标题 + 段落 + 代码 + 列表 + 表格 |
| **Code Block** | 语法高亮 + 复制按钮 + 语言标签 + 行号 |
| **Callout** | Note / Tip / Warning / Danger |
| **API Reference** | 端点 + 参数 + 响应示例 |
| **Pagination** | 上一页/下一页 |
| **Search** | Cmd+K 全文搜索 |
| **Version Switcher** | 版本切换下拉 |
| **Edit on GitHub** | 链接到源文件 |
| **Feedback Widget** | 页面反馈（有用/无用） |

---

## 布局基线

### 三栏布局（桌面）

```css
.docs-layout {
  display: grid;
  grid-template-columns: 280px 1fr 240px;
  min-height: 100vh;
  max-width: 1600px;
  margin: 0 auto;
}

.docs-sidebar {
  border-right: 1px solid var(--color-border);
  padding: var(--space-6) var(--space-4);
  position: sticky;
  top: 64px;  /* 顶栏高度 */
  height: calc(100vh - 64px);
  overflow-y: auto;
}

.docs-main {
  padding: var(--space-8) var(--space-12);
  max-width: 800px;
  margin: 0 auto;
}

.docs-toc {
  padding: var(--space-6) var(--space-4);
  position: sticky;
  top: 64px;
  height: calc(100vh - 64px);
  overflow-y: auto;
}

@media (max-width: 1279px) {
  .docs-layout {
    grid-template-columns: 1fr;
  }
  .docs-toc {
    display: none;
  }
}

@media (max-width: 767px) {
  .docs-sidebar {
    position: fixed;
    z-index: var(--z-fixed);
    background: var(--color-surface);
    transform: translateX(-100%);
    transition: transform 300ms var(--ease-out-quart);
    width: 80%;
  }
  .docs-sidebar.is-open {
    transform: translateX(0);
  }
  .docs-main {
    padding: var(--space-4);
  }
}
```

---

## 阅读优化

### 排版规则

```css
.docs-main {
  font-size: 16px;
  line-height: 1.7;          /* 长文阅读友好 */
  color: var(--color-on-surface);
}

.docs-main h1 {
  font-size: 2.5rem;
  font-weight: var(--font-weight-bold);
  margin-top: 0;
  margin-bottom: var(--space-4);
  letter-spacing: -0.02em;
}

.docs-main h2 {
  font-size: 1.75rem;
  font-weight: var(--font-weight-semibold);
  margin-top: var(--space-12);
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--color-border);
}

.docs-main h3 {
  font-size: 1.25rem;
  font-weight: var(--font-weight-semibold);
  margin-top: var(--space-8);
  margin-bottom: var(--space-3);
}

.docs-main p {
  margin: var(--space-4) 0;
}

.docs-main ul, .docs-main ol {
  margin: var(--space-4) 0;
  padding-left: var(--space-6);
}

.docs-main li {
  margin: var(--space-2) 0;
}

.docs-main a {
  color: var(--color-primary);
  text-decoration: underline;
  text-decoration-color: var(--color-border);
  text-underline-offset: 3px;
}

.docs-main a:hover {
  text-decoration-color: var(--color-primary);
}

.docs-main strong {
  font-weight: var(--font-weight-semibold);
}

.docs-main blockquote {
  border-left: 3px solid var(--color-border-strong);
  padding-left: var(--space-4);
  margin: var(--space-4) 0;
  color: var(--color-on-surface-muted);
  font-style: italic;
}
```

### 锚点跳转

```css
.docs-main h2,
.docs-main h3 {
  scroll-margin-top: 80px;  /* 顶栏 + 一点缓冲 */
  position: relative;
}

.docs-main h2 a.anchor,
.docs-main h3 a.anchor {
  position: absolute;
  left: -24px;
  opacity: 0;
  transition: opacity 200ms;
}

.docs-main h2:hover a.anchor,
.docs-main h3:hover a.anchor {
  opacity: 1;
}
```

---

## 代码块

### 基础代码块

```html
<div class="code-block">
  <div class="code-block-header">
    <span class="code-language">TypeScript</span>
    <button class="code-copy" aria-label="复制">
      <Icon name="copy" />
    </button>
  </div>
  <pre><code class="language-typescript">const greeting: string = 'Hello';</code></pre>
</div>
```

```css
.code-block {
  background: var(--color-code-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin: var(--space-4) 0;
}

.code-block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2) var(--space-4);
  background: var(--color-surface-tinted);
  border-bottom: 1px solid var(--color-border);
  font-size: var(--font-size-xs);
}

.code-language {
  color: var(--color-on-surface-muted);
  font-family: var(--font-family-mono);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.code-copy {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  color: var(--color-on-surface-muted);
  font-size: var(--font-size-xs);
  transition: all 150ms;
}

.code-copy:hover {
  background: var(--color-surface);
  color: var(--color-on-surface);
}

.code-block pre {
  margin: 0;
  padding: var(--space-4);
  overflow-x: auto;
  font-family: var(--font-family-mono);
  font-size: 0.875rem;
  line-height: 1.6;
}

.code-block code {
  font-family: inherit;
  background: none;
  padding: 0;
}
```

### 内联代码

```css
.docs-main :not(pre) > code {
  background: var(--color-surface-tinted);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-family: var(--font-family-mono);
  font-size: 0.875em;
  color: var(--color-primary);
  border: 1px solid var(--color-border);
}
```

### 复制成功反馈

```js
async function copyCode(button) {
  const code = button.closest('.code-block').querySelector('code').textContent;
  try {
    await navigator.clipboard.writeText(code);
    button.classList.add('copied');
    button.querySelector('.label').textContent = '已复制';
    setTimeout(() => {
      button.classList.remove('copied');
      button.querySelector('.label').textContent = '复制';
    }, 2000);
  } catch (err) {
    console.error('复制失败', err);
  }
}
```

---

## Callout（提示框）

```html
<div class="callout callout-info">
  <div class="callout-icon">ℹ️</div>
  <div class="callout-content">
    <p class="callout-title">提示</p>
    <p>这是一段补充说明。</p>
  </div>
</div>

<div class="callout callout-warning">
  <div class="callout-icon">⚠️</div>
  <div class="callout-content">
    <p class="callout-title">注意</p>
    <p>这是一个需要留意的操作。</p>
  </div>
</div>
```

```css
.callout {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid;
  margin: var(--space-4) 0;
}

.callout-info {
  background: oklch(from var(--color-info) l c h / 0.08);
  border-color: var(--color-info);
}

.callout-warning {
  background: oklch(from var(--color-warning) l c h / 0.08);
  border-color: var(--color-warning);
}

.callout-danger {
  background: oklch(from var(--color-error) l c h / 0.08);
  border-color: var(--color-error);
}

.callout-title {
  font-weight: var(--font-weight-semibold);
  margin: 0 0 var(--space-1);
}
```

---

## TOC（右侧目录）

```html
<nav class="docs-toc" aria-label="本页目录">
  <p class="toc-title">本页目录</p>
  <ul class="toc-list">
    <li><a href="#section-1" class="toc-h2 active">Section 1</a>
      <ul>
        <li><a href="#subsection-1-1" class="toc-h3">Subsection 1.1</a></li>
      </ul>
    </li>
  </ul>
</nav>
```

```css
.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-list a {
  display: block;
  padding: var(--space-1) 0;
  font-size: var(--font-size-sm);
  color: var(--color-on-surface-muted);
  line-height: 1.4;
  border-left: 2px solid transparent;
  padding-left: var(--space-3);
  margin-left: -2px;
  transition: all 150ms;
}

.toc-list a:hover {
  color: var(--color-on-surface);
}

.toc-list a.active {
  color: var(--color-primary);
  border-left-color: var(--color-primary);
  font-weight: var(--font-weight-medium);
}

.toc-list ul {
  list-style: none;
  padding-left: var(--space-4);
  margin: 0;
}
```

---

## 搜索（Cmd+K）

```html
<dialog class="search-dialog">
  <div class="search-container">
    <input type="search" placeholder="搜索文档..." class="search-input" />
    <div class="search-results">
      <!-- 搜索结果列表 -->
    </div>
  </div>
</dialog>
```

```js
// Cmd+K / Ctrl+K 打开搜索
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    document.querySelector('.search-dialog').showModal();
  }
});
```

---

## 关键 Token 偏向

```css
/* 阅读优化：行高 1.7，行长 65-75ch */
--font-size-body: 16px;
--line-height-body: 1.7;
--container-prose: 800px;

/* 等宽字体突出代码 */
--font-family-mono: 'JetBrains Mono', 'Fira Code', monospace;
--font-size-code: 0.875rem;

/* 间距克制，文档不要太多留白 */
--space-section: var(--space-8);    /* 32px 区块 */
--space-paragraph: var(--space-4);  /* 16px 段间距 */

/* 圆角小，工业感 */
--radius-code: var(--radius-md);
```

---

## 推荐调色板

- **文档清爽**（默认）— 米白 + 靛蓝，Mintlify 风
- **冷调极简**（Linear）— 白 + 蓝灰
- **数据深色**（可选暗色模式）— 深色代码区

---

## 反模式

- ❌ 没有搜索或搜索弱
- ❌ 没有 TOC（多章节文档必备）
- ❌ 代码块无复制按钮
- ❌ 行高 < 1.6（阅读疲劳）
- ❌ 没有行号（错误信息无法定位）
- ❌ 移动端侧栏不可访问
- ❌ 暗色模式代码对比度差
- ❌ 字体不区分代码/正文
- ❌ 嵌套卡片

---

## 验证清单

- [ ] 三栏布局（导航/内容/TOC）
- [ ] 行高 1.7、行长 65-75ch
- [ ] 代码块有复制按钮 + 语言标签
- [ ] 内联代码视觉区分
- [ ] 锚点跳转可点击
- [ ] TOC 高亮当前章节
- [ ] 搜索可用（Cmd+K）
- [ ] 移动端侧栏抽屉化
- [ ] 暗色模式代码对比度足够
- [ ] 减弱动效模式
- [ ] 没有 AI slop
