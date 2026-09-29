# brand — 品牌风格套用

将指定品牌的视觉语言（调色 + 字体 + 组件风格）套用到目标项目。

## 用法

```
brand <name> [path] [--component button|card|nav|all] [--preview]
```

### 品牌选择

引用 `references/brands/index.md`，支持 58 个品牌。

### 参数

| 参数 | 说明 | 默认 |
|------|------|------|
| `<name>` | 必填，品牌名 | — |
| `[path]` | 目标路径 | cwd |
| `--component` | 套用到哪些组件 | all |
| `--preview` | 只预览不修改 | 否 |

## 支持的品牌（10 个详细卡）

`stripe` / `linear` / `vercel` / `apple` / `supabase` / `mintlify` / `revolut` / `lovable` / `cursor` / `claude`

其他 48 个品牌用通用规则（见 [brands/index.md](../brands/index.md)）。

## 流程

### 1. 加载品牌

读取 `references/brands/<name>.md`，获取：
- 风格 DNA
- 配色（OKLCH / HEX）
- 字体配对
- 关键组件
- 适用/不适用场景
- 反 AI Slop 关键

### 2. 检测目标

```bash
node scripts/detect-stack.mjs [path]
```

识别技术栈，决定如何应用。

### 3. 派生 Token

按品牌规格生成 Token：
- 调色板（主/副/辅/背景/文字/边框/状态）
- 字体（家族/字号阶/字重/行高）
- 圆角（按品牌调性）
- 阴影（按品牌调性）
- 动效（按品牌调性）

### 4. 应用组件（按 `--component`）

#### button（按钮）

```css
/* 例：Stripe 风格 */
.button-primary {
  background: var(--color-primary);  /* 紫蓝 */
  color: var(--color-primary-foreground);
  border-radius: var(--radius-md);
  padding: 0 var(--space-4);
  height: 40px;
  font-weight: 500;
  transition: background-color 150ms var(--ease-out-quart);
}
.button-primary:hover {
  background: var(--color-primary-hover);
}
.button-primary:active {
  transform: scale(0.98);
}
```

#### card（卡片）

```css
/* 例：Linear 风格（紧凑几何） */
.card {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);  /* 8px，克制 */
  padding: var(--space-4);
  transition: border-color 150ms;
}
.card:hover {
  border-color: var(--color-border-strong);
}
```

#### nav（导航）

按品牌风格调整（顶栏 vs 侧栏、紧凑 vs 宽松、阴影 vs 边框）。

### 5. 预览 / 应用

`--preview`：在临时文件渲染，不写实际项目
不加：直接修改 `src/styles/tokens.css` 等

## 输出：`brand-report.md`

```markdown
# Brand Apply Report — <name>

> 品牌：Stripe
> 目标：/path/to/project
> 技术栈：React Next.js 14
> 时间：2024-XX-XX

---

## 品牌画像

### 风格 DNA
- 暖色 Committed
- 排版戏剧性
- 细节狂魔
- 非典型落地页

### 调色板
- 主色：#ff6e40 橙红
- 副色：#635bff 紫蓝
- 强调：#d4a574 金黄
- 背景：#fffbf5 暖白

### 字体
- 标题：Cabinet Grotesk（替代 Sohne）
- 正文：Cabinet Grotesk
- 等宽：JetBrains Mono（替代 Berkeley Mono）

## 套用范围

- [x] 全局 Token（颜色/字体/间距/圆角/阴影/动效）
- [x] 基础组件（Button、Input、Card）
- [x] 导航（Header、Footer）
- [ ] 业务组件（保留业务逻辑）

## 修改清单

| # | 文件 | 修改 |
|---|------|------|
| 1 | src/styles/tokens.css | 完整替换为 Stripe 调色 |
| 2 | tailwind.config.ts | 更新 colors 映射 |
| 3 | components/Button.tsx | 调整圆角到 8px |
| ... |

## 风险评估

- 调色板变更：中等（需验证所有页面）
- 字体变更：低（提供回退）
- 圆角变更：低（统一阶梯）
- 阴影变更：低

## 回滚

```bash
git checkout HEAD -- src/styles/tokens.css tailwind.config.ts components/Button.tsx
```
```

## 注意事项

- **品牌 ≠ 个人审美**：套用品牌需忠实于品牌 DNA
- **避免"反 AI Slop 关键"中的错误**：每个品牌有特定陷阱
- **保留业务逻辑**：只改视觉层
- **对比度验证**：替换后必须验证 WCAG
- **可访问性优先**：不要为了品牌牺牲 a11y

## 适用场景

- 公司要重塑品牌（rebrand）
- 收购/合并后统一
- 新项目按指定品牌开建
- 营销活动套用临时品牌（季节性）

## 不适用

- 已经定型的成熟产品（用 `optimize` 微调）
- 没有明确品牌方向（用 `forge` 探索）
- 纯代码问题（用 `audit`）
