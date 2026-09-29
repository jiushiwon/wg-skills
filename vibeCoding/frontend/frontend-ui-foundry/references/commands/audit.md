# audit — 设计 + 代码双维审查

综合审查项目：设计法则、可访问性、AI slop、性能、代码质量。

## 用法

```
audit [path] [--depth quick|standard|deep] [--focus design|code|all]
```

### 深度

| 深度 | 检查数 | 时间 |
|------|--------|------|
| `quick` | 8 项核心 | 1-2 分钟 |
| `standard` | 24 项标准 | 5-10 分钟 |
| `deep` | 60+ 项深度 | 30+ 分钟 |

### 焦点

| Focus | 说明 |
|-------|------|
| `design` | 设计法则 + 可访问性 + AI slop |
| `code` | 代码质量 + 性能 + 安全性 |
| `all` | 全部（默认） |

## 检查清单

### 设计维度

#### 调色（4 项）
- [ ] 使用 OKLCH 或现代色彩空间
- [ ] 中性色向品牌色相微调（chroma 0.005-0.01）
- [ ] 无纯 `#000` / `#fff`（除非故意）
- [ ] 调色策略明确（Restrained / Committed / Full / Drenched）

#### 字体（4 项）
- [ ] 字号阶 ≥1.25 比例
- [ ] 行长 65-75ch（桌面）/ 35-60ch（移动）
- [ ] 行高 1.5-1.75（正文）/ 1.1-1.3（标题）
- [ ] 无 Inter / Roboto / Arial 等 AI slop 字体

#### 布局（4 项）
- [ ] 4pt 网格（间距）
- [ ] 圆角在阶梯上
- [ ] 触摸目标 ≥44pt
- [ ] 嵌套卡片 = 0

#### 动效（3 项）
- [ ] 仅 transform / opacity
- [ ] 缓动 = ease-out 指数
- [ ] prefers-reduced-motion 支持

#### 可访问性（6 项）
- [ ] 文本对比度 ≥4.5:1（AA）
- [ ] 大文本对比度 ≥3:1
- [ ] 焦点环可见
- [ ] 键盘可达
- [ ] 语义化 HTML
- [ ] 减弱动效支持

#### AI Slop（6 项）
- [ ] 无侧边色条边框
- [ ] 无渐变文字
- [ ] 无玻璃拟态默认
- [ ] 无大数字 hero-metric
- [ ] 无相同尺寸卡片网格
- [ ] 无紫色渐变 + 白底

### 代码维度

#### 性能（4 项）
- [ ] 图片 WebP / AVIF
- [ ] 字体预加载 + font-display: swap
- [ ] 代码分割 / 懒加载
- [ ] 资源懒加载

#### 安全性（3 项）
- [ ] 无硬编码密钥
- [ ] 输入校验
- [ ] XSS 防护

#### 可维护性（3 项）
- [ ] TypeScript 严格模式
- [ ] ESLint / Prettier
- [ ] 组件命名一致

#### 响应式（3 项）
- [ ] viewport 正确（不禁用缩放）
- [ ] 移动优先
- [ ] 安全区处理（iOS）

## 流程

### 1. 检测项目

```bash
node scripts/detect-stack.mjs
```

### 2. 扫描文件

```bash
# 收集文件列表
node scripts/extract-tokens.mjs > tokens.json
```

### 3. 逐项检查

按上述清单扫描，每项给出 pass / warn / fail / na。

### 4. 评分

```
总分 = pass * 1.0 + warn * 0.5 + fail * 0
```

### 5. 输出报告

## 输出：`audit-report.md`

```markdown
# Audit Report — <project>

> 时间：2024-XX-XX
> 深度：standard
> 焦点：all

---

## 总分

**78 / 100**（21 pass / 3 warn / 0 fail）

## 设计维度（12/12 项检查）

### 调色
- ✅ 使用 OKLCH
- ✅ 中性色微调
- ✅ 无纯 #000/#fff
- ⚠️ 调色策略未明确

### 字体
- ✅ 字号阶 1.25
- ✅ 行长 70ch
- ✅ 行高 1.6
- ❌ 使用了 Inter

...

## 代码维度（12/12 项检查）

### 性能
- ✅ WebP
- ✅ 字体预加载
...

## 优先级修复（Top 5）

1. **替换 Inter 字体**（AI slop）
   - 影响：品牌形象
   - 修复：使用 Geist / General Sans 替代
   - 工作量：低

2. ...

## 验证

- 构建：✅ pass
- Token 验证：✅ pass
- 减弱动效：✅ pass
- AI slop：❌ fail（Inter）

## 建议

（按优先级排列的修复建议清单）
```

## 示例

```bash
# 快速审查
audit --depth quick

# 深度审查 + 焦点设计
audit --depth deep --focus design

# 审查指定路径
audit /path/to/project --depth standard
```

## 集成

`audit` 可与 `optimize` 联动：
- audit 输出问题清单
- optimize 根据清单应用修复
- 修复后再 audit 验证

```bash
# 循环
audit --report-only > issues.md
optimize --fix-from-audit issues.md
audit  # 验证
```

## 与其他 SKILL 协同

- `frontend-code-doctor`（D:\frontend-skills\frontend-code-doctor）— 详细代码审查
- `impeccable`（D:\frontend-skills\impeccable）— 极致设计精修
- `ui-ux-pro-max`（D:\frontend-skills\ui-ux-pro-max）— 161 规则库

audit 是这些的入口与汇总，必要时调用具体 SKILL 做深度检查。
