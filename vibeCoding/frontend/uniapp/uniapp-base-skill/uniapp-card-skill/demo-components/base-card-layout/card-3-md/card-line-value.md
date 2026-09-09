# card-line-value 折线图 · 数据点数值标注

> canvas 2d 折线图（跨端兼容），每个数据点上方直接标注数值，含 Y 轴刻度、X 轴日期标签、图例、末端空心高亮。典型场景：健康步数 / 活力指数 / 7 日趋势。
> 图表基座见 [_canvas-base.md](./_canvas-base.md)。

## 形态特征

| 特征 | 值 |
|------|-----|
| 容器 | `base-card` |
| 标题区 | 左上角标题 + 右上角图例（短线 + 文字） |
| Y 轴 | 5 格刻度（0/25/50/75/100），左侧标签 |
| X 轴 | 日期标签，最后一个可高亮（如"今天"绿色） |
| 折线 | 平滑贝塞尔 + 渐变面积填充 |
| 数据点 | 实心圆点（r=3.5），最后一个空心圆 + 外圈高亮 |
| 数值标签 | 每个圆点上方 10px 居中标注 |

## 适用场景

- 健康数据（步数 / 心率 / 睡眠 / 活力指数）
- 7 日 / 30 日趋势看板
- 运动 App 的周报告
- 任何需要"一眼看到每个点具体数值"的折线场景

## 组件代码

```vue
<base-card :padding="0">
  <view class="chart-head">
    <text class="chart-title">{{ title }}</text>
    <view class="chart-legend" v-if="legend">
      <view class="chart-legend-line" :style="{ background: color }"/>
      <text class="chart-legend-text">{{ legend }}</text>
    </view>
  </view>

  <view class="chart-body">
    <!-- #ifdef MP-WEIXIN || MP-ALIPAY || MP-TOUTIAO -->
    <canvas class="chart-canvas" type="2d" id="lineValueChart" :style="{ width: W + 'px', height: H + 'px' }" />
    <!-- #endif -->
    <!-- #ifndef MP-WEIXIN || MP-ALIPAY || MP-TOUTIAO -->
    <canvas ref="canvasRef" class="chart-canvas" :style="{ width: W + 'px', height: H + 'px' }" />
    <!-- #endif -->
  </view>
</base-card>
```

