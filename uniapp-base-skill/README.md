# uniapp-base-skill

> 基于"一切皆卡片"思想，通过参数组合生成不同形态的页面。核心是 base-card 基础卡片，chat/product 等案例展示如何组合。

## 核心理念

> **所有页面都是由"卡片容器 + 内容"组成，通过调整宽高、背景色、圆角、内外边距等参数，可以组合出任意形态。**

## 强制规范 ⚠️

### 1. 必须使用 uniapp-theme-skill 主题系统

```ts
// ✅ 正确
:style="{ background: 'var(--color-primary)' }"

// ❌ 禁止
:style="{ background: '#07c160' }"
```

### 2. 禁止使用 H5 标签

- ❌ `div` / `p` / `span` / `img`
- ✅ `view` / `text` / `image`

### 3. 禁止 scroll-view

使用页面级滚动，避免右边距问题。

### 4. 禁止原生 button

使用 view 模拟按钮。

## 文件结构

```
uniapp-base-skill/
├── SKILL.md              # 系统介绍 + 规范 + 版本日志
├── README.md             # 本文件
├── demo.html             # 演示页面
├── base-card.md          # 核心：基础卡片
└── demo-components/      # Demo 案例
    ├── chat.md
    └── product.md
```

## 核心：base-card

[查看 base-card 完整文档](base-card.md)

## Demo 案例

> ⚠️ demo-components 目录下的案例是 demo 示例，非完美实现，仅供参考。

[查看 demo-components/chat.md](demo-components/chat.md)  
[查看 demo-components/product.md](demo-components/product.md)

## 触发词

- 按钮 / 设置项 / 输入框 / 头像 / 卡片
- 聊天页 / 商品详情

## 使用前提

1. **必须安装** uniapp-theme-skill
2. 了解基础 CSS
3. 测试时兼顾小程序和 App 端

---

## 版本日志

### v1.0.0 (2025-08-07)

**初始版本**

- ✅ base-card 基础卡片
- ✅ chat-page 聊天页案例
- ✅ product-page 商品页案例
- ✅ 强制规范（主题变量/H5标签/scroll-view/button）
- ✅ APP 端兼容性规范

**后续迭代**

- [ ] profile 案例（个人中心）
- [ ] search 案例（搜索页）
- [ ] list 案例（列表页）
- [ ] 完善基础组件代码
