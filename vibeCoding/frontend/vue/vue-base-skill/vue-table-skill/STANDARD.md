# vue-table-skill 个体规范

> 上位规范：[vue-base-skill/STANDARD.md](../STANDARD.md)

## 一、模块定位

- **做什么**：表格组件，23 种形态 + 3 个独立组件（`base-table` / `base-loading` / `base-paginated`）。
- **不做什么**：不实现后端数据逻辑；不做大数据虚拟滚动（二期）。

## 二、依赖

| 依赖 | 说明 |
|------|------|
| `vue-theme-skill` | 高度/圆角/间距/字号 Token |
| `vue-base-skill/base-card.md` | 表格嵌入 `<base-card>` |

## 三、目录约定

```
vue-table-skill/
├── SKILL.md / README.md / STANDARD.md
├── base-table.md / base-loading.md / base-paginated.md
└── demo-components/
```

## 四、内容清单

- 23 种形态（基础 / 斑马纹 / 边框 / 固定列 / 排序 / 筛选 / 多选等）
- 3 个独立组件：base-table / base-loading / base-paginated

## 五、内置约束（编号红线）

- **T01**：遵循 [vue/AGENTS.md](../../AGENTS.md) 的 HTML 结构规则；表格局部必须提供与列、行、单元格对应的 ARIA 角色。
- **T02**：列定义（columns）与数据（data）契约分离，columns 支持 `slot` 自定义单元格。
- **T03**：分页 `page` + `pageSize` 对齐后端分页规范（camelCase，上限 100）。

## 六、变更纪律

改 columns 契约 → 同步 `base-table.md`、demo 底部列定义示例。

## 七、自检清单

- [ ] 已满足上位的 HTML、Emoji 与 Token 规则
- [ ] columns/data 契约分离
- [ ] 23 形态覆盖
