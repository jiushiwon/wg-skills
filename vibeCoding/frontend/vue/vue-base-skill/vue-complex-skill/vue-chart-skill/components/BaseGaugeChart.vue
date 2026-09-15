<script setup lang="ts">
/**
 * BaseGaugeChart — 仪表盘组件
 * 特性：270 度弧形表盘 / 三色渐变弧线 / 刻度线+标签 / 指针 / 中心数值 / 入场动画
 */
import { ref, watch, onMounted, nextTick } from 'vue';
import { useCanvas } from '../composables/useCanvas';
import { animate, type EasingType } from '../composables/useAnimation';
import { drawText, mapRange, hexToRgba, formatNumber } from '../composables/draw-helpers';
import type { GaugeChartOption } from '../types/chart';

const props = withDefaults(defineProps<{
  option: GaugeChartOption;
  width?: number;
  height?: number;
}>(), {
  width: 360,
  height: 280,
});

const canvasRef = ref<HTMLCanvasElement | null>(null);

const { ctx, clear, getSize } = useCanvas(canvasRef, {
  width: () => props.width,
  height: () => props.height,
});

/** 当前动画进度值 0~1 */
let currentProgress = 0;

/** 当前动画取消函数 */
let cancelAnim: (() => void) | null = null;

/** 首次绘制标记 */
let initialDraw = true;

function draw() {
  const c = ctx.value;
  if (!c) return;
  clear();

  const { w, h } = getSize();
  const option = props.option;
  const series = option.series[0];
  if (!series) return;

  const anim = option.animation;
  const shouldAnimate = initialDraw && anim?.enabled !== false;
  const duration = anim?.duration ?? 1000;
  const easing: EasingType = (anim?.easing as EasingType) ?? 'cubicOut';

  function render(progress: number) {
    currentProgress = progress;
    const c2 = ctx.value;
    if (!c2) return;
    clear();
    drawGauge(c2, w, h, series!, progress);
  }

  if (shouldAnimate) {
    cancelAnim?.();
    cancelAnim = animate({ duration, easing, onProgress: render });
    initialDraw = false;
  } else {
    render(1);
  }
}

