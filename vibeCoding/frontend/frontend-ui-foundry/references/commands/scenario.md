# scenario — 场景方案

输出指定场景的完整设计基线（布局 / 组件 / 交互 / Token 偏向 / 推荐调色板）。

## 用法

```
scenario <type> [--depth overview|detailed] [--compare]
```

### 支持的场景

`mobile-responsive` / `pc-corporate` / `admin-dashboard` / `landing-marketing` / `docs-site` / `fintech-app` / `mobile-native` / `threejs-3d`

### 参数

| 参数 | 说明 | 默认 |
|------|------|------|
| `<type>` | 必填，场景名 | — |
| `--depth` | 输出详细度 | detailed |
| `--compare` | 与其他场景对比 | 否 |

## 流程

### 1. 加载场景基线

读取 `references/scenarios/<type>.md`，输出结构化方案。

### 2. 推荐品牌

按场景默认品牌映射：

| 场景 | 默认品牌 | 备选 |
|------|---------|------|
| mobile-responsive | 冷调极简 | 原生移动 |
| pc-corporate | 赤琥金 | 创意广告 |
| admin-dashboard | 2B 灰蓝 | 数据深色 |
| landing-marketing | 暖色商务 | 创意广告 |
| docs-site | 文档清爽 | 冷调极简 |
| fintech-app | 金融稳重 | 2B 灰蓝 |
| mobile-native | 原生移动 | — |
| threejs-3d | 3D 沉浸 | 数据深色 |

### 3. 输出基线

## 输出格式

```markdown
# 场景方案 — <type>

> 详细度：detailed

---

## 一句话定位

（场景描述 + 典型用途）

## 适用 / 不适用

**适用**：
- ...

**不适用**：
- ...

## 核心组件

| 组件 | 说明 |
|------|------|
| ... | ... |

## 布局基线

### 移动端 / 桌面 / 横屏

```css
.layout { ... }
```

## 关键 Token 偏向

```css
--space-section: var(--space-16);  /* 64px */
--radius-button: var(--radius-md);
...
```

## 推荐调色板

1. **XX** — 主推
2. **YY** — 备选

## 关键交互

- ...
- ...

## 反模式

- ❌ ...
- ❌ ...

## 验证清单

- [ ] ...
- [ ] ...
```

## `--compare` 模式

对比 2-3 个场景的差异：

```markdown
# 场景对比

| 维度 | mobile-responsive | pc-corporate | admin-dashboard |
|------|-------------------|--------------|-----------------|
| 触摸目标 | ≥44pt | ≥44pt | ≥32px |
| 字号下限 | 16px | 14px | 12px |
| 圆角 | 12-16px | 8-12px | 2-4px |
| 阴影 | 弱 | 中 | 克制 |
| 动效 | 平台一致 | 戏剧 | 极简 |
| 主导航 | Bottom Nav | Top Nav | Sidebar |
```

## 用途

- 决策阶段：评估哪个场景适合你的项目
- 设计阶段：作为方案模板
- 评审阶段：作为标准对比基线
- 学习：了解不同场景的设计哲学

## 示例

```bash
# 查看营销落地页场景
scenario landing-marketing

# 详细查看管理端
scenario admin-dashboard --depth detailed

# 对比 3 个场景
scenario admin-dashboard pc-corporate mobile-responsive --compare
```
