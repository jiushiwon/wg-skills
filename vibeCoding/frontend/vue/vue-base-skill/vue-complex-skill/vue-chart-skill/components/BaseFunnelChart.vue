<script setup lang="ts">
/**
 * BaseFunnelChart — 漏斗图组件
 * 支持：梯形层叠 / descending(默认)·ascending·none 排序 / 层间距 /
 * 名称+数值+百分比标注 / hover 高亮偏移 / 交错入场动画
 */
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useCanvas } from '../composables/useCanvas';
import { useTooltip, type HitZone } from '../composables/useTooltip';
import { staggerAnimate } from '../composables/useAnimation';
import {
  hexToRgba, drawText, formatNumber, measureText,
  DEFAULT_COLORS, drawAxis,
} from '../composables/draw-helpers';
import type { FunnelChartOption, FunnelSeries } from '../types/chart';

const props = withDefaults(defineProps<{
  option: FunnelChartOption;
  width?: number;
  height?: number;
}>(), {
  width: 560,
  height: 380,
});

const canvasRef = ref<HTMLCanvasElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);
/** 当前 hover 层索引（-1 表示无） */
const hoveredIndex = ref(-1);

const { ctx, clear, getSize } = useCanvas(canvasRef, {
  width: () => props.width,
  height: () => props.height,
});
const { state: tooltipState, registerHitZones } = useTooltip(canvasRef, containerRef);

let cancelAnim: (() => void) | null = null;

// ===================== 系列配置解析 =====================

const series = computed<FunnelSeries>(() => {
  const s = props.option.series?.[0];
  if (!s) return { data: [], sort: 'descending' };
  return { sort: 'descending', min: 0, max: 100, gap: 2, ...s };
});

// ===================== 数据预处理 =====================

const sortedData = computed(() => {
  const data = series.value.data;
  if (!data.length) return [];

  const sort = series.value.sort ?? 'descending';
  // 记录原始索引，用于 hover 后映射回原始数据
  const indexed = data.map((item, i) => ({ item, originalIndex: i }));

  if (sort !== 'none') {
    indexed.sort((a, b) =>
      sort === 'descending'
        ? b.item.value - a.item.value
        : a.item.value - b.item.value,
    );
  }
  return indexed;
});

const totalSum = computed(() =>
  sortedData.value.reduce((sum, { item }) => sum + item.value, 0),
);

// ===================== 绘图区域 =====================

const plotArea = computed(() => {
  const { w, h } = getSize();
  const hasTitle = !!props.option.title?.text;
  return {
    x: w * 0.15,
    y: hasTitle ? 56 : 20,
    width: w * 0.7,
    height: h - (hasTitle ? 56 : 20) - 20,
  };
});

// ===================== 标题 =====================

const titleStyle = computed(() => {
  const t = props.option.title;
  if (!t?.text) return { text: '', subtext: '', textStyle: {}, subtextStyle: {} };
  return {
    text: t.text,
    subtext: t.subtext ?? '',
    textStyle: {
      color: t.textStyle?.color ?? '#333',
      fontSize: t.textStyle?.fontSize ?? 16,
      fontWeight: t.textStyle?.fontWeight ?? '600',
    },
    subtextStyle: {
      color: t.subtextStyle?.color ?? '#999',
      fontSize: t.subtextStyle?.fontSize ?? 12,
    },
  };
});

// ===================== Tooltip HTML =====================

const tooltipHtml = computed(() => {
  const p = tooltipState.value.params;
  if (!p) return '';
  const pct = p.percent != null ? `${p.percent.toFixed(1)}%` : '';
  return `<div style="font-weight:600;margin-bottom:4px">${p.name}</div>
    <div style="display:flex;align-items:center;gap:6px">
      <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${p.color}"></span>
      <span>数值：<b>${formatNumber(p.value)}</b>${pct ? `（${pct}）` : ''}</span>
    </div>`;
});

// ===================== 主绘制 =====================

watch(
  () => [props.option, props.width, props.height, hoveredIndex.value],
  () => draw(),
  { deep: true },
);
onMounted(() => nextTick(() => draw()));
onUnmounted(() => cancelAnim?.());

