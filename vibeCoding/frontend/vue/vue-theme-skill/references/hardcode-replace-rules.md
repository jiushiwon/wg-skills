# 硬编码替换规则（A/B/C/D/E 分类）

> 业务代码必须**全部使用 Token**，禁止裸色值 / 裸 px。
> 本规则按 **CSS 属性上下文** 分类，确保替换完整无遗漏。

## 一、按上下文分类

### A 类：颜色上下文

| CSS 属性 | 替换为 | 示例 |
|---------|--------|------|
| `color` | `var(--color-text*)` | `color: var(--color-text)` |
| `background` / `background-color` | `var(--color-*)` | `background: var(--color-primary)` |
| `border` / `border-color` | `var(--color-border*)` | `border: 1px solid var(--color-border)` |
| `box-shadow` 颜色部分 | `var(--shadow-*)` | `box-shadow: var(--shadow-md)` |
| `outline` 颜色部分 | `var(--color-*)` | `outline: 1px solid var(--color-primary)` |
| `fill` / `stroke`（SVG） | `var(--color-*)` | `fill: var(--color-primary)` |
| `text-decoration` 颜色部分 | `var(--color-text-link)` | `text-decoration-color: var(--color-text-link)` |
| `caret-color` | `var(--color-primary)` | `caret-color: var(--color-primary)` |
| `accent-color` | `var(--color-primary)` | `accent-color: var(--color-primary)` |
| `column-rule` 颜色部分 | `var(--color-border)` | `column-rule: 1px solid var(--color-border)` |

### B 类：尺寸上下文（间距 / 边框）

| CSS 属性 | 替换为 | 示例 |
|---------|--------|------|
| `padding` / `padding-*` | `var(--space-*)` | `padding: var(--space-4)` |
| `margin` / `margin-*` | `var(--space-*)` | `margin: var(--space-4) 0` |
| `gap` / `row-gap` / `column-gap` | `var(--space-*)` | `gap: var(--space-3)` |
| `top` / `right` / `bottom` / `left` | `var(--space-*)` 或具体值 | `top: var(--space-4)` |
| `border` / `border-width` | `1px`（固定值）或 `var(--space-px)` | `border: 1px solid var(--color-border)` |
| `border-radius` | `var(--radius-*)` | `border-radius: var(--radius-md)` |
| `width` / `height`（组件自身） | `var(--height-*-*)` | `height: var(--height-button-md)` |
| `width` / `height`（容器布局） | 具体数值或 `%` | `width: 100%` |
| `min-width` / `max-width` | 具体数值 | `max-width: 1200px` |

### C 类：字体上下文

| CSS 属性 | 替换为 | 示例 |
|---------|--------|------|
| `font-size` | `var(--font-*)` | `font-size: var(--font-base)` |
| `font-weight` | `var(--weight-*)` | `font-weight: var(--weight-medium)` |
| `line-height` | `var(--leading-*)` 或数字 | `line-height: var(--leading-normal)` |
| `font-family` | `-apple-system, ...`（字体栈） | `font-family: -apple-system, sans-serif` |
| `letter-spacing` | 具体值（em） | `letter-spacing: 0.02em` |
| `text-indent` | `var(--space-*)` | `text-indent: var(--space-4)` |

### D 类：图标 / SVG 上下文

| CSS 属性 | 替换为 | 示例 |
|---------|--------|------|
| `width` / `height`（图标） | `var(--icon-*)` | `width: var(--icon-md)` |
| SVG 元素尺寸 | `var(--icon-*)` | `<svg width="var(--icon-md)">` |

### E 类：变换 / 动画上下文

| CSS 属性 | 替换为 | 示例 |
|---------|--------|------|
| `transform: translate(x, y)` | `translate(var(--space-*), var(--space-*))` | `transform: translate(var(--space-2), var(--space-2))` |
| `translate` | `var(--space-*)` | `translate: var(--space-2)` |
| `transition-duration` | 具体值（ms） | `transition: all 200ms ease` |
| `transition-delay` | 具体值（ms） | `transition-delay: 100ms` |

> ⚠️ **本 Skill 不做 Motion/Transition**，只规定命名规则。具体动画时长由业务层决定。

## 三、完整替换示例

### ❌ 反例（硬编码）

```css
.button {
  background: #4a90e2;
  color: #ffffff;
  padding: 12px 24px;
  margin-bottom: 16px;
  border-radius: 8px;
  font-size: 14px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  height: 40px;
}
.button:hover {
  background: #6bb3ff;
}
```

### ✅ 正例（全部 Token 化）

```css
.button {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  padding: var(--space-3) var(--space-6);
  margin-bottom: var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--font-base);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-md);
  height: var(--height-button-md);
}
.button:hover {
  background: var(--color-primary-light);
}
```

## 四、特殊场景

### 1. 阴影中的 rgba()

```css
/* ❌ 不推荐：rgba 硬编码 */
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

/* ✅ 推荐：使用 --shadow-* 变量 */
box-shadow: var(--shadow-md);
```

如果需要自定义阴影透明度，使用 CSS color-mix：

```css
/* ✅ color-mix 动态调整透明度 */
box-shadow: 0 4px 12px color-mix(in srgb, var(--color-primary) 20%, transparent);
```

### 2. 渐变

```css
/* ✅ 渐变颜色用 Token */
background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
```

### 3. 透明色

```css
/* ✅ 用 color-mix 而非 rgba */
background: color-mix(in srgb, var(--color-primary) 50%, transparent);
```

### 4. z-index

```css
/* ⚠️ z-index 不在本 Skill 范围，由业务层定义 */
/* 建议：业务层定义 --z-* 全局变量 */
```

## 五、批量替换工具（推荐）

### ESLint 规则

```jsonc
// .eslintrc.json
{
  "rules": {
    "color-no-hex": [2, { "message": "禁止裸色值，请使用 var(--color-*)" }],
    "declaration-property-value-disallowed-list": {
      "/.*/": ["/^#[0-9a-fA-F]{3,8}$/", "/^rgba?\\(/"]
    }
  }
}
```

### stylelint 规则

```jsonc
// .stylelintrc.json
{
  "rules": {
    "color-no-hex": true,
    "function-disallowed-list": ["rgb", "rgba"],
    "declaration-property-value-disallowed-list": {
      "/^padding/": ["/[0-9]+px/"],
      "/^margin/": ["/[0-9]+px/"]
    }
  }
}
```

## 六、检查清单

- [ ] 无 `#xxx` / `#xxxxxx` / `#xxxxxxxx`
- [ ] 无 `rgb(...)` / `rgba(...)`
- [ ] 无裸 `px`（除 `border: 1px`、`width: 100%`）
- [ ] 无 `calc()` 生成主题值
- [ ] 所有 `color` / `background` / `border-color` 用 `var(--color-*)`
- [ ] 所有 `padding` / `margin` / `gap` 用 `var(--space-*)`
- [ ] 所有 `font-size` 用 `var(--font-*)`
- [ ] 所有 `border-radius` 用 `var(--radius-*)`
- [ ] 所有组件高度用 `var(--height-*-*)`
- [ ] 所有图标尺寸用 `var(--icon-*)`