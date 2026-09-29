# vue-theme-skill — Vue 3 设计 Token 系统

> **完全对齐 uniapp-theme-skill 命名体系**，Vue 项目设计 Token 一站式方案。

## 快速开始

### 1. 复制模板到项目

```bash
cp -r vue-theme-skill/templates/src/styles your-project/src/
```

### 2. 在 main.ts 引入

```typescript
import '@/styles/tokens.css'
import '@/styles/global.css'
```

### 3. 在组件中使用

```vue
<style scoped>
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  font-size: var(--font-base);
}
</style>
```

## 核心能力

| 能力 | 说明 |
|------|------|
| 多主题色阶 | HSL 算法生成 50-950 色阶，8 套预设主题 |
| 尺寸阶梯 | `--space-{n}` / `--font-{size}` / `--height-{comp}-{size}` / `--icon-{size}` |
| 圆角 | `--radius-{sm,md,lg,xl,full}` |
| 多主题切换 | 通过 `[data-theme="xxx"]` 切换 |

## 8 套预设主题

| 主题 | 命名 | 主色 |
|------|------|------|
| 蓝（默认） | `blue` | hsl(211, 100%, 56%) |
| 绿 | `green` | hsl(152, 69%, 45%) |
| 紫 | `purple` | hsl(262, 83%, 58%) |
| 红 | `red` | hsl(0, 84%, 60%) |
| 橙 | `orange` | hsl(33, 100%, 56%) |
| 青 | `cyan` | hsl(180, 77%, 47%) |
| 粉 | `pink` | hsl(330, 81%, 60%) |
| 灰 | `slate` | hsl(220, 9%, 46%) |

## 主题切换

```typescript
// 切换为绿色主题
document.documentElement.setAttribute('data-theme', 'green')

// 切换为默认
document.documentElement.removeAttribute('data-theme')
```

## 与其他 Skill 关系

```
vue-generate-skill（骨架）
  └─→ vue-theme-skill（设计 Token）
       └─→ vue-base-skill（业务组件，强依赖）
```

## 边界声明

**只做**：Token 体系（颜色 / 尺寸 / 圆角 / 阴影）+ 多主题切换

**不做**：组件库、Dark Mode、Z-Index、Motion、JS Bridge、TypeScript 类型生成、Figma 对接、A11y 校验

## 详细文档

- [SKILL.md](SKILL.md) — 完整规范
- [references/color-scale.md](references/color-scale.md) — 9 级色阶 + HSL 算法
- [references/size-scale.md](references/size-scale.md) — 尺寸阶梯完整规范
- [references/hardcode-replace-rules.md](references/hardcode-replace-rules.md) — 硬编码替换规则
- [templates/](templates/) — 完整 Token 模板