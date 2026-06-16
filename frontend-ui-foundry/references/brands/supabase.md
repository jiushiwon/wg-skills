# Supabase

> 开源 BaaS。**深色 Full**，多角色覆盖数据维度。

---

## 定位

开源 Firebase 替代品。Postgres + Auth + Storage + Realtime + Edge Functions。

## 风格 DNA

- **深色 Full**：深绿 `#3ecf8e` 主色，多角色状态色齐备
- **数据感**：SQL、表格、查询编辑器
- **开发者视角**：代码示例、CLI 演示
- **3D 几何**：绿色渐变球体、抽象几何背景
- **极简文案 + 戏剧性排版**混搭

## 配色

```css
--color-primary: oklch(0.70 0.18 155);        /* 亮绿 */
--color-primary-hover: oklch(0.75 0.20 155);
--color-secondary: oklch(0.60 0.15 200);      /* 青蓝 */
--color-accent: oklch(0.75 0.20 80);          /* 暖黄 */
--color-surface: oklch(0.18 0.01 220);        /* 深蓝黑 */
--color-surface-tinted: oklch(0.22 0.01 220);
--color-on-surface: oklch(0.95 0.005 220);
--color-on-surface-muted: oklch(0.65 0.01 220);
--color-error: oklch(0.65 0.20 25);
--color-warning: oklch(0.75 0.15 80);
```

**HEX**：
- 主绿：`#3ecf8e`
- 背景：`#1c1c1c` / `#0e1111`
- 错误：`#f43f5e`

## 字体

- **Custom Sans**（基于 Inter 但不完全相同）
- **Berkeley Mono**

```css
--font-family-sans: 'Inter', 'Geist', system-ui, sans-serif;
--font-family-mono: 'Berkeley Mono', 'JetBrains Mono', monospace;
```

## 关键组件

| 组件 | 特点 |
|------|------|
| **Nav** | 深色，左 logo + 主导航 |
| **SQL Editor** | Monaco + 自定义主题 |
| **Table View** | 数据表 + 行操作 |
| **Auth UI** | 邮箱/OAuth/魔法链接 |
| **Dashboard Cards** | 项目状态卡 |
| **Hero** | 3D 球体背景 + 大字 |
| **Logo Wall** | 用户 logo |

## 适用场景

- ✅ 后台管理系统
- ✅ 数据仪表盘
- ✅ 监控 / 运维工具
- ✅ 开发者向品牌（深色版）
- ✅ 数据库 / 工具型 SaaS
- ❌ 不适合消费产品（深色 + 数据感太重）
- ❌ 不适合儿童 / 医疗

## 反 AI Slop 关键

- 渐变只在"3D 球体"装饰，**不是文字**
- 数据图表真实且具体
- SQL / 代码示例占大块空间
- 状态色用具体语义（success/warning/error）

## 在 foundry 中使用

调色板选择：**数据深色**（Full，深色默认）
字体配对：**英文数据（IBM Plex）** 或 **英文极简（Geist）**
场景：**admin-dashboard**
