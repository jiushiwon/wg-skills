# frontend-icon-skill 模板清单

## 模板总数：18

| 分类 | 名称 | 用途 |
|------|------|------|
| menu | dashboard | 仪表盘首页 |
| menu | user | 用户管理 |
| menu | role | 角色权限 |
| menu | menu | 菜单管理 |
| menu | settings | 系统设置（齿轮） |
| menu | tree | 树形结构（组织/分类） |
| menu | building | 组织架构 / 企业 |
| menu | box | 物料 / 仓库 / 模块 |
| menu | chart | 数据统计 / 报表 |
| action | edit | 编辑 |
| action | delete | 删除 |
| action | add | 新增 |
| action | search | 搜索 |
| action | logout | 退出登录 |
| status | success | 成功状态 |
| status | warning | 警告状态 |
| arrow | chevron-down | 下拉/展开箭头 |
| arrow | chevron-left | 收起/返回箭头 |

## 添加新模板

1. 在对应分类目录下新建 `<name>.svg.template`
2. SVG 内容使用 3 个占位符：`{{size}}` `{{color}}` `{{strokeWidth}}`
3. 在 `src/registry.ts` 的 `TEMPLATE_REGISTRY` + `RAW_TEMPLATES` 中同步注册（内联）
4. 跑 `node --experimental-strip-types test/generate.test.ts` 验证（同步改总数断言）

## SVG 模板示例

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="{{size}}" height="{{size}}" viewBox="0 0 24 24" fill="none" stroke="{{color}}" stroke-width="{{strokeWidth}}" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10"/>
  <path d="..."/>
</svg>
```

风格保持 lucide 一致：`viewBox="0 0 24 24"` + `stroke-linecap="round"` + `stroke-linejoin="round"` + `fill="none"`。

## BaseIcon 别名登记

模板就绪后，如需 kebab-case 业务名（如 `users` → `user`、`layout-dashboard` → `dashboard`），
在 `src/registry.ts` 的 `TEMPLATE_ALIASES` 中登记别名，`BaseIcon.vue` 与 `png.ts` 会自动生效。