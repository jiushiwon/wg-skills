# card-line 折线图卡片

> canvas 2d 平滑折线图（跨端兼容），展示数据趋势。含主数值、涨跌指示、渐变填充。
> 图表基座与跨端初始化见 [_canvas-base.md](./_canvas-base.md)。

## 形态特征

| 特征 | 值 |
|------|-----|
| 容器 | `base-card` |
| 标题区 | 24px 数值 + 12px 涨跌 |
| 图表区 | 高度 160 px |
| 网格 | 3 条虚线（40/80/120） |
| 曲线 | 平滑贝塞尔 + 渐变填充 |
| 高亮 | 末端圆点 + tooltip |

## 适用场景

- 销售 / GMV / 营收趋势
- 活跃用户、留存曲线
- 心率 / 步数 / 体重等健康数据
- 股价、汇率走势

## 组件代码

```vue
<base-card :padding="0">
  <view class="chart-head">
    <view>
      <text class="chart-title">{{ title }}</text>
      <text class="chart-value">{{ value }}</text>
    </view>
    <view class="chart-meta" :class="{ 'is-down': trend.direction === 'down' }">
      <text>{{ trend.value }}</text>
      <text class="chart-meta-sep">{{ trend.compareText }}</text>
    </view>
  </view>

  <view class="chart-body">
    <!-- #ifdef MP-WEIXIN || MP-ALIPAY || MP-TOUTIAO -->
    <canvas class="chart-canvas" type="2d" id="lineChart" :style="{ width: W + 'px', height: H + 'px' }" />
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
  title: String,
  value: String,
  trend: { type: Object, default: () => ({ value: '', direction: 'up', compareText: '' }) },
  series: { type: Array, default: () => [] },   // number[]
  labels: { type: Array, default: () => [] },   // string[]
  color: { type: String, default: '#3b82f6' },
  smooth: { type: Boolean, default: true },
  W: { type: Number, default: 340 },
  H: { type: Number, default: 160 },
})

const canvasRef = ref(null)
const ctx = ref(null)

async function initCanvas() {
  await nextTick()
  const dpr = (uni.getSystemInfoSync().pixelRatio) || 1
  let c
  // #ifdef MP-WEIXIN || MP-ALIPAY || MP-TOUTIAO
  c = await new Promise((resolve) => {
    uni.createSelectorQuery().in(getCurrentInstance())
      .select('#lineChart').fields({ node: true, size: true }).exec((ret) => {
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

function point(i, max) {
  const n = props.series.length || 1
  const pad = 8
  const x = pad + (i / (n - 1 || 1)) * (props.W - pad * 2)
  const y0 = props.H - pad - 6
  const y = y0 - (props.series[i] / max) * (props.H - pad * 2 - 12)
  return [x, y]
}

function buildPath(ctx2, max) {
  const pts = props.series.map((_, i) => point(i, max))
  ctx2.beginPath()
  ctx2.moveTo(pts[0][0], pts[0][1])
  if (!props.smooth || pts.length < 3) {
    pts.forEach((p) => ctx2.lineTo(p[0], p[1]))
  } else {
    for (let i = 1; i < pts.length - 1; i++) {
      const xc = (pts[i][0] + pts[i + 1][0]) / 2
      const yc = (pts[i][1] + pts[i + 1][1]) / 2
      ctx2.quadraticCurveTo(pts[i][0], pts[i][1], xc, yc)
    }
    const last = pts[pts.length - 1]
    ctx2.lineTo(last[0], last[1])
  }
  return pts
}

function draw() {
  const c = ctx.value
  if (!c || !props.series.length) return
  c.clearRect(0, 0, props.W, props.H)
  const max = Math.max(...props.series) * 1.1 || 1

  // 网格（3 条虚线 40/80/120）
  c.strokeStyle = '#e2e8f0'
  c.lineWidth = 1
  c.setLineDash([3, 3])
  for (let i = 1; i <= 3; i++) {
    const gy = (props.H / 4) * i
    c.beginPath()
    c.moveTo(0, gy)
    c.lineTo(props.W, gy)
    c.stroke()
  }
  c.setLineDash([])

  const pts = buildPath(c, max)

  // 渐变面积填充
  const g = c.createLinearGradient(0, 0, 0, props.H)
  g.addColorStop(0, hexToRgba(props.color, 0.25))
  g.addColorStop(1, hexToRgba(props.color, 0))
  c.beginPath()
  c.moveTo(pts[0][0], props.H - 6)
  pts.forEach((p) => c.lineTo(p[0], p[1]))
  c.lineTo(pts[pts.length - 1][0], props.H - 6)
  c.closePath()
  c.fillStyle = g
  c.fill()

  // 折线
  c.beginPath()
  c.moveTo(pts[0][0], pts[0][1])
  for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1])
  c.strokeStyle = props.color
  c.lineWidth = 2
  c.lineJoin = 'round'
  c.lineCap = 'round'
  c.stroke()

  // 末端高亮圆点
  const end = pts[pts.length - 1]
  c.beginPath()
  c.arc(end[0], end[1], 4, 0, Math.PI * 2)
  c.fillStyle = props.color
  c.fill()
  c.beginPath()
  c.arc(end[0], end[1], 2.5, 0, Math.PI * 2)
  c.fillStyle = '#fff'
  c.fill()
}

function hexToRgba(hex, a) {
  const h = hex.replace('#', '')
  const n = parseInt(h, 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}

watch(() => props.series, () => { if (ctx.value) draw() }, { deep: true })
watch(() => props.color, () => { if (ctx.value) draw() })
watch(() => props.smooth, () => { if (ctx.value) draw() })
watch([() => props.W, () => props.H], () => { initCanvas() })

onMounted(initCanvas)
</script>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | string | - | 图表标题 |
| value | string | - | 主数值 |
| trend | { value, direction, compareText } | - | 涨跌信息 |
| series | number[] | - | 数值序列 |
| labels | string[] | - | X 轴标签 |
| color | string | '#3b82f6' | 主色 |
| smooth | boolean | true | 平滑曲线 |
| W | number | 340 | 画布宽度（逻辑 px） |
| H | number | 160 | 画布高度（逻辑 px） |

## 跨端说明

- 小程序端用 `<canvas type="2d">` + `createSelectorQuery` 获取节点；H5/App 用普通 canvas。二者由条件编译切换。
- 画布按 DPR 缩放，保证高分屏清晰。
- 折线的渐变填充、虚线网格、末端高亮圆点均由 canvas API 绘制。

## 变体参考

- 单线 → `card-line`（默认）
- 双线对比 → 两条 path + 颜色区分
- 阶梯线 → `smooth: false`，折线直角连接
- 大数据量 → 折线 + 区域选中（hover 高亮）