function draw() {
  const c = ctx.value;
  if (!c) return;
  clear();

  const sorted = sortedData.value;
  if (!sorted.length) return;

  const total = totalSum.value;
  const s = series.value;
  const colors = s.color ?? DEFAULT_COLORS;
  const gap = s.gap ?? 2;
  const minW = (s.min ?? 0) / 100;
  const maxW = (s.max ?? 100) / 100;
  const plot = plotArea.value;
  const n = sorted.length;
  const activeIndex = hoveredIndex.value;

  // 层高度（扣除间距）
  const layerH = (plot.height - gap * (n - 1)) / n;

  // 计算每层目标宽度比例（按值相对最大值）
  const maxVal = Math.max(...sorted.map(d => d.item.value), 1);
  const widthRatios = sorted.map(({ item }) => {
    const ratio = item.value / maxVal;
    return minW + ratio * (maxW - minW);
  });

  // 预计算每层几何信息
  const layers = sorted.map(({ item, originalIndex }, i) => {
    const topW = widthRatios[i] * plot.width;
    const bottomW = i < n - 1 ? widthRatios[i + 1] * plot.width : topW * 0.6;
    const cx = plot.x + plot.width / 2;
    const ty = plot.y + i * (layerH + gap);
    const isHovered = activeIndex === i;

    // hover 时颜色变亮
    let color = item.color ?? colors[originalIndex % colors.length];
    if (isHovered) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      color = `rgb(${Math.min(255, r + 30)},${Math.min(255, g + 30)},${Math.min(255, b + 30)})`;
    }

    return {
      cx, ty, layerH, topW, bottomW, color, item,
      originalIndex, isHovered,
      percent: total > 0 ? (item.value / total) * 100 : 0,
    };
  });

  // 绘制各层（先绘制非 hover 层，再绘制 hover 层，确保高亮层在最上）
  const hitZones: HitZone[] = [];
  const renderOrder = [
    ...layers.filter(l => !l.isHovered),
    ...layers.filter(l => l.isHovered),
  ];

  for (const layer of renderOrder) {
    const { cx, ty, layerH, topW, bottomW, color, item, originalIndex, isHovered, percent } = layer;
    const offsetY = isHovered ? 2 : 0;
    const drawY = ty + offsetY;

    // 绘制梯形
    c.beginPath();
    c.moveTo(cx - topW / 2, drawY);
    c.lineTo(cx + topW / 2, drawY);
    c.lineTo(cx + bottomW / 2, drawY + layerH);
    c.lineTo(cx - bottomW / 2, drawY + layerH);
    c.closePath();
    c.fillStyle = color;
    c.fill();

    // 层内文字
    const textX = cx;
    const midY = drawY + layerH / 2;
    const availW = Math.min(topW, bottomW) - 16;

    if (availW > 50) {
      const labelFontSz = layerH > 40 ? 13 : 11;
      // 名称
      drawText(c, item.name, textX, midY - (layerH > 40 ? 10 : 6), {
        color: '#fff', fontSize: labelFontSz, fontWeight: 'bold', maxWidth: availW,
      });
      // 数值 + 百分比
      const valueStr = `${formatNumber(item.value)}  ${percent.toFixed(1)}%`;
      drawText(c, valueStr, textX, midY + (layerH > 40 ? 10 : 6), {
        color: 'rgba(255,255,255,0.85)', fontSize: labelFontSz - 1, maxWidth: availW,
      });
    }

    // 注册命中区域
    hitZones.push({
      x: cx, y: ty + layerH / 2,
      radius: Math.max(topW, bottomW) / 2 + 10,
      params: {
        seriesIndex: 0, dataIndex: originalIndex,
        seriesName: s.name ?? '', name: item.name,
        value: item.value,
        color: item.color ?? colors[originalIndex % colors.length],
        percent,
        extra: { layerIndex: originalIndex },
      },
    });
  }

  registerHitZones(hitZones);
}

// ===================== Hover 状态监听 =====================

function onCanvasMouseMove(e: MouseEvent) {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  const sorted = sortedData.value;
  const s = series.value;
  const total = totalSum.value;
  const gap = s.gap ?? 2;
  const minW = (s.min ?? 0) / 100;
  const maxW = (s.max ?? 100) / 100;
  const plot = plotArea.value;
  const n = sorted.length;
  if (!n) return;

  const layerH = (plot.height - gap * (n - 1)) / n;
  const maxVal = Math.max(...sorted.map(d => d.item.value), 1);
  const cx = plot.x + plot.width / 2;

  let hit = -1;
  for (let i = 0; i < n; i++) {
    const ty = plot.y + i * (layerH + gap);
    const ratio = sorted[i].item.value / maxVal;
    const halfW = (minW + ratio * (maxW - minW)) * plot.width / 2;

    if (my >= ty && my <= ty + layerH && mx >= cx - halfW && mx <= cx + halfW) {
      hit = i;
      break;
    }
  }
  hoveredIndex.value = hit;
}

function onCanvasMouseLeave() {
  hoveredIndex.value = -1;
}

onMounted(() => {
  canvasRef.value?.addEventListener('mousemove', onCanvasMouseMove);
  canvasRef.value?.addEventListener('mouseleave', onCanvasMouseLeave);
});
onUnmounted(() => {
  canvasRef.value?.removeEventListener('mousemove', onCanvasMouseMove);
  canvasRef.value?.removeEventListener('mouseleave', onCanvasMouseLeave);
});

// ===================== 入场动画 =====================

