# vue-menu-skill

Vue 菜单组件技能。

## 快速使用

```vue
<base-menu
  mode="vertical"
  :data="menuData"
  v-model:activeKey="activeKey"
  collapsible
/>
```

## 模式

- `mode="vertical"` - 垂直菜单（侧边栏）
- `mode="horizontal"` - 横向菜单（顶部导航）

## 文档

- [base-menu.md](base-menu.md) - 组件文档
- [SKILL.md](SKILL.md) - 技能定义

## 依赖

- vue-list-item-skill - 底层渲染
- vue-theme-skill - 样式 Token
- vue-icon-skill - 图标

## Demo

打开 `demo-components/base-menu/html/00-showcase.html` 查看 8 种形态演示。
