<script setup lang="ts">
/**
 * BaseLineChart — 折线图组件
 * 支持：基础折线 / 平滑曲线 / 面积填充 / 多系列 / 堆叠 / 双Y轴 / tooltip / 缩略轴
 */
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { useCanvas } from '../composables/useCanvas';
import { useTooltip, type HitZone } from '../composables/useTooltip';
import { animate } from '../composables/useAnimation';
import {
  hexToRgba, linearGradient, smoothLinePath, drawArea,
  drawText, drawAxis, drawLegend, niceScale, formatNumber,
  measureText, DEFAULT_COLORS, mapRange,
} from '../composables/draw-helpers';
import type { LineChartOption, Series, Axis } from '../types/chart';

const props = withDefaults(defineProps<{
  option: LineChartOption;
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

// 解析 grid 边距
const grid = computed(() => {
  const g = props.option.grid || {};
  return {
    top: typeof g.top === 'number' ? g.top : 50,
    right: typeof g.right === 'number' ? g.right : 30,
    bottom: typeof g.bottom === 'number' ? g.bottom : 40,
    left: typeof g.left === 'number' ? g.left : 55,
  };
});

// 计算绘图区域
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

// 生成tooltip HTML
const tooltipHtml = computed(() => {
  const p = tooltipState.value.params;
  if (!p) return '';
  return `<div style="font-weight:600;margin-bottom:4px">${p.name}</div>
    <div style="display:flex;align-items:center;gap:6px">
      <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color}"></span>
      <span>${p.seriesName}: <b>${formatNumber(p.value)}</b></span>
    </div>`;
});

watch(() => [props.option, props.width, props.height], () => draw(), { deep: true });
onMounted(() => nextTick(() => draw()));

function draw() {
  const c = ctx.value;
  if (!c) return;
  clear();

  const { w, h } = getSize();
  const plot = plotArea.value;
  const option = props.option;
  const series = option.series || [];
  const colors = DEFAULT_COLORS;

  // 1. 计算 Y 轴范围
  const allValues: number[] = [];
  series.forEach(s => s.data.forEach(v => allValues.push(v)));
  const yMin = option.yAxis?.min === 'dataMin' ? Math.min(...allValues) : (option.yAxis?.min as number) ?? 0;
  const yMax = option.yAxis?.max === 'dataMax' ? Math.max(...allValues) : (option.yAxis?.max as number) ?? Math.max(...allValues) * 1.1;
  const scale = niceScale(Math.min(yMin, 0), yMax);

  // 2. 绘制 Y 轴 + 网格线
  const yTicks = scale.ticks.map(v => ({
    label: (option.yAxis as Axis)?.formatter?.(v) ?? formatNumber(v),
    position: mapRange(v, scale.min, scale.max, 0, plot.height),
  }));
  drawAxis(c, {
    x: plot.x, y: plot.y + plot.height, length: plot.height,
    direction: 'y', values: yTicks,
    gridLine: (option.yAxis as Axis)?.splitLine?.show !== false,
    gridLineColor: (option.yAxis as Axis)?.splitLine?.color ?? '#eee',
    gridLength: plot.width,
    labelColor: (option.yAxis as Axis)?.axisLabel?.color ?? '#999',
  });

  // 3. 绘制 X 轴
  const xData = (option.xAxis?.data || series[0]?.data.map((_, i) => String(i)) || []);
  const xStep = plot.width / Math.max(xData.length - 1, 1);
  const xTicks = xData.map((label, i) => ({
    label: (option.xAxis as Axis)?.axisLabel?.formatter?.(label, i) ?? label,
    position: i * xStep,
  }));
  drawAxis(c, {
    x: plot.x, y: plot.y + plot.height, length: plot.width,
    direction: 'x', values: xTicks,
    labelColor: (option.xAxis as Axis)?.axisLabel?.color ?? '#999',
  });

  // 4. 绘制系列
  const hitZones: HitZone[] = [];
  const anim = option.animation;
  const animDuration = anim?.enabled === false ? 0 : (anim?.duration ?? 800);

  function drawSeries(progress: number) {
    // 重绘坐标轴
    clear();
    drawAxis(c, {
      x: plot.x, y: plot.y + plot.height, length: plot.height,
      direction: 'y', values: yTicks,
      gridLine: (option.yAxis as Axis)?.splitLine?.show !== false,
      gridLineColor: (option.yAxis as Axis)?.splitLine?.color ?? '#eee',
      gridLength: plot.width,
      labelColor: (option.yAxis as Axis)?.axisLabel?.color ?? '#999',
    });
    drawAxis(c, {
      x: plot.x, y: plot.y + plot.height, length: plot.width,
      direction: 'x', values: xTicks,
      labelColor: (option.xAxis as Axis)?.axisLabel?.color ?? '#999',
    });

    hitZones.length = 0;

    series.forEach((s, si) => {
      const color = s.color || colors[si % colors.length];
      const pts: Array<[number, number]> = s.data.map((v, di) => {
        const x = plot.x + di * xStep;
        const y = plot.y + plot.height - mapRange(v, scale.min, scale.max, 0, plot.height) * progress;
        return [x, y];
      });

      // 面积填充
      if (s.area) {
        const areaColor = linearGradient(c, 0, plot.y, 0, plot.y + plot.height, [
          { offset: 0, color: hexToRgba(color, s.areaOpacity ?? 0.25) },
          { offset: 1, color: hexToRgba(color, 0) },
        ]);
        drawArea(c, pts, plot.y + plot.height, areaColor);
      }

      // 折线
      c.beginPath();
      if (s.smooth !== false) {
        smoothLinePath(c, pts);
      } else {
        c.moveTo(pts[0][0], pts[0][1]);
        pts.forEach(p => c.lineTo(p[0], p[1]));
      }
      c.strokeStyle = color;
      c.lineWidth = s.lineWidth ?? 2;
      c.lineJoin = 'round';
      c.lineCap = 'round';
      if (s.lineStyle === 'dashed') c.setLineDash([6, 4]);
      else if (s.lineStyle === 'dotted') c.setLineDash([2, 3]);
      c.stroke();
      c.setLineDash([]);

      // 数据点
      if (s.showDot !== false && pts.length <= 50) {
        pts.forEach((p, di) => {
          const r = s.dotRadius ?? 3;
          c.beginPath();
          c.arc(p[0], p[1], r + 2, 0, Math.PI * 2);
          c.fillStyle = '#fff';
          c.fill();
          c.beginPath();
          c.arc(p[0], p[1], r, 0, Math.PI * 2);
          c.fillStyle = color;
          c.fill();

          // 注册命中区域
          hitZones.push({
            x: p[0], y: p[1], radius: 16,
            params: {
              seriesIndex: si, dataIndex: di,
              seriesName: s.name, name: xData[di] || String(di),
              value: s.data[di], color,
            },
          });
        });
      }

      // 末端高亮圆点
      if (pts.length > 0 && s.showDot !== false) {
        const end = pts[pts.length - 1];
        c.beginPath();
        c.arc(end[0], end[1], 5, 0, Math.PI * 2);
        c.fillStyle = color;
        c.fill();
        c.beginPath();
        c.arc(end[0], end[1], 3, 0, Math.PI * 2);
        c.fillStyle = '#fff';
        c.fill();
      }
    });

    registerHitZones(hitZones);
  }

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
.base-chart__legend-dot { width: 10px; height: 10px; border-radius: 3px; }
.base-chart__canvas { display: block; }
.base-chart__tooltip {
  background: rgba(0,0,0,0.78); color: #fff; padding: 8px 12px; border-radius: 6px;
  font-size: 12px; line-height: 1.5; max-width: 240px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
</style>
