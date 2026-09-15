<script setup lang="ts">
/**
 * BaseRadarChart — 雷达图组件
 * 支持：多边形网格背景 / 顶点标签 / 多系列叠加对比 / 面积填充 / hover 高亮维度 + tooltip / 入场动画
 */
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { useCanvas } from '../composables/useCanvas';
import { useTooltip, type HitZone } from '../composables/useTooltip';
import { animate } from '../composables/useAnimation';
import {
  hexToRgba, drawText, drawArea, DEFAULT_COLORS, formatNumber, measureText,
} from '../composables/draw-helpers';
import type { RadarChartOption } from '../types/chart';

const props = withDefaults(defineProps<{
  option: RadarChartOption;
  width?: number;
  height?: number;
}>(), {
  width: 400,
  height: 400,
});

const canvasRef = ref<HTMLCanvasElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);

const { ctx, clear, getSize } = useCanvas(canvasRef, {
  width: () => props.width,
  height: () => props.height,
});
const { state: tooltipState, registerHitZones } = useTooltip(canvasRef, containerRef);

// 雷达图中心和半径
const grid = computed(() => {
  const { w, h } = getSize();
  return {
    cx: w / 2,
    cy: h / 2 + 10,
    radius: Math.min(w, h) / 2 - 55,
  };
});

// 生成 tooltip HTML
const tooltipHtml = computed(() => {
  const p = tooltipState.value.params;
  if (!p) return '';
  return `<div style="font-weight:600;margin-bottom:4px">${p.name}</div>
    <div style="display:flex;align-items:center;gap:6px">
      <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color}"></span>
      <span>${p.seriesName}: <b>${formatNumber(p.value)}</b></span>
    </div>`;
});

// 网格层数
const GRID_LEVELS = 5;

watch(() => [props.option, props.width, props.height], () => draw(), { deep: true });
onMounted(() => nextTick(() => draw()));

// 按维度索引计算角度（12 点钟方向开始，顺时针）
function getAngle(index: number, total: number): number {
  return (Math.PI * 2 * index) / total - Math.PI / 2;
}

// 根据维度索引 + 比例值，计算画布坐标
function getPoint(index: number, total: number, ratio: number, cx: number, cy: number, radius: number): [number, number] {
  const angle = getAngle(index, total);
  return [
    cx + radius * ratio * Math.cos(angle),
    cy + radius * ratio * Math.sin(angle),
  ];
}

// 绘制多边形网格层
function drawGridLevels(c: CanvasRenderingContext2D, cx: number, cy: number, radius: number, count: number) {
  const total = props.option.radar.length;
  for (let level = 1; level <= count; level++) {
    const ratio = level / count;
    c.beginPath();
    for (let i = 0; i <= total; i++) {
      const [px, py] = getPoint(i % total, total, ratio, cx, cy, radius);
      if (i === 0) c.moveTo(px, py);
      else c.lineTo(px, py);
    }
    c.closePath();
    c.strokeStyle = '#e8e8e8';
    c.lineWidth = 1;
    c.stroke();

    // 交替底色（奇数层淡填充）
    if (level % 2 === 1) {
      c.fillStyle = level === count ? 'rgba(245,245,250,0.6)' : 'rgba(250,250,252,0.4)';
      c.fill();
    }
  }
}

// 绘制从中心到顶点的骨架线
function drawAxisLines(c: CanvasRenderingContext2D, cx: number, cy: number, radius: number, count: number) {
  const total = props.option.radar.length;
  for (let i = 0; i < total; i++) {
    const [px, py] = getPoint(i, total, 1, cx, cy, radius);
    c.beginPath();
    c.moveTo(cx, cy);
    c.lineTo(px, py);
    c.strokeStyle = '#ddd';
    c.lineWidth = 1;
    c.stroke();
  }
}

