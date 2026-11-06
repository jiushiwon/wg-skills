# vue-card-skill 个体规范

> 上位规范：[vue-base-skill/STANDARD.md](../STANDARD.md)

## 一、模块定位

- **做什么**：卡片容器 `base-card`，提供 12 种卡片布局 + header/footer 插槽，是内容型组件的**外壳真源**。
- **不做什么**：不承载业务内容；不实现弹窗/抽屉（→ `vue-dialog-skill`）。

## 二、依赖

| 依赖 | 说明 |
|------|------|
| `vue-theme-skill` | 圆角/阴影/背景/间距 Token |

## 三、目录约定

```
vue-card-skill/
├── SKILL.md / README.md / STANDARD.md
├── base-card.md            # 卡片容器规格（唯一真源）
└── base-wg-card.md         # 卡片衍生实现
```

## 四、内容清单

- 12 种卡片布局（标题卡 / 列表卡 / 统计卡 / 图文卡等）
- 插槽：default / header / footer / header-right

## 五、内置约束（编号红线）

- **C01**：`base-card` 是全 Vue 群内容型组件的唯一外壳真源，其他 skill 只能引用，禁止复制其圆角/分割线/内边距实现。
- **C02**：零 HTML5 标签——`<header>`/`<footer>`/`<h1>-<h6>` 用 `<div class="*-header/footer">` + CSS 字重/字号替代。
- **C03**：圆角/阴影/内边距全走 `var(--radius-*`、`var(--shadow-*`、`var(--space-*`。

## 六、变更纪律

改 `base-card.md` → 检查全群引用它的子 skill（尤其 vue-complex-skill 7 个子 skill）是否受影响。

## 七、自检清单

- [ ] 12 种布局全覆盖
- [ ] header/footer 插槽可用
- [ ] 零 HTML5 标签、零硬编码
