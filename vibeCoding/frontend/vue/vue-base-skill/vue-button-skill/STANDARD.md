# vue-button-skill 个体规范

> 上位规范：[vue-base-skill/STANDARD.md](../STANDARD.md)

## 一、模块定位

- **做什么**：通用按钮组件 `base-button`，6 type × 3 variant × 3 size 灵活组合。
- **不做什么**：不承载业务文案逻辑；不实现图标按钮的图标资产（图标走 SVG / Unicode 符号）。

## 二、依赖

| 依赖 | 说明 |
|------|------|
| `vue-theme-skill` | 颜色/高度/圆角/字号 Token |
| `vue-base-skill/base-card.md` | 按钮组必须嵌入 `<base-card>`（容器原则） |

## 三、目录约定

```
vue-button-skill/
├── SKILL.md / README.md / STANDARD.md
├── base-button.md          # 组件规格（props/events/slots 唯一真源）
└── demo-components/base-button/html/  # 01-types / 02-variants / 03-sizes
```

## 四、内容清单

- 6 type：default / primary / danger / success / warning / info
- 3 variant：solid / outline / text
- 3 size：sm / md / lg
- 状态：loading / disabled / hover / focus / active

## 五、内置约束（编号红线）

- **B01**：遵循 [vue/AGENTS.md](../../AGENTS.md) 的零 HTML5 标签规则；按钮的键盘可访问性实现使用 `div[role="button"]`、`@keydown.enter` 与 `@keydown.space.prevent`。
- **B02**：`loading` 态必须禁用点击并给转圈反馈（防重复提交）。
- **B03**：遵循上位 Token 规则；按钮额外只允许使用已定义的颜色、高度与圆角语义变量。

## 六、变更纪律

改 `base-button.md` 的 props → 同步 `SKILL.md`、demo 底部入参列表。

## 七、自检清单

- [ ] 已满足上位的 HTML、Emoji 与 Token 规则
- [ ] 6 type × 3 variant × 3 size 全覆盖
- [ ] loading/disabled 态齐全