// 绘制各维度标签
function drawLabels(c: CanvasRenderingContext2D, cx: number, cy: number, radius: number) {
  const indicators = props.option.radar;
  const total = indicators.length;

  indicators.forEach((ind, i) => {
    const [px, py] = getPoint(i, total, 1, cx, cy, radius);
    const angle = getAngle(i, total);

    // 根据标签所在方向微调对齐方式
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    let align: CanvasTextAlign = 'center';
    let baseline: CanvasTextBaseline = 'middle';
    let offsetX = 0;
    let offsetY = 0;
    const labelGap = 16;

    if (cos > 0.3) align = 'left';
    else if (cos < -0.3) align = 'right';

    if (sin < -0.3) baseline = 'bottom';
    else if (sin > 0.3) baseline = 'top';

    offsetX = cos * labelGap;
    offsetY = sin * labelGap;

    drawText(c, ind.name, px + offsetX, py + offsetY, {
      color: ind.color || '#666',
      fontSize: 11,
      align,
      baseline,
    });
  });
}

// 绘制数据多边形
function drawDataPolygon(
  c: CanvasRenderingContext2D,
  data: number[],
  indicators: { name: string; max: number }[],
  cx: number, cy: number, radius: number,
  color: string,
  progress: number,
  areaOpacity: number,
) {
  const total = indicators.length;
  const points: Array<[number, number]> = data.map((val, i) => {
    const ratio = (val / indicators[i].max) * progress;
    return getPoint(i, total, Math.min(ratio, 1), cx, cy, radius);
  });

  // 半透明面积填充
  c.beginPath();
  points.forEach((p, i) => {
    if (i === 0) c.moveTo(p[0], p[1]);
    else c.lineTo(p[0], p[1]);
  });
  c.closePath();
  c.fillStyle = hexToRgba(color, areaOpacity * progress);
  c.fill();

  // 数据连线
  c.beginPath();
  points.forEach((p, i) => {
    if (i === 0) c.moveTo(p[0], p[1]);
    else c.lineTo(p[0], p[1]);
  });
  c.closePath();
  c.strokeStyle = hexToRgba(color, progress);
  c.lineWidth = 2;
  c.lineJoin = 'round';
  c.stroke();

  // 顶点数据点
  points.forEach(p => {
    c.beginPath();
    c.arc(p[0], p[1], 3.5 * progress, 0, Math.PI * 2);
    c.fillStyle = hexToRgba(color, progress);
    c.fill();
    // 白色内圆（精致感）
    c.beginPath();
    c.arc(p[0], p[1], 1.5 * progress, 0, Math.PI * 2);
    c.fillStyle = hexToRgba('#ffffff', progress);
    c.fill();
  });
}

// 绘制高亮维度连线（hover 效果）
function drawHighlightAxis(
  c: CanvasRenderingContext2D,
  dimIndex: number,
  cx: number, cy: number, radius: number,
  color: string,
) {
  const [px, py] = getPoint(dimIndex, props.option.radar.length, 1, cx, cy, radius);
  c.beginPath();
  c.moveTo(cx, cy);
  c.lineTo(px, py);
  c.strokeStyle = hexToRgba(color, 0.6);
  c.lineWidth = 2;
  c.stroke();
}

