# vue-form-skill 个体规范

> 上位规范：[vue-base-skill/STANDARD.md](../STANDARD.md)

## 一、模块定位

- **做什么**：表单体系（组装型），提供 `base-form` / `base-form-item` / `base-form-render`，引用独立输入控件 skill。
- **不做什么**：不重新实现输入框/选择器（→ `vue-input-skill` / `vue-select-skill`）；不实现校验引擎（只做契约挂载）。

## 二、依赖

| 依赖 | 说明 |
|------|------|
| `vue-input-skill` / `vue-select-skill` / `vue-checkbox-skill` 等 | 表单字段控件来源 |
| `vue-base-skill/base-card.md` | 表单外壳 |
| `frontend-request-skill` | 提交请求封装 |

## 三、目录约定

```
vue-form-skill/
├── SKILL.md / README.md / STANDARD.md
├── base-form.md / base-form-item.md / base-form-render.md
└── references/
```

## 四、内容清单

- `base-form`：表单容器（布局 + 提交）
- `base-form-item`：表单项外壳（label + 校验提示）
- `base-form-render`：JSON 驱动渲染

## 五、内置约束（编号红线）

- **F01**：零 HTML5 标签——`<form>` 用 `<div role="form">` + `emit('submit')`；`<label>` 用 `<div class="*-label">`。
- **F02**：组装型——不复制输入控件的实现，通过 v-model 对接 `vue-input-skill` 等独立控件。
- **F03**：校验提示态（error/success）齐全，错误信息可见（四态：loading/error/disabled/重试）。

## 六、变更纪律

改 form 契约 → 同步 `base-form.md` 与 `vue-upload-integration-skill`（依赖 base-form）。

## 七、自检清单

- [ ] 零 HTML5 标签（`<form>` `<label>` 全替代）
- [ ] 组装型（不复制控件实现）
- [ ] 校验四态齐全
