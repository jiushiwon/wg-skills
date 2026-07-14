---
name: frontend-style-harmonizer-skill
description: 前端样式一致性治理技能：发现跨页面样式重复、同类组件尺寸不一致、硬编码裸值，给出收敛方案并可自动落地为公共CSS/公共组件/CSS变量。uniapp优先，兼容vue/react/html。
argument-hint: "[--report-only|--apply] [--scope reuse|align|hardcode|all] [path]"
user-invocable: true
---

# Frontend Style Harmonizer

前端样式一致性治理工具。只读审计 + 可选自动重构，发现并修复三类问题：

1. **复用**：多个页面写了相同的样式声明块 → 抽取为公共 CSS
2. **对齐**：同类组件（按钮/tab/输入框/列表项）跨页面尺寸不一致 → 收敛到统一规格
3. **硬编码**：散落的裸值（`14rpx`、`#c45c48`、`red`） → 收敛为 SCSS 变量 / CSS 变量

## 核心原则

- **只改视觉层**：props / event / router / state / API 一律不动
- **只读优先**：默认只出报告，`--apply` 才改文件
- **dry-run 可见**：所有修改提供 diff + 回滚
- **uniapp 一等公民**：rpx 归一化（修正 foundry 的 4pt 网格误判）

## 使用方式

### 触发词（任一即可）

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

| 参数 | 说明 | 默认 |
|------|------|------|
| `[path]` | 项目路径 | cwd |
| `--scope` | 审查维度 | all |
| `--report-only` | 只出报告不修改 | true |
| `--apply` | 执行修改（需先 --report-only 确认） | false |

### 执行流程（AI 必须按此顺序执行）

```
Step 1: 检测项目类型
  → 扫描根目录，判断 uniapp / vue / react / html
  → 检测依据：pages.json(uniapp) / package.json(vue/react) / index.html(html)

Step 2: 收集目标文件
  → 扫描 pages/, components/, src/ 下的 .vue/.scss/.css 文件
  → 忽略 node_modules, dist, .git

Step 3: 按维度扫描（取决于 --scope）
  → 复用: 按 references/detection-rules.md 的"样式指纹"规则扫描
  → 对齐: 按 references/align-checklist.md 的"同类组件"规则扫描
  → 硬编码: 按 references/hardcode-patterns.md 的正则扫描

Step 4: 汇总问题，生成报告
  → 按 references/report-template.md 模板生成 style-governance-report.md
  → 报告写入 <用户项目>/docs/style-governance-report.md

Step 5: (仅 --apply) 执行替换
  → 先 dry-run（输出 diff 不写文件）
  → 用户确认后执行
  → 执行后提示 git 回滚命令
```

> **AI 必须读取的参考资料**：执行时必须加载以下文件获取具体规则
> - `references/detection-rules.md` — 扫描规则（rpx归一化、样式指纹）
> - `references/align-checklist.md` — 对齐检查清单（按钮/tab/输入框规格）
> - `references/hardcode-patterns.md` — 硬编码模式（裸值→变量映射）
> - `references/token-conventions.md` — 变量命名约定
> - `references/report-template.md` — 报告模板

## 三个审查维度

### 维度 A：复用（公共样式块抽取）

检测"多个文件出现**相同或高度相似的样式声明块**"。

**发现项**：
- 选择器声明块指纹相同 / 相似度 ≥ 阈值
- 内联 style 重复
- 多个 scoped style 里重复定义同名同值的规则

**治理动作**：
- 抽成公共 class（`common.scss` / `styles/components.css`）
- 或提示抽成公共组件
- 保留差异部分在各自页面

### 维度 B：对齐（同类组件尺寸 / 样式一致性）

检测"同类组件在不同页面的关键视觉属性不一致**"。

**发现项**：
- 按钮 / tab item / 标签 / 输入框 / 列表项 / 卡片 的 `height`、`font-size`、`padding`、`border-radius`、`color`、`background` 跨文件差异
- 固定高度容器（头部 tab、导航栏）跨页面高度不一致导致切换跳变

**治理动作**：
- 收敛到统一规格（组件 size 阶梯 + 设计 token）
- 输出"按钮在 5 个页面有 3 种高度：64/72/80rpx"清单 + 收敛建议

### 维度 C：硬编码（裸值变量化）

检测"散落在样式里的裸值"，收敛为变量。

**发现项**：
- 颜色裸值（`#hex` / `rgb()` / `red` 等命名色）
- 尺寸裸值（`14rpx` / `13px`）
- 未走变量的 font-size / padding / margin / radius

**治理动作**：
- 生成 / 更新 `uni.scss`（编译期变量）+ `tokens.css`（运行期 CSS 变量）
- 把裸值替换为 `$xxx` / `var(--xxx)`
- 同义近值先收敛再变量化

### 报告输出位置

**必须写入用户项目的 `docs/` 目录**，不是 skill 所在目录：

