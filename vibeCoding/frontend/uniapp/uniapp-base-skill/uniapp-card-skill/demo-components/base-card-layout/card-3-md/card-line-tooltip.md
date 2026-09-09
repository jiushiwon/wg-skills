# card-line-tooltip 折线图 · 节点 tooltip

> canvas 2d 折线图 + 数据节点圆点 + 活动节点 tooltip（跨端兼容）。展示"关键时刻"的具体数值。
> 图表基座见 [_canvas-base.md](./_canvas-base.md)。

## 形态特征

| 特征 | 值 |
|------|-----|
| 容器 | `base-card` |
| 节点圆点 | 直径 6px（默认）、10px（激活） |
| 激活节点 | 实心蓝色 + 白色描边 |
| 引导线 | 垂直虚线，连接激活点到 X 轴 |
| Tooltip | 绝对定位，深色背景 + 倒三角箭头 |

## 适用场景

- 服务器响应时间（异常时刻）
- 股价关键点提示
- 性能监控（异常事件标注）
- 异常数据点高亮

## 组件代码

```vue
<base-card :padding="0">
  <view class="chart-head">
    <text class="chart-title">{{ title }}</text>
    <view class="chart-value-row">
      <text class="chart-value">{{ value }}</text>
    </view>
  </view>

  <view class="chart-body" style="position: relative;">
    <!-- #ifdef MP-WEIXIN || MP-ALIPAY || MP-TOUTIAO -->
    <canvas class="chart-canvas" type="2d" id="tooltipChart" :style="{ width: W + 'px', height: H + 'px' }" />
    <!-- #endif -->
    <!-- #ifndef MP-WEIXIN || MP-ALIPAY || MP-TOUTIAO -->
    <canvas ref="canvasRef" class="chart-canvas" :style="{ width: W + 'px', height: H + 'px' }" />
    <!-- #endif -->

    <view v-if="activeIndex !== null && tipPos.left !== null" class="tooltip-box"
      :style="{ left: tipPos.left + 'px', top: tipPos.top + 'px' }">
      <text class="tooltip-label">{{ tooltip.label }}</text>
      <text class="tooltip-value">{{ tooltip.value }}</text>
    </view>
  </view>
</base-card>
```

```vue
<script setup>
import { ref, reactive, onMounted, nextTick, watch, getCurrentInstance } from 'vue'
import { hexToRgba } from './_chart-draw'

const props = defineProps({
  title: String,
  value: String,
  series: { type: Array, default: () => [] }, // number[]
  labels: { type: Array, default: () => [] },
  activeIndex: { type: Number, default: null },
  tooltip: { type: Object, default: () => ({ label: '', value: '' }) },
  color: { type: String, default: '#3b82f6' },
  W: { type: Number, default: 340 },
  H: { type: Number, default: 160 },
})

const canvasRef = ref(null)
const ctx = ref(null)
const tipPos = reactive({ left: null, top: null })

const pad = 8
const maxOf = () => Math.max(...props.series) * 1.1 || 1
function xOf(i) {
  const n = props.series.length || 1
  return pad + (i / (n - 1 || 1)) * (props.W - pad * 2)
}
function yOf(v) {
  const bottom = props.H - pad - 6
  return bottom - (v / maxOf()) * (props.H - pad * 2 - 12)
}

async function initCanvas() {
  await nextTick()
  const dpr = (uni.getSystemInfoSync().pixelRatio) || 1
  let c
  // #ifdef MP-WEIXIN || MP-ALIPAY || MP-TOUTIAO
  c = await new Promise((resolve) => {
    uni.createSelectorQuery().in(getCurrentInstance())
      .select('#tooltipChart').fields({ node: true, size: true }).exec((ret) => {
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
  const bottom = props.H - pad - 6
  const pts = props.series.map((v, i) => [xOf(i), yOf(v)])

  // 折线 + 面积
  const g = c.createLinearGradient(0, 0, 0, props.H)
  g.addColorStop(0, hexToRgba(props.color, 0.25))
  g.addColorStop(1, hexToRgba(props.color, 0))
  c.beginPath()
  c.moveTo(pts[0][0], bottom)
  pts.forEach((p) => c.lineTo(p[0], p[1]))
  c.lineTo(pts[pts.length - 1][0], bottom)
  c.closePath()
  c.fillStyle = g
  c.fill()

  c.beginPath()
  c.moveTo(pts[0][0], pts[0][1])
  pts.forEach((p) => c.lineTo(p[0], p[1]))
  c.strokeStyle = props.color
  c.lineWidth = 2
  c.lineJoin = 'round'
  c.stroke()

  // 引导线（active 垂直虚线）
  if (props.activeIndex !== null && props.activeIndex < pts.length) {
    const ax = xOf(props.activeIndex)
    c.beginPath()
    c.moveTo(ax, pts[props.activeIndex][1])
    c.lineTo(ax, bottom)
    c.strokeStyle = props.color
    c.lineWidth = 1
    c.setLineDash([3, 3])
    c.globalAlpha = 0.5
    c.stroke()
    c.setLineDash([])
    c.globalAlpha = 1
  }

  // 节点圆点
  pts.forEach((p, i) => {
    const active = i === props.activeIndex
    c.beginPath()
    c.arc(p[0], p[1], active ? 5 : 3, 0, Math.PI * 2)
    c.fillStyle = active ? props.color : '#fff'
    c.fill()
    if (active) {
      c.beginPath()
      c.arc(p[0], p[1], 5, 0, Math.PI * 2)
      c.strokeStyle = props.color
      c.lineWidth = 1.5
      c.stroke()
    }
  })

  // 同步 tooltip 定位（供 view 层绝对定位）
  if (props.activeIndex !== null && props.activeIndex < pts.length) {
    tipPos.left = pts[props.activeIndex][0] - 30
    tipPos.top = pts[props.activeIndex][1] - 50
  } else {
    tipPos.left = null
    tipPos.top = null
  }
}

watch(() => props.series, () => { if (ctx.value) draw() }, { deep: true })
watch(() => props.activeIndex, () => { if (ctx.value) draw() })
watch(() => props.tooltip, () => { if (ctx.value) draw() }, { deep: true })
watch(() => props.color, () => { if (ctx.value) draw() })
watch([() => props.W, () => props.H], () => { initCanvas() })

onMounted(initCanvas)
</script>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | string | - | 图表标题 |
| value | string | - | 主数值 |
| series | number[] | - | 数值序列 |
| labels | string[] | - | X 轴标签 |
| activeIndex | number \| null | - | 高亮节点 |
| tooltip | { label, value } | - | tooltip 内容 |
| color | string | '#3b82f6' | 主色 |
| W | number | 340 | 画布宽度 |
| H | number | 160 | 画布高度 |

## 跨端说明

- 条件编译切换小程序 2d 与 H5/App 普通 canvas。
- 引导虚线、节点圆点、激活描边全在 canvas 绘制。
- tooltip 气泡仍是 `view` 覆盖层，位置由 canvas 绘制时同步计算到 `tipPos`。

## 变体参考

- 单点高亮 → `card-line-tooltip`（默认）
- 多点高亮 → `activeIndexes: number[]`，多个 tooltip
- 范围高亮 → 高亮一段区域（如 P95）
- 阈值线 → 添加水平参考线（基线 / 阈值）