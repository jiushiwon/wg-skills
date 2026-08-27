# uniapp-base-skill

> uni-app 页面组件技能套件。

本技能包含三个子技能 + 三个根容器，覆盖 uni-app 开发中的常用组件与页面场景。

## 子技能

| 子技能 | 说明 |
|--------|------|
| [uniapp-card-skill](./uniapp-card-skill/) | 卡片组件 |
| [uniapp-form-skill](./uniapp-form-skill/) | 表单组件 |
| [uniapp-page-skill](./uniapp-page-skill/) | 页面模板 |

## 根容器（放在仓库根目录）

| 容器 | 说明 | 文档 |
|------|------|------|
| base-card | 基础卡片（所有组件的基石） | [base-card.md](./base-card.md) |
| base-input | 通用输入框（表单基础） | [base-input.md](./base-input.md) |
| base-popup | 弹窗/抽屉（内置 base-card） | [base-popup.md](./base-popup.md) |

## 组件层级

```
根容器 (base-card / base-input / base-popup)
        ↑
  ┌────┴────┬────────┐
  │         │        │
卡片组件  表单组件  弹窗组件
  │         │        │
  └────┬────┴────────┘
        ↑
     页面模板
```

## 依赖关系

| 类型 | 依赖 | 说明 |
|------|------|------|
| 根容器 | 无 | base-card / base-input / base-popup 为最小单位 |
| 表单组件 | 根容器 | switch/radio/select 依赖 base-input |
| 卡片组件 | 根容器 | 卡片布局依赖 base-card |
| 弹窗组件 | 根容器 | **base-popup 内置 base-card** |
| 页面模板 | card + form + popup | 组合使用 |

## 容器原则

> **所有涉及内容容器的组件，都必须使用根容器作为容器**

- 弹窗内容 → base-popup（内置 base-card）
- 输入框容器 → base-card 包裹 input
- 选择器面板 → base-popup + base-select 组合

## 根容器 Demo

| 容器 | Demo |
|------|------|
| base-popup | [4 方向弹窗 demo](./demo-components/base-popup/html/00-showcase.html) |

- [底部弹出](./demo-components/base-popup/html/popup-bottom.html)
- [顶部通知](./demo-components/base-popup/html/popup-top.html)
- [左侧抽屉](./demo-components/base-popup/html/popup-left.html)
- [右侧筛选](./demo-components/base-popup/html/popup-right.html)

## 使用方式

```markdown
/uniapp-base-skill 做一个弹窗
/uniapp-card-skill 做一个卡片
/uniapp-form-skill 做一个输入框
/uniapp-page-skill 做一个商品详情页
```

## 版本

### v2.1.0

- 新增根容器 `base-popup`（内置 base-card）
- 4 方向弹窗 demo
- select-popup / select-cascade 改用 base-popup 容器

### v2.0.0

- 拆分为 3 个子技能
