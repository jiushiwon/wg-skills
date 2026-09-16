# card-line-area 折线图 · 堆叠面积图

> canvas 2d 多层面积堆叠图（跨端兼容），展示各组成部分累计变化。适合渠道分布、能量来源等场景。
> 图表基座见 [_canvas-base.md](./_canvas-base.md)。

## 形态特征

| 特征 | 值 |
|------|-----|
| 容器 | `base-card` |
| 层数 | 2~5 层（推荐 3 层） |
| 填充透明度 | 0.85 |
| 图例 | 彩色方块 + 名称 |
| 累计 | 顶部数字 + 涨跌 |

## 适用场景

- 渠道访问占比（搜索 / 直接 / 社交）
- 能量来源构成（电 / 水 / 燃气）
- 收入来源拆分
- 用户来源构成

## 组件代码

```vue
<base-card :padding="0">
  <view class="chart-head">
    <text class="chart-title">{{ title }}</text>
    <view class="chart-value-row">
      <text class="chart-value">{{ total }}</text>
      <text class="chart-meta">{{ trend }}</text>
    </view>
  </view>

  <view class="chart-legend">
    <view v-for="(l, i) in legend" :key="i" class="chart-legend-item">
      <view class="chart-legend-dot" :style="{ background: colors[i] }"/>
      <text>{{ l }}</text>
    </view>
  </view>

  <view class="chart-body">
    <!-- #ifdef MP-WEIXIN || MP-ALIPAY || MP-TOUTIAO -->
    <canvas class="chart-canvas" type="2d" id="areaChart" :style="{ width: W + 'px', height: H + 'px' }" />
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
import { hexToRgba } from './_chart-draw'

const props = defineProps({
  title: String,
  total: String,
  trend: String,
  series: { type: Array, default: () => [] }, // number[][] 底层到顶层
  colors: { type: Array, default: () => [] },
  legend: { type: Array, default: () => [] },
  labels: { type: Array, default: () => [] },
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
      .select('#areaChart').fields({ node: true, size: true }).exec((ret) => {
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
  if (!c || !props.series.length || !props.series[0].length) return
  c.clearRect(0, 0, props.W, props.H)

  const pad = 8
  const bottom = props.H - pad
  const n = props.series[0].length
  // 总累计 max
  const max = Math.max(...props.series.map((s) => s.reduce((a, b) => a + b, 0))) * 1.1 || 1

  const xOf = (i) => pad + (i / (n - 1 || 1)) * (props.W - pad * 2)
  const yOf = (v) => bottom - (v / max) * (props.H - pad * 2 - 8)

  // 从底层到顶层画累计面积（每层闭合到自己的下边界曲线）
  props.series.forEach((layer, li) => {
    const upper = layer.map((_, i) => props.series.slice(0, li + 1).reduce((a, s) => a + s[i], 0))
    const lowerPts = props.series.slice(0, li).reduce((acc, s) => {
      s.forEach((v, i) => { acc[i] = (acc[i] || 0) + v })
      return acc
    }, []).map((v, i) => [xOf(i), yOf(v || 0)])
    const upperPts = upper.map((v, i) => [xOf(i), yOf(v)])

    c.beginPath()
    c.moveTo(upperPts[0][0], upperPts[0][1])
    upperPts.forEach((p) => c.lineTo(p[0], p[1]))
    // 从右往左沿 lower 边界闭合
    for (let i = lowerPts.length - 1; i >= 0; i--) c.lineTo(lowerPts[i][0], lowerPts[i][1])
    c.closePath()
    c.fillStyle = hexToRgba(props.colors[li] || '#3b82f6', 0.85)
    c.fill()
  })
}

watch(() => props.series, () => { if (ctx.value) draw() }, { deep: true })
watch(() => props.colors, () => { if (ctx.value) draw() }, { deep: true })
watch([() => props.W, () => props.H], () => { initCanvas() })

onMounted(initCanvas)
</script>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | string | - | 图表标题 |
| total | string | - | 累计总数 |
| trend | string | - | 涨跌 |
| series | number[][] | - | 多层数据（从底层到顶层） |
| colors | string[] | - | 颜色数组 |
| legend | string[] | - | 图例名 |
| labels | string[] | - | X 轴标签 |
| W | number | 340 | 画布宽度 |
| H | number | 160 | 画布高度 |

## 跨端说明

- 条件编译切换小程序 2d 与 H5/App 普通 canvas。
- 堆叠面积按"累计值曲线"逐层闭合填充，透明度 0.85。

## 变体参考

- 2 层堆叠 → `card-line-area`（精简版）
- 3 层堆叠 → 默认（搜索 / 直接 / 社交）
- 5 层堆叠 → 完整分布
- 时间累积 → 展示每周新增累计