/** 绘制仪表盘主体 */
function drawGauge(
  c: CanvasRenderingContext2D,
  w: number,
  h: number,
  series: NonNullable<GaugeChartOption['series'][0]>,
  progress: number,
) {
  // 角度配置（单位：度，0°=3点钟方向，顺时针递增）
  // 仪表盘弧段：135° → 405°（即 7 点钟到 1 点钟，270 度弧）
  const startAngleDeg = series.startAngle ?? 225;
  const endAngleDeg = series.endAngle ?? -45;
  const totalArc = startAngleDeg - endAngleDeg; // 总弧度（度）

  // 数值范围
  const min = series.min ?? 0;
  const max = series.max ?? 100;
  const dp = series.data[0];
  const value = dp ? dp.value : 0;
  const targetPercent = max > min ? Math.max(0, Math.min(1, (value - min) / (max - min))) : 0;
  const animatedPercent = targetPercent * progress;

  // 将度数转为弧度（标准数学坐标系）
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const startRad = toRad(startAngleDeg);
  const endRad = toRad(endAngleDeg);

  // 布局参数
  const centerX = w / 2;
  const centerY = h / 2 + 15;
  const radius = Math.min(w, h) / 2 - 45;

  // ---- 1. 绘制渐变色弧线 ----
  const colorStops = series.axisLine?.lineStyle?.color ?? [
    [0.2, '#91cc75'],
    [0.8, '#fac858'],
    [1, '#ee6666'],
  ];
  const lineWidth = series.axisLine?.lineStyle?.width ?? 20;

  // 按颜色分段绘制弧线（每段一个独立 arc，实现多色渐变效果）
  for (let i = 0; i < colorStops.length; i++) {
    const [prevPos, prevColor] = i === 0 ? [0, colorStops[0][1]] : colorStops[i - 1];
    const [curPos, curColor] = colorStops[i];

    // 计算该段在总弧度上的起止角度
    const segStart = startRad - (startRad - endRad) * (prevPos as number);
    const segEnd = startRad - (startRad - endRad) * (curPos as number);

    c.beginPath();
    c.arc(centerX, centerY, radius, segStart, segEnd, true);
    c.strokeStyle = curColor as string;
    c.lineWidth = lineWidth;
    c.lineCap = 'butt';
    c.stroke();
  }

  // ---- 2. 绘制刻度线 + 标签 ----
  const splitNumber = series.splitNumber ?? 10;
  const showTick = series.axisTick?.show !== false;
  const tickSplitNum = series.axisTick?.splitNumber ?? 5;
  const tickLength = series.axisTick?.length ?? 8;
  const showLabel = series.axisLabel?.show !== false;
  const labelDistance = series.axisLabel?.distance ?? 20;
  const showSplitLine = series.splitLine?.show !== false;
  const splitLineLength = series.splitLine?.length ?? 12;

  // 主刻度线 + 标签
  if (showTick || showLabel) {
    for (let i = 0; i <= splitNumber; i++) {
      const ratio = i / splitNumber;
      const angle = startRad - ratio * (startRad - endRad);
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const tickVal = min + ratio * (max - min);

      // 主刻度线
      if (showTick) {
        const inner = radius - lineWidth / 2 - 4;
        const outer = inner - tickLength;
        c.beginPath();
        c.moveTo(centerX + cos * inner, centerY - sin * inner);
        c.lineTo(centerX + cos * outer, centerY - sin * outer);
        c.strokeStyle = '#bbb';
        c.lineWidth = 2;
        c.stroke();
      }

      // 分割线（与主刻度同位置但更长）
      if (showSplitLine && i > 0 && i < splitNumber) {
        const inner = radius - lineWidth / 2 - 4;
        const outer = inner - splitLineLength;
        c.beginPath();
        c.moveTo(centerX + cos * inner, centerY - sin * inner);
        c.lineTo(centerX + cos * outer, centerY - sin * outer);
        c.strokeStyle = '#ddd';
        c.lineWidth = 2;
        c.stroke();
      }

      // 刻度标签
      if (showLabel) {
        const labelR = radius - lineWidth / 2 - labelDistance;
        const labelX = centerX + cos * labelR;
        const labelY = centerY - sin * labelR;
        const formatter = series.axisLabel?.formatter;
        const labelStr = formatter ? formatter(tickVal) : formatNumber(tickVal);
        drawText(c, labelStr, labelX, labelY, {
          color: '#999',
          fontSize: 11,
        });
      }
    }

    // 次刻度线
    if (showTick && tickSplitNum > 1) {
      for (let i = 0; i < splitNumber; i++) {
        for (let j = 1; j < tickSplitNum; j++) {
          const ratio = (i + j / tickSplitNum) / splitNumber;
          const angle = startRad - ratio * (startRad - endRad);
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          const inner = radius - lineWidth / 2 - 4;
          const outer = inner - tickLength * 0.5;
          c.beginPath();
          c.moveTo(centerX + cos * inner, centerY - sin * inner);
          c.lineTo(centerX + cos * outer, centerY - sin * outer);
          c.strokeStyle = '#ccc';
          c.lineWidth = 1;
          c.stroke();
        }
      }
    }
  }

  // ---- 3. 绘制指针 ----
  const pointerShow = series.pointer?.show !== false;
  if (pointerShow) {
    const valueAngle = startRad - animatedPercent * (startRad - endRad);
    const cos = Math.cos(valueAngle);
    const sin = Math.sin(valueAngle);
    const pointerLen = radius * 0.75;
    const pointerWidth = series.pointer?.width ?? 6;

    // 指针尖端坐标
    const tipX = centerX + cos * pointerLen;
    const tipY = centerY - sin * pointerLen;

    // 指针底部（垂直于指针方向的两点）
    const perpCos = Math.cos(valueAngle - Math.PI / 2);
    const perpSin = Math.sin(valueAngle - Math.PI / 2);
    const baseL = { x: centerX + perpCos * pointerWidth, y: centerY - perpSin * pointerWidth };
    const baseR = { x: centerX - perpCos * pointerWidth, y: centerY + perpSin * pointerWidth };
    // 指针尾部（中心后方短端）
    const tailLen = 15;
    const tailX = centerX - cos * tailLen;
    const tailY = centerY + sin * tailLen;
    const tailL = { x: tailX + perpCos * 3, y: tailY - perpSin * 3 };
    const tailR = { x: tailX - perpCos * 3, y: tailY + perpSin * 3 };

    // 绘制指针阴影
    c.save();
    c.shadowColor = 'rgba(0, 0, 0, 0.15)';
    c.shadowBlur = 6;
    c.shadowOffsetY = 2;

    // 指针形状：五边形（尖端 → 底左 → 尾左 → 尾右 → 底右）
    c.beginPath();
    c.moveTo(tipX, tipY);
    c.lineTo(baseL.x, baseL.y);
    c.lineTo(tailL.x, tailL.y);
    c.lineTo(tailR.x, tailR.y);
    c.lineTo(baseR.x, baseR.y);
    c.closePath();
    c.fillStyle = '#464646';
    c.fill();
    c.restore();

    // 中心装饰圆（底座大圆 + 顶部小圆）
    c.beginPath();
    c.arc(centerX, centerY, 8, 0, Math.PI * 2);
    c.fillStyle = '#464646';
    c.fill();

    c.beginPath();
    c.arc(centerX, centerY, 4, 0, Math.PI * 2);
    c.fillStyle = '#888';
    c.fill();
  }

  // ---- 4. 中心数值显示 ----
  const detailShow = series.detail?.show !== false;
  if (detailShow) {
    const displayVal = animatedPercent * (max - min) + min;
    const formatter = series.detail?.formatter;
    let detailText: string;
    if (typeof formatter === 'function') {
      detailText = formatter(displayVal);
    } else if (typeof formatter === 'string') {
      detailText = formatter.replace('{value}', formatNumber(displayVal));
    } else {
      detailText = formatNumber(displayVal);
    }

    const detailFontSize = series.detail?.fontSize ?? 28;
    const detailFontWeight = (series.detail?.fontWeight as 'bold' | 'normal') ?? 'bold';
    let detailColor = '#333';
    if (typeof series.detail?.color === 'function') {
      detailColor = series.detail.color(displayVal);
    } else if (typeof series.detail?.color === 'string') {
      detailColor = series.detail.color;
    }

    const detailOffset = series.detail?.offsetCenter ?? [0, '40%'];
    const detailX = centerX + parseFloat(String(detailOffset[0])) * (typeof detailOffset[0] === 'string' && detailOffset[0].includes('%') ? radius / 100 : 1);
    const detailY = centerY + parseFloat(String(detailOffset[1])) * (typeof detailOffset[1] === 'string' && String(detailOffset[1]).includes('%') ? radius / 100 : 1);

    // 数值
    drawText(c, detailText, detailX, detailY, {
      color: detailColor,
      fontSize: detailFontSize,
      fontWeight: detailFontWeight,
    });

    // 系列名称标题
    if (series.title?.show !== false && (series.name || dp?.name)) {
      const titleOffset = series.title?.offsetCenter ?? [0, '60%'];
      const titleX = centerX + parseFloat(String(titleOffset[0])) * (typeof titleOffset[0] === 'string' && titleOffset[0].includes('%') ? radius / 100 : 1);
      const titleY = centerY + parseFloat(String(titleOffset[1])) * (typeof titleOffset[1] === 'string' && String(titleOffset[1]).includes('%') ? radius / 100 : 1);
      const titleFontSize = series.title?.fontSize ?? 13;
      drawText(c, series.name || dp?.name || '', titleX, titleY, {
        color: '#999',
        fontSize: titleFontSize,
      });
    }
  }
}

