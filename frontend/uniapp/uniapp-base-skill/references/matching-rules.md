# 模糊匹配规则

> 本文件记录内置匹配规则。**项目固化后的组件会动态添加到 `_registry.json`，不在此文件重复登记。**
>
> 上位规范：[uniapp/AGENTS.md](../../AGENTS.md)　个体规范：[../STANDARD.md](../STANDARD.md)

## 一、匹配优先级

从高到低：

1. **用户点名组件名**（`base-card` / `picker` / `date-picker`）→ 直接命中。
2. **用户点名别名**（`navbar` / `滚轮选择器` / `空状态`）→ 按别名表命中。
3. **语义描述**（"做一个能滚着选日期的"）→ 按下方分类表做包含匹配。
4. **同名冲突** → 走 §3 的冲突裁决表。

## 二、容器优先（先于组件匹配）

需求里出现下列**内容型词汇**时，**先匹配根容器**，再匹配具体组件：

| 需求词汇 | 先匹配到 |
|---------|---------|
| 卡片 / 面板 / 卡片块 | `base-card` |
| 弹窗 / 抽屉 / 底部面板 / 遮罩 | `base-popup` |
| 表单项 / 带标签的输入行 | `base-form-item` |
| 头像 / 用户头像 | `base-avatar` |
| 顶部导航 / 导航栏 | `base-navbar` |
| 底部导航 / 底部菜单 / tab 栏 | `base-tabbar` |

> 判据：这句话描述的是"**外壳**"还是"**内容**"？
> "做一个卡片" → 外壳 → `base-card`；
> "做一个商品卡片" → 内容 → `product-card`（其外壳已由 `base-card` 提供）。

## 三、分类匹配表

### 3.0 根容器（container）

| 用户输入 | 匹配指令 | 优先级 |
|----------|----------|--------|
| 卡片 / 面板 / 卡片块 / 卡片容器 | `base-card` | 1 |
| 弹窗 / 抽屉 / 底部面板 / 弹层容器 | `base-popup` | 1 |
| 表单项 / 带标签的输入行 / 表单行容器 | `base-form-item` | 1 |
| 头像 / 用户头像 / 圆形头像 / avatar | `base-avatar` | 1 |
| 顶部导航 / 导航栏 / 头部栏 | `base-navbar` | 1 |
| 底部导航 / 底部菜单 / tab 栏 | `base-tabbar` | 1 |

> 本表与 §2「容器优先」等价，§2 优先于本表；本表用于补全同义说法。

### 3.1 导航类

| 用户输入 | 匹配指令 | 优先级 |
|----------|----------|--------|
| 顶部导航 / 导航栏 / 头部 / header / 自定义导航 / 顶部菜单 | `base-navbar` | 1 |
| 底部tab / 底部导航 / tab切换 / 底部菜单 / tab-bar | `base-tabbar` | 1 |
| 顶部tab / 分类切换 / 顶部切换 / top-tab | `top-tab` | 1 |
| 侧边栏 / 侧边菜单 / 抽屉 / side-menu | `side-menu` | 1 |
| 面包屑 / 路径导航 / 层级路径 / breadcrumb | `breadcrumb` | 1 |

### 3.2 列表类

| 用户输入 | 匹配指令 | 优先级 |
|----------|----------|--------|
| 列表项 / 单元格 / 列表行 / 条目 / list-item | `list-item` | 1 |
| 商品卡片 / 商品块 / 商品卡 / product-card | `product-card` | 1 |
| 商品 | `product-card` | 2 |
| 文章卡片 / 文章块 / 资讯卡片 / article-card | `article-card` | 1 |
| 聊天气泡 / 消息气泡 / 对话气泡 / 气泡 / chat-bubble | `chat-bubble` | 1 |
| 时间线 / 时间轴 / timeline | `timeline` | 1 |

### 3.3 表单类

| 用户输入 | 匹配指令 | 优先级 |
|----------|----------|--------|
| 搜索栏 / 搜索框 / 搜索输入 / search-bar | `search-bar` | 1 |
| 输入框 / 表单项 / 输入项 / input-field | `input-field` | 1 |
| 选择器 / 下拉选择 / 滚轮选择 / 滚轮选择器 / picker | `picker` | 1 |
| 日期选择器 / 日期选择 / 年月日选择 / 日期滚轮 / date-picker | `date-picker` | 1 |
| 开关 / 切换开关 / toggle / switch | `switch` | 1 |
| 复选框 / 多选框 / 多选 / checkbox-group | `checkbox-group` | 1 |
| 单选框 / 单选按钮 / radio / radio-group | `radio-group` | 1 |

