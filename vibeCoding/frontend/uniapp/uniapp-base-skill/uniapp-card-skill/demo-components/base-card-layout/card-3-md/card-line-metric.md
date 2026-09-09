# card-line-metric 折线图 · 迷你指标卡

> canvas 2d 多指标列表卡片（跨端兼容），每行：图标 + 名称 + 数值 + 涨跌 + 右侧迷你 sparkline。
> 图表基座见 [_canvas-base.md](./_canvas-base.md)，sparkline 公共绘制见 [_chart-draw.md](./_chart-draw.md)。

## 形态特征

| 特征 | 值 |
|------|-----|
| 容器 | `base-card` |
| 指标项 | 4 行（可定制 1-6 行） |
| 图标区 | 36×36，圆角 8，浅色背景 |
| 数值 | 18px 粗体 |
| Sparkline | 80×32，无轴、无标签 |

## 适用场景

- Dashboard 概览（4-6 个核心指标）
- 数据后台首页
- 运营报告卡

## 组件代码

```vue
<base-card :padding="0">
  <view class="metric-head">
    <text class="metric-title">{{ title }}</text>
  </view>
  <view class="metric-list">
    <view v-for="(m, idx) in metrics" :key="m.name" class="metric-row">
      <view class="metric-icon" :class="iconClass(m.sparkColor)">
        <text class="metric-icon-text">{{ m.icon }}</text>
      </view>
      <view class="metric-body">
        <text class="metric-name">{{ m.name }}</text>
        <view class="metric-value-row">
          <text class="metric-value">{{ m.value }}</text>
          <text class="metric-trend" :class="m.trend.direction">{{ m.trend.value }}</text>
        </view>
      </view>

      <!-- #ifdef MP-WEIXIN || MP-ALIPAY || MP-TOUTIAO -->
      <canvas class="metric-spark" type="2d" :canvas-id="`spark${idx}`" :id="`spark${idx}`"
        :style="{ width: '80px', height: '32px' }" />
      <!-- #endif -->
      <!-- #ifndef MP-WEIXIN || MP-ALIPAY || MP-TOUTIAO -->
      <canvas :ref="el => setSparkRef(el, idx)" class="metric-spark"
        :style="{ width: '80px', height: '32px' }" />
      <!-- #endif -->
    </view>
  </view>
</base-card>
```

```vue
<script setup>
import { ref, onMounted, nextTick, watch, getCurrentInstance } from 'vue'
import { drawSparkline } from './_chart-draw'

const props = defineProps({
  title: { type: String, default: '' },
  metrics: { type: Array, default: () => [] }, // Metric[]
})

const sparkRefEls = ref({})

function setSparkRef(el, idx) {
  if (el) sparkRefEls.value[idx] = el
}

function sparkColorMap(k) {
  return { blue: '#3b82f6', green: '#10b981', orange: '#f59e0b', purple: '#8b5cf6' }[k] || '#3b82f6'
}

function iconClass(k) {
  return k // 交由 CSS class 定义背景色
}

async function drawSparks() {
  await nextTick()
  const dpr = (uni.getSystemInfoSync().pixelRatio) || 1
  props.metrics.forEach(async (m, idx) => {
    const color = sparkColorMap(m.sparkColor)
    // #ifdef MP-WEIXIN || MP-ALIPAY || MP-TOUTIAO
    const ctx = await new Promise((resolve) => {
      uni.createSelectorQuery().in(getCurrentInstance())
        .select(`#spark${idx}`).fields({ node: true, size: true }).exec((ret) => {
          const node = ret && ret[0] && ret[0].node
          if (!node) return resolve(null)
          node.width = 80 * dpr
          node.height = 32 * dpr
          const c = node.getContext('2d')
          c.scale(dpr, dpr)
          resolve(c)
        })
    })
    // #endif
    // #ifndef MP-WEIXIN || MP-ALIPAY || MP-TOUTIAO
    const el = sparkRefEls.value[idx]
    const ctx = el ? (() => {
      el.width = 80 * dpr
      el.height = 32 * dpr
      const c = el.getContext('2d')
      c.scale(dpr, dpr)
      return c
    })() : null
    // #endif
    if (ctx) drawSparkline(ctx, { data: m.sparkData, W: 80, H: 32, color })
  })
}

onMounted(drawSparks)
watch(() => props.metrics, drawSparks, { deep: true })
</script>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | string | - | 卡片标题 |
| metrics | Metric[] | - | 指标列表（1-6 条） |

**Metric 子结构**：
| 字段 | 类型 | 说明 |
|------|------|------|
| icon | string | 图标名（i-users 等） |
| name | string | 指标名称 |
| value | string | 数值（已格式化） |
| trend | { value, direction } | 涨跌信息 |
| sparkData | number[] | 折线数据 |
| sparkColor | 'blue'\|'green'\|'orange'\|'purple' | 颜色主题 |

## 跨端说明

- 每行一个 80×32 独立 sparkline 画布，用 `:id="spark{idx}"` 区分。
- 图标区不再用 SVG `<use>`，改 `text` 占位（由业务传入 icon 名），避免依赖外部 symbol 定义。
- 条件编译切换小程序 2d 与 H5/App 手动画布。

## 变体参考

- 4 行 → `card-line-metric`（默认）
- 2-3 行精简 → 减少指标项
- 6 行完整版 → 加分割线 hover 效果
- 横向卡片 → 1 行 2 个 metric（左右布局）