watch(() => props.option, () => {
  initialDraw = false;
  draw();
}, { deep: true });

onMounted(() => nextTick(() => {
  initialDraw = true;
  draw();
}));
</script>

<template>
  <div class="gauge-chart" :style="{ width: width + 'px' }">
    <!-- 标题 -->
    <div v-if="option.title?.text" class="gauge-chart__title">
      <div class="gauge-chart__title-text" :style="{
        color: option.title?.textStyle?.color || '#333',
        fontSize: (option.title?.textStyle?.fontSize || 16) + 'px',
        fontWeight: option.title?.textStyle?.fontWeight || '600',
      }">{{ option.title.text }}</div>
      <div v-if="option.title?.subtext" class="gauge-chart__title-sub" :style="{
        color: option.title?.subtextStyle?.color || '#999',
        fontSize: (option.title?.subtextStyle?.fontSize || 12) + 'px',
      }">{{ option.title.subtext }}</div>
    </div>

    <!-- Canvas -->
    <canvas
      ref="canvasRef"
      class="gauge-chart__canvas"
      :style="{ width: width + 'px', height: height + 'px' }"
    ></canvas>
  </div>
</template>

<style scoped>
.gauge-chart {
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
.gauge-chart__title {
  padding: 4px 0 8px;
  text-align: center;
}
.gauge-chart__title-text {
  line-height: 1.4;
}
.gauge-chart__title-sub {
  line-height: 1.4;
  margin-top: 2px;
}
.gauge-chart__canvas {
  display: block;
}
</style>
