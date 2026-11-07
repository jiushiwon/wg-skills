# 共享 canvas 绘制函数（图表用）

> 折线/面积类图表的公共绘制逻辑，供 card-line 系列（tabs / multi / metric / area / tooltip）复用。
> 本文件以 js 代码段承载，实际使用时抽到 `@/components/charts/_chart-draw.js` 或组件内直接内联。

## drawLineArea — 折线 + 渐变面积 + 末端圆点

```js
// series: number[]
// opts: { W, H, color, grid (虚线网格层数，0 关闭), dot (末端高亮圆点) }
export function drawLineArea(ctx, { series, W, H, color = '#3b82f6', grid = 3, dot = true }) {
  if (!series || !series.length) return
  ctx.clearRect(0, 0, W, H)
  const max = Math.max(...series) * 1.1 || 1
  const pad = 8
  const bottom = H - pad - 6
  const pts = series.map((v, i) => {
    const x = pad + (i / (series.length - 1 || 1)) * (W - pad * 2)
    const y = bottom - (v / max) * (H - pad * 2 - 12)
    return [x, y]
  })

  // 虚线网格
  if (grid > 0) {
    ctx.strokeStyle = '#e2e8f0'
    ctx.lineWidth = 1
    ctx.setLineDash([3, 3])
    for (let i = 1; i <= grid; i++) {
      const gy = (H / (grid + 1)) * i
      ctx.beginPath()
      ctx.moveTo(0, gy)
      ctx.lineTo(W, gy)
      ctx.stroke()
    }
    ctx.setLineDash([])
  }

  // 渐变面积
  const g = ctx.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, hexToRgba(color, 0.25))
  g.addColorStop(1, hexToRgba(color, 0))
  ctx.beginPath()
  ctx.moveTo(pts[0][0], bottom)
  pts.forEach((p) => ctx.lineTo(p[0], p[1]))
  ctx.lineTo(pts[pts.length - 1][0], bottom)
  ctx.closePath()
  ctx.fillStyle = g
  ctx.fill()

  // 折线（平滑）
  ctx.beginPath()
  ctx.moveTo(pts[0][0], pts[0][1])
  if (pts.length < 3) {
    pts.forEach((p) => ctx.lineTo(p[0], p[1]))
  } else {
    for (let i = 1; i < pts.length - 1; i++) {
      const xc = (pts[i][0] + pts[i + 1][0]) / 2
      const yc = (pts[i][1] + pts[i + 1][1]) / 2
      ctx.quadraticCurveTo(pts[i][0], pts[i][1], xc, yc)
    }
    ctx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1])
  }
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.stroke()

  // 末端圆点
  if (dot) {
    const end = pts[pts.length - 1]
    ctx.beginPath()
    ctx.arc(end[0], end[1], 4, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()
    ctx.beginPath()
    ctx.arc(end[0], end[1], 2.5, 0, Math.PI * 2)
    ctx.fillStyle = '#fff'
    ctx.fill()
  }
}

// hex 转 rgba
export function hexToRgba(hex, a) {
  const h = hex.replace('#', '')
  const n = parseInt(h, 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}
```

## drawSparkline — 迷你折线（metric 卡片用）

```js
// 80x32 无轴 sparkline
export function drawSparkline(ctx, { data, W = 80, H = 32, color = '#3b82f6' }) {
  if (!data || !data.length) return
  ctx.clearRect(0, 0, W, H)
  const max = Math.max(...data) || 1
  const min = Math.min(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1 || 1)) * (W - 2) + 1
    const y = H - 2 - ((v - min) / range) * (H - 4)
    return [x, y]
  })

  // 面积
  const g = ctx.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, hexToRgba(color, 0.3))
  g.addColorStop(1, hexToRgba(color, 0))
  ctx.beginPath()
  ctx.moveTo(pts[0][0], H)
  pts.forEach((p) => ctx.lineTo(p[0], p[1]))
  ctx.lineTo(pts[pts.length - 1][0], H)
  ctx.closePath()
  ctx.fillStyle = g
  ctx.fill()

  // 线
  ctx.beginPath()
  ctx.moveTo(pts[0][0], pts[0][1])
  pts.forEach((p) => ctx.lineTo(p[0], p[1]))
  ctx.strokeStyle = color
  ctx.lineWidth = 1.5
  ctx.lineJoin = 'round'
  ctx.stroke()
}
```
