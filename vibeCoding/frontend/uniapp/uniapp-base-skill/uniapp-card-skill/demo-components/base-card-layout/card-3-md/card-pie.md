# card-pie 环形饼图卡片

> canvas 2d 环形饼图（跨端兼容），展示占比分析。含中心数值 + 右侧彩色图例。
> 图表基座见 [_canvas-base.md](./_canvas-base.md)。

## 形态特征

| 特征 | 值 |
|------|-----|
| 容器 | `base-card` |
| 环形直径 | 140 px |
| 描边宽度 | 6 px（stroke-width） |
| 中心 | 大数值 + 小标签 |
| 图例 | 4 项：颜色点 + 名称 + 数值 + 百分比 |

## 适用场景

- 流量来源、用户构成
- 消费分类、预算占比
- 任务分布、状态占比
- 商品类别销售占比

## 组件代码

```vue
<base-card :padding="0">
  <view class="chart-head">
    <view>
      <text class="chart-title">{{ title }}</text>
      <text class="chart-value">{{ value }}</text>
    </view>
  </view>
  <view class="chart-body">
    <view class="donut-wrap">
      <!-- #ifdef MP-WEIXIN || MP-ALIPAY || MP-TOUTIAO -->
      <canvas class="donut-canvas" type="2d" id="pieChart" :style="{ width: size + 'px', height: size + 'px' }" />
      <!-- #endif -->
      <!-- #ifndef MP-WEIXIN || MP-ALIPAY || MP-TOUTIAO -->
      <canvas ref="canvasRef" class="donut-canvas" :style="{ width: size + 'px', height: size + 'px' }" />
      <!-- #endif -->
      <view class="donut-center">
        <text class="donut-center-num">{{ total }}</text>
        <text class="donut-center-label">{{ totalLabel }}</text>
      </view>
    </view>
    <view class="pie-legend">
      <view v-for="s in segments" :key="s.label" class="pie-legend-item">
        <view class="pie-legend-left">
          <view class="pie-legend-dot" :style="{ background: s.color }"/>
          <text>{{ s.label }}</text>
        </view>
        <view>
          <text class="pie-legend-val">{{ s.value }}</text>
          <text class="pie-legend-pct">{{ s.pct }}%</text>
        </view>
      </view>
    </view>
  </view>
</base-card>
```

```vue
<script setup>
import { ref, onMounted, nextTick, watch, getCurrentInstance } from 'vue'

const props = defineProps({
  title: String,
  value: String,
  total: String,
  totalLabel: String,
  segments: { type: Array, default: () => [] }, // {label, value, color, pct}[]
  type: { type: String, default: 'donut' }, // donut | pie
  size: { type: Number, default: 140 },
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
      .select('#pieChart').fields({ node: true, size: true }).exec((ret) => {
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

function draw() {
  const c = ctx.value
  if (!c || !props.segments.length) return
  c.clearRect(0, 0, props.size, props.size)

  const cx = props.size / 2
  const cy = props.size / 2
  const outerR = props.size / 2 - 8
  const innerR = props.type === 'pie' ? 0 : outerR * 0.72
  const totalPct = props.segments.reduce((a, s) => a + s.pct, 0) || 1

  let start = -Math.PI / 2 // 从 12 点方向
  props.segments.forEach((s) => {
    const sweep = (s.pct / 100) * Math.PI * 2
    c.beginPath()
    c.arc(cx, cy, outerR, start, start + sweep)
    if (innerR > 0) {
      c.arc(cx, cy, innerR, start + sweep, start, true)
      c.closePath()
    } else {
      c.lineTo(cx, cy)
      c.closePath()
    }
    c.fillStyle = s.color
    c.fill()
    start += sweep
  })
}

watch(() => props.segments, () => { if (ctx.value) draw() }, { deep: true })
watch(() => props.type, () => { if (ctx.value) draw() })
watch(() => props.size, () => { initCanvas() })

onMounted(initCanvas)
</script>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | string | - | 图表标题 |
| total | string | - | 中心主数 |
| totalLabel | string | - | 中心副标 |
| segments | {label, value, color, pct}[] | - | 段数据 |
| type | 'donut' \| 'pie' | 'donut' | 环形 / 饼 |
| size | number | 140 | 画布边长 |

## 跨端说明

- 条件编译切换小程序 2d 与 H5/App 普通 canvas。
- 环形用 canvas `arc` 从 12 点方向累计角度绘制；`type: 'pie'` 时 innerR=0 变实心饼。
- 中心数值与图例仍为 view 层（CSS），不依赖 SVG。

## 变体参考

- 环形 → `card-pie`（默认，donut）
- 实心饼 → `type: 'pie'`，移除中心
- 半环 → 限制扫角为 180°（canvas 只画半圈）
- 多层嵌套 → 多个同心圆环（旭日图雏形）