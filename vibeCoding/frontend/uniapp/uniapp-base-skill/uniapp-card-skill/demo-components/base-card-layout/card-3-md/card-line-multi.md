# card-line-multi 折线图 · 多线对比

> canvas 2d 多线对比图（跨端兼容），本月 / 上月 / 平均，含彩色图例与虚线区分。
> 图表基座见 [_canvas-base.md](./_canvas-base.md)，公共绘制见 [_chart-draw.md](./_chart-draw.md)。

## 形态特征

| 特征 | 值 |
|------|-----|
| 容器 | `base-card` |
| 主线宽度 | 2.5 px（突出当前） |
| 副线宽度 | 1.5 px |
| 样式 | 实线 / 虚线 / 半透明 |
| 高亮 | 当前线末端圆点 |
| 图例 | 彩色短线 + 名称 |

## 适用场景

- 多产品线销售对比
- 多部门业绩排行
- 多渠道流量分析
- 同比 / 环比

## 组件代码

```vue
<base-card :padding="0">
  <view class="chart-head">
    <text class="chart-title">{{ title }}</text>
    <text class="chart-value">{{ value }}</text>
  </view>

  <view class="chart-legend">
    <view v-for="l in lines" :key="l.name" class="chart-legend-item">
      <view class="chart-legend-dot" :style="{ background: l.color }"/>
      <text>{{ l.name }}</text>
    </view>
  </view>

  <view class="chart-body">
    <!-- #ifdef MP-WEIXIN || MP-ALIPAY || MP-TOUTIAO -->
    <canvas class="chart-canvas" type="2d" id="multiChart" :style="{ width: W + 'px', height: H + 'px' }" />
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
  value: String,
  lines: { type: Array, default: () => [] }, // Line[]
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
      .select('#multiChart').fields({ node: true, size: true }).exec((ret) => {
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
  if (!c || !props.lines.length) return
  c.clearRect(0, 0, props.W, props.H)

  const all = props.lines.flatMap((l) => l.data)
  const max = Math.max(...all) * 1.1 || 1
  const pad = 8
  const bottom = props.H - pad
  const n = Math.max(...props.lines.map((l) => l.data.length)) || 1

  const pointsOf = (data) => data.map((v, i) => {
    const x = pad + (i / (n - 1 || 1)) * (props.W - pad * 2)
    const y = bottom - (v / max) * (props.H - pad * 2 - 8)
    return [x, y]
  })

  props.lines.forEach((l) => {
    const pts = pointsOf(l.data)
    c.beginPath()
    c.moveTo(pts[0][0], pts[0][1])
    if (pts.length < 3) pts.forEach((p) => c.lineTo(p[0], p[1]))
    else {
      for (let i = 1; i < pts.length - 1; i++) {
        const xc = (pts[i][0] + pts[i + 1][0]) / 2
        const yc = (pts[i][1] + pts[i + 1][1]) / 2
        c.quadraticCurveTo(pts[i][0], pts[i][1], xc, yc)
      }
      c.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1])
    }
    // active 主线加粗 2.5，副线 1.5
    c.strokeStyle = l.color
    c.lineWidth = l.active ? 2.5 : 1.5
    c.globalAlpha = l.dashed ? 0.6 : 1
    c.setLineDash(l.dashed ? [4, 4] : [])
    c.lineJoin = 'round'
    c.stroke()
    c.setLineDash([])
    c.globalAlpha = 1

    // 主线末端圆点
    if (l.active) {
      const end = pts[pts.length - 1]
      c.beginPath()
      c.arc(end[0], end[1], 3.5, 0, Math.PI * 2)
      c.fillStyle = l.color
      c.fill()
    }
  })
}

watch(() => props.lines, () => { if (ctx.value) draw() }, { deep: true })
watch([() => props.W, () => props.H], () => { initCanvas() })

onMounted(initCanvas)
</script>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | string | - | 图表标题 |
| value | string | - | 主数值 |
| lines | Line[] | - | 多线数据 |
| labels | string[] | - | X 轴标签 |
| W | number | 340 | 画布宽度 |
| H | number | 160 | 画布高度 |

**Line 子结构**：
| 字段 | 类型 | 说明 |
|------|------|------|
| name | string | 名称（图例） |
| color | string | 颜色 |
| data | number[] | 数值 |
| dashed | boolean | 是否虚线 |
| active | boolean | 是否主线（高亮） |

## 跨端说明

- 条件编译切换小程序 `type="2d"` 与 H5/App 普通 canvas。
- 多线绘制：active 主线加粗 2.5、副线 1.5；dashed 用 `setLineDash` + 半透明。
- 图例仍是 `view` 渲染（CSS），不占画布。

## 变体参考

- 2 线对比 → `card-line-multi`（本月 vs 上月）
- 3 线对比 → + 平均线（虚线）
- 4+ 线对比 → 调色板使用浅色调，避免视觉混乱