onMounted(() => {
  const anim = props.option.animation;
  if (anim?.enabled === false) return;

  const sorted = sortedData.value;
  const s = series.value;
  const total = totalSum.value;
  const gap = s.gap ?? 2;
  const minW = (s.min ?? 0) / 100;
  const maxW = (s.max ?? 100) / 100;
  const plot = plotArea.value;
  const n = sorted.length;
  if (!n) return;

  const layerH = (plot.height - gap * (n - 1)) / n;
  const maxVal = Math.max(...sorted.map(d => d.item.value), 1);
  const cx = plot.x + plot.width / 2;
  const colors = s.color ?? DEFAULT_COLORS;

  cancelAnim = staggerAnimate(
    n,
    80,
    anim?.duration ?? 600,
    (_i, progress) => {
      const c = ctx.value;
      if (!c) return;
      clear();

      // 每帧重绘所有层（已完成动画的层以 1 绘制）
      const hitZones: HitZone[] = [];
      const renderLayers: Array<{
        i: number; cx: number; ty: number; layerH: number;
        topW: number; bottomW: number; color: string;
        item: typeof sorted[0]['item'];
        originalIndex: number; percent: number;
      }> = [];

      for (let i = 0; i < n; i++) {
        const p = Math.min((_i <= i ? progress : 1), 1);
        const { item, originalIndex } = sorted[i];
        const ratio = item.value / maxVal;
        const targetTopW = (minW + ratio * (maxW - minW)) * plot.width;
        const targetBottomW = i < n - 1
          ? (minW + (sorted[i + 1].item.value / maxVal) * (maxW - minW)) * plot.width
          : targetTopW * 0.6;

        const topW = targetTopW * p;
        const bottomW = targetBottomW * p;
        const ty = plot.y + i * (layerH + gap);
        const color = item.color ?? colors[originalIndex % colors.length];

        renderLayers.push({
          i, cx, ty, layerH, topW, bottomW, color,
          item, originalIndex,
          percent: total > 0 ? (item.value / total) * 100 : 0,
        });
      }

      for (const layer of renderLayers) {
        const { cx, ty, layerH, topW, bottomW, color, item, originalIndex, percent } = layer;

        c.beginPath();
        c.moveTo(cx - topW / 2, ty);
        c.lineTo(cx + topW / 2, ty);
        c.lineTo(cx + bottomW / 2, ty + layerH);
        c.lineTo(cx - bottomW / 2, ty + layerH);
        c.closePath();
        c.fillStyle = color;
        c.fill();

        const availW = Math.min(topW, bottomW) - 16;
        if (availW > 50) {
          const labelFontSz = layerH > 40 ? 13 : 11;
          drawText(c, item.name, cx, ty + layerH / 2 - (layerH > 40 ? 10 : 6), {
            color: '#fff', fontSize: labelFontSz, fontWeight: 'bold', maxWidth: availW,
          });
          const valueStr = `${formatNumber(item.value)}  ${percent.toFixed(1)}%`;
          drawText(c, valueStr, cx, ty + layerH / 2 + (layerH > 40 ? 10 : 6), {
            color: 'rgba(255,255,255,0.85)', fontSize: labelFontSz - 1, maxWidth: availW,
          });
        }

        hitZones.push({
          x: cx, y: ty + layerH / 2,
          radius: Math.max(topW, bottomW) / 2 + 10,
          params: {
            seriesIndex: 0, dataIndex: originalIndex,
            seriesName: s.name ?? '', name: item.name,
            value: item.value,
            color: item.color ?? colors[originalIndex % colors.length],
            percent,
            extra: { layerIndex: originalIndex },
          },
        });
      }

      registerHitZones(hitZones);
    },
    () => {
      // 动画完成后重绘一次确保最终状态精确
      cancelAnim = null;
      draw();
    },
  );
});
</script>

<template>
  <div ref="containerRef" class="funnel-chart" :style="{ width: width + 'px' }">
    <!-- 标题 -->
    <div v-if="option.title?.text" class="funnel-chart__title">
      <div
        class="funnel-chart__title-text"
        :style="titleStyle.textStyle"
      >{{ titleStyle.text }}</div>
      <div
        v-if="titleStyle.subtext"
        class="funnel-chart__title-sub"
        :style="titleStyle.subtextStyle"
      >{{ titleStyle.subtext }}</div>
    </div>

    <!-- Canvas 画布 -->
    <canvas
      ref="canvasRef"
      class="funnel-chart__canvas"
      :style="{ width: width + 'px', height: height + 'px' }"
    ></canvas>

    <!-- Tooltip 浮层 -->
    <div
      v-if="tooltipState.visible"
      class="funnel-chart__tooltip"
      :style="tooltipState.style"
      v-html="tooltipHtml"
    ></div>
  </div>
</template>

<style scoped>
.funnel-chart {
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
}
.funnel-chart__title {
  padding: 4px 0 8px;
}
.funnel-chart__title-text {
  line-height: 1.4;
}
.funnel-chart__title-sub {
  line-height: 1.4;
  margin-top: 2px;
}
.funnel-chart__canvas {
  display: block;
}
.funnel-chart__tooltip {
  background: rgba(0, 0, 0, 0.78);
  color: #fff;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  line-height: 1.5;
  max-width: 240px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