```
<用户项目>/docs/style-governance-report.md
```

如用户项目无 `docs/` 目录，则新建。

## 技术关键点

### 1. rpx 归一化（修正 foundry 的错）

检测项目是否 uniapp（`pages.json` / `manifest.json` / 样式含 `rpx`）。若是：
- 按 `750rpx = 设计稿宽` 换算
- 间距网格用 rpx 合理档位（8/16/24/32rpx 对应 4/8/12/16px）
- **绝不套用 px 的 4pt 检查**（foundry 的误判点）

### 2. 组件语义归类（对齐的关键）

通过以下线索识别同类组件：
- 选择器名（`.btn` / `.button` / `.tab` / `.input` / `.cell` / `.list-item` / `.tag`）
- 模板标签（`<button>` / `<input>`）
- easycom 组件名（`ui-button`）

识别后跨文件比对其关键尺寸。**启发式初筛 + 报告标注置信度**，疑似项交人工确认，不自动改。

### 3. 样式声明指纹（复用的关键）

每个声明块的 `property:value` 归一化排序后取指纹。相同 / 高相似指纹跨文件出现即复用候选。

## 输出格式

### 治理报告：style-governance-report.md

> 报告写入 **用户项目** 的 `docs/style-governance-report.md`，不是 skill 所在目录。

```markdown
# Style Governance Report — <project>

> 时间：2026-XX-XX
> 路径：/path/to/project
> 维度：all (reuse + align + hardcode)

---

## 总览

| 维度 | 发现问题数 | 风险 |
|------|------------|------|
| 复用 | X | 低-中 |
| 对齐 | X | 中 |
| 硬编码 | X | 低 |

---

## 复用清单

### 可抽取的公共样式块

| # | 样式指纹 | 出现位置 | 建议公共类名 |
|---|----------|----------|--------------|
| 1 | `.card { padding: 32rpx; radius: 16rpx; }` | pageA.vue, pageB.vue | `.common-card` |
| ... |

---

## 对齐清单

### 同类组件规格散度

| 组件 | 出现页面 | 规格散度 | 收敛目标 |
|------|----------|----------|----------|
| 按钮高度 | 5 页面 | 64/72/80rpx（3种） | 72rpx（--btn-height-md） |
| Tab 高度 | 3 页面 | 80/88/96rpx（3种） | 88rpx（--tab-height） |
| 输入框高度 | 4 页面 | 64/72rpx（2种） | 72rpx |
| ... |

---

## 硬编码清单

### 裸值 → 变量映射

| # | 类型 | 裸值 | 建议变量名 | 出现位置 |
|---|------|------|------------|----------|
| 1 | 颜色 | `#c45c48` | `--color-primary` | 23 处 |
| 2 | 颜色 | `#bd5640` | `--color-primary` (同义近色) | 5 处 |
| 3 | 尺寸 | `14rpx` | `--space-2` | 18 处 |
| 4 | 尺寸 | `32rpx` | `--space-4` | 31 处 |
| ... |

---

## 抽取/替换计划

### 执行顺序（按风险从低到高）

| # | 类型 | 文件 | 行号 | 改前 | 改后 | 风险 |
|---|------|------|------|------|------|------|
| 1 | 变量替换 | pages/index/index.vue | 45 | `#c45c48` | `var(--color-primary)` | 低 |
| 2 | 变量替换 | pages/user/user.vue | 23 | `#c45c48` | `var(--color-primary)` | 低 |
| 3 | 抽取公共 | pages/list/list.vue | 12-18 | (内联样式) | → common.scss | 中 |
| ... |

---

## 回滚

```bash
git checkout HEAD -- .
```

---

## 验证

- [ ] 构建通过
- [ ] 颜色变量化后对比度 ≥ 4.5:1
- [ ] 关键组件（按钮/tab/输入框）高度已收敛
```

## 与其他技能协同

| 场景 | 协同技能 |
|------|----------|
| 产出 token 后导出多端 | `frontend-ui-foundry tokens export` |
| 发现美学/品牌问题 | `frontend-ui-foundry audit` |
| 代码质量/性能问题 | `frontend-code-doctor` |
| 新项目初始化样式规范 | `uniapp-app-generate-skill`（生成期预防，本技能是存量治理） |

## 红线

1. **绝不改业务逻辑**：props / event / router / state / API 保持不变
2. **rpx 必须归一化**：uniapp 项目不套用 px 的 4pt 检查
3. **组件语义归类标置信度**：疑似项交人工确认，不自动改
4. **dry-run 优先**：`--apply` 前必先出 diff
5. **不破坏可访问性**：收敛颜色后校验对比度 ≥ 4.5:1

## 开始使用

```
帮我统一各页面样式           # 触发审计
样式对齐                    # 触发对齐维度
去硬编码                    # 触发硬编码维度
frontend-style-harmonizer   # 完整触发
```
