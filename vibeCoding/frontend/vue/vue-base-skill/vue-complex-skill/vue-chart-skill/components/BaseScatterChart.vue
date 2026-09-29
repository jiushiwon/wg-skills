<script setup lang="ts">
/**
 * BaseScatterChart — 散点图 / 气泡图组件
 * 支持：散点图 / 气泡图（data[2] 映射大小）/ 多系列 / 入场动画 / hover 高亮 + tooltip
 */
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { useCanvas } from '../composables/useCanvas';
import { useTooltip, type HitZone } from '../composables/useTooltip';
import { animate } from '../composables/useAnimation';
import {
  hexToRgba, drawText, drawAxis, niceScale, formatNumber, mapRange,
  DEFAULT_COLORS, measureText,
} from '../composables/draw-helpers';
import type { ScatterChartOption } from '../types/chart';

const props = withDefaults(defineProps<{
  option: ScatterChartOption;
  width?: number;
  height?: number;
}>(), {
  width: 560,
  height: 320,
});

const canvasRef = ref<HTMLCanvasElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);

const { ctx, clear, getSize } = useCanvas(canvasRef, {
  width: () => props.width,
  height: () => props.height,
});
const { state: tooltipState, registerHitZones } = useTooltip(canvasRef, containerRef);

// 解析 grid 边距（散点图左右多留空间给轴标签）
const grid = computed(() => {
  const g = props.option.grid || {};
  return {
    top: typeof g.top === 'number' ? g.top : 45,
    right: typeof g.right === 'number' ? g.right : 35,
    bottom: typeof g.bottom === 'number' ? g.bottom : 45,
    left: typeof g.left === 'number' ? g.left : 55,
  };
});

// 绘图区域
const plotArea = computed(() => {
  const { w, h } = getSize();
  const g = grid.value;
  return {
    x: g.left,
    y: g.top,
    width: w - g.left - g.right,
    height: h - g.top - g.bottom,
  };
});

// 生成 tooltip HTML
const tooltipHtml = computed(() => {
  const p = tooltipState.value.params;
  if (!p) return '';
  // 气泡图模式显示第三维数据
  const bubbleInfo = p.extra?.bubbleValue != null
    ? `<div style="margin-top:2px;opacity:0.8">Size: <b>${formatNumber(p.extra.bubbleValue as number)}</b></div>`
    : '';
  return `<div style="font-weight:600;margin-bottom:4px">${p.seriesName}</div>
    <div style="display:flex;align-items:center;gap:6px">
      <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color}"></span>
      <span>x: ${formatNumber(p.dataIndex === -1 ? 0 : parseFloat(p.name))} &nbsp; y: <b>${formatNumber(p.value)}</b></span>
    </div>${bubbleInfo}`;
});

watch(() => [props.option, props.width, props.height], () => draw(), { deep: true });
onMounted(() => nextTick(() => draw()));

// 计算点的半径：symbolSize 为 [min, max] 时按 data[2] 映射，否则用固定值
function getPointRadius(
  dataPoint: [number, number, number?],
  symbolSize: [number, number] | number | undefined,
  minVal: number,
  maxVal: number,
): number {
  if (Array.isArray(symbolSize)) {
    const [minR, maxR] = symbolSize;
    const val = dataPoint[2] ?? 0;
    return mapRange(val, minVal, maxVal, minR, maxR);
  }
  if (typeof symbolSize === 'number') return symbolSize;
  // 气泡模式：data[2] 映射到 [6, 30]
  if (dataPoint[2] != null) {
    return mapRange(dataPoint[2], minVal, maxVal, 6, 30);
  }
  return 5;
}

