/**
 * draw-helpers — Canvas 绘制辅助函数库
 * 提供圆角矩形、平滑曲线、渐变、文字、坐标轴、网格等基础绘制能力
 * 所有图表组件复用此文件
 */

// ===================== 颜色工具 =====================

export function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

/** 创建线性渐变 */
export function linearGradient(
  ctx: CanvasRenderingContext2D,
  x0: number, y0: number, x1: number, y1: number,
  stops: Array<{ offset: number; color: string }>,
): CanvasGradient {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  for (const s of stops) g.addColorStop(s.offset, s.color);
  return g;
}

/** 创建径向渐变 */
export function radialGradient(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, r0: number, r1: number,
  stops: Array<{ offset: number; color: string }>,
): CanvasGradient {
  const g = ctx.createRadialGradient(x, y, r0, x, y, r1);
  for (const s of stops) g.addColorStop(s.offset, s.color);
  return g;
}

// ===================== 基础形状 =====================

/** 圆角矩形路径（支持四角独立设置） */
export function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  r: number | [number, number, number, number],
) {
  const radii = Array.isArray(r) ? r : [r, r, r, r];
  const [tl, tr, br, bl] = radii;
  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + w - tr, y);
  ctx.arcTo(x + w, y, x + w, y + tr, tr);
  ctx.lineTo(x + w, y + h - br);
  ctx.arcTo(x + w, y + h, x + w - br, y + h, br);
  ctx.lineTo(x + bl, y + h);
  ctx.arcTo(x, y + h, x, y + h - bl, bl);
  ctx.lineTo(x, y + tl);
  ctx.arcTo(x, y, x + tl, y, tl);
  ctx.closePath();
}

/** 填充圆角矩形 */
export function fillRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  r: number | [number, number, number, number],
  fillStyle: string | CanvasGradient,
) {
  roundRectPath(ctx, x, y, w, h, r);
  ctx.fillStyle = fillStyle;
  ctx.fill();
}

/** 描边圆角矩形 */
export function strokeRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  r: number | [number, number, number, number],
  strokeStyle: string,
  lineWidth = 1,
) {
  roundRectPath(ctx, x, y, w, h, r);
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

// ===================== 平滑曲线 =====================

/** 贝塞尔平滑曲线路径（二次贝塞尔中点插值） */
export function smoothLinePath(
  ctx: CanvasRenderingContext2D,
  points: Array<[number, number]>,
) {
  if (points.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);

  if (points.length === 2) {
    ctx.lineTo(points[1][0], points[1][1]);
    return;
  }

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    // Catmull-Rom -> Bezier 转换
    const tension = 0.3;
    const cp1x = p1[0] + (p2[0] - p0[0]) * tension;
    const cp1y = p1[1] + (p2[1] - p0[1]) * tension;
    const cp2x = p2[0] - (p3[0] - p1[0]) * tension;
    const cp2y = p2[1] - (p3[1] - p1[1]) * tension;

    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2[0], p2[1]);
  }
}

/** 绘制面积填充（曲线 + 底部闭合） */
export function drawArea(
  ctx: CanvasRenderingContext2D,
  points: Array<[number, number]>,
  bottomY: number,
  fillColor: string | CanvasGradient,
) {
  if (points.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(points[0][0], bottomY);
  ctx.lineTo(points[0][0], points[0][1]);
  smoothLinePath(ctx, points);
  ctx.lineTo(points[points.length - 1][0], bottomY);
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();
}

// ===================== 文字 =====================

export interface TextOptions {
  color?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | number;
  fontFamily?: string;
  align?: CanvasTextAlign;
  baseline?: CanvasTextBaseline;
  maxWidth?: number;
}

/** 绘制文字 */
export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: TextOptions = {},
) {
  const {
    color = '#333',
    fontSize = 12,
    fontWeight = 'normal',
    fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    align = 'center',
    baseline = 'middle',
    maxWidth,
  } = options;
  ctx.fillStyle = color;
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.fillText(text, x, y, maxWidth);
}

