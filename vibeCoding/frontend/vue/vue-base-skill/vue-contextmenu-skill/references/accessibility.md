# ContextMenu 可访问性指南

## 概述

ContextMenu 组件遵循 WAI-ARIA 菜单模式，为屏幕阅读器和键盘用户提供完整的可访问性支持。

## ARIA 角色

### 菜单容器

```html
<div role="menu" aria-orientation="vertical">
  <!-- 菜单项 -->
</div>
```

- `role="menu"`：标识这是一个菜单
- `aria-orientation="vertical"`：菜单方向

### 菜单项

```html
<div
  role="menuitem"
  aria-disabled="false"
  aria-label="复制文件"
  tabindex="-1"
>
  复制
</div>
```

- `role="menuitem"`：标识这是一个菜单项
- `aria-disabled`：禁用状态
- `aria-label`：可访问性标签
- `tabindex="-1"`：不参与 Tab 导航，由方向键控制

### 带子菜单的项

```html
<div
  role="menuitem"
  aria-haspopup="true"
  aria-expanded="false"
>
  更多操作 ▸
</div>
```

- `aria-haspopup="true"`：标识有弹出内容
- `aria-expanded`：子菜单展开状态

### 分割线

```html
<div role="separator" aria-orientation="horizontal"></div>
```

---

## 键盘导航

### 按键映射

| 按键 | 操作 | 说明 |
|------|------|------|
| `↑` | 上移焦点 | 移动到上一个可用菜单项 |
| `↓` | 下移焦点 | 移动到下一个可用菜单项 |
| `→` | 展开子菜单 | 当前项有子菜单时展开 |
| `←` | 收起子菜单 | 关闭当前子菜单，返回父菜单 |
| `Enter` | 选择 | 触发当前焦点项 |
| `Space` | 选择 | 同 Enter |
| `Escape` | 关闭 | 关闭整个菜单 |

### 焦点管理规则

1. **打开菜单时**
   - 焦点移动到第一个可用菜单项
   - 禁用项被跳过

2. **导航时**
   - 焦点在可用菜单项间循环
   - 到达末尾后回到开头

3. **子菜单展开时**
   - 焦点移动到子菜单第一个可用项
   - 父菜单项保持 `aria-expanded="true"`

4. **子菜单关闭时**
   - 焦点返回到父菜单项
   - 恢复 `aria-expanded="false"`

5. **关闭菜单时**
   - 焦点返回到触发元素

---

## 屏幕阅读器支持

### NVDA / JAWS

- 宣读菜单项标签
- 宣读禁用状态
- 宣读子菜单存在
- 宣读选中状态

### VoiceOver (macOS)

- 自动识别菜单结构
- 支持 VO + 方向键导航
- 正确宣读菜单项角色

---

## 最小触摸目标

菜单项应满足最小触摸目标尺寸：

```scss
.menu-item {
  min-height: 44px; // WCAG 2.5.5 最小触摸目标
  padding: 8px 16px;
}

// 移动端
@media (pointer: coarse) {
  .menu-item {
    min-height: 48px;
    padding: 12px 16px;
  }
}
```

---

## 对比度要求

### 文本对比度

- 普通文本：至少 4.5:1 (WCAG AA)
- 大文本（18px+ 或 14px+ 粗体）：至少 3:1

### 交互状态对比度

- 悬停/聚焦状态：确保与默认状态有足够区分
- 禁用状态：至少 3:1（WCAG 1.4.3）

```scss
.menu-item {
  color: var(--color-text); // #333 on #fff = 12.6:1 ✓

  &--disabled {
    color: var(--color-text-disabled); // 确保至少 3:1
  }

  &:hover {
    background: var(--color-fill); // 确保文本仍满足对比度
  }
}
```

---

## 焦点样式

### 可见焦点指示器

```scss
.menu-item {
  &:focus {
    outline: 2px solid var(--color-primary);
    outline-offset: -2px;
  }

  // 高对比度模式
  @media (forced-colors: active) {
    &:focus {
      outline: 2px solid ButtonText;
    }
  }
}
```

### 焦点可见性

使用 `:focus-visible` 仅在键盘导航时显示焦点样式：

```scss
.menu-item {
  // 鼠标点击不显示焦点框
  &:focus:not(:focus-visible) {
    outline: none;
  }

  // 键盘导航显示焦点框
  &:focus-visible {
    outline: 2px solid var(--color-primary);
  }
}
```

---

## 语义化 HTML

### 正确结构

```html
<div role="menu" aria-orientation="vertical">
  <div role="menuitem" tabindex="-1">复制</div>
  <div role="menuitem" tabindex="-1">粘贴</div>
  <div role="separator"></div>
  <div role="menuitem" aria-haspopup="true" aria-expanded="false">
    更多
    <div role="menu">
      <div role="menuitem">子选项</div>
    </div>
  </div>
</div>
```

### 常见错误

```html
<!-- ✗ 错误：使用 button 不当 -->
<button>复制</button>

<!-- ✗ 错误：缺少 ARIA 属性 -->
<div class="menu-item">复制</div>

<!-- ✗ 错误：分割线无 role -->
<div class="divider"></div>

<!-- ✓ 正确 -->
<div role="menuitem" aria-label="复制">复制</div>
<div role="separator" aria-orientation="horizontal"></div>
```

---

## 测试清单

### 键盘测试

- [ ] Tab 无法直接聚焦到菜单项（通过 trigger 触发）
- [ ] 打开菜单后，焦点在第一个可用项
- [ ] ↑↓ 键可以导航
- [ ] → 键展开子菜单
- [ ] ← 键关闭子菜单
- [ ] Enter/Space 选择菜单项
- [ ] Escape 关闭菜单
- [ ] 关闭后焦点返回 trigger

### 屏幕阅读器测试

- [ ] 菜单被识别为菜单
- [ ] 菜单项标签被正确宣读
- [ ] 禁用状态被宣读
- [ ] 子菜单存在被宣读
- [ ] 选中后有反馈

### 对比度测试

- [ ] 文本对比度 >= 4.5:1
- [ ] 禁用文本对比度 >= 3:1
- [ ] 焦点指示器对比度 >= 3:1

---

## 参考资料

- [WAI-ARIA Menu Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menu/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN ARIA: menu role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/menu_role)
