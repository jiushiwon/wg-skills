# 数据大屏模板

> PC端React数据大屏，1套风格（科技深蓝）

## 目录结构

```
dashboard/
├── style-1-tech.tsx    # 风格1：科技深蓝
└── style-1.css        # 样式
```

## 风格说明

### 风格1：科技深蓝
- 背景：#0A0E27（深蓝黑）
- 主色：#00D9FF（青色）
- 副色：#7C4DFF（紫色）
- 特点：发光效果，科技感强

## 组件

- 顶部Header（标题+更新时间）
- 4个统计卡片（数字+趋势）
- 折线图（ECharts）
- 环形图（ECharts）
- 排行榜

## 使用

```tsx
import Dashboard from './style-1-tech'
// 需要安装 echarts 和 echarts-for-react
```