/** 测量文字宽度 */
export function measureText(
  ctx: CanvasRenderingContext2D,
  text: string,
  fontSize = 12,
  fontWeight: 'normal' | 'bold' | number = 'normal',
): number {
  ctx.font = `${fontWeight} ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  return ctx.measureText(text).width;
}

/** 自动换行文字 */
export function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number, y: number,
  maxWidth: number,
  lineHeight: number,
  options: TextOptions = {},
): number {
  const chars = text.split('');
  let line = '';
  let lineY = y;
  let lineCount = 0;
  for (const char of chars) {
    const testLine = line + char;
    const w = measureText(ctx, testLine, options.fontSize, options.fontWeight);
    if (w > maxWidth && line) {
      drawText(ctx, line, x, lineY, options);
      line = char;
      lineY += lineHeight;
      lineCount++;
    } else {
      line = testLine;
    }
  }
  if (line) {
    drawText(ctx, line, x, lineY, options);
    lineCount++;
  }
  return lineCount;
}

// ===================== 坐标轴 & 网格 =====================

export interface AxisDrawOptions {
  /** 轴位置 */
  x: number;
  y: number;
  /** 轴长度 */
  length: number;
  /** 方向 */
  direction: 'x' | 'y';
  /** 刻度值 */
  values: Array<{ label: string; position: number }>;
  /** 轴线颜色 */
  lineColor?: string;
  /** 标签颜色 */
  labelColor?: string;
  /** 标签字号 */
  labelFontSize?: number;
  /** 刻度长度 */
  tickLength?: number;
  /** 是否绘制网格线 */
  gridLine?: boolean;
  gridLineColor?: string;
  gridLineDash?: [number, number];
  /** 轴另一端（用于画网格线） */
  gridLength?: number;
}

/** 绘制坐标轴 */
export function drawAxis(
  ctx: CanvasRenderingContext2D,
  opts: AxisDrawOptions,
) {
  const {
    x, y, length, direction, values,
    lineColor = '#ddd',
    labelColor = '#666',
    labelFontSize = 11,
    tickLength = 5,
    gridLine = false,
    gridLineColor = '#eee',
    gridLineDash = [3, 3],
    gridLength = 0,
  } = opts;

  // 轴线
  ctx.beginPath();
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 1;
  if (direction === 'x') {
    ctx.moveTo(x, y);
    ctx.lineTo(x + length, y);
  } else {
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - length);
  }
  ctx.stroke();

  // 刻度 + 标签 + 网格线
  for (const val of values) {
    const pos = val.position;
    let tickX: number, tickY: number, labelX: number, labelY: number;

    if (direction === 'x') {
      tickX = x + pos;
      tickY = y;
      labelX = tickX;
      labelY = y + tickLength + 10;
    } else {
      tickX = x;
      tickY = y - pos;
      labelX = x - tickLength - 6;
      labelY = tickY;
    }

    // 刻度
    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1;
    if (direction === 'x') {
      ctx.moveTo(tickX, tickY);
      ctx.lineTo(tickX, tickY + tickLength);
    } else {
      ctx.moveTo(tickX, tickY);
      ctx.lineTo(tickX - tickLength, tickY);
    }
    ctx.stroke();

    // 标签
    drawText(ctx, val.label, labelX, labelY, {
      color: labelColor,
      fontSize: labelFontSize,
      align: direction === 'x' ? 'center' : 'right',
      baseline: 'middle',
    });

    // 网格线
    if (gridLine && gridLength > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = gridLineColor;
      ctx.lineWidth = 1;
      ctx.setLineDash(gridLineDash);
      if (direction === 'x') {
        ctx.moveTo(tickX, tickY);
        ctx.lineTo(tickX, tickY - gridLength);
      } else {
        ctx.moveTo(tickX, tickY);
        ctx.lineTo(tickX + gridLength, tickY);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
  }
}

// ===================== 图例 =====================

export interface LegendItem {
  name: string;
  color: string;
  active?: boolean;
}

export interface LegendDrawOptions {
  items: LegendItem[];
  x: number;
  y: number;
  direction?: 'horizontal' | 'vertical';
  gap?: number;
  itemGap?: number;
  fontSize?: number;
  iconSize?: number;
  iconShape?: 'circle' | 'rect' | 'roundRect';
  /** 返回图例占据的宽高 */
}

export interface LegendBounds {
  width: number;
  height: number;
  items: Array<{ name: string; x: number; y: number; color: string }>;
}

/** 绘制图例，返回各项目位置（用于点击检测） */
export function drawLegend(
  ctx: CanvasRenderingContext2D,
  opts: LegendDrawOptions,
): LegendBounds {
  const {
    items, x, y,
    direction = 'horizontal',
    gap = 24,
    itemGap = 6,
    fontSize = 12,
    iconSize = 10,
    iconShape = 'roundRect',
  } = opts;

  const bounds: LegendBounds = { width: 0, height: 0, items: [] };
  let cx = x;
  let cy = y;

  for (const item of items) {
    const active = item.active !== false;
    const alpha = active ? 1 : 0.35;
    const color = hexToRgba(item.color, alpha);

    // 图标
    ctx.fillStyle = color;
    if (iconShape === 'circle') {
      ctx.beginPath();
      ctx.arc(cx + iconSize / 2, cy, iconSize / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (iconShape === 'roundRect') {
      fillRoundRect(ctx, cx, cy - iconSize / 2, iconSize, iconSize, 2, color);
    } else {
      ctx.fillRect(cx, cy - iconSize / 2, iconSize, iconSize);
    }

    // 文字
    const textW = measureText(ctx, item.name, fontSize);
    drawText(ctx, item.name, cx + iconSize + itemGap, cy, {
      color: hexToRgba(active ? '#333' : '#999', alpha),
      fontSize,
      align: 'left',
      baseline: 'middle',
    });

    bounds.items.push({
      name: item.name,
      x: cx,
      y: cy,
      color: item.color,
    });

    const itemWidth = iconSize + itemGap + textW;
    if (direction === 'horizontal') {
      cx += itemWidth + gap;
    } else {
      cy += fontSize + gap;
    }
  }

  bounds.width = direction === 'horizontal' ? cx - x : 0;
  bounds.height = direction === 'vertical' ? cy - y : fontSize;

  return bounds;
}

// ===================== 饼图弧形 =====================

/** 绘制扇形 */
export function drawArc(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  outerR: number,
  startAngle: number, endAngle: number,
  fillStyle: string | CanvasGradient,
  innerR = 0,
  padAngle = 0,
) {
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, startAngle + padAngle, endAngle - padAngle);
  if (innerR > 0) {
    ctx.arc(cx, cy, innerR, endAngle - padAngle, startAngle + padAngle, true);
  } else {
    ctx.lineTo(cx, cy);
  }
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();
}

// ===================== 通用数学 =====================

/** 计算 "nice" 刻度值（对标 ECharts axisTick 的 niceMin/niceMax） */
export function niceScale(min: number, max: number, tickCount = 5): { min: number; max: number; step: number; ticks: number[] } {
  if (min === max) { max = min + 1; }
  const range = max - min;
  const roughStep = range / tickCount;
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const residual = roughStep / magnitude;

  let niceStep: number;
  if (residual <= 1.5) niceStep = magnitude;
  else if (residual <= 3) niceStep = 2 * magnitude;
  else if (residual <= 7) niceStep = 5 * magnitude;
  else niceStep = 10 * magnitude;

  const niceMin = Math.floor(min / niceStep) * niceStep;
  const niceMax = Math.ceil(max / niceStep) * niceStep;

  const ticks: number[] = [];
  for (let v = niceMin; v <= niceMax + niceStep * 0.01; v += niceStep) {
    ticks.push(parseFloat(v.toPrecision(12)));
  }

  return { min: niceMin, max: niceMax, step: niceStep, ticks };
}

/** 格式化数值（千分位、万、亿） */
export function formatNumber(n: number, digits = 0): string {
  if (Math.abs(n) >= 1e8) return (n / 1e8).toFixed(digits) + '亿';
  if (Math.abs(n) >= 1e4) return (n / 1e4).toFixed(digits) + '万';
  return n.toLocaleString('zh-CN', { maximumFractionDigits: digits });
}

/** 百分比格式化 */
export function formatPercent(n: number, digits = 1): string {
  return n.toFixed(digits) + '%';
}

/** 线性插值 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** 值域映射 */
export function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  if (inMax === inMin) return outMin;
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

// ===================== 默认主题色板 =====================

/** ECharts 默认色板（对标 echarts 5.x） */
export const DEFAULT_COLORS = [
  '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
  '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#48b8d0',
];

/** 柔和色板 */
export const SOFT_COLORS = [
  '#6E9BD1', '#8FC1A9', '#F2C57C', '#E88E7D', '#7BBFCF',
  '#5E9B74', '#DBA564', '#A07DBD', '#D98FB1', '#5BB5C5',
];

/** 暗色主题色板 */
export const DARK_COLORS = [
  '#4992ff', '#7cffb2', '#fddd60', '#ff6e76', '#58d9f9',
  '#05c091', '#ff8a45', '#8d48e3', '#dd79ff', '#44d9b5',
];
