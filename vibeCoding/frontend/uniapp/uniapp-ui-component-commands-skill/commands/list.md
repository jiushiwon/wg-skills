# 列表类组件

## list-item 列表项

**说明**：通用列表项，支持图标、箭头、开关

**别名**：列表项、单元格

**属性**：
| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | string | '' | 标题 |
| label | string | '' | 副标题 |
| icon | string | '' | 左侧图标 |
| arrow | boolean | false | 显示右侧箭头 |
| clickable | boolean | false | 可点击态 |

**用法**：
```vue
<list-item title="设置" icon="setting" arrow clickable @click="goSetting" />
<list-item title="头像" label="点击更换">
  <template #right>
    <image src="/avatar.png" />
  </template>
</list-item>
```

---

## product-card 商品卡片

**说明**：商品展示卡片

**别名**：商品、商品块

**属性**：
| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| image | string | '' | 商品图片 |
| title | string | '' | 商品标题 |
| price | string | '' | 价格 |
| originPrice | string | '' | 原价 |
| sales | string | '' | 销量 |
| tag | string | '' | 标签 |

**用法**：
```vue
<product-card
  image="/product.jpg"
  title="商品名称"
  price="99.00"
  originPrice="199.00"
  sales="1000+"
  tag="热卖"
/>
```

---

## article-card 文章卡片

**说明**：文章/内容卡片

**别名**：文章、文章块

**属性**：
| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| image | string | '' | 封面图 |
| title | string | '' | 标题 |
| summary | string | '' | 摘要 |
| author | string | '' | 作者 |
| date | string | '' | 日期 |
| readCount | string | '' | 阅读量 |

**用法**：
```vue
<article-card
  title="文章标题"
  summary="文章摘要..."
  image="/cover.jpg"
  author="作者"
  date="2024-01-01"
/>
```

---

## chat-bubble 聊天气泡

**说明**：对话消息气泡

**别名**：消息气泡、对话气泡

**属性**：
| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| content | string | '' | 消息内容 |
| type | string | 'text' | 内容类型(text/image/voice) |
| position | string | 'left' | 位置(left/right) |
| avatar | string | '' | 头像 |

**用法**：
```vue
<chat-bubble content="你好" position="left" avatar="/avatar1.png" />
<chat-bubble content="有什么可以帮助？" position="right" avatar="/avatar2.png" />
```

---

## timeline 时间线

**说明**：时间轴组件

**别名**：时间轴

**属性**：
| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| items | array | [] | 时间线数据 |

**用法**：
```vue
<timeline :items="[
  { time: '2024-01-01', title: '开始', content: '项目启动' },
  { time: '2024-02-01', title: '进行中', content: '开发中' },
  { time: '2024-03-01', title: '完成', content: '项目上线' }
]" />
```
