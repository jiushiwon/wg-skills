# card-line-tabs 折线图 · Tab 切换时段

> canvas 2d 折线图（跨端兼容），顶部带 Tab 切换时段（7天 / 30天 / 90天 / 全部）。
> 图表基座与跨端初始化见 [_canvas-base.md](./_canvas-base.md)。

## 形态特征

| 特征 | 值 |
|------|-----|
| 容器 | `base-card` |
| Tab 栏 | 4 段等宽切换，激活态主色填充 |
| 主数值 | 22px |
| 图表区 | 高度 140 px（比基础版略矮，给 Tab 让空间） |

## 适用场景

- 访问量趋势（7/30/90天切换）
- 销售统计（日 / 周 / 月）
- 活跃用户趋势
- 健康指标（24h / 7d / 30d）

## 组件代码

```vue
<base-card :padding="0">
  <view class="chart-head">
    <view>
      <text class="chart-title">{{ title }}</text>
      <text class="chart-value">{{ value }}</text>
    </view>
    <view class="chart-meta">
      <text>{{ trend.value }}</text>
      <text class="chart-meta-sep">{{ trend.compareText }}</text>
    </view>
  </view>

  <view class="chart-tabs">
    <text
      v-for="t in tabs" :key="t"
      class="chart-tab" :class="{ 'is-active': t === activeTab }"
      @click="onTabChange(t)">{{ t }}</text>
  </view>

  <view class="chart-body">
    <!-- #ifdef MP-WEIXIN || MP-ALIPAY || MP-TOUTIAO -->
    <canvas class="chart-canvas" type="2d" id="lineTabsChart" :style="{ width: W + 'px', height: H + 'px' }" />
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
import { drawLineArea } from './_chart-draw'

const props = defineProps({
  title: String,
  value: String,
  trend: { type: Object, default: () => ({ value: '', compareText: '' }) },
  tabs: { type: Array, default: () => [] },
  activeTab: { type: String, default: '' },
  seriesByTab: { type: Object, default: () => ({}) }, // Record<string, number[]>
  color: { type: String, default: '#3b82f6' },
  W: { type: Number, default: 340 },
  H: { type: Number, default: 140 },
})

const emit = defineEmits(['change'])

const canvasRef = ref(null)
const ctx = ref(null)

async function initCanvas() {
  await nextTick()
  const dpr = (uni.getSystemInfoSync().pixelRatio) || 1
  let c
  // #ifdef MP-WEIXIN || MP-ALIPAY || MP-TOUTIAO
  c = await new Promise((resolve) => {
    uni.createSelectorQuery().in(getCurrentInstance())
      .select('#lineTabsChart').fields({ node: true, size: true }).exec((ret) => {
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
  const series = props.seriesByTab[props.activeTab] || []
  if (!c || !series.length) return
  c.clearRect(0, 0, props.W, props.H)
  drawLineArea(c, { series, W: props.W, H: props.H, color: props.color, grid: 3, dot: true })
}

function onTabChange(t) {
  emit('change', t)
}

watch(() => props.activeTab, () => { if (ctx.value) draw() })
watch(() => props.seriesByTab, () => { if (ctx.value) draw() }, { deep: true })
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
| trend | { value, direction, compareText } | - | 涨跌 |
| tabs | string[] | - | 时段选项 |
| activeTab | string | - | 当前时段 |
| seriesByTab | Record<string, number[]> | - | 各时段数据 |
| color | string | '#3b82f6' | 主色 |
| W | number | 340 | 画布宽度 |
| H | number | 140 | 画布高度 |

**事件**：`change`（tabs 切换时触发）

## 跨端说明

- 条件编译切换小程序 `type="2d"` 与 H5/App 普通 canvas。
- 折线复用 `_chart-draw.js` 的 `drawLineArea`（平滑曲线 + 渐变面积 + 末端圆点）。

## 变体参考

- 4 段 tab → `card-line-tabs`（默认：7/30/90/全部）
- 2 段 tab → 简化版（昨日 / 今日）
- 5 段 tab → 含本年 / 去年对比