# card-radar 雷达图卡片

> canvas 2d 雷达图（跨端兼容），多维能力 / 评分对比展示。含多层多边形网格 + 双数据对比。
> 图表基座见 [_canvas-base.md](./_canvas-base.md)。

## 形态特征

| 特征 | 值 |
|------|-----|
| 容器 | `base-card` |
| 雷达直径 | 160 px |
| 多边形层级 | 4 层（20/40/60/80%） |
| 维度数 | 3 ~ 8（推荐 5~6） |
| 双数据 | 本人 vs 同行平均（虚线） |

## 适用场景

- 综合能力评估（HR / 绩效）
- 产品多维度评分
- 个人技能雷达
- 游戏角色属性图
- 健康多指标（体能 / 力量 / 柔韧）

## 组件代码

```vue
<base-card :padding="0">
  <view class="chart-head">
    <view>
      <text class="chart-title">{{ title }}</text>
      <text class="chart-value">{{ totalScore }}<text class="unit"> / 综合分</text></text>
    </view>
    <view class="chart-meta">{{ rankText }}</view>
  </view>
  <view class="chart-body">
    <view class="radar-wrap">
      <!-- #ifdef MP-WEIXIN || MP-ALIPAY || MP-TOUTIAO -->
      <canvas class="radar-canvas" type="2d" id="radarChart" :style="{ width: size + 'px', height: size + 'px' }" />
      <!-- #endif -->
      <!-- #ifndef MP-WEIXIN || MP-ALIPAY || MP-TOUTIAO -->
      <canvas ref="canvasRef" class="radar-canvas" :style="{ width: size + 'px', height: size + 'px' }" />
      <!-- #endif -->
    </view>

    <view class="radar-stats">
      <view v-for="(label, i) in labels" :key="`s-${i}`" class="radar-stat-row">
        <text class="radar-stat-label">
          <view class="radar-stat-dot" />
          {{ label }}
        </text>
        <text class="radar-stat-val">{{ selfValues[i] }}</text>
      </view>
    </view>
  </view>
</base-card>
```

```vue
<script setup>
import { ref, onMounted, nextTick, watch, getCurrentInstance } from 'vue'
import { hexToRgba } from './_chart-draw'

const props = defineProps({
  title: String,
  totalScore: Number,
  rankText: String,
  labels: { type: Array, default: () => [] },
  selfValues: { type: Array, default: () => [] },
  peerValues: { type: Array, default: () => [] },
  maxValue: { type: Number, default: 100 },
  ringLevels: { type: Array, default: () => [20, 40, 60, 80] },
  size: { type: Number, default: 200 },
  selfColor: { type: String, default: '#3b82f6' },
  peerColor: { type: String, default: '#94a3b8' },
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
      .select('#radarChart').fields({ node: true, size: true }).exec((ret) => {
        const node = ret && ret[0] && ret[0].node
        if (!node) return resolve(null)
        node.width = props.size * dpr
        node.height = props.size * dpr
        const c2 = node.getContext('2d')
        c2.scale(dpr, dpr)
        resolve(c2)
      })
  })
  // #endif
  // #ifndef MP-WEIXIN || MP-ALIPAY || MP-TOUTIAO
  if (canvasRef.value) {
    canvasRef.value.width = props.size * dpr
    canvasRef.value.height = props.size * dpr
    c = canvasRef.value.getContext('2d')
    c.scale(dpr, dpr)
  }
  // #endif
  ctx.value = c
  if (c) draw()
}

function vertex(i, ratio) {
  const n = props.labels.length
  const cx = props.size / 2
  const cy = props.size / 2
  const R = props.size / 2 - 18
  const angle = (Math.PI * 2 / n) * i - Math.PI / 2
  return [cx + Math.cos(angle) * R * ratio, cy + Math.sin(angle) * R * ratio]
}

function polygon(ratio) {
  return props.labels.map((_, i) => vertex(i, ratio))
}

function draw() {
  const c = ctx.value
  if (!c || !props.labels.length) return
  c.clearRect(0, 0, props.size, props.size)
  const n = props.labels.length
  const cx = props.size / 2
  const cy = props.size / 2

  // 网格多边形（4 层）
  c.strokeStyle = '#e2e8f0'
  c.lineWidth = 1
  props.ringLevels.forEach((lv) => {
    const pts = polygon(lv / 100)
    c.beginPath()
    pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])))
    c.closePath()
    c.stroke()
  })

  // 轴线
  for (let i = 0; i < n; i++) {
    const [x, y] = vertex(i, 1)
    c.beginPath()
    c.moveTo(cx, cy)
    c.lineTo(x, y)
    c.strokeStyle = '#e2e8f0'
    c.stroke()
  }

  // peer（虚线）
  if (props.peerValues && props.peerValues.length) {
    const pts = props.peerValues.map((v, i) => vertex(i, v / props.maxValue))
    c.beginPath()
    pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])))
    c.closePath()
    c.strokeStyle = props.peerColor
    c.lineWidth = 1.5
    c.setLineDash([4, 4])
    c.stroke()
    c.setLineDash([])
  }

  // self（实线 + 半透明填充）
  const spts = props.selfValues.map((v, i) => vertex(i, v / props.maxValue))
  c.beginPath()
  spts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])))
  c.closePath()
  c.fillStyle = hexToRgba(props.selfColor, 0.25)
  c.fill()
  c.strokeStyle = props.selfColor
  c.lineWidth = 2
  c.stroke()

  // 维度标签
  c.fillStyle = '#64748b'
  c.font = '10px sans-serif'
  c.textAlign = 'center'
  c.textBaseline = 'middle'
  props.labels.forEach((label, i) => {
    const [x, y] = vertex(i, 1.18)
    c.fillText(label, x, y)
  })
}

watch(() => [props.selfValues, props.peerValues, props.labels], () => { if (ctx.value) draw() }, { deep: true })
watch(() => props.maxValue, () => { if (ctx.value) draw() })
watch(() => [props.selfColor, props.peerColor], () => { if (ctx.value) draw() })
watch(() => props.size, () => { initCanvas() })

onMounted(initCanvas)
</script>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | string | - | 图表标题 |
| totalScore | number | - | 综合分 |
| labels | string[] | - | 维度名 |
| selfValues | number[] | - | 本人分数 |
| peerValues | number[] | - | 同行分数（可选） |
| maxValue | number | 100 | 最大值 |
| ringLevels | number[] | [20,40,60,80] | 网格层百分比 |
| size | number | 200 | 画布边长 |
| selfColor | string | '#3b82f6' | 本人颜色 |
| peerColor | string | '#94a3b8' | 同行颜色 |

## 跨端说明

- 条件编译切换小程序 2d 与 H5/App 普通 canvas。
- 多边形网格、轴线、双数据叠加、维度文字全在 canvas 绘制。
- peer 用 `setLineDash` 虚线，self 实线 + 25% 透明度填充。

## 变体参考

- 单数据 → `card-radar`（默认）
- 双数据对比 → `peerValues`（虚线层）
- 三方对比 → 三个 polygon 叠加
- 实心填充 → 提高 `fill-opacity` 透明度区分层级