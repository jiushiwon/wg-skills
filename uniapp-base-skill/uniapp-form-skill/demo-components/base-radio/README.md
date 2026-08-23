# base-radio 单选框

> 通用单选组件，支持圆圈、打钩、标签、卡片、按钮组、列表式、芯片、图片等多种形态。开关功能已整合。

## 形态

- **基础单选** (8种)：circle, check, tag, card, button, list, chips, image
- **开关形态** (5种)：standard, square, icon, card, ios

## 使用

```vue
<base-radio
  v-model="value"
  type="circle"
  :options="[
    { label: '选项一', value: '1' },
    { label: '选项二', value: '2' }
  ]"
/>
```

## 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| v-model | any | - | 选中值 |
| type | string | circle | 类型 |
| options | array | [] | 选项列表 |
| position | string | left | 圆圈位置(left/right) |
| showIcon | boolean | true | 显示图标 |
| showArrow | boolean | false | 显示箭头 |
| showPrice | boolean | false | 显示价格 |
| disabled | boolean | false | 禁用 |

## HTML 演示

- [radio-circle.html](html/radio-circle.html) - 标准圆圈
- [radio-check.html](html/radio-check.html) - 打钩风格
- [radio-tag.html](html/radio-tag.html) - 标签排列
- [radio-card.html](html/radio-card.html) - 卡片式
- [radio-button.html](html/radio-button.html) - 按钮组
- [radio-list.html](html/radio-list.html) - 列表式
- [radio-chips.html](html/radio-chips.html) - 芯片风格
- [radio-image.html](html/radio-image.html) - 图片选项
- [switch-standard.html](html/switch-standard.html) - 标准胶囊开关
- [switch-square.html](html/switch-square.html) - 方形开关
- [switch-icon.html](html/switch-icon.html) - 图标按钮开关
- [switch-card.html](html/switch-card.html) - 卡片开关
- [switch-ios.html](html/switch-ios.html) - iOS风格开关
