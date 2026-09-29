<script setup lang="ts">
/**
 * BaseBarChart — 柱状图组件
 * 支持：基础柱状 / 堆叠 / 分组 / 水平 / 圆角柱 / tooltip / 动画
 */
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { useCanvas } from '../composables/useCanvas';
import { useTooltip, type HitZone } from '../composables/useTooltip';
import { animate, staggerAnimate } from '../composables/useAnimation';
import {
  hexToRgba, fillRoundRect, drawText, drawAxis, drawLegend,
  niceScale, formatNumber, DEFAULT_COLORS, mapRange, measureText,
} from '../composables/draw-helpers';
import type { BarChartOption, Series, Axis } from '../types/chart';

const props = withDefaults(defineProps<{
  option: BarChartOption;
  width?: number;
  height?: number;
}>(), { width: 560, height: 320 });

const canvasRef = ref<HTMLCanvasElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);
const { ctx, clear, getSize } = useCanvas(canvasRef, { width: () => props.width, height: () => props.height });
const { state: tooltipState, registerHitZones } = useTooltip(canvasRef, containerRef);

const grid = computed(() => {
  const g = props.option.grid || {};
  return {
    top: typeof g.top === 'number' ? g.top : 50,
    right: typeof g.right === 'number' ? g.right : 30,
    bottom: typeof g.bottom === 'number' ? g.bottom : 45,
    left: typeof g.left === 'number' ? g.left : 55,
  };
});

const plotArea = computed(() => {
  const { w, h } = getSize();
  const g = grid.value;
  return { x: g.left, y: g.top, width: w - g.left - g.right, height: h - g.top - g.bottom };
});