function draw() {
  const c = ctx.value;
  if (!c) return;
  clear();

  const { w, h } = getSize();
  const plot = plotArea.value;
  const option = props.option;
  const series = option.series || [];
  const colors = DEFAULT_COLORS;

  // 1. 计算 X/Y 轴范围
  const allX: number[] = [];
  const allY: number[] = [];
  const allBubble: number[] = [];

  series.forEach(s => {
    s.data.forEach(d => {
      allX.push(d[0]);
      allY.push(d[1]);
      if (d[2] != null) allBubble.push(d[2]);
    });
  });

  if (allX.length === 0) return;

  const xScale = niceScale(
    option.xAxis?.min === 'dataMin' ? Math.min(...allX) : (option.xAxis?.min as number ?? Math.min(...allX)),
    option.xAxis?.max === 'dataMax' ? Math.max(...allX) : (option.xAxis?.max as number ?? Math.max(...allX) * 1.05),
  );
  const yScale = niceScale(
    Math.min(0, option.yAxis?.min === 'dataMin' ? Math.min(...allY) : (option.yAxis?.min as number ?? Math.min(...allY))),
    option.yAxis?.max === 'dataMax' ? Math.max(...allY) : (option.yAxis?.max as number ?? Math.max(...allY) * 1.1),
  );

  // 气泡图：计算第三维数据的全局范围
  const bubbleMin = allBubble.length > 0 ? Math.min(...allBubble) : 0;
  const bubbleMax = allBubble.length > 0 ? Math.max(...allBubble) : 1;

  // 2. 绘制 Y 轴 + 水平网格线
  const yTicks = yScale.ticks.map(v => ({
    label: option.yAxis?.formatter?.(v) ?? formatNumber(v),
    position: mapRange(v, yScale.min, yScale.max, 0, plot.height),
  }));
  drawAxis(c, {
    x: plot.x, y: plot.y + plot.height, length: plot.height,
    direction: 'y', values: yTicks,
    gridLine: option.yAxis?.splitLine?.show !== false,
    gridLineColor: option.yAxis?.splitLine?.color ?? '#eee',
    gridLength: plot.width,
    labelColor: option.yAxis?.axisLabel?.color ?? '#999',
  });

  // 3. 绘制 X 轴 + 垂直网格线
  const xTicks = xScale.ticks.map(v => ({
    label: option.xAxis?.formatter?.(v) ?? formatNumber(v),
    position: mapRange(v, xScale.min, xScale.max, 0, plot.width),
  }));
  drawAxis(c, {
    x: plot.x, y: plot.y + plot.height, length: plot.width,
    direction: 'x', values: xTicks,
    gridLine: option.xAxis?.splitLine?.show === true,
    gridLineColor: option.xAxis?.splitLine?.color ?? '#eee',
    gridLength: plot.height,
    labelColor: option.xAxis?.axisLabel?.color ?? '#999',
  });

  // 4. 绘制散点数据
  const anim = option.animation;
  const animDuration = anim?.enabled === false ? 0 : (anim?.duration ?? 800);
  let hitZones: HitZone[] = [];

  function drawSeries(progress: number) {
    // 每帧清除并重绘背景
    clear();

    drawAxis(c, {
      x: plot.x, y: plot.y + plot.height, length: plot.height,
      direction: 'y', values: yTicks,
      gridLine: option.yAxis?.splitLine?.show !== false,
      gridLineColor: option.yAxis?.splitLine?.color ?? '#eee',
      gridLength: plot.width,
      labelColor: option.yAxis?.axisLabel?.color ?? '#999',
    });
    drawAxis(c, {
      x: plot.x, y: plot.y + plot.height, length: plot.width,
      direction: 'x', values: xTicks,
      gridLine: option.xAxis?.splitLine?.show === true,
      gridLineColor: option.xAxis?.splitLine?.color ?? '#eee',
      gridLength: plot.height,
      labelColor: option.xAxis?.axisLabel?.color ?? '#999',
    });

    hitZones = [];

    series.forEach((s, si) => {
      const color = s.color || colors[si % colors.length];
      const itemAlpha = s.itemStyle?.opacity ?? 0.75;

      s.data.forEach((d, di) => {
        // 计算画布坐标
        const px = plot.x + mapRange(d[0], xScale.min, xScale.max, 0, plot.width);
        const baseY = plot.y + plot.height - mapRange(d[1], yScale.min, yScale.max, 0, plot.height);
        // 入场动画：Y 轴从底部展开，同时透明度渐现
        const py = plot.y + plot.height - (plot.y + plot.height - baseY) * progress;

        const radius = getPointRadius(d, s.symbolSize, bubbleMin, bubbleMax);
        const drawRadius = radius * progress;

        if (drawRadius < 0.5) return;

        // 绘制散点：外层使用半透明色增强层次感
        c.beginPath();
        c.arc(px, py, drawRadius, 0, Math.PI * 2);
        c.fillStyle = hexToRgba(color, itemAlpha * progress);
        c.fill();

        // 散点边框（更精致的视觉效果）
        c.beginPath();
        c.arc(px, py, drawRadius, 0, Math.PI * 2);
        c.strokeStyle = hexToRgba(color, Math.min(1, itemAlpha + 0.2) * progress);
        c.lineWidth = 1;
        c.stroke();

        // 注册命中区域（使用实际半径 + 缓冲）
        hitZones.push({
          x: px, y: py,
          radius: Math.max(radius + 4, 12),
          params: {
            seriesIndex: si,
            dataIndex: di,
            seriesName: s.name,
            name: String(d[0]),
            value: d[1],
            color,
            extra: d[2] != null ? { bubbleValue: d[2] } : undefined,
          },
        });
      });
    });

    registerHitZones(hitZones);
  }

  // 入场动画：逐点渐现 + 放大
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
      textAlign: option.title?.left || 'left',
      paddingLeft: grid.left + 'px',
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
.base-chart__title { padding: 4px 0 8px; }
.base-chart__title-text { line-height: 1.4; }
.base-chart__title-sub { line-height: 1.4; margin-top: 2px; }
.base-chart__legend { display: flex; gap: 18px; padding: 2px 0 6px; font-size: 12px; color: #666; }
.base-chart__legend-item { display: flex; align-items: center; gap: 5px; cursor: pointer; }
.base-chart__legend-dot { width: 10px; height: 10px; border-radius: 50%; }
.base-chart__canvas { display: block; }
.base-chart__tooltip {
  background: rgba(0,0,0,0.78); color: #fff; padding: 8px 12px; border-radius: 6px;
  font-size: 12px; line-height: 1.5; max-width: 260px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
</style>
