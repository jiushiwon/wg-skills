# unify — 设计统一化

对多页面 / 多模块 / 多端的设计变体进行收敛，统一到同一套设计系统。

## 用法

```
unify [path] [--scope pages|components|stacks] [--baseline <brand>]
```

## 适用场景

- 同一产品有多个营销页（landing1、landing2、landing3...）风格不统一
- 多端产品（Web、App、小程序）视觉分裂
- 多个团队维护同一产品，各自有"方言"
- 收购/合并后需要统一品牌

## 流程

### 1. 收集变体

扫描所有目标文件，提取 Token 用法：
- 颜色（每种用法的文件 + 出现位置）
- 字体
- 间距
- 圆角
- 阴影
- 组件用法（不同页面用不同实现）

### 2. 收敛

按"使用频次 × Token 接近度"分组：

```
group-1: #c45c48 + #c85948 + #bd5640 → 收敛为 --color-primary
group-2: padding: 13px + 17px + 15px → 收敛为 --space-4 (16px)
group-3: border-radius: 6px + 5px + 7px → 收敛为 --radius-md (8px)
```

### 3. 替换

按使用频次从高到低替换，确保不影响构建。

### 4. 验证

- 构建通过
- 视觉对比（截图 diff）
- 死代码检测

## 详细步骤

### Step 1：检测项目

```bash
node scripts/detect-stack.mjs /path/to/project
```

### Step 2：提取全部 Token

```bash
node scripts/extract-tokens.mjs /path/to/project > tokens.json
```

### Step 3：分析变体

输出每个 Token 维度的"使用散度"：

```json
{
  "primaryColor": {
    "values": {
      "#c45c48": { "count": 23, "files": ["page1.vue", "page2.vue"] },
      "#c85948": { "count": 5, "files": ["page3.vue"] },
      "#bd5640": { "count": 2, "files": ["page4.vue"] }
    },
    "recommendation": "收敛为 #c45c48（频次最高 76%）"
  }
}
```

### Step 4：生成替换计划

```json
{
  "replacements": [
    {
      "type": "color",
      "from": "#c85948",
      "to": "var(--color-primary)",
      "occurrences": 5,
      "files": ["page3.vue:23", "page3.vue:45"]
    }
  ]
}
```

### Step 5：执行替换（带 dry-run）

```bash
unify --dry-run   # 输出 diff，不写文件
unify             # 实际替换
```

## 输出：`unify-report.md`

```markdown
# Unify Report — <project>

> 时间：2024-XX-XX
> 范围：所有页面

---

## 变体统计

| 维度 | 变体数 | 主要变体（频次） | 目标值 |
|------|--------|------------------|--------|
| 主色 | 3 | #c45c48 (76%), #c85948 (16%), #bd5640 (8%) | --color-primary |
| 副色 | 4 | ... | --color-secondary |
| 间距 | 8 | 16px (45%), 13px (15%), 17px (10%) | --space-4 |
| 圆角 | 6 | 8px (60%), 6px (20%), 12px (10%) | --radius-md |
| 字号 | 5 | ... | --font-size-base |

## 替换清单

（详细列出每处替换）

## 影响范围

- 涉及文件：42
- 涉及行数：187
- 风险等级：低（颜色 / 间距类无业务逻辑）

## 回滚

```bash
git checkout HEAD -- .
```

## 验证

（构建 + 视觉对比 + 死代码扫描结果）
```

## 策略选择

| 策略 | 适用 | 风险 |
|------|------|------|
| `merge-to-majority` | 变体差异小 | 低 |
| `merge-to-token` | 已有 Token 系统 | 中 |
| `apply-baseline` | 要套用特定品牌 | 中-高 |
| `preserve-rare` | 保留稀有变体 | 低 |

## 注意事项

- **不破坏业务**：与 optimize 一样
- **保持可访问性**：替换后验证对比度
- **逐项替换**：不要全文件替换，避免混乱
- **dry-run 优先**：先看 diff 再执行
