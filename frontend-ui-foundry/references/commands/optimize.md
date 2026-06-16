# optimize — 一键智能重构

对现有项目（HTML/Vue/React/uniapp/小程序）智能识别技术栈、提取当前设计、匹配品牌画像、应用统一 Token，全局优化。

## 用法

```
optimize [path] [--strategy conservative|gradual|reshape] [--brand <name>] [--report-only] [--dry-run]
```

### 参数

| 参数 | 说明 | 默认 |
|------|------|------|
| `[path]` | 项目路径 | cwd |
| `--strategy` | 优化策略 | gradual |
| `--brand` | 目标品牌 | 自动匹配 |
| `--report-only` | 只输出报告不修改 | 否 |
| `--dry-run` | 试运行（输出 diff 不写入） | 否 |

### 策略

| 策略 | 风险 | 说明 |
|------|------|------|
| `conservative` | 低 | 保留现状，只统一不一致项 |
| `gradual` | 中 | 对齐到匹配品牌 80%（默认） |
| `reshape` | 高 | 完全套用某品牌/场景 Token |

## 5 步流水线

### 1. detect-stack

调用 `scripts/detect-stack.mjs` 识别项目：
- 技术栈（React/Vue/uniapp/...）
- 框架版本
- UI 库
- 项目规模

输出：
```json
{
  "stack": "vue-nuxt",
  "framework": "Nuxt 3",
  "version": "3.13.0",
  "ui": "Element Plus",
  "scale": "medium",
  "files": { "componentCount": 87 }
}
```

### 2. extract-tokens

调用 `scripts/extract-tokens.mjs` 从代码提取事实 Token：
- 颜色（频次统计）
- 字体（家族、字号、字重）
- 间距（padding/margin/gap）
- 圆角
- 阴影
- 动效时长
- 断点

输出包含一致性警告：
- 颜色 > 30 种 → 缺少 Token 化
- 间距 < 70% 在 4pt 网格
- 圆角 > 8 种不一致
- 字体 > 5 种太多

### 3. match-profile

调用 `scripts/match-profile.mjs` 匹配调色板 + 字体画像：
- 调色板（10 套）匹配
- 字体（中文/英文/编辑/数据）
- 圆角/间距一致性分析
- 推荐优化策略

输出：
```json
{
  "bestMatch": { "name": "冷调极简", "score": 0.78 },
  "fontProfile": "chinese-tech",
  "drift": [
    "约 35% 间距值不在 4pt 网格上",
    "圆角有 12 种不同值"
  ],
  "strategy": "gradual"
}
```

### 4. apply

按策略 + 技术栈应用变更：

**只改视觉相关属性**，**不改业务代码**：

| 改 | 不改 |
|----|------|
| 颜色值（→ CSS 变量） | API 调用 |
| 内联样式（→ 工具类 / 变量） | 数据结构 |
| 魔法数字（→ Token） | 状态管理 |
| 重复样式（→ 公共组件） | 路由配置 |
| 圆角/阴影/动效 | props / event |
| 字号（→ token） | 业务逻辑 |

#### 实施方式

**Vue/React/uniapp**：
1. 在 `src/styles/tokens.css` 写入完整 Token
2. 在 `main.ts` / `App.vue` 引入
3. 替换硬编码颜色为 `var(--color-*)`
4. 替换 px 字号为 token
5. 替换 px 间距为 token
6. 统一圆角到阶梯

**HTML+Tailwind**：
1. 替换 `tailwind.config.js` 完整 token
2. 替换自定义 class 为 token
3. 移除 arbitrary value（如 `text-[#c45c48]` → `text-primary`）

**每个修改**：
- 提供 before/after diff
- 记录文件路径 + 行号
- **不允许**改业务逻辑

### 5. verify

调用 `scripts/verify-output.mjs` 验证：
- 构建/编译是否通过
- 触摸目标 ≥44pt
- 间距在 4pt 网格
- viewport 配置正确
- 减弱动效支持
- 颜色 Token 化
- AI slop 模式检查

输出汇总：
```
=== 总结 ===
✅ 通过: 6 | ⚠️ 警告: 2 | ❌ 失败: 0
```

## 输出：`optimize-report.md`

```markdown
# Optimize Report — <project>

> 时间：2024-XX-XX
> 路径：/path/to/project
> 策略：gradual

---

## 1. 项目画像

| 维度 | 值 |
|------|---|
| 技术栈 | vue-nuxt |
| 框架 | Nuxt 3.13.0 |
| UI 库 | Element Plus |
| 规模 | medium (87 组件) |
| 语言 | TypeScript |

## 2. 当前 Token 现状

| 类别 | 独立值 | 一致性 |
|------|--------|--------|
| 颜色 | 47 | ⚠️ 过多 |
| 字号 | 12 | ✅ 适中 |
| 间距 | 28 | ⚠️ 35% 不在网格 |
| 圆角 | 12 | ⚠️ 需收敛 |
| 字体 | 3 | ✅ |

## 3. 匹配画像

**最佳匹配**：冷调极简（score 0.78）
**字体画像**：chinese-tech
**当前漂移**：
- 约 35% 间距值不在 4pt 网格上
- 圆角有 12 种不同值
- 检测到 47 种独立颜色值

## 4. 优化策略

**推荐**：gradual（渐进式 80% 对齐）
**说明**：保留业务代码，视觉层对齐到"冷调极简"调色板 + 完整 4pt 网格 + 6 档圆角

## 5. 修改清单

| # | 文件 | 改前 | 改后 | 风险 |
|---|------|------|------|------|
| 1 | src/components/Card.vue:23 | `padding: 13px` | `padding: var(--space-3)` | 低 |
| 2 | src/styles/global.css:8 | `#c45c48` | `var(--color-primary)` | 低 |
| 3 | src/components/Button.vue:45 | `border-radius: 6px` | `var(--radius-md)` | 低 |
| ... |

## 6. 新增文件

- [src/styles/tokens.css](新增完整 Token)
- [src/styles/migration-tokens.css](兼容旧值的过渡映射)

## 7. 回滚方案

```bash
git checkout HEAD -- src/
```

## 8. 验证结果

```
=== 总结 ===
✅ 通过: 6 | ⚠️ 警告: 2 | ❌ 失败: 0
```

| 检查 | 状态 |
|------|------|
| 构建 | ✅ pass |
| Token 文件 | ✅ pass |
| viewport | ✅ pass |
| 触摸目标 | ✅ pass |
| 4pt 网格 | ⚠️ warn (23%) |
| 减弱动效 | ✅ pass |
| 颜色 Token | ✅ pass |
| AI Slop | ✅ pass |

## 9. 截图对比

[原图] vs [优化后]

## 10. 后续建议

1. 跟进 23% 离网间距（多为表单 magic number）
2. 收敛圆角到 6 档（已用 12 档）
3. 补暗色模式 token
```

## 示例

```bash
# 优化当前目录
optimize

# 优化指定项目
optimize /path/to/project

# 保守策略（只统一不一致）
optimize --strategy conservative

# 重塑为赤琥金
optimize --brand vermilion-amber --strategy reshape

# 只看报告
optimize --report-only

# 试运行（不写文件）
optimize --dry-run
```

## 注意事项

- **绝不修改业务逻辑**：API、状态、路由、props、event 保持原样
- **不破坏可访问性**：对比度、触摸目标、键盘导航
- **不引入 AI slop**：自检
- **提供回滚**：git diff + 完整报告
- **保守优先**：默认 gradual 策略，避免大幅改动
