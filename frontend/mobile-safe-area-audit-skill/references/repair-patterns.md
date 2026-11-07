# 确认后的最小修复模式

先确认项目的真源；下列模式是责任归属示例，不可绕过现有组件、mixin 或 composable 新建平行实现。

## 一、底部固定操作栏

```scss
// Footer 自身负责按钮区和安全区；变量来自项目既有 Token。
.page-footer {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  min-height: var(--footer-action-height);
  padding-bottom: env(safe-area-inset-bottom);
}

// 可滚动内容负责为 Footer 留位置，避免最后一项被遮挡。
.page-content {
  padding-bottom: calc(
    var(--footer-action-height) + env(safe-area-inset-bottom)
  );
}
```

若项目已有 `safe-area-bottom` mixin 或 `PageFooter`，必须优先改为复用它；上例仅用于解释两个责任不能混在一起。

## 二、错误模式

```scss
// 反例：Footer 存在，但内容没有预留，或每页各写一个无来源的魔法值。
.page-content {
  padding-bottom: 120rpx;
}
```

不能把“看起来够用”的 `120rpx` 当成安全区方案；按钮高度、设备安全区和页面 Variant 改变后会立即失真。

## 三、键盘策略

键盘位移只能有一个责任层：

- 输入组件管理键盘：页面不得同时对输入栏叠加 `keyboardHeight`。
- 页面容器管理键盘：输入组件关闭自动顶起，且该约定需写进组件契约。

修复前必须保留原有平台分支，并完成键盘弹起 / 收起和末项可达性真机验证。

