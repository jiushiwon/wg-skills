# 9 级色阶规范（HSL 算法）

## 一、为什么用 HSL 而不是 RGB 混合？

RGB 混合（如 `#4a90e2 + #fff` 按比例）会产生**色相偏移**：

```js
// ❌ RGB 混合：色相不稳定
mix('#4a90e2', '#fff', 20%)  // 实际结果偏紫，不符合直觉
```

HSL 算法**色相绝对稳定**，仅调整饱和度和亮度：

```js
// ✅ HSL：色相不变
hsl(211, 100%, 56%)        // 主色
hsl(211, 100%, 76%)        // 主色 light（仅 +20% 亮度）
hsl(211, 100%, 48%)        // 主色 dark（仅 -8% 亮度）
```

## 二、9 级色阶规范

| 阶 | HSL 调整 | 用途 |
|----|---------|------|
| **50** | hue, sat, 96% | 极浅背景、禁用态 |
| **100** | hue, sat, 92% | 浅色背景、hover 浅 |
| **200** | hue, sat, 86% | 标签底色 |
| **300** | hue, sat, 76% | light（hover） |
| **400** | hue, sat, 66% | 中浅（强调 hover） |
| **500** | hue, sat, 56% | **主色**（= `--color-primary`） |
| **600** | hue, sat, 48% | dark（按下） |
| **700** | hue, sat, 40% | 深色文本 |
| **800** | hue, sat, 32% | 标题文字 |
| **950** | hue, sat, 16% | 极深文本 |

## 三、8 套预设主题

| 主题 | hue | sat | light | 主色 |
|------|-----|-----|-------|------|
| blue（默认） | 211 | 100% | 56% | #2196F3 感 |
| green | 152 | 69% | 45% | #26C281 感 |
| purple | 262 | 83% | 58% | #7C4DFF 感 |
| red | 0 | 84% | 60% | #F44336 感 |
| orange | 33 | 100% | 56% | #FF9800 感 |
| cyan | 180 | 77% | 47% | #00BCD4 感 |
| pink | 330 | 81% | 60% | #E91E63 感 |
| slate | 220 | 9% | 46% | #607D8B 感 |

## 四、HSL Token 生成器

```javascript
// references/theme-generator.js
function hslScale(hue, sat, baseLight = 56) {
  return {
    50:  `hsl(${hue}, ${sat}%, 96%)`,
    100: `hsl(${hue}, ${sat}%, 92%)`,
    200: `hsl(${hue}, ${sat}%, 86%)`,
    300: `hsl(${hue}, ${sat}%, 76%)`,
    400: `hsl(${hue}, ${sat}%, 66%)`,
    500: `hsl(${hue}, ${sat}%, ${baseLight}%)`,
    600: `hsl(${hue}, ${sat}%, 48%)`,
    700: `hsl(${hue}, ${sat}%, 40%)`,
    800: `hsl(${hue}, ${sat}%, 32%)`,
    950: `hsl(${hue}, ${sat}%, 16%)`,
  }
}

// 生成主题
const blueTheme = hslScale(211, 100)
const greenTheme = hslScale(152, 69, 45)
```

## 五、使用方式

```css
/* 主色 */
.button-primary {
  background: var(--color-primary);
}

/* hover（变浅） */
.button-primary:hover {
  background: var(--color-primary-light);  /* = --color-primary-300 */
}

/* 按下（变深） */
.button-primary:active {
  background: var(--color-primary-dark);  /* = --color-primary-600 */
}

/* 文本 */
.text-primary {
  color: var(--color-primary);
}

/* 浅色背景 */
.bg-primary-soft {
  background: var(--color-primary-50);
}
```

## 六、运行时主题切换

```typescript
// 切换为绿色主题
document.documentElement.setAttribute('data-theme', 'green')

// 切换为默认
document.documentElement.removeAttribute('data-theme')

// 持久化（业务层处理，本 Skill 不管）
localStorage.setItem('theme', 'green')
```

## 七、边界声明

✅ **本 Skill 负责**：
- 9 级色阶生成
- 8 套预设主题
- 运行时切换（通过 [data-theme]）
- HSL 算法

❌ **本 Skill 不做**：
- 持久化（业务层）
- 系统偏好检测（prefers-color-scheme）
- 用户主题选择 UI
- 主题切换的过渡动画