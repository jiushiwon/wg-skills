# Vue3 Dashboard Skill

Vue3 高端数据看板页技能，**6 种视觉风格 × 5 种布局结构**，适用于 SaaS 后台、数据中心大屏、实时监控等多种业务场景。

## 快速开始

1. 复制 `templates/DashboardPage.vue` 到项目
2. 导入 `tokens.css` 设计 Token
3. 设置 `variant` prop 切换视觉风格
4. 设置 `layout` prop 切换布局结构

```vue
<DashboardPage variant="dark" layout="panels" :kpis="kpis" />
```

## 文件结构

```
vue-dashboard-skill/
  templates/
    DashboardPage.vue          # 主模板（双维度模型，variant + layout）
  components/                  # 10 个内置组件
    BaseCard.vue               # 卡片容器（封装 vue-card-skill CSS，6 维度参数）
    BaseProgressBar.vue        # 水平进度条（预算/达成率/出勤率等）
    BaseHorizontalBar.vue      # 横向条形图（账龄/成绩/资产分布）
    BaseCompareBars.vue        # 双期对比条形图（同比/环比）
    BaseStatGrid.vue           # 统计数字网格（班级/区域概览）
    BaseApprovalList.vue       # 待办/审批列表
    BaseBigKpi.vue             # LED 大屏超大 KPI
    BaseKpiMini.vue            # 迷你紧凑 KPI（高密场景）
    BaseSparkline.vue          # 迷你趋势图（SVG 绘制，KPI 附属）
    BaseScrollFeed.vue         # 实时滚动数据流（大屏专用）
  demo-components/
    shared/
      tokens.css               # 设计 Token（颜色/间距/字号/阴影变量）
      base-card.css            # 卡片容器样式（复用 vue-card-skill 规范）
      demo.css                 # Demo 公共样式
    dashboard-page/html/
      00-showcase.html         # 全风格画廊
      01-classic.html          # 经典白色 demo
      02-dark.html             # 暗色霓虹 demo
      03-minimal.html          # 极简无框 demo
      04-bigscreen.html        # LED 大屏 demo
      05-glass.html            # 毛玻璃 demo
      06-compact.html          # 紧凑高密 demo
```

## 6 大业务场景

每个 demo 对应一个真实业务场景，图表类型和数据内容各不相同：

| Demo | 场景 | 图表 | 特色内容 |
|------|------|------|----------|
| 01-classic | 财务 | 柱状图 | KPI + 营收趋势 + 部门收支 + 费用分布 + 预算执行 + 订单表格 + 排行 + 应收账款 + 待办审批（10 模块） |
| 02-dark | 教务 | 水平柱状图 | KPI + 教师概览 + 班级统计 + 成绩分布 + 学科及格率 + 出勤率 + 学生表格 + 教学资产 + 告警 + 待办（10 模块） |
| 03-minimal | 小区物业 | 环形占比图 | KPI + 营收分布 + 报修漏斗 + 关键指标 + 缴费排行 + 服务动态 + 设施维护（8 模块） |
| 04-bigscreen | 企业 | SVG 饼图 | 超大数字 KPI + 饼图 + 目标完成率 + 客户留存 + 实时滚动 + 城市/品类双排行（9 模块） |
| 05-glass | 物流 | 柱线混合图 | KPI + 包裹量趋势 + 指标达成率 + 区域同比 + 月度明细 + 告警 + 网点状态（8 模块） |
| 06-compact | 商城 | sparkline | 迷你 KPI + sparkline + 订单表格 + 热销排行 + 动态 + 库存预警 + 服务健康（8 模块） |

## 双维度模型

### Variant（视觉风格）— 控制颜色、字体、阴影

| # | 风格 | 适用场景 | 关键词 |
|---|------|----------|--------|
| 1 | 经典白色 | SaaS 后台、通用管理 | classic, 经典 |
| 2 | 暗色霓虹 | 科技产品、数据监控 | dark, 霓虹 |
| 3 | 极简无框 | 高端产品、简约风格 | minimal, 极简 |
| 4 | LED 大屏 | 数据中心、投屏展示 | bigscreen, 大屏 |
| 5 | 毛玻璃 | 高端产品、暗色主题 | glass, 毛玻璃 |
| 6 | 紧凑高密 | 数据分析、专业工具 | compact, 紧凑 |

### Layout（结构布局）— 控制 DOM 结构、Grid 布局

| # | 布局 | 核心结构 | 推荐搭配 |
|---|------|----------|----------|
| 1 | default | 标准流式：header → kpi → content-grid → table-grid | classic / dark / minimal / compact |
| 2 | panels | KPI 通栏 + 左右双面板 | dark |
| 3 | three-col | 左中右三栏大屏投屏（允许自定义组件） | bigscreen |
| 4 | bento | 自由网格卡片 | glass |
| 5 | grid4 | 2×2 四区均分网格 | compact |

## Demo

打开 `demo-components/dashboard-page/html/00-showcase.html` 查看全部风格画廊。

各布局独立 demo：

| Demo | Variant | Layout | 场景 | 核心内容 |
|------|---------|--------|------|----------|
| 01-classic | classic | default | 财务 | KPI + 营收趋势 + 部门收支 + 费用分布 + 预算 + 订单 + 排行 + 应收 + 审批 |
| 02-dark | dark | panels | 教务 | KPI + 教师 + 统计 + 成绩 + 及格率 + 出勤 + 学生表 + 资产 + 告警 + 待办 |
| 03-minimal | minimal | default | 小区物业 | KPI + 营收分布 + 报修漏斗 + 关键指标 + 缴费排行 + 服务动态 + 设施维护 |
| 04-bigscreen | bigscreen | three-col | 企业 | 超大 KPI + SVG 饼图 + 目标完成率 + 客户留存 + 实时滚动 + 双排行 |
| 05-glass | glass | bento | 物流 | KPI + 包裹趋势 + 指标达成 + 区域同比 + 月度明细 + 告警 + 网点状态 |
| 06-compact | compact | grid4 | 商城 | 迷你 KPI + sparkline + 订单表格 + 热销排行 + 库存预警 + 服务健康 |

## 依赖

| 组件 | 来源 | 用途 |
|------|------|------|
| BaseCard | 本技能 components/ | 卡片容器（封装 vue-card-skill CSS，6 维度参数） |
| BaseProgressBar / BaseHorizontalBar / BaseCompareBars | 本技能 components/ | 进度条/横条图/双期对比 |
| BaseStatGrid / BaseApprovalList | 本技能 components/ | 统计网格/审批列表 |
| BaseBigKpi / BaseKpiMini | 本技能 components/ | LED 大屏 KPI / 迷你紧凑 KPI |
| BaseSparkline / BaseScrollFeed | 本技能 components/ | 迷你趋势图/实时滚动流 |
| BaseLineChart / BaseBarChart / BasePieChart 等 | vue-chart-skill | 折线/柱状/饼图（含环形图）/仪表盘/漏斗/进度环 |

**零外部依赖的操作元素**：
- 操作按钮：原生 div + SVG 图标
- 状态标签：原生 span + CSS 变体类

## 特性

- 6 种视觉风格 × 5 种布局结构，支持 30 种组合
- 6 种 demo 均有独立 DOM 结构 + 独立数据内容（非换皮），每个 8-10 个业务模块
- 图表引用 vue-chart-skill（折线/柱状/饼图/仪表盘/漏斗等），卡片用 BaseCard（封装 vue-card-skill），进度条/迷你图内置组件
- three-col 大屏布局允许自定义组件（不强制 base-card）
- 响应式布局
- 零 emoji（SVG 图标系统）