const tooltipHtml = computed(() => {
  const p = tooltipState.value.params;
  if (!p) return '';
  return `<div style="font-weight:600;margin-bottom:4px">${p.name}</div>
    <div style="display:flex;align-items:center;gap:6px">
      <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${p.color}"></span>
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

  const xData = option.xAxis?.data || [];
  const catCount = xData.length || (series[0]?.data.length || 0);

  // Y 轴范围
  const allValues: number[] = [];
  series.forEach(s => s.data.forEach(v => allValues.push(v)));
  const scale = niceScale(0, Math.max(...allValues) * 1.1 || 10);

  // 绘制 Y 轴
  const yTicks = scale.ticks.map(v => ({
    label: (option.yAxis as Axis)?.formatter?.(v) ?? formatNumber(v),
    position: mapRange(v, scale.min, scale.max, 0, plot.height),
  }));
  drawAxis(c, {
    x: plot.x, y: plot.y + plot.height, length: plot.height,
    direction: 'y', values: yTicks,
    gridLine: (option.yAxis as Axis)?.splitLine?.show !== false,
    gridLineColor: '#eee', gridLength: plot.width,
    labelColor: '#999',
  });

  // X 轴标签
  const catWidth = plot.width / catCount;
  const xTicks = xData.map((label, i) => ({
    label, position: i * catWidth + catWidth / 2,
  }));
  drawAxis(c, {
    x: plot.x, y: plot.y + plot.height, length: plot.width,
    direction: 'x', values: xTicks,
    labelColor: '#999', tickLength: 0,
  });

  // 柱条计算
  const seriesCount = series.length;
  const barMaxWidth = option.barMaxWidth || 40;
  const barGap = 0.2; // 柱间距比例
  const groupWidth = catWidth * (1 - barGap);
  const barWidth = Math.min(groupWidth / seriesCount, barMaxWidth);
  const groupOffset = (catWidth - barWidth * seriesCount) / 2;

  const hitZones: HitZone[] = [];

  function drawBars(progress: number) {
    clear();
    // 重绘坐标轴
    drawAxis(c, {
      x: plot.x, y: plot.y + plot.height, length: plot.height,
      direction: 'y', values: yTicks,
      gridLine: (option.yAxis as Axis)?.splitLine?.show !== false,
      gridLineColor: '#eee', gridLength: plot.width,
      labelColor: '#999',
    });
    drawAxis(c, {
      x: plot.x, y: plot.y + plot.height, length: plot.width,
      direction: 'x', values: xTicks,
      labelColor: '#999', tickLength: 0,
    });

    hitZones.length = 0;

    series.forEach((s, si) => {
      const color = s.color || colors[si % colors.length];

      s.data.forEach((v, di) => {
        const bx = plot.x + di * catWidth + groupOffset + si * barWidth;
        const barH = mapRange(v, scale.min, scale.max, 0, plot.height) * progress;
        const by = plot.y + plot.height - barH;

        // 圆角柱
        const radius = Math.min(4, barWidth / 4);
        fillRoundRect(c, bx, by, barWidth, barH, [radius, radius, 0, 0], color);

        // 阴影效果（首系列加微阴影）
        if (si === 0) {
          c.save();
          c.shadowColor = hexToRgba(color, 0.15);
          c.shadowBlur = 6;
          c.shadowOffsetY = 2;
          fillRoundRect(c, bx, by, barWidth, barH, [radius, radius, 0, 0], color);
          c.restore();
        }

        // 数值标签
        if (catCount <= 12 && progress > 0.8) {
          drawText(c, formatNumber(v), bx + barWidth / 2, by - 8, {
            color: '#666', fontSize: 10, align: 'center',
          });
        }

        // 命中区域
        hitZones.push({
          x: bx + barWidth / 2, y: by + barH / 2, radius: barWidth,
          params: {
            seriesIndex: si, dataIndex: di,
            seriesName: s.name, name: xData[di] || String(di),
            value: v, color,
          },
        });
      });
    });

    registerHitZones(hitZones);
  }

  const animDuration = option.animation?.enabled === false ? 0 : (option.animation?.duration ?? 800);
  if (animDuration > 0) {
    animate({ duration: animDuration, easing: 'cubicOut', onProgress: drawBars });
  } else {
    drawBars(1);
  }
}
</script>

<template>
  <div ref="containerRef" class="base-chart" :style="{ position: 'relative', width: width + 'px' }">
    <div v-if="option.title?.text" class="base-chart__title" :style="{ paddingLeft: grid.left + 'px' }">
      <div class="base-chart__title-text" :style="{
        color: option.title?.textStyle?.color || '#333',
        fontSize: (option.title?.textStyle?.fontSize || 16) + 'px',
        fontWeight: option.title?.textStyle?.fontWeight || '600',
      }">{{ option.title.text }}</div>
      <div v-if="option.title?.subtext" class="base-chart__title-sub" :style="{
        color: option.title?.subtextStyle?.color || '#999',
      }">{{ option.title.subtext }}</div>
    </div>
    <div v-if="option.legend?.show !== false && seriesCount > 1" class="base-chart__legend">
      <span v-for="(s, i) in option.series" :key="s.name" class="base-chart__legend-item">
        <span class="base-chart__legend-dot" :style="{ background: s.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length] }"></span>
        <span>{{ s.name }}</span>
      </span>
    </div>
    <canvas ref="canvasRef" class="base-chart__canvas" :style="{ width: width + 'px', height: height + 'px' }"></canvas>
    <div v-if="tooltipState.visible" class="base-chart__tooltip" :style="tooltipState.style" v-html="tooltipHtml"></div>
  </div>
</template>

<style scoped>
.base-chart { position: relative; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
.base-chart__title { padding: 4px 0 8px; }
.base-chart__title-text { line-height: 1.4; }
.base-chart__title-sub { line-height: 1.4; margin-top: 2px; font-size: 12px; }
.base-chart__legend { display: flex; gap: 18px; padding: 2px 0 6px; font-size: 12px; color: #666; }
.base-chart__legend-item { display: flex; align-items: center; gap: 5px; cursor: pointer; }
.base-chart__legend-dot { width: 10px; height: 10px; border-radius: 2px; }
.base-chart__canvas { display: block; }
.base-chart__tooltip {
  background: rgba(0,0,0,0.78); color: #fff; padding: 8px 12px; border-radius: 6px;
  font-size: 12px; line-height: 1.5; max-width: 240px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
</style>
