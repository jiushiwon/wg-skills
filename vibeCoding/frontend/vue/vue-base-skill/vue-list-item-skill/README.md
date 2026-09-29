# vue-list-item-skill

> Vue 列表项抽象基座 —— 所有"列表类"组件的共同底层。

## 核心组件

| 组件 | 角色 |
|------|------|
| [base-list-item](./base-list-item.md) | 列表项基座（4 槽位 + 6 风格） |

## 4 个槽位

`[expander] [icon] [label] [meta]`

## 6 种风格

`basic` / `finder` / `win` / `vscode` / `admin` / `notion` / `nav`

## 使用

```vue
<base-list-item
  v-for="item in items"
  :key="item.id"
  :item="item"
  variant="basic"
  @select="onSelect"
/>
```

详见 [SKILL.md](./SKILL.md) 与 [base-list-item.md](./base-list-item.md)。

## 演示

`demo-components/base-list-item/html/00-showcase.html` —— 一个 HTML 文件演示全部用法。