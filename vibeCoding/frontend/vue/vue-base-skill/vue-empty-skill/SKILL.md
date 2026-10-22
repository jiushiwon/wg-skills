---
name: vue-empty-skill
description: Vue 空状态组件技能。用于列表无数据、搜索无结果、暂无内容等场景。
trigger: |
  做一个空状态 | 做一个无数据 | 做一个暂无内容
  做一个空列表 | 做一个空结果 | 做一个占位图
---

# vue-empty-skill

> Vue 空状态组件技能。基于 Vue主题-skill 的 Token 实现，零第三方组件库。

## 核心组件

| 组件 | 说明 |
|------|------|
| **base-empty** | 通用空状态（图标+文字+操作按钮） |

## 场景矩阵

| 场景 | 描述 |
|------|------|
| 无数据 | 列表/表格无数据 |
| 无结果 | 搜索/筛选无结果 |
| 暂无内容 | 内容为空 |
| 自定义 | 自定义图标+文案 |

## 文件结构

```
vue-empty-skill/
├── SKILL.md
├── README.md
├── base-empty.md
├── types/
│   └── empty.ts
├── templates/
│   ├── BaseEmpty.vue
│   └── index.ts
└── demo-components/
    └── base-empty/
        └── html/01-all-scenes.html
```

## 使用示例

```vue
<!-- 无数据 -->
<base-empty description="暂无数据" />

<!-- 带操作按钮 -->
<base-empty description="暂无数据" action-text="新建" @action="handleCreate" />

<!-- 自定义图标 -->
<base-empty :image="EmptyIllustration" description="暂无内容" />
```

## 容器原则

> 空状态组件必须嵌入 base-card 或业务组件内使用。

```vue
<base-card title="用户列表">
  <base-empty v-if="list.length === 0" description="暂无用户" />
  <base-table v-else :data="list" />
</base-card>
```

## 设计 Token

```css
.base-empty {
  padding: var(--space-6);
  text-align: center;
}

.base-empty__description {
  margin-top: var(--space-3);
  color: var(--color-text-secondary);
  font-size: var(--font-base);
}
```

**禁止硬编码任何颜色 / 间距 / 字号值。**

## 第三方组件库

❌ 禁止 Element Plus / Naive UI / Ant Design Vue / Vuetify / PrimeVue。
