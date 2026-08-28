---
name: uniapp-standardization-skill
description: 诊断 uniapp 项目与标准骨架的差距，出具规范化方案并指导调整。触发词："uniapp 规范化"、"项目结构诊断"、"代码规范"、"项目重构"
---

# UniApp Standardization Skill

## Overview

诊断现有 uniapp 项目与标准骨架的差距，出具规范化诊断报告和重构计划，指导按优先级逐步调整项目结构。

## When to Use

触发此 skill 时使用：

- "项目规范化"
- "帮我看看项目结构有什么问题"
- "这个 uniapp 项目很乱"
- "需要重构 uniapp 项目"
- "代码规范调整"

## Workflow

```
Phase 1: 项目结构扫描
  → 检测当前目录结构
  → 对比标准骨架（api/stores/components/pages/styles 等）
  → 识别缺失的目录和文件

Phase 2: 代码规范检测
  → API 层：是否统一封装、是否有重复请求逻辑
  → 状态管理：是否使用 Pinia/Vuex，store 是否规范
  → 组件：是否有统一的组件规范，重复组件是否抽离
  → 样式：是否有全局变量、样式是否分散

Phase 3: 生成诊断报告
  → 结构层面：缺失目录/文件清单
  → 代码层面：规范违背项及修复优先级
  → 行动建议：按优先级排序的调整清单

Phase 4: 执行规范化（可选）
  → 按报告逐步调整
  → 每次调整后生成新的 CLAUDE.md
```

## Phase Details

### Phase 1: 项目结构扫描

#### 检测当前目录结构

```bash
# 查看项目根目录结构
ls -la

# 查看 src 目录结构
find src -type d
```

#### 标准骨架参考

```
uniapp-vue3-project/
├── src/
│   ├── api/                    # API 层
│   │   ├── modules/            # 按业务模块拆分
│   │   │   ├── user.ts
│   │   │   ├── order.ts
│   │   │   └── index.ts       # 统一导出
│   │   ├── types/              # API 相关类型
│   │   └── index.ts            # API 入口
│   ├── components/             # 公共组件
│   │   ├── AppButton/
│   │   ├── AppCard/
│   │   ├── AppEmpty/
│   │   ├── AppLoading/
│   │   ├── AppNavbar/
│   │   └── index.ts           # 统一导出
│   ├── constants/              # 常量
│   │   ├── colors.ts
│   │   └── index.ts
│   ├── pages/                 # 页面
│   │   ├── index/
│   │   │   └── index.vue
│   │   ├── profile/
│   │   └── ...
│   ├── static/                # 静态资源
│   │   ├── icons/
│   │   ├── images/
│   │   └── tab-bar/
│   ├── stores/                # 状态管理
│   │   ├── index.ts           # store 入口
│   │   └── modules/
│   │       ├── user.ts
│   │       └── app.ts
│   ├── styles/                # 样式系统
│   │   ├── config/
│   │   ├── tokens/
│   │   │   ├── _colors.scss
│   │   │   ├── _spacing.scss
│   │   │   └── _index.scss
│   │   ├── _functions.scss
│   │   ├── _mixins.scss
│   │   ├── global.scss
│   │   └── variables.scss
│   ├── types/                 # 全局类型
│   │   └── index.d.ts
│   ├── utils/                 # 工具函数
│   │   ├── request.ts
│   │   ├── storage.ts
│   │   ├── platform.ts
│   │   └── index.ts
│   ├── App.vue
│   ├── main.ts
│   ├── pages.json
│   ├── manifest.json
│   └── uni.scss
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

#### 常见问题

| 问题 | 说明 |
|------|------|
| 缺少 api/ 目录 | API 散落在页面中 |
| 缺少 stores/ 目录 | 状态管理混乱 |
| 缺少 utils/ 目录 | 工具函数重复 |
| 缺少 styles/ 目录 | 样式散落各处 |
| 缺少 types/ 目录 | 无类型定义 |
| 页面目录结构混乱 | 页面文件散落 |

### Phase 2: 代码规范检测

#### 2.1 API 层检测

**检测项**：
- 是否有统一的 API 封装
- API 是否按模块拆分
- 是否有重复的请求逻辑
- 请求是否统一处理错误

```bash
# 搜索直接使用 uni.request 的地方
grep -rnE 'uni\.request\(' src/pages/
```

#### 2.2 状态管理检测

**检测项**：
- 是否使用 Pinia/Vuex
- store 是否按模块拆分
- 是否有全局状态管理
- 页面间传值是否规范

```bash
# 搜索 store 相关
ls src/stores/
```

#### 2.3 组件检测

**检测项**：
- 是否有公共组件目录
- 组件是否统一导出
- 相似组件是否抽离
- 组件命名是否规范

#### 2.4 样式检测

**检测项**：
- 是否有全局样式文件
- 是否有主题变量
- 样式是否复用
- 是否有统一的命名规范

### Phase 3: 生成诊断报告

生成 `standardization-report.md`：

```markdown
# 项目规范化诊断报告

