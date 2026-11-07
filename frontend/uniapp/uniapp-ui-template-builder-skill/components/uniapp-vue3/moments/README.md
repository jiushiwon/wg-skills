# 朋友圈 / 动态列表组件

> 参考微信朋友圈风格的动态列表组件模板。

## 文件

```
moments/
├── moments.vue    # 动态列表组件
└── README.md      # 本文件
```

## 功能

- 顶部封面 + 个人头像
- 动态列表：头像、昵称、正文、图片网格
- 点赞 / 评论操作入口
- 发布时间

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| cover | string | - | 顶部封面图 |
| user | object | - | 当前用户（头像、昵称） |
| list | array | [] | 动态列表数据 |

## 使用示例

```vue
<template>
  <view class="page">
    <moments-list :cover="cover" :user="user" :list="moments" />
  </view>
</template>

<script setup>
import MomentsList from '@/components/uniapp-vue3/moments/moments.vue'

const cover = 'https://picsum.photos/750/300'
const user = { avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', nickname: '我' }
const moments = [
  {
    id: '1',
    user: { avatar: '...', nickname: '好友A' },
    content: '今天天气不错～',
    images: ['https://picsum.photos/300/300?random=1'],
    time: '10分钟前',
    likes: 12,
    comments: 3
  }
]
</script>
```
