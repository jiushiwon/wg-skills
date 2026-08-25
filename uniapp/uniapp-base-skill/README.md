# uniapp-base-skill

> uni-app 页面组件技能套件。

本技能包含三个子技能，覆盖 uni-app 开发中的常用组件与页面场景。

## 子技能

| 子技能 | 说明 |
|--------|------|
| [uniapp-card-skill](./uniapp-card-skill/) | 卡片组件 |
| [uniapp-form-skill](./uniapp-form-skill/) | 表单组件 |
| [uniapp-page-skill](./uniapp-page-skill/) | 页面模板 |

## 组件层级

```
根组件 (base-card / base-input)
        ↑
  ┌────┴────┐
  │          │
卡片组件    表单组件
  │          │
  └────┬────┘
        ↑
     页面模板
```

## 依赖关系

| 类型 | 依赖 | 说明 |
|------|------|------|
| 根组件 | 无 | base-card、base-input 为最小单位 |
| 表单组件 | 根组件 | switch/radio/select 依赖 base-input |
| 卡片组件 | 根组件 | 卡片布局依赖 base-card |
| 弹窗组件 | 根组件 | popup 属于页面性质 |
| 页面模板 | card + form | 组合使用卡片和表单组件 |

## 使用方式

```markdown
/uniapp-card-skill 做一个卡片
/uniapp-form-skill 做一个输入框
/uniapp-page-skill 做一个商品详情页
```

## 版本

v2.0.0 - 拆分为 3 个子技能