```vue
<script setup>
import { ref, onMounted, nextTick, watch, getCurrentInstance } from 'vue'

const props = defineProps({
  title: { type: String, default: '' },
  legend: { type: String, default: '' },         // 图例文字，如"活力指数"
  series: { type: Array, default: () => [] },    // number[]
  labels: { type: Array, default: () => [] },    // string[] 日期标签
  highlightLastLabel: { type: Boolean, default: true }, // 最后一个 X 轴标签是否高亮
  color: { type: String, default: '#10b981' },   // 主色（默认翡翠绿）
  maxValue: { type: Number, default: 100 },      // Y 轴最大值
  yTicks: { type: Array, default: () => [0, 25, 50, 75, 100] },
  smooth: { type: Boolean, default: true },
  W: { type: Number, default: 340 },
  H: { type: Number, default: 180 },
})

const canvasRef = ref(null)
const ctx = ref(null)

// 边距：左(Y轴标签) 右 上(数值标签) 下(X轴标签)
const LP = 32, RP = 12, TP = 28, BP = 32

async function initCanvas() {
  await nextTick()
  const dpr = (uni.getSystemInfoSync().pixelRatio) || 1
  let c
  // #ifdef MP-WEIXIN || MP-ALIPAY || MP-TOUTIAO
  c = await new Promise((resolve) => {
    uni.createSelectorQuery().in(getCurrentInstance())
      .select('#lineValueChart').fields({ node: true, size: true }).exec((ret) => {
        const node = ret && ret[0] && ret[0].node
        if (!node) return resolve(null)
        node.width = props.W * dpr
        node.height = props.H * dpr
        const c2 = node.getContext('2d')
        c2.scale(dpr, dpr)
        resolve(c2)
      })
  })
  // #endif
  // #ifndef MP-WEIXIN || MP-ALIPAY || MP-TOUTIAO
  if (canvasRef.value) {
    canvasRef.value.width = props.W * dpr
    canvasRef.value.height = props.H * dpr
    c = canvasRef.value.getContext('2d')
    c.scale(dpr, dpr)
  }
  // #endif
  ctx.value = c
  if (c) draw()
}

function draw() {
  const c = ctx.value
  if (!c || !props.series.length) return
  c.clearRect(0, 0, props.W, props.H)

  const drawW = props.W - LP - RP
  const drawH = props.H - TP - BP
  const bottomY = props.H - BP
  const n = props.series.length
  const stepX = drawW / (n - 1 || 1)

  const xOf = (i) => LP + i * stepX
  const yOf = (v) => bottomY - (v / props.maxValue) * drawH

  // 1. Y 轴虚线 + 标签
  c.strokeStyle = '#e2e8f0'
  c.lineWidth = 1
  c.setLineDash([3, 3])
  c.fillStyle = '#94a3b8'
  c.font = '10px sans-serif'
  c.textAlign = 'right'
  c.textBaseline = 'middle'
  props.yTicks.forEach((tick) => {
    const y = yOf(tick)
    c.beginPath()
    c.moveTo(LP, y)
    c.lineTo(props.W - RP, y)
    c.stroke()
    c.fillText(String(tick), LP - 6, y)
  })
  c.setLineDash([])

  // 2. 折线点坐标
  const pts = props.series.map((v, i) => [xOf(i), yOf(v)])

  // 3. 渐变面积
  const g = c.createLinearGradient(0, TP, 0, bottomY)
  g.addColorStop(0, hexToRgba(props.color, 0.12))
  g.addColorStop(1, hexToRgba(props.color, 0))
  c.beginPath()
  c.moveTo(pts[0][0], bottomY)
  pts.forEach((p) => c.lineTo(p[0], p[1]))
  c.lineTo(pts[pts.length - 1][0], bottomY)
  c.closePath()
  c.fillStyle = g
  c.fill()

  // 4. 折线（平滑）
  c.beginPath()
  c.moveTo(pts[0][0], pts[0][1])
  if (!props.smooth || pts.length < 3) {
    pts.forEach((p) => c.lineTo(p[0], p[1]))
  } else {
    for (let i = 1; i < pts.length - 1; i++) {
      const xc = (pts[i][0] + pts[i + 1][0]) / 2
      const yc = (pts[i][1] + pts[i + 1][1]) / 2
      c.quadraticCurveTo(pts[i][0], pts[i][1], xc, yc)
    }
    c.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1])
  }
  c.strokeStyle = props.color
  c.lineWidth = 2.5
  c.lineJoin = 'round'
  c.lineCap = 'round'
  c.stroke()

  // 5. 数据点 + 数值标签
  c.textAlign = 'center'
  c.textBaseline = 'bottom'
  c.fillStyle = '#334155'
  c.font = 'bold 11px sans-serif'
  pts.forEach((p, i) => {
    // 数值标签（圆点上方 10px）
    c.fillText(String(props.series[i]), p[0], p[1] - 10)

    const isLast = i === pts.length - 1
    if (isLast) {
      // 最后一个点：空心圆 + 外圈高亮
      c.beginPath()
      c.arc(p[0], p[1], 7, 0, Math.PI * 2)
      c.strokeStyle = props.color
      c.lineWidth = 2
      c.stroke()
      c.beginPath()
      c.arc(p[0], p[1], 5, 0, Math.PI * 2)
      c.fillStyle = '#fff'
      c.fill()
      c.beginPath()
      c.arc(p[0], p[1], 5, 0, Math.PI * 2)
      c.strokeStyle = props.color
      c.lineWidth = 1.5
      c.stroke()
    } else {
      // 普通点：实心圆点
      c.beginPath()
      c.arc(p[0], p[1], 3.5, 0, Math.PI * 2)
      c.fillStyle = props.color
      c.fill()
    }
  })

  // 6. X 轴日期标签
  c.font = '11px sans-serif'
  c.textAlign = 'center'
  c.textBaseline = 'top'
  props.labels.forEach((label, i) => {
    const isLast = i === props.labels.length - 1
    c.fillStyle = (isLast && props.highlightLastLabel) ? props.color : '#64748b'
    c.fillText(label, xOf(i), bottomY + 8)
  })

  // 7. 右上角图例（如果传入 legend）
  if (props.legend) {
    const lx = props.W - 90
    const ly = 14
    c.beginPath()
    c.moveTo(lx, ly)
    c.lineTo(lx + 15, ly)
    c.strokeStyle = props.color
    c.lineWidth = 3
    c.lineCap = 'round'
    c.stroke()
    c.fillStyle = '#64748b'
    c.font = '11px sans-serif'
    c.textAlign = 'left'
    c.textBaseline = 'middle'
    c.fillText(props.legend, lx + 20, ly + 1)
  }
}

function hexToRgba(hex, a) {
  const h = hex.replace('#', '')
  const n = parseInt(h, 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}

watch(() => props.series, () => { if (ctx.value) draw() }, { deep: true })
watch(() => props.labels, () => { if (ctx.value) draw() }, { deep: true })
watch(() => props.color, () => { if (ctx.value) draw() })
watch(() => props.maxValue, () => { if (ctx.value) draw() })
watch([() => props.W, () => props.H], () => { initCanvas() })

onMounted(initCanvas)
</script>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | string | '' | 图表标题（如"近7日活力"） |
| legend | string | '' | 右上角图例文字（如"活力指数"） |
| series | number[] | - | 数值序列 |
| labels | string[] | - | X 轴日期标签 |
| highlightLastLabel | boolean | true | 最后一个 X 标签是否绿色高亮 |
| color | string | '#10b981' | 主色（默认翡翠绿） |
| maxValue | number | 100 | Y 轴最大值 |
| yTicks | number[] | [0,25,50,75,100] | Y 轴刻度值 |
| smooth | boolean | true | 平滑曲线 |
| W | number | 340 | 画布宽度 |
| H | number | 180 | 画布高度 |

## 跨端说明

- 条件编译切换小程序 `type="2d"` 与 H5/App 普通 canvas。
- Y 轴刻度、X 轴标签、数值标注、图例全部由 canvas `fillText` / `stroke` 绘制。
- 最后一个数据点特殊处理：外圈（r=7, stroke）+ 空心圆（r=5, fill white）+ 内描边。
- "今天"标签绿色高亮通过 `highlightLastLabel` 控制。

## 变体参考

- 默认绿 → `color: '#10b981'`（健康/活力场景）
- 蓝色版 → `color: '#3b82f6'`（销售/业绩场景）
- 橙色版 → `color: '#f59e0b'`（预警/热量场景）
- 不标数值 → `card-line`（默认折线，只有末端圆点）
- 带 tooltip → `card-line-tooltip`（hover 节点出气泡）
- 多线对比 → `card-line-multi`（多条折线 + 图例）
