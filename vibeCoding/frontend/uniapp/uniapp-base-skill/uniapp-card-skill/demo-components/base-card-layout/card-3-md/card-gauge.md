# card-gauge 仪表盘卡片

> canvas 2d 仪表盘（跨端兼容，半圆 / 3/4 圆弧），展示数值状态。含渐变填充 + 指针 + 刻度。
> 图表基座见 [_canvas-base.md](./_canvas-base.md)。

## 形态特征

| 特征 | 值 |
|------|-----|
| 容器 | `base-card` |
| 弧度 | 270°（3/4 圆，从 135° 到 45°） |
| 半径 | 110 px |
| 描边宽度 | 14 px |
| 渐变 | 三段（绿→蓝→橙） |
| 指针 | 三角形 + 中心 hub |
| 中心 | 36px 大数值 + 对比文案 |

## 适用场景

- 健康指数（HRV / 体能）
- CPU / 内存使用率
- 信用评分、风险指数
- 性能指标（SLA）
- 等级 / 进度（白金 / 黄金 / 白银）

## 组件代码

```vue
<base-card :padding="0">
  <view class="chart-head">
    <view>
      <text class="chart-title">{{ title }}</text>
    </view>
    <view class="chart-meta" :class="statusClass">{{ statusLabel }}</view>
  </view>
  <view class="chart-body">
    <!-- #ifdef MP-WEIXIN || MP-ALIPAY || MP-TOUTIAO -->
    <canvas class="gauge-canvas" type="2d" id="gaugeChart" :style="{ width: W + 'px', height: H + 'px' }" />
    <!-- #endif -->
    <!-- #ifndef MP-WEIXIN || MP-ALIPAY || MP-TOUTIAO -->
    <canvas ref="canvasRef" class="gauge-canvas" :style="{ width: W + 'px', height: H + 'px' }" />
    <!-- #endif -->

    <view class="gauge-center">
      <text class="gauge-value">{{ value }}<text class="gauge-unit">/{{ maxValue }}</text></text>
      <text class="gauge-label">{{ compareText }}</text>
    </view>
  </view>
</base-card>
```

```vue
<script setup>
import { ref, onMounted, nextTick, watch, getCurrentInstance } from 'vue'

const props = defineProps({
  title: String,
  value: { type: Number, default: 0 },
  maxValue: { type: Number, default: 100 },
  unit: { type: String, default: '' },
  compareText: String,
  status: { type: String, default: 'good' },
  arcDeg: { type: Number, default: 270 }, // 270° = 3/4 圆
  W: { type: Number, default: 340 },
  H: { type: Number, default: 180 },
})

const canvasRef = ref(null)
const ctx = ref(null)

// 仪表起始角（canvas 顺时针）；总扫角每次 draw 内按 arcDeg 动态计算
const angStart = 135 * Math.PI / 180

function polar(cx, cy, r, angle) {
  return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r]
}

async function initCanvas() {
  await nextTick()
  const dpr = (uni.getSystemInfoSync().pixelRatio) || 1
  let c
  // #ifdef MP-WEIXIN || MP-ALIPAY || MP-TOUTIAO
  c = await new Promise((resolve) => {
    uni.createSelectorQuery().in(getCurrentInstance())
      .select('#gaugeChart').fields({ node: true, size: true }).exec((ret) => {
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
  if (!c) return
  c.clearRect(0, 0, props.W, props.H)
  const angTotal = props.arcDeg * Math.PI / 180

  const cx = props.W / 2
  const cy = props.H - 30
  const r = Math.min(cx - 16, props.H - 50)
  const lineW = 14

  // 轨道
  c.beginPath()
  c.arc(cx, cy, r, angStart, angStart + angTotal)
  c.strokeStyle = '#e2e8f0'
  c.lineWidth = lineW
  c.lineCap = 'round'
  c.stroke()

  // 渐变进度弧（绿→蓝→橙）
  const ratio = Math.min(props.value / props.maxValue, 1)
  const g = c.createLinearGradient(cx - r, 0, cx + r, 0)
  g.addColorStop(0, '#10b981')
  g.addColorStop(0.5, '#3b82f6')
  g.addColorStop(1, '#f59e0b')
  c.beginPath()
  c.arc(cx, cy, r, angStart, angStart + angTotal * ratio)
  c.strokeStyle = g
  c.lineWidth = lineW
  c.lineCap = 'round'
  c.stroke()

  // 指针（三角形 + hub）：指向 value 对应角度
  const needleAng = angStart + angTotal * ratio
  const [px, py] = polar(cx, cy, r - 14, needleAng)
  const [hx, hy] = polar(cx, cy, r + 8, needleAng)
  c.beginPath()
  c.moveTo(px, py)
  c.lineTo(hx - 4, hy + 3)
  c.lineTo(hx + 4, hy + 3)
  c.closePath()
  c.fillStyle = '#1e293b'
  c.fill()

  // hub
  c.beginPath()
  c.arc(cx, cy, 8, 0, Math.PI * 2)
  c.fillStyle = '#1e293b'
  c.fill()
}

watch(() => props.value, () => { if (ctx.value) draw() })
watch(() => props.maxValue, () => { if (ctx.value) draw() })
watch(() => props.arcDeg, () => { if (ctx.value) draw() })
watch([() => props.W, () => props.H], () => { initCanvas() })

onMounted(initCanvas)
</script>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | string | - | 图表标题 |
| value | number | - | 当前值 |
| maxValue | number | 100 | 最大值 |
| unit | string | '' | 单位 |
| compareText | string | - | 对比文案 |
| status | 'poor'\|'normal'\|'good'\|'excellent' | 'good' | 状态 |
| arcDeg | number | 270 | 弧度（180=半圆，270=3/4 圆，360=全圆） |
| W | number | 340 | 画布宽度 |
| H | number | 180 | 画布高度 |

## 跨端说明

- 条件编译切换小程序 2d 与 H5/App 普通 canvas。
- 轨道/进度弧用 canvas `arc`（lineCap: round）；渐变用 `createLinearGradient`；指针为三角形 + hub。
- 中心数值与对比文案仍为 view 层。

## 变体参考

- 3/4 圆 → `card-gauge`（默认，270°）
- 半圆 → 弧度改为 180°（从 180° 到 0°）
- 全圆 → 弧度改为 360°（带进度环）
- 多指针 → 多 needle 叠加（对比昨日/今日）