## 项目概况
- 项目路径：xxx
- 扫描时间：2024-01-01
- 当前结构：Vue3 + TypeScript + Pinia

## 结构对比

### 缺失的目录/文件

| 标准目录 | 当前状态 | 优先级 |
|----------|----------|--------|
| src/api/modules/ | 缺失 | P0 |
| src/stores/ | 缺失 | P0 |
| src/utils/request.ts | 缺失 | P0 |
| src/styles/tokens/ | 部分缺失 | P1 |
| src/components/AppButton/ | 缺失 | P1 |

### 目录结构评分

| 维度 | 得分 | 说明 |
|------|------|------|
| API 层 | 4/10 | API 散落在页面中 |
| 状态管理 | 3/10 | 无统一 store |
| 组件 | 5/10 | 部分组件抽离 |
| 样式 | 4/10 | 缺少主题系统 |
| 工具 | 6/10 | 部分工具函数 |

## 规范违背项

### P0 - 必须修复

1. **API 散落**
   - 位置：pages/index/index.vue, pages/user/user.vue
   - 问题：直接使用 uni.request，无统一封装
   - 建议：创建 src/api/modules/user.ts

2. **缺少状态管理**
   - 问题：页面间传值用 URL 参数或 localStorage
   - 建议：创建 src/stores/user.ts

### P1 - 应该修复

1. **样式散落**
   - 位置：各页面 scss 文件
   - 问题：样式未抽离，变量未统一
   - 建议：建立 styles/tokens/ 主题系统

### P2 - 建议修复

1. 组件命名规范统一
2. 添加 TypeScript 类型
3. 优化页面目录结构

## 行动建议

### 第一步：建立基础设施（P0）
1. 创建 src/api/modules/ 和统一请求封装
2. 创建 src/stores/ 状态管理
3. 创建 src/utils/ 工具函数

### 第二步：样式规范化（P1）
1. 建立 src/styles/tokens/ 主题系统
2. 抽离公共样式
3. 统一颜色/字号/间距变量

### 第三步：组件规范化（P2）
1. 抽离公共组件
2. 建立组件规范
3. 统一组件导出

### 第四步：持续优化
1. 添加 TypeScript 类型
2. 完善文档
3. 建立代码规范
```

### Phase 4: 执行规范化

按报告逐步调整，每次调整：

1. 创建缺失的目录/文件
2. 移动/重构代码
3. 验证功能正常
4. 更新 CLAUDE.md

## Output

此 skill 输出：

1. **terminal 输出**：诊断进度、建议摘要
2. **文件**：`standardization-report.md` 在项目根目录
3. **可选**：直接执行规范化调整

## Collaboration

可与以下 skill 协作：

- **uniapp-code-audit-skill**：先做代码审计了解问题，再做规范化
- **uniapp-crossplatform-audit-skill**：规范化后可做跨平台审计
- **uniapp-vue2-upgrade-skill**：Vue2 项目先升级再做规范化

## References

- `references/standard-structure.md` — 标准项目结构详解
- `references/api-spec.md` — API 封装规范
- `references/store-spec.md` — 状态管理规范
- `references/component-spec.md` — 组件规范
