# 复杂组件处理指引

本文件处理 `ui-replica-skill` 中无法仅凭一张图就完整还原的复杂元素：图表、表单校验、动画、地图、富文本等。

**核心原则：能代码模拟就模拟，不能模拟再占位。** 占位 div + 文字说明会显著拉低还原度，应作为最后手段。

## 1. 图表（Chart）

### 识别特征

- 折线图、柱状图、饼图、雷达图、散点图
- 带坐标轴、图例、tooltip
- 数据是模拟的还是真实的

### 处理策略

| 场景 | 方案 |
|---|---|
| 图中有明确图表类型 | 用 ECharts/Recharts/uCharts 渲染 mock 数据 |
| 图中只有静态示例数据 | 用 ECharts 按示例数据渲染 |
| 中后台 dashboard | 优先 ECharts（Vue/React 通用） |
| 移动端/uniapp | 优先 uCharts 或 ECharts 微信小程序版 |
| 完全无法判断数据 | 输出占位 div + 注释 |

### 默认实现

```html
<!-- ECharts 方案 -->
<div id="chart" class="h-64"></div>
<script src="https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js"></script>
<script>
  const chart = echarts.init(document.getElementById('chart'));
  chart.setOption({
    xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed'] },
    yAxis: { type: 'value' },
    series: [{ data: [120, 200, 150], type: 'line' }]
  });
</script>
```

```html
<!-- 占位方案（最后手段） -->
<div class="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-text-sub">
  [图表占位] 需接入 ECharts：折线图，X轴为日期，Y轴为数值
</div>
```

**CDN fallback**：如果外部 CDN 不可用，用占位 div + 文字说明替代，不要让页面因资源加载失败而空白。

## 2. 表单校验（Form Validation）

### 识别特征

- 登录/注册/搜索/配置表单
- 必填项、错误提示、提交按钮
- 图里看不到校验规则

### 处理策略

| 信息 | 做法 |
|---|---|
| 字段类型明确 | 按类型设置 input type（email/tel/password） |
| 必填/非必填 | 图中带 * 号的默认必填，其余询问用户 |
| 校验规则 | 主动询问用户：“手机号是否需要验证码？密码复杂度要求是什么？” |
| 错误提示 | 输出基础样式占位 |

### 默认实现

```html
<form class="space-y-4">
  <div>
    <label class="block text-sm font-medium mb-1">手机号 <span class="text-red-500">*</span></label>
    <input type="tel" class="w-full px-3 py-2 border rounded-lg" placeholder="请输入手机号" />
    <p class="mt-1 text-xs text-red-500 hidden" data-error>请输入正确的手机号</p>
  </div>
  <button type="submit" class="w-full bg-primary text-white py-2 rounded-lg">提交</button>
</form>
```

## 3. 动画（Animation）

### 识别特征

- 页面加载动效
- 卡片 hover 动画
- 按钮点击反馈
- 列表进入动画
- 弹窗出现/消失动画

### 处理策略

| 动画类型 | 是否还原 | 实现方式 |
|---|---|---|
| 微交互（hover/focus） | 必须还原 | CSS transition |
| 按钮点击反馈 | 必须还原 | active 态 + transform |
| 列表进入动画 | 可选 | CSS animation / transition-group |
| 复杂 loading | 可选 | CSS 动画或 Lottie |
| 页面转场 | 一般不还原 | 说明需接入路由动画 |
| 装饰性动效 | 视情况 | 简单 CSS，复杂的说明需设计稿 |

### 原则

- 不动 CSS 布局属性（width/height/margin/top/left）
- 优先使用 `transform` 和 `opacity`
- 时长 150-300ms，缓动用 `ease-out`
- 必须支持 `prefers-reduced-motion`

## 4. 地图（Map）

### 处理策略

- 图中只有示意 → 用 CSS 色块 + 标注点模拟
- 需要真实地图 → 输出占位 div + 说明需接入地图 SDK

```html
<!-- 模拟方案 -->
<div class="h-64 bg-gray-100 rounded-lg relative overflow-hidden">
  <div class="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300"></div>
  <div class="absolute top-1/3 left-1/2 w-3 h-3 bg-primary rounded-full border-2 border-white"></div>
  <div class="absolute bottom-1/4 right-1/3 w-2 h-2 bg-primary rounded-full opacity-60"></div>
</div>
```

```html
<!-- 占位方案 -->
<div class="h-64 bg-gray-100 rounded-lg flex items-center justify-center text-text-sub">
  [地图占位] 需接入高德/百度地图 SDK
</div>
```

## 5. 富文本 / Markdown

### 处理策略

- 图中只有静态文字 → 直接写成 HTML
- 图中明显是编辑器输出 → 输出 HTML 结构，说明需接入富文本编辑器

## 6. 日历 / 日期选择器

### 处理策略

- 单文件 HTML：用原生的 `<input type="date">`
- Vue/React：使用 Element Plus / Ant Design 的 DatePicker
- uniapp：使用 uni-datetime-picker

## 7. 文件上传

### 处理策略

- 输出拖拽/点击上传 UI
- 说明需接入具体上传逻辑和接口

```html
<div class="border-2 border-dashed border-border-light rounded-lg p-8 text-center hover:border-primary transition-colors">
  <i class="ph ph-upload-simple text-2xl text-text-sub"></i>
  <p class="text-sm text-text-sub mt-2">点击或拖拽文件到此处上传</p>
</div>
```

## 8. 表格（Table）

### 处理策略

- 静态表格：直接写 HTML table
- 数据量大：说明需接入分页/排序/筛选
- 中后台：优先使用 Element Plus Table / Ant Design Table

## 通用原则

1. **能代码实现就不截图**：图标、二维码、简单图形用代码
2. **能模拟就不占位**：图表、地图尽量用代码模拟视觉形态
3. **不能实现的先占位**：复杂图表、真实数据、真实地图用占位 + 说明
4. **主动询问缺失信息**：校验规则、真实数据、API 接口
5. **不要 hallucinate**：图中没有的状态/交互，不要脑补太多
