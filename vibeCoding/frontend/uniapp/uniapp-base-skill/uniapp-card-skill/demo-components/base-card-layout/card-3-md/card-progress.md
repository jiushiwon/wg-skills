# card-progress 进度环卡片

> canvas 2d 进度环（跨端兼容），展示完成度。含中心百分比 + 右侧任务列表。
> 图表基座见 [_canvas-base.md](./_canvas-base.md)。

## 形态特征

| 特征 | 值 |
|------|-----|
| 容器 | `base-card` |
| 进度环直径 | 132 px |
| 描边宽度 | 6 px（stroke-width） |
| 中心 | 28px 百分比 + 11px 标签 |
| 任务列表 | 3~5 项，含状态图标 + 优先级 |

## 适用场景

- 今日任务完成度
- 学习进度、阅读进度
- 项目里程碑
- 健身目标完成度
- 课程进度

## 组件代码

```vue
<base-card :padding="0">
  <view class="chart-head">
    <view>
      <text class="chart-title">{{ title }}</text>
      <text class="chart-subtitle">{{ current }} / {{ total }} 已完成</text>
    </view>
  </view>
  <view class="chart-body">
    <view class="progress-ring-wrap">
      <!-- #ifdef MP-WEIXIN || MP-ALIPAY || MP-TOUTIAO -->
      <canvas class="ring-canvas" type="2d" id="ringChart" :style="{ width: size + 'px', height: size + 'px' }" />
      <!-- #endif -->
      <!-- #ifndef MP-WEIXIN || MP-ALIPAY || MP-TOUTIAO -->
      <canvas ref="canvasRef" class="ring-canvas" :style="{ width: size + 'px', height: size + 'px' }" />
      <!-- #endif -->
      <view class="progress-ring-center">
        <text class="progress-ring-pct">{{ percent }}%</text>
        <text class="progress-ring-label">已完成</text>
      </view>
    </view>
    <view class="task-list">
      <view v-for="t in tasks" :key="t.id" class="task-item">
        <view class="task-check" :class="{ 'is-pending': !t.done }">
          <text class="task-check-icon">{{ t.done ? '✓' : '○' }}</text>
        </view>
        <text class="task-text" :class="{ 'is-done': t.done }">{{ t.text }}</text>
        <text class="task-priority" :class="{ 'is-high': t.priority === 'high' }">
          {{ t.done ? '已完' : t.priority === 'high' ? '高' : '普' }}
        </text>
      </view>
    </view>
  </view>
</base-card>
```

```vue
<script setup>
import { computed, ref, onMounted, nextTick, watch, getCurrentInstance } from 'vue'

const props = defineProps({
  title: String,
  current: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  unit: { type: String, default: '项' },
  color: { type: String, default: '#3b82f6' },
  size: { type: String, default: 'lg' },
  tasks: { type: Array, default: () => [] },
})

const percent = computed(() => props.total ? Math.round((props.current / props.total) * 100) : 0)
const ringSize = computed(() => (props.size === 'sm' ? 100 : 132))

const canvasRef = ref(null)
const ctx = ref(null)

async function initCanvas() {
  await nextTick()
  const dpr = (uni.getSystemInfoSync().pixelRatio) || 1
  const S = ringSize.value
  let c
  // #ifdef MP-WEIXIN || MP-ALIPAY || MP-TOUTIAO
  c = await new Promise((resolve) => {
    uni.createSelectorQuery().in(getCurrentInstance())
      .select('#ringChart').fields({ node: true, size: true }).exec((ret) => {
        const node = ret && ret[0] && ret[0].node
        if (!node) return resolve(null)
        node.width = S * dpr
        node.height = S * dpr
        const c2 = node.getContext('2d')
        c2.scale(dpr, dpr)
        resolve(c2)
      })
  })
  // #endif
  // #ifndef MP-WEIXIN || MP-ALIPAY || MP-TOUTIAO
  if (canvasRef.value) {
    canvasRef.value.width = S * dpr
    canvasRef.value.height = S * dpr
    c = canvasRef.value.getContext('2d')
    c.scale(dpr, dpr)
  }
  // #endif
  ctx.value = c
  if (c) draw()
}

function draw() {
  const c = ctx.value
  if (!c) return
  const S = ringSize.value
  c.clearRect(0, 0, S, S)
  const cx = S / 2
  const cy = S / 2
  const r = S / 2 - 8
  const lineW = 6

  // 轨道
  c.beginPath()
  c.arc(cx, cy, r, 0, Math.PI * 2)
  c.strokeStyle = '#e2e8f0'
  c.lineWidth = lineW
  c.stroke()

  // 进度弧（带圆头 lineCap）
  const start = -Math.PI / 2
  const sweep = (percent.value / 100) * Math.PI * 2
  c.beginPath()
  c.arc(cx, cy, r, start, start + sweep)
  c.strokeStyle = props.color
  c.lineWidth = lineW
  c.lineCap = 'round'
  c.stroke()
  c.lineCap = 'butt'
}

watch(() => percent.value, () => { if (ctx.value) draw() })
watch(() => props.color, () => { if (ctx.value) draw() })
watch(() => ringSize.value, () => { initCanvas() })

onMounted(initCanvas)
</script>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | string | - | 图表标题 |
| current | number | - | 当前完成数 |
| total | number | - | 总数 |
| unit | string | '项' | 单位 |
| color | string | '#3b82f6' | 主色 |
| size | 'sm' \| 'lg' | 'lg' | 尺寸 |

## 跨端说明

- 条件编译切换小程序 2d 与 H5/App 普通 canvas。
- 进度环用 canvas `arc` 从 12 点方向绘制，`lineCap: 'round'` 圆头。
- 中心百分比、任务列表（✓/○ 用文本替代 SVG symbol）仍为 view 层。
| tasks | Task[] | - | 任务列表 |

## 变体参考

- 单环 → `card-progress`（默认）
- 多层环 → 多个同心 `arc` 叠加，不同 `percent`
- 半环 → 弧长改为 180°（canvas 只画半圈）
- 多色 → 不同段不同颜色（已完成/进行中/未开始）