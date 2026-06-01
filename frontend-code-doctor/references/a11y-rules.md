# Accessibility 无障碍审查规则

本文档定义前端项目的无障碍（a11y）审查规则。

---

## 1. 图像无障碍

### 检查项

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| A11Y-001 | img 缺少 alt 属性 | Error |
| A11Y-002 | 装饰性图片 alt="" 缺失 | Warning |
| A11Y-003 | alt 文本描述不完整 | Warning |
| A11Y-004 | 图标链接缺少 aria-label | Error |

### 检查模式

```bash
# img without alt
Grep "<img(?![^>]* alt)" --glob "*.vue" --output_mode content
```

### 正确示例

```html
<!-- 有意义图像 -->
<img src="chart.png" alt="销售增长图表" />

<!-- 装饰性图像 -->
<img src="decoration.png" alt="" role="presentation" />
```

---

## 2. 表单无障碍

### 检查项

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| A11Y-010 | input 缺少关联 label | Error |
| A11Y-011 | label 缺少 for/id 对应 | Warning |
| A11Y-012 | 必填字段未标记 | Warning |
| A11Y-013 | 错误提示未与 input 关联 | Warning |

### 正确示例

```html
<!-- 显式关联 -->
<label for="email">邮箱</label>
<input id="email" v-model="email" aria-required="true" />

<!-- 隐式关联 -->
<label>
  邮箱
  <input v-model="email" />
</label>

<!-- 错误提示关联 -->
<input 
  id="email"
  aria-describedby="email-error"
  aria-invalid="true"
/>
<span id="email-error" role="alert">邮箱格式错误</span>
```

---

## 3. 键盘导航

### 检查项

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| A11Y-020 | 可点击元素缺少 focus | Warning |
| A11Y-021 | tabindex > 0 使用错误 | Warning |
| A11Y-022 | 快捷键未提供退出机制 | Warning |
| A11Y-023 | 自定义交互组件不可键盘操作 | Error |

### 正确示例

```html
<!-- 正确的 tab 顺序 -->
<button tabindex="0">选项一</button>
<button tabindex="1">选项二</button>

<!-- 禁用元素不应获得焦点 -->
<button disabled tabindex="-1">删除</button>

<!-- 模态框焦点管理 -->
<div role="dialog" aria-modal="true" autofocus>
  <button @keydown.esc="close">关闭</button>
</div>
```

---

## 4. ARIA 正确使用

### 检查项

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| A11Y-030 | role 与元素语义冲突 | Error |
| A11Y-031 | aria-* 应用于无意义元素 | Warning |
| A11Y-032 | 动态内容未通知屏幕阅读器 | Warning |
| A11Y-033 | 展开/折叠未使用 aria-expanded | Warning |

### 检查模式

```bash
# div button 缺少 role
Grep "<div(?!.*role)[^>]*(onClick|@click)" --glob "*.vue" --output_mode content

# 检查 ARIA 缺失
Grep "(role=\"button\"|role=\"dialog\")" --output_mode content
```

### 正确示例

```html
<!-- 按钮语义 -->
<button @click="openMenu">菜单</button>
<!-- 或 -->
<div role="button" tabindex="0" @click="openMenu">菜单</div>

<!-- 动态通知 -->
<span aria-live="polite">{{ message }}</span>

<!-- 展开状态 -->
<button aria-expanded="true">展开菜单</button>
```

---

## 5. 颜色对比度

### 检查项

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| A11Y-040 | 文本对比度 < 4.5:1 | Warning |
| A11Y-041 | 大文本对比度 < 3:1 | Warning |
| A11Y-042 | 禁用状态可见性不足 | Warning |
| A11Y-043 | 仅用颜色传达信息 | Warning |

### 正确示例

```css
/* 正常文本需要 4.5:1 对比度 */
.text-primary {
  color: #1a1a1a; /* 深灰色，接近黑色 */
  background: #ffffff;
}

/* 结合其他提示 */
.error-text {
  color: #d32f2f; /* 红色 */
  /* 同时使用图标或文字说明 */
}
.error-icon::after {
  content: "错误";
}
```

---

## 6. 焦点管理

### 检查项

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| A11Y-050 | 模态框打开后焦点未捕获 | Warning |
| A11Y-051 | 模态框关闭后焦点未恢复 | Warning |
| A11Y-052 | 页面跳转后焦点未复位 | Warning |
| A11Y-053 | Skip Link 缺失 | Info |

### 正确示例

```typescript
// 模态框焦点管理
function openModal() {
  const previousFocus = document.activeElement;
  modal.focus();
  
  // 使用 trap-focus 库处理
}

// 关闭恢复焦点
function closeModal() {
  modal.close();
  previousFocus.focus();
}
```

---

## 7. 动态内容无障碍

### 检查项

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| A11Y-060 | 加载状态未通知 | Warning |
| A11Y-061 | 分页/无限滚动未通知 | Warning |
| A11Y-062 | 实时更新未使用 aria-live | Warning |
| A11Y-063 | 下拉选择未使用 listbox role | Warning |

### 正确示例

```html
<!-- 加载状态 -->
<div role="status" aria-live="polite">
  正在加载...
</div>

<!-- 无限滚动 -->
<ul role="listbox" aria-label="新闻列表">
  <li role="option" v-for="item in news">{{ item.title }}</li>
</ul>

<!-- 分页 -->
<nav aria-label="分页">
  <button aria-label="第 1 页">1</button>
</nav>
```

---

## 8. 触摸目标尺寸

### 检查项

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| A11Y-070 | 可点击区域 < 44x44px | Warning |
| A11Y-071 | 按钮内边距不足 | Warning |
| A11Y-072 | 密集排列的可点击元素间距不足 | Warning |

### 正确示例

```css
/* 最小触摸区域 */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  padding: 12px;
}

/* 列表项触摸友好 */
.list-item {
  padding: 16px;
  min-height: 56px;
}
```