# canvas 兼容层（跨端图表基座）

> 所有 `card-3-*` 图表统一使用 **canvas 2d** 绘制（替代 SVG），并通过 **条件编译** 兼容 uniapp 各端。
> 本文件是公共基座，各图表 md 的 `## 组件代码` 均复用本方案的初始化与绘制模式。

## 为什么用 canvas 而不是 SVG

| 端 | SVG 内联 | canvas 2d |
|----|----------|-----------|
| H5 / App | ✅ 原生支持 | ✅ 原生支持 |
| 微信/支付宝/抖音小程序 | ❌ 不支持内联 `<svg>` 渲染图形 | ✅ `<canvas type="2d">` 支持 |
| 性能（大数据量） | 节点多时卡顿 | 单画布，性能更好 |

> **结论**：canvas 2d 是唯一能**全端统一**绘图的方案。SVG 在小程序端不可用，因此图表整体迁移到 canvas。

## 模板结构（条件编译）

```vue
<template>
  <base-card :padding="0">
    <!-- 图表画布：小程序用 type="2d"，H5/App 用普通 canvas（条件编译） -->
    <!-- #ifdef MP-WEIXIN || MP-ALIPAY || MP-TOUTIAO -->
    <canvas
      class="chart-canvas"
      type="2d"
      id="chart"
      canvas-id="chart"
      :style="{ width: W + 'px', height: H + 'px' }"
    />
    <!-- #endif -->

    <!-- #ifndef MP-WEIXIN || MP-ALIPAY || MP-TOUTIAO -->
    <canvas
      class="chart-canvas"
      id="chart"
      :style="{ width: W + 'px', height: H + 'px' }"
    />
    <!-- #endif -->
  </base-card>
</template>
```

## JS 初始化（跨端统一获取 context）

> ⚠️ canvas 的实际像素尺寸必须按 **DPR（设备像素比）** 放大，否则在高分屏上会模糊。
> 初始化时把 canvas 的宽高乘以 `dpr`，绘制时 `ctx.scale(dpr, dpr)`。

```vue
<script setup>
import { ref, onMounted, nextTick } from 'vue'

const props = defineProps({
  W: { type: Number, default: 340 },
  H: { type: Number, default: 160 },
})

const canvasRef = ref(null)
const ctxRef = ref(null)

// 统一获取 2d 上下文（跨端）
async function initCanvas() {
  await nextTick()
  const dpr = uni.getSystemInfoSync().pixelRatio || 1

  // #ifdef MP-WEIXIN || MP-ALIPAY || MP-TOUTIAO
  const query = uni.createSelectorQuery().in(getCurrentInstance())
  const res = await new Promise((resolve) => {
    query.select('#chart').fields({ node: true, size: true }).exec((ret) => {
      const node = ret && ret[0] && ret[0].node
      if (!node) return resolve(null)
      node.width = props.W * dpr
      node.height = props.H * dpr
      const ctx = node.getContext('2d')
      ctx.scale(dpr, dpr)
      resolve(ctx)
    })
  })
  ctxRef.value = res
  // #endif

  // #ifndef MP-WEIXIN || MP-ALIPAY || MP-TOUTIAO
  const node = canvasRef.value
  node.width = props.W * dpr
  node.height = props.H * dpr
  const ctx = node.getContext('2d')
  ctx.scale(dpr, dpr)
  ctxRef.value = ctx
  // #endif

  if (ctxRef.value) drawChart()
}

onMounted(initCanvas)
</script>
```

## 跨端注意事项

1. **条件编译与表达式**：条件编译内**不能**直接使用 JS 表达式 `||`，需按平台分别写（如上面拆成 MP-* 与非 MP-* 两块）。
2. **`#ifdef` 只认平台宏**：`MP-WEIXIN` / `MP-ALIPAY` / `MP-TOUTIAO` / `MP-BAIDU` / `APP-PLUS` / `H5` 等。`MP`（泛指所有小程序）也可用。
3. **canvas-id 与 id**：小程序 2d 模式用 `id` + `createSelectorQuery().fields({ node: true })`；旧小程序用 `canvas-id` + `createCanvasContext`。本方案统一用 2d 模式（`type="2d"`）。
4. **DPR 缩放**：所有图表绘制都用逻辑像素（W/H），靠 `ctx.scale(dpr, dpr)` 保证清晰。
5. **`uni.getSystemInfoSync()` 已废弃**：新版本建议用 `uni.getWindowInfo()`，但为兼容旧基础库仍可用前者。
6. **虚线、圆角、渐变**：canvas 全部支持——`ctx.setLineDash()`、`ctx.roundRect()`（部分端需手动）、`ctx.createLinearGradient()`。

## 常用绘制辅助（各图表复用）

```js
// 线性渐变（H5/App/小程序均支持）
function linearGradient(ctx, x0, y0, x1, y1, stops) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1)
  for (const s of stops) g.addColorStop(s.offset, s.color)
  return g
}

// 圆角矩形（小程序部分端无 roundRect，手动绘制）
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

// 平滑曲线路径（二次贝塞尔中点插值，等价于 SVG 平滑曲线的视觉）
function smoothPath(ctx, pts, W, H) {
  // 先做坐标归一化：x 线性铺满，y 按最小/最大值映射
}

// 虚线：ctx.setLineDash([...])
// 透明度：ctx.globalAlpha
```

> 各图表的 `drawChart()` 内会给出针对性的坐标换算与 path 构造，直接参考对应 md。

## 主题变量（复用 uniapp-theme-skill）

```
--color-primary: #3b82f6   主色
--color-bg-muted: #e2e8f0  轨道/背景色
--color-text-secondary: #64748b
--color-success: #10b981
--color-warning: #f59e0b
```

> 绘制前通过 `getComputedStyle` 或预设调色板取色；canvas 无法直接用 CSS 变量，需把色值传入到绘制函数。
