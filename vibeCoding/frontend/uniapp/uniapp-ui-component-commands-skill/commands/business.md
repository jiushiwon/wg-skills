# 业务类组件（business）

> 实现真源：`vibeCoding/frontend/uniapp/uniapp-base-skill/`
> 本文件由 `components/_registry.json` + 各组件 `props.json` 同步生成，**改实现必须重新生成本文件**。
> 重新生成：`node scripts/gen-commands.js`

## 总览

| 组件 | 说明 | 别名 | 类型 |
|------|------|------|------|
| `count-down` | 倒计时组件，支持结束时间戳、相对秒数、格式模板与自定义分段 | 倒计时 / count-down / 秒杀倒计时 / 剩余时间 | 组件 |
| `coupon` | 优惠券卡面组件，外壳基于 BaseCard 根容器 | 优惠券 / coupon / 卡券 / 代金券 | 组件 |
| `price-tag` | 价格展示组件，支持货币符号、划线原价与三档字号 | 价格 / price-tag / 金额展示 / 价钱 | 组件 |
| `progress-bar` | 进度条组件，按状态取主题填充色 | 进度条 / progress-bar / 完成度 / 进度 | 组件 |
| `stepper` | 数量加减控件，支持范围限制、步长与直接输入 | 步进器 / stepper / 数量加减 / 计数器 | 组件 |

---

## count-down 倒计时

**说明**：倒计时组件，支持结束时间戳、相对秒数、格式模板与自定义分段

**别名**：倒计时、count-down、秒杀倒计时、剩余时间

**路径**：`vibeCoding/frontend/uniapp/uniapp-base-skill/components/business/count-down/`

**属性**：

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `target` | `number` | `0` | 结束时间戳(ms)，与 seconds 二选一 |
| `timestamp` | `number` | `0` | 结束时间戳(ms)，兼容旧属性名 |
| `seconds` | `number` | `0` | 相对秒数，从现在起倒计时 |
| `format` | `string` |  | 展示格式模板，支持 DD/HH/mm/ss 占位符 |
| `showDay` | `boolean` | `false` | 是否显示天数 |
| `showUnit` | `boolean` | `true` | 是否显示单位分隔 |
| `endText` | `string` | `已结束` | 倒计时结束文案 |
| `autostart` | `boolean` | `true` | 是否自动开始 |

**事件**：

- `finish`
- `end`

**插槽**：

| 名称 | 说明 |
|------|------|
| `default` | 自定义倒计时内容，作用域含 day/hour/minute/second 与 formatted |
| `end` | 倒计时结束时的内容 |

**用法**：见 [usage.md](../../uniapp-base-skill/components/business/count-down/usage.md)

---

## coupon 优惠券

**说明**：优惠券卡面组件，外壳基于 BaseCard 根容器

**别名**：优惠券、coupon、卡券、代金券

**路径**：`vibeCoding/frontend/uniapp/uniapp-base-skill/components/business/coupon/`

**属性**：

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `'money' | 'discount'` | `money` | 券类型：money 金额券 / discount 折扣券 |
| `value` | `string | number` | `0` | 优惠值 |
| `condition` | `string` |  | 使用条件 |
| `title` | `string` |  | 标题 |
| `desc` | `string` |  | 描述 |
| `date` | `string` |  | 有效期 |
| `status` | `'unused' | 'used' | 'expired'` | `unused` | 状态：未使用 / 已使用 / 已过期 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `showReceive` | `boolean` | `false` | 是否显示领取文案 |
| `received` | `boolean` | `false` | 是否已领取 |
| `currency` | `string` | `¥` | 货币符号 |

**事件**：

- `click`

**用法**：见 [usage.md](../../uniapp-base-skill/components/business/coupon/usage.md)

---

## price-tag 价格标签

**说明**：价格展示组件，支持货币符号、划线原价与三档字号

**别名**：价格、price-tag、金额展示、价钱

**路径**：`vibeCoding/frontend/uniapp/uniapp-base-skill/components/business/price-tag/`

**属性**：

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `price` | `string | number` | `0.00` | 价格 |
| `originalPrice` | `string | number` |  | 原价，划线显示 |
| `size` | `'small' | 'medium' | 'large'` | `medium` | 尺寸 |
| `currency` | `string` | `¥` | 货币符号 |
| `symbol` | `boolean` | `true` | 是否显示货币符号 |
| `decimal` | `boolean` | `true` | 数字价格是否保留两位小数 |

**用法**：见 [usage.md](../../uniapp-base-skill/components/business/price-tag/usage.md)

---

## progress-bar 进度条

**说明**：进度条组件，按状态取主题填充色

**别名**：进度条、progress-bar、完成度、进度

**路径**：`vibeCoding/frontend/uniapp/uniapp-base-skill/components/business/progress-bar/`

**属性**：

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `percent` | `number` | `0` | 进度百分比(0-100)，超出自动截断 |
| `status` | `'primary' | 'success' | 'warning' | 'error'` |  | 状态，决定填充色；为空时取 type |
| `type` | `'primary' | 'success' | 'warning' | 'error'` | `primary` | 状态，兼容旧属性名 |
| `showText` | `boolean` | `true` | 是否显示文字 |
| `text` | `string` |  | 自定义文字，为空时显示百分比 |
| `strokeWidth` | `number` | `6` | 进度条高度(px 值，按 1px=2rpx 换算) |
| `round` | `boolean` | `true` | 是否圆角 |

**用法**：见 [usage.md](../../uniapp-base-skill/components/business/progress-bar/usage.md)

---

## stepper 数量步进器

**说明**：数量加减控件，支持范围限制、步长与直接输入

**别名**：步进器、stepper、数量加减、计数器

**路径**：`vibeCoding/frontend/uniapp/uniapp-base-skill/components/business/stepper/`

**属性**：

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `number` | `0` | 绑定值 |
| `min` | `number` | `0` | 最小值 |
| `max` | `number` | `999` | 最大值 |
| `step` | `number` | `1` | 步长 |
| `disabled` | `boolean` | `false` | 是否禁用整个控件 |
| `editable` | `boolean` | `true` | 是否允许直接输入 |

**事件**：

- `update:modelValue`
- `change`

**用法**：见 [usage.md](../../uniapp-base-skill/components/business/stepper/usage.md)
