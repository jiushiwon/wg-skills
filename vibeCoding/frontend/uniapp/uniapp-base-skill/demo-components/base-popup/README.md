# base-popup 弹窗容器

> **根目录通用容器**（与 `base-card` / `base-input` 同级）。
> slide in/out 动画 + 4 方向弹出 + **内置 base-card**。

## 4 种方向

| # | 方向 | 圆角位置 | 场景 | HTML |
|---|------|----------|------|------|
| 00 | 总览 | — | 4 方向对比 | [html/00-showcase.html](html/00-showcase.html) |
| 01 | bottom | 顶部两角 | 操作菜单、分享 | [html/popup-bottom.html](html/popup-bottom.html) |
| 02 | top | 底部两角 | 系统通知 | [html/popup-top.html](html/popup-top.html) |
| 03 | left | 右侧两角 | 侧滑抽屉 | [html/popup-left.html](html/popup-left.html) |
| 04 | right | 左侧两角 | 筛选面板 | [html/popup-right.html](html/popup-right.html) |

## 核心特性

- **slide in/out 动画**：CSS transform + transition，duration 可配
- **4 方向弹出**：top / bottom / left / right，圆角自动应用在对应角
- **内置 base-card**：所有 demo 内部结构都遵循 base-card 的 `header / body / footer`
- **mask 遮罩**：可选 + 点击关闭
- **safe area**：适配 iPhone 安全区域

## 容器原则

> base-popup 是**根目录容器**，内部封装 base-card。

```vue
<base-popup v-model:show="show" direction="bottom" title="分享">
  <!-- 默认 slot：弹窗主体 -->
  <view class="menu-item">微信好友</view>

  <!-- 转发给内部 base-card -->
  <template #footer>
    <button>取消</button>
    <button type="primary">分享</button>
  </template>
</base-popup>
```

## 组合使用

`base-popup` + 其他组件的常见组合：

```vue
<!-- base-popup + base-select（选择器面板） -->
<base-popup v-model:show="show" direction="bottom">
  <base-select v-model="city" :options="cities" type="cascade" />
</base-popup>

<!-- base-popup + base-radio（确认弹窗） -->
<base-popup v-model:show="show" direction="center" title="选择支付方式">
  <base-radio v-model="pay" :options="pays" />
</base-popup>
```

## 规格文档

- [base-popup.md](../../base-popup.md) — 完整 Props / 内置 base-card 说明

## 相关组件

- [base-card.md](../../base-card.md) — 卡片容器（base-popup 内置）
- [uniapp-form-skill](../../uniapp-form-skill/) — base-select / base-radio 等表单组件
- [uniapp-page-skill](../../uniapp-page-skill/) — 业务页面层