### 3.4 反馈类

| 用户输入 | 匹配指令 | 优先级 |
|----------|----------|--------|
| 轻提示 / 提示 / 操作反馈 / toast | `toast` | 1 |
| 模态框 / 对话框 / 确认框 / 确认弹窗 / modal | `modal` | 1 |
| 操作菜单 / 操作面板 / 底部菜单弹层 / 动作列表 / action-sheet | `action-sheet` | 1 |
| 加载态 / 加载 / 加载动画 / 转圈 / loading | `loading` | 1 |
| 空状态 / 空页面 / 暂无数据 / 空列表占位 / empty-state | `empty-state` | 1 |

### 3.5 业务类

| 用户输入 | 匹配指令 | 优先级 |
|----------|----------|--------|
| 价格 / 价格标签 / 金额展示 / 价钱 / price-tag | `price-tag` | 1 |
| 倒计时 / 秒杀倒计时 / 剩余时间 / count-down | `count-down` | 1 |
| 进度条 / 完成度 / 进度 / progress-bar | `progress-bar` | 1 |
| 步进器 / 数量加减 / 计数器 / stepper | `stepper` | 1 |
| 优惠券 / 卡券 / 代金券 / coupon | `coupon` | 1 |
| 券 | `coupon` | 2 |

### 3.6 样式类（纯 CSS 类，不是组件）

| 用户输入 | 匹配指令 | 优先级 |
|----------|----------|--------|
| 主按钮 / 确定 / 提交 / 确认 / primary / 主要按钮 | `btn-primary` | 1 |
| 次按钮 / 取消 / 返回 / 灰色按钮 / secondary | `btn-secondary` | 1 |
| 幽灵按钮 / 透明按钮 / 空心按钮 / ghost / outline | `btn-ghost` | 1 |
| 图标按钮 / icon按钮 / 纯图标 | `btn-icon` | 1 |
| 线 / 分割线 / 横线 / 实线 | `solid-line` | 1 |
| 虚线 / 点线 / dashed | `dashed-line` | 1 |
| 渐变线 / 彩线 | `gradient-line` | 1 |
| 间隔线 / 带间距的线 | `space-line` | 1 |
| 竖线 / 垂直线 | `v-solid-line` | 1 |
| 半圆 / 半弧 / 圆弧 | `semi-circle` | 1 |
| 圆形 / 圆 | `circle` | 1 |
| 圆点 / 点 | `dot` | 2 |
| icon+文字 / 图标+文字 / 图标标签 / icon标签 | `icon-tag` | 1 |
| 徽章 / 角标 / 小红点 / badge | `badge` | 1 |
| 卡片样式 / card 样式类 | `card-basic` | 1 |
| 高卡片 / 高海拔卡片 | `card-elevated` | 1 |
| 玻璃卡片 / 玻璃拟态 | `card-glass` | 1 |

## 四、冲突裁决

当同一句话能命中多个候选时：

| 冲突场景 | 裁决 |
|---------|------|
| "弹窗" vs "底部菜单" | 明确说"底部"→`action-sheet`；只说"弹窗"→`base-popup`（容器优先） |
| "底部导航" vs "底部菜单弹层" | 带"弹层/面板/动作"→`action-sheet`；否则→`base-tabbar` |
| "卡片" vs "商品卡片" | 带商品/文章/列表等定语→具体卡片组件；否则→`base-card` |
| "选择器" vs "日期选择器" | 带日期/年月日/时间→`date-picker`；否则→`picker` |
| 容器 vs 组件 | **一律容器优先**（§2） |

## 五、匹配流程

```
用户输入
   预处理（去空格、统一大小写）
   ① 命中组件名 / 别名？
   ② 含内容型词汇？ 先给根容器
   ③ 查分类匹配表  返回最佳匹配
   ④ 未命中  走固化流程新建组件
```

## 六、扩展匹配

新增组件时，同步三处：

1. `components/_registry.json`：加一条记录（`name` / `title` / `kind` / `category` / `aliases` / `path`）；
2. `commands/<category>.md`：加对应条目；
3. 本文件：在对应分类表加关键词行。
