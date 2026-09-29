# 模糊匹配规则

> 注意：此文件记录内置匹配规则。**项目固化后会动态添加到 _registry.json，不在此文件**

## 导航类匹配

| 用户输入 | 匹配指令 | 优先级 |
|----------|----------|--------|
| 顶部导航 | nav-bar | 1 |
| 导航栏 | nav-bar | 1 |
| header | nav-bar | 1 |
| 头部 | nav-bar | 1 |
| 自定义导航 | nav-bar | 1 |
| 顶部菜单 | nav-bar | 1 |

| 底部tab | tab-bar | 1 |
| 底部导航 | tab-bar | 1 |
| tab切换 | tab-bar | 1 |
| 底部菜单 | tab-bar | 1 |
| tab-bar | tab-bar | 1 |

| top-tab | top-tab | 1 |
| 顶部tab | top-tab | 1 |
| 分类切换 | top-tab | 1 |
| 顶部切换 | top-tab | 1 |

| 侧边栏 | side-menu | 1 |
| 侧边菜单 | side-menu | 1 |
| 抽屉 | side-menu | 1 |
| side-menu | side-menu | 1 |

| 面包屑 | breadcrumb | 1 |
| 路径导航 | breadcrumb | 1 |

---

## 列表类匹配

| 用户输入 | 匹配指令 | 优先级 |
|----------|----------|--------|
| 列表项 | list-item | 1 |
| 单元格 | list-item | 1 |
| list-item | list-item | 1 |

| 商品卡片 | product-card | 1 |
| 商品块 | product-card | 1 |
| 商品 | product-card | 2 |

| 文章卡片 | article-card | 1 |
| 文章块 | article-card | 1 |

| 聊天气泡 | chat-bubble | 1 |
| 消息气泡 | chat-bubble | 1 |
| 对话气泡 | chat-bubble | 1 |

| 时间线 | timeline | 1 |
| 时间轴 | timeline | 1 |

---

## 表单类匹配

| 用户输入 | 匹配指令 | 优先级 |
|----------|----------|--------|
| 搜索栏 | search-bar | 1 |
| 搜索框 | search-bar | 1 |
| 搜索输入 | search-bar | 1 |

| 输入框 | input-field | 1 |
| 表单项 | input-field | 1 |
| input-field | input-field | 1 |

| 选择器 | picker | 1 |
| 下拉选择 | picker | 1 |

| 日期选择器 | date-picker | 1 |
| 日期选择 | date-picker | 1 |

| 开关 | switch | 1 |

---

## 反馈类匹配

| 用户输入 | 匹配指令 | 优先级 |
|----------|----------|--------|
| 轻提示 | toast | 1 |
| toast | toast | 1 |

| 模态框 | modal | 1 |
| 弹窗 | modal | 1 |
| 对话框 | modal | 1 |

| 操作菜单 | action-sheet | 1 |
| 底部菜单 | action-sheet | 1 |
| action-sheet | action-sheet | 1 |

| 加载态 | loading | 1 |
| loading | loading | 1 |

| 空状态 | empty-state | 1 |
| 无数据 | empty-state | 1 |

---

## 业务类匹配

| 用户输入 | 匹配指令 | 优先级 |
|----------|----------|--------|
| 头像 | user-avatar | 1 |
| 用户头像 | user-avatar | 1 |

| 价格 | price-tag | 1 |
| 价格标签 | price-tag | 1 |

| 倒计时 | count-down | 1 |
| countdown | count-down | 1 |

| 进度条 | progress-bar | 1 |
| 进度 | progress-bar | 1 |

| 步进器 | stepper | 1 |
| 计数器 | stepper | 1 |

| 优惠券 | coupon | 1 |
| 券 | coupon | 2 |

---

## 按钮类匹配

| 用户输入 | 匹配指令 | 优先级 |
|----------|----------|--------|
| 主按钮 | btn-primary | 1 |
| 确定 | btn-primary | 1 |
| 提交 | btn-primary | 1 |
| 确认 | btn-primary | 1 |
| primary | btn-primary | 1 |
| 主要按钮 | btn-primary | 1 |

| 次按钮 | btn-secondary | 1 |
| 取消 | btn-secondary | 1 |
| 返回 | btn-secondary | 1 |
| 灰色按钮 | btn-secondary | 1 |
| secondary | btn-secondary | 1 |

| 幽灵按钮 | btn-ghost | 1 |
| 透明按钮 | btn-ghost | 1 |
| 空心按钮 | btn-ghost | 1 |
| ghost | btn-ghost | 1 |
| outline | btn-ghost | 1 |

| 图标按钮 | btn-icon | 1 |
| icon按钮 | btn-icon | 1 |
| 纯图标 | btn-icon | 1 |

---

## 线条类匹配

| 用户输入 | 匹配指令 | 优先级 |
|----------|----------|--------|
| 线 | solid-line | 1 |
| 分割线 | solid-line | 1 |
| 横线 | solid-line | 1 |
| 实线 | solid-line | 1 |

| 虚线 | dashed-line | 1 |
| 点线 | dashed-line | 1 |
| dashed | dashed-line | 1 |

| 渐变线 | gradient-line | 1 |
| 彩线 | gradient-line | 1 |

| 间隔线 | space-line | 1 |
| 带间距的线 | space-line | 1 |

| 竖线 | v-solid-line | 1 |
| 垂直线 | v-solid-line | 1 |

---

## 图形类匹配

| 用户输入 | 匹配指令 | 优先级 |
|----------|----------|--------|
| 半圆 | semi-circle | 1 |
| 半弧 | semi-circle | 1 |
| 圆弧 | semi-circle | 1 |

| 圆形 | circle | 1 |
| 圆 | circle | 1 |

| 圆点 | dot | 1 |
| 点 | dot | 2（优先级较低） |

---

## 组合类匹配

| 用户输入 | 匹配指令 | 优先级 |
|----------|----------|--------|
| icon+文字 | icon-tag | 1 |
| 图标+文字 | icon-tag | 1 |
| 图标标签 | icon-tag | 1 |
| icon标签 | icon-tag | 1 |

| 徽章 | badge | 1 |
| 角标 | badge | 1 |
| 小红点 | badge | 1 |
| badge | badge | 1 |

---

## 卡片类匹配

| 用户输入 | 匹配指令 | 优先级 |
|----------|----------|--------|
| 卡片 | card-basic | 1 |
| card | card-basic | 1 |

| 高卡片 | card-elevated | 1 |
| 高海拔卡片 | card-elevated | 1 |

| 玻璃卡片 | card-glass | 1 |
| 玻璃拟态 | card-glass | 1 |

---

## 匹配优先级规则

1. **精确匹配**：用户输入完全等于指令关键词
2. **包含匹配**：用户输入包含指令关键词
3. **语义匹配**：用户输入含义接近指令

## 匹配流程

```
用户输入 → 预处理(去除空格、转小写) → 匹配表查找 → 返回最佳匹配
```

## 扩展匹配

如需添加新匹配规则，在对应类别的匹配表中添加：
```markdown
| 新关键词 | 匹配指令 | 优先级 |
|----------|----------|--------|
| xxx | btn-primary | 1 |
```
