# UniApp Crossplatform Audit Skill

审计 uniapp 项目的跨平台兼容性，检测 H5/小程序/App 差异问题。

## 功能

- **模板标签检查**：检测 H5 专属标签（div/span/p/img 等）的使用
- **CSS 兼容性检查**：检测 background-image、var()、calc()、vw/vh 等兼容性风险属性
- **API 调用检查**：检测 fetch/window/document 等非 uni API
- **条件编译评估**：检查现有的 #ifdef/#ifndef 是否覆盖各端差异
- **配置文件检查**：检查 pages.json 和 manifest.json 的平台配置
- **修复建议**：每个问题给出具体的修复方案和预估工作量

## 使用方式

### 触发词

```
"多端兼容"
"跨平台审计"
"小程序 App 兼容"
"uniapp 兼容性"
"检查跨平台问题"
```

### 示例

```bash
# 审计当前项目的跨平台兼容性
> 帮我审计一下这个 uniapp 项目的多端兼容性

# 专门检查 App 端兼容性
> 看看这个项目能不能打包成 App，有哪些兼容性问题
```

## 工作流

1. **目标平台确认** — 确定要兼容哪些端（小程序/H5/App）
2. **自动化扫描** — 扫描标签、样式、API、配置问题
3. **人工复核** — 过滤误报，评估修复难度
4. **输出报告** — 生成 `crossplatform-audit-report.md`

## 输出文件

- `crossplatform-audit-report.md` — 按严重程度分级的兼容性问题清单

## 协作技能

| 协作 Skill | 场景 |
|------------|------|
| uniapp-code-audit-skill | 先做代码审计了解整体质量 |
| uniapp-standardization-skill | 兼容性修复后做规范化 |
| uniapp-vue2-upgrade-skill | Vue2 项目先升级再做审计 |

## 目录说明

```
uniapp-crossplatform-audit-skill/
├── SKILL.md                    # 技能定义
├── README.md                   # 本文件
└── references/
    ├── cross-platform-checklist.md  # 兼容性检查清单
    ├── tag-mapping.md               # 标签映射表
    └── api-mapping.md               # API 映射表
```

## 常见问题

### Q: 扫描结果太多怎么办？

A: 按严重程度排序，先修复 Critical 和 High 级别的问题。P0 级问题通常可以自动化修复。

### Q: 有些误报怎么处理？

A: 某些动态创建的场景可能是合法的，人工复核阶段可以过滤。建议先处理明确的问题。

### Q: 修复后需要重新审计吗？

A: 是的，修复完成后建议重新运行审计，确认问题已解决。