function draw() {
  const c = ctx.value;
  if (!c) return;
  clear();

  const option = props.option;
  const series = option.series || [];
  const indicators = option.radar;
  const colors = DEFAULT_COLORS;

  if (indicators.length === 0) return;

  const { cx, cy, radius } = grid.value;

  // 1. 绘制网格背景
  drawGridLevels(c, cx, cy, radius, GRID_LEVELS);
  drawAxisLines(c, cx, cy, radius, indicators.length);

  // 2. 绘制维度标签
  drawLabels(c, cx, cy, radius);

  // 3. 绘制数据系列
  const anim = option.animation;
  const animDuration = anim?.enabled === false ? 0 : (anim?.duration ?? 800);
  let hitZones: HitZone[] = [];

  function drawSeries(progress: number) {
    clear();

    // 重绘网格背景和标签
    drawGridLevels(c, cx, cy, radius, GRID_LEVELS);
    drawAxisLines(c, cx, cy, radius, indicators.length);
    drawLabels(c, cx, cy, radius);

    hitZones = [];

    // 高亮当前 hover 维度（如有）
    const hoverDimIndex = tooltipState.value.params?.extra?.dimIndex as number | undefined;
    if (hoverDimIndex != null) {
      drawHighlightAxis(c, hoverDimIndex, cx, cy, radius, tooltipState.value.params?.color || '#5470c6');
    }

    // 绘制每个系列的数据多边形
    series.forEach((s, si) => {
      const color = s.color || colors[si % colors.length];
      const areaOpacity = s.areaStyle?.opacity ?? 0.2;

      drawDataPolygon(c, s.data, indicators, cx, cy, radius, color, progress, areaOpacity);
    });

    // 注册 hit zone：每个维度顶点处注册一个命中区域
    series.forEach((s, si) => {
      const color = s.color || colors[si % colors.length];
      s.data.forEach((val, di) => {
        const ratio = (val / indicators[di].max) * progress;
        const [px, py] = getPoint(di, indicators.length, Math.min(ratio, 1), cx, cy, radius);
        hitZones.push({
          x: px, y: py,
          radius: 20,
          params: {
            seriesIndex: si,
            dataIndex: di,
            seriesName: s.name,
            name: indicators[di].name,
            value: val,
            color,
            extra: { dimIndex: di },
          },
        });
      });
    });

    registerHitZones(hitZones);
  }

  // 入场动画：数据多边形从中心展开
  if (animDuration > 0) {
    animate({ duration: animDuration, easing: 'cubicOut', onProgress: drawSeries });
  } else {
    drawSeries(1);
  }
}
</script>

<template>
  <div ref="containerRef" class="base-chart" :style="{ position: 'relative', width: width + 'px' }">
    <!-- 标题 -->
    <div v-if="option.title?.text" class="base-chart__title" :style="{
      textAlign: option.title?.left || 'center',
    }">
      <div class="base-chart__title-text" :style="{
        color: option.title?.textStyle?.color || '#333',
        fontSize: (option.title?.textStyle?.fontSize || 16) + 'px',
        fontWeight: option.title?.textStyle?.fontWeight || '600',
      }">{{ option.title.text }}</div>
      <div v-if="option.title?.subtext" class="base-chart__title-sub" :style="{
        color: option.title?.subtextStyle?.color || '#999',
        fontSize: (option.title?.subtextStyle?.fontSize || 12) + 'px',
      }">{{ option.title.subtext }}</div>
    </div>

    <!-- 图例 -->
    <div v-if="option.legend?.show !== false && option.series?.length" class="base-chart__legend">
      <span
        v-for="(s, i) in option.series"
        :key="s.name"
        class="base-chart__legend-item"
      >
        <span class="base-chart__legend-dot" :style="{ background: s.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length] }"></span>
        <span>{{ s.name }}</span>
      </span>
    </div>

    <!-- Canvas -->
    <canvas ref="canvasRef" class="base-chart__canvas" :style="{ width: width + 'px', height: height + 'px' }"></canvas>

    <!-- Tooltip -->
    <div v-if="tooltipState.visible" class="base-chart__tooltip" :style="tooltipState.style" v-html="tooltipHtml"></div>
  </div>
</template>

<style scoped>
.base-chart { position: relative; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
.base-chart__title { padding: 4px 0 8px; text-align: center; }
.base-chart__title-text { line-height: 1.4; }
.base-chart__title-sub { line-height: 1.4; margin-top: 2px; }
.base-chart__legend { display: flex; justify-content: center; gap: 18px; padding: 2px 0 6px; font-size: 12px; color: #666; }
.base-chart__legend-item { display: flex; align-items: center; gap: 5px; cursor: pointer; }
.base-chart__legend-dot { width: 10px; height: 10px; border-radius: 50%; }
.base-chart__canvas { display: block; }
.base-chart__tooltip {
  background: rgba(0,0,0,0.78); color: #fff; padding: 8px 12px; border-radius: 6px;
  font-size: 12px; line-height: 1.5; max-width: 240px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
</style>
