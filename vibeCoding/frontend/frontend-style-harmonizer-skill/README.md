# Frontend Style Harmonizer

> 前端样式一致性治理技能

## 功能

前端样式一致性治理：发现跨页面样式重复、同类组件尺寸不一致、硬编码裸值，给出收敛方案并可自动落地为公共 CSS / 公共组件 / CSS 变量。

**uniapp 优先**，兼容 vue / react / html。

### 三个核心能力

| 能力 | 做什么 | 产出 |
|------|--------|------|
| **复用** | 检测多个页面写了相同的样式声明块 | 抽取为公共 CSS / 组件 |
| **对齐** | 检测同类组件（按钮/tab/输入框）跨页面尺寸不一致 | 收敛到统一规格（size 阶梯） |
| **硬编码** | 检测散落的裸值（`14rpx`、`#c45c48`） | 收敛为 SCSS 变量 / CSS 变量 |

## 使用方式

### 触发词

```
统一各页面样式
样式对齐
抽取公共样式
去硬编码
按钮对齐
tab高度不一致
样式治理
样式审查
frontend-style-harmonizer
```

### 参数

```bash
# 审计当前项目（默认只读）
frontend-style-harmonizer

# 审计指定项目
frontend-style-harmonizer /path/to/project

# 指定维度
frontend-style-harmonizer --scope align    # 只查对齐
frontend-style-harmonizer --scope hardcode  # 只查硬编码
frontend-style-harmonizer --scope reuse     # 只查复用

# 执行修改（需先审计确认）
frontend-style-harmonizer --apply
```

### 典型流程

1. **审计**：`frontend-style-harmonizer` → 产出 `docs/style-governance-report.md`
2. **确认**：阅读报告，核对抽取/替换计划
3. **执行**：`frontend-style-harmonizer --apply` → 实际修改文件
4. **回滚**：`git checkout HEAD -- .`（如不满意）

## 案例场景

### 复用维度

#### 案例 1：卡片样式重复

**现象**：
```vue
<!-- pages/index/index.vue -->
<style scoped>
.card { padding: 32rpx; background: #ffffff; border-radius: 16rpx; }
</style>

<!-- pages/user/profile.vue -->
<style scoped>
.card { padding: 32rpx; background: #ffffff; border-radius: 16rpx; }
</style>
```

**治理**：抽取为 `.common-card` 放入 `common.scss`。

---

#### 案例 2：列表项样式重复

**现象**：5 个页面各自写了相同的 `.list-item { height: 88rpx; padding: 24rpx; }`

**治理**：抽取为公共类，保留页面特定覆盖。

---

### 对齐维度

#### 案例 3：按钮高度三处不一致

**现象**：
- 首页按钮：`height: 64rpx`
- 订单页按钮：`height: 72rpx`
- 个人中心按钮：`height: 80rpx`

**治理**：收敛到 72rpx（md 档），输出 token `--btn-height-md`。

---

#### 案例 4：Tab 高度导致切换跳变（核心痛点）

**现象**：
- 首页 tab：`height: 80rpx`
- 分类页 tab：`height: 96rpx`
- 个人中心 tab：`height: 88rpx`

**影响**：切换 tab 时页面跳动明显。

**治理**：统一为 88rpx，写入 `--tab-height: 88rpx`。

---

#### 案例 5：输入框高度不一致

**现象**：登录页 64rpx，填写页 72rpx。

**治理**：统一为 72rpx。

---

### 硬编码维度

#### 案例 6：颜色硬编码散落

**现象**：`#c45c48` 在项目中出现 23 次。

**治理**：定义 `--color-primary: #c45c48`，全部替换为 `var(--color-primary)`。

---

#### 案例 7：尺寸硬编码不在档位

**现象**：
```scss
.card { padding: 14rpx; }  // 不在档位
.item { margin: 13px; }     // 不在档位
```

**治理**：就近映射：`14rpx` → `--space-2` (8rpx)，`13px` → `--space-3` (16px)。

