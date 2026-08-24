# UniApp Standardization Skill

诊断 uniapp 项目与标准骨架的差距，出具规范化方案并指导调整。

## 功能

- **结构扫描**：检测当前目录结构 vs 标准骨架
- **规范检测**：API 层、状态管理、组件、样式规范检测
- **诊断报告**：输出缺失目录/文件清单和修复优先级
- **规范化执行**：按报告逐步调整项目结构

## 使用方式

### 触发词

```
"项目规范化"
"uniapp 规范化"
"项目结构诊断"
"代码规范调整"
"重构 uniapp 项目"
```

### 示例

```bash
# 诊断项目结构
> 帮我看看这个 uniapp 项目结构有什么问题

# 规范化调整
> 帮我把项目结构调整为标准规范
```

## 工作流

1. **结构扫描** — 对比当前结构 vs 标准骨架
2. **规范检测** — 检测 API/状态/组件/样式规范
3. **生成报告** — 输出缺失清单和优先级
4. **执行调整** — 按优先级逐步规范化

## 输出文件

- `standardization-report.md` — 规范化诊断报告

## 标准骨架

参考 uniapp-app-generate-skill 生成的标准结构：

```
src/
├── api/           # API 层（按模块拆分）
├── components/   # 公共组件
├── constants/    # 常量
├── pages/        # 页面
├── static/       # 静态资源
├── stores/       # 状态管理
├── styles/       # 样式系统
├── types/        # 类型定义
└── utils/        # 工具函数
```

## 协作技能

| 协作 Skill | 场景 |
|------------|------|
| uniapp-code-audit-skill | 先审计再规范化 |
| uniapp-crossplatform-audit-skill | 规范化后审计兼容性 |
| uniapp-vue2-upgrade-skill | Vue2 项目先升级 |

## 目录说明

```
uniapp-standardization-skill/
├── SKILL.md                    # 技能定义
├── README.md                   # 本文件
└── references/
    ├── standard-structure.md   # 标准项目结构
    ├── api-spec.md             # API 封装规范
    ├── store-spec.md           # 状态管理规范
    └── component-spec.md       # 组件规范
```

## 常见问题

### Q: 规范化会影响现有功能吗？

A: 规范化主要是目录调整和代码抽离，不会改变业务逻辑。建议分步骤执行，每步验证后再继续。

### Q: 项目已经很乱了从哪开始？

A: 按优先级 P0 → P1 → P2 的顺序，先建立基础设施（API、store），再规范化样式和组件。

### Q: 可以自动化执行吗？

A: 部分可以自动化（如创建目录结构），但代码迁移需要人工复核。
