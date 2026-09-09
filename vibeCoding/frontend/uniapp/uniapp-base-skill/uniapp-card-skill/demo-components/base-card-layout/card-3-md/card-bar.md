# card-bar 柱状图卡片

> canvas 2d 柱状图（跨端兼容），支持高亮当前项 + 数值标签 + 类别标签。
> 图表基座见 [_canvas-base.md](./_canvas-base.md)。

## 形态特征

| 特征 | 值 |
|------|-----|
| 容器 | `base-card` |
| 标题区 | 22px 数值 + 时段切换 tab |
| 图表区 | 高度 160 px |
| 柱条宽度 | 32 px，圆角 4 px |
| 高亮 | 当前柱填主色，其他浅色 |
| 数值 | 柱顶上方 11 px 文字 |
| 类别 | 柱下方 10 px 文字 |

## 适用场景

- 月度 / 周度业绩对比
- 分类销量排行
- 任务完成数对比
- 用户增长柱状

## 组件代码

```vue
<base-card :padding="0">
  <view class="chart-head">
    <view>
      <text class="chart-title">{{ title }}</text>
      <text class="chart-value">{{ value }}<text class="unit">/{{ activeLabel }}</text></text>
    </view>
    <view class="chart-tabs">
      <text
        v-for="t in tabs" :key="t"
        class="chart-tab" :class="{ 'is-active': t === currentTab }"
        @click="onTab(t)">{{ t }}</text>
    </view>
  </view>

  <view class="chart-body">
    <!-- #ifdef MP-WEIXIN || MP-ALIPAY || MP-TOUTIAO -->
    <canvas class="chart-canvas" type="2d" id="barChart" :style="{ width: W + 'px', height: H + 'px' }" />
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
  data: { type: Array, default: () => [] }, // number[]
  labels: { type: Array, default: () => [] },
  activeIndex: { type: Number, default: -1 },
  unit: { type: String, default: '' },
  color: { type: String, default: '#3b82f6' },
  tabs: { type: Array, default: () => [] },
  currentTab: { type: String, default: '' },
  W: { type: Number, default: 340 },
  H: { type: Number, default: 160 },
})

const emit = defineEmits(['tab-change'])

const canvasRef = ref(null)
const ctx = ref(null)

async function initCanvas() {
  await nextTick()
  const dpr = (uni.getSystemInfoSync().pixelRatio) || 1
  let c
  // #ifdef MP-WEIXIN || MP-ALIPAY || MP-TOUTIAO
  c = await new Promise((resolve) => {
    uni.createSelectorQuery().in(getCurrentInstance())
      .select('#barChart').fields({ node: true, size: true }).exec((ret) => {
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
  if (!c || !props.data.length) return
  c.clearRect(0, 0, props.W, props.H)

  const max = Math.max(...props.data) * 1.1 || 1
  const n = props.data.length
  const barW = Math.min(32, (props.W / n) * 0.5)
  const stepX = (props.W - 16) / n
  const bottom = props.H - 22 // 下方留给类别标签
  const topPad = 18 // 上方留给数值标签

  props.data.forEach((v, i) => {
    const x = 8 + i * stepX + (stepX - barW) / 2
    const h = (v / max) * (bottom - topPad)
    const y = bottom - h
    const active = i === props.activeIndex

    // 圆角柱
    roundRect(c, x, y, barW, h, 4)
    c.fillStyle = active ? props.color : hexToRgba(props.color, 0.25)
    c.fill()

    // 数值标签（柱顶上方 11px）
    c.fillStyle = active ? props.color : '#94a3b8'
    c.font = '10px sans-serif'
    c.textAlign = 'center'
    c.fillText(String(v), x + barW / 2, y - 5)

    // 类别标签（柱下方）
    c.fillStyle = '#94a3b8'
    c.font = '10px sans-serif'
    c.fillText(props.labels[i] || '', x + barW / 2, props.H - 8)
  })
}

function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

function onTab(t) {
  emit('tab-change', t)
}

watch(() => props.data, () => { if (ctx.value) draw() }, { deep: true })
watch(() => props.labels, () => { if (ctx.value) draw() }, { deep: true })
watch(() => props.activeIndex, () => { if (ctx.value) draw() })
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
| data | number[] | - | 数值数组 |
| labels | string[] | - | 类别标签 |
| activeIndex | number | - | 高亮索引 |
| unit | string | '' | 单位 |
| color | string | '#3b82f6' | 高亮色 |
| tabs | string[] | - | 时段切换 |
| currentTab | string | '' | 当前时段 |
| W | number | 340 | 画布宽度 |
| H | number | 160 | 画布高度 |

**事件**：`tab-change`（时段 tab 切换）

## 跨端说明

- 条件编译切换小程序 2d 与 H5/App 普通 canvas。
- 圆角柱用 canvas `arcTo` 手动绘制；数值/类别标签用 `fillText`。
- 高亮柱填主色，其余 25% 透明主色。

## 变体参考

- 单色 → `card-bar`（默认）
- 渐变柱条 → 用 `linearGradient` 填充
- 水平柱 → `direction: 'horizontal'`
- 堆叠柱 → 多 `data` 数组合并
- 排名 Top → 前 3 高亮（金/银/铜）