---

#### 案例 8：AI 常写死的命名色

**现象**：
```vue
<text style="color: red;">错误</text>
<view style="background: blue;">背景</view>
```

**治理**：映射到语义化变量：`red` → `--color-error`，`blue` → `--color-info`。

---

#### 案例 9：近义颜色未收敛

**现象**：`#c45c48`、`#c85948`、`#bd5640` 是同一色系但写多次。

**治理**：聚类分析后统一为 `--color-primary`。

---

## 解决的典型问题清单

### 复用（5 类）

| 问题 | 典型案例 |
|------|----------|
| 多页面重复卡片样式 | pageA/B 都写 `.card { padding: 32rpx; }` |
| 多处重复列表项样式 | 5 页面各自写相同 `.list-item` |
| 重复标题样式 | 不同页面 section-title 相同 |
| 重复分割线样式 | 多处 `.divider { height: 1px; }` |
| 内联 style 重复 | 多组件内联相同 style |

### 对齐（8 类）

| 问题 | 典型案例 |
|------|----------|
| 按钮高度不一致 | 64/72/80rpx 三种 |
| 按钮字号不一致 | 24/28/32rpx 三种 |
| Tab 高度不一致 | 80/88/96rpx，切换跳变 |
| 输入框高度不一致 | 64/72rpx |
| 标签高度/字号不一致 | 32/40rpx |
| 列表项高度不一致 | 88/96rpx |
| 卡片圆角不一致 | 12/16/24rpx |
| 固定头部高度不一致 | 88/100rpx |

### 硬编码（8 类）

| 问题 | 典型案例 |
|------|----------|
| 颜色硬编码 | `#c45c48` 散落 20+ 处 |
| 命名色 | `color: red`、`blue` |
| 间距硬编码 | `padding: 14rpx` 不在档位 |
| 字号硬编码 | `font-size: 12px/14px` |
| 圆角硬编码 | `border-radius: 5px/10px` |
| 高度硬编码 | `height: 50px` 写死 |
| 阴影硬编码 | 多处 `box-shadow` 不同 |
| 近义颜色未收敛 | 同色系写多次 |

## 技术特点

### rpx 归一化

检测 uniapp 项目（`pages.json` / 样式含 `rpx`），按 `750rpx = 设计稿宽` 换算，**不套用 px 的 4pt 网格检查**（foundry 的误判点）。

### 组件语义归类

通过选择器名（`.btn` / `.tab`）、模板标签（`<button>`）、easycom 组件名（`ui-button`）识别同类组件，跨文件比较尺寸。疑似项标注置信度，交人工确认。

### 只读优先

默认 `--report-only`，只出报告不修改；`--apply` 才落地。所有修改提供 diff + git 回滚。

## 与其他技能协同

| 场景 | 协同 |
|------|------|
| 产出 token 后导出多端 | → `frontend-ui-foundry tokens export` |
| 发现美学/品牌问题 | → `frontend-ui-foundry audit` |
| 新项目初始化 | → `uniapp-app-generate-skill`（预防） |

## 目录说明

```
frontend-style-harmonizer-skill/
├── SKILL.md                      # 技能定义（触发词 + 审查维度 + 输出格式）
├── README.md                     # 本文件
└── references/
    ├── detection-rules.md       # 扫描规则：rpx归一化、组件语义归类、样式指纹
    ├── align-checklist.md       # 对齐维度清单（按钮/tab/输入框/列表项规格）
    ├── hardcode-patterns.md     # 硬编码模式库（裸值→变量映射约定）
    ├── token-conventions.md     # uni.scss + tokens.css 变量命名与分层约定
    └── report-template.md       # 治理报告模板
```

## 红线

- **不改业务逻辑**：props / event / router / state / API 不动
- **只读优先**：默认 `--report-only`，`--apply` 需先确认报告
- **可访问性**：颜色收敛后校验对比度 ≥ 4.5:1
- **rpx 归一化**：uniapp 项目不套用 px 检查
