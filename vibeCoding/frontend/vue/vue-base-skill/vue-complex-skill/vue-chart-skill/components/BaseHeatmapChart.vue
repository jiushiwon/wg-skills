<script setup lang="ts">
/**
 * BaseHeatmapChart — 热力图组件
 * 支持：X/Y 类目轴 / 值→颜色映射 / 自定义颜色范围 / 圆角格子 /
 * hover 高亮边框 + tooltip / 格子内数值文本 / 对角线交错入场动画
 */
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useCanvas } from '../composables/useCanvas';
import { useTooltip, type HitZone } from '../composables/useTooltip';
import { animate } from '../composables/useAnimation';
import {
  drawText, measureText, DEFAULT_COLORS,
} from '../composables/draw-helpers';
import type { HeatmapChartOption, HeatmapSeries } from '../types/chart';

const props = withDefaults(defineProps<{
  option: HeatmapChartOption;
  width?: number;
  height?: number;
}>(), {
  width: 560,
  height: 400,
});

const canvasRef = ref<HTMLCanvasElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);
/** 当前 hover 格子索引（-1 表示无） */
const hoveredCell = ref(-1);

const { ctx, clear, getSize } = useCanvas(canvasRef, {
  width: () => props.width,
  height: () => props.height,
});
const { state: tooltipState, registerHitZones } = useTooltip(canvasRef, containerRef);

let cancelAnim: (() => void) | null = null;

// ===================== 系列配置 =====================

const series = computed<HeatmapSeries>(() => {
  const s = props.option.series?.[0];
  return s ?? { data: [] };
});

const visualMap = computed(() => ({
  minColor: props.option.visualMap?.minColor ?? '#ebedf0',
  maxColor: props.option.visualMap?.maxColor ?? '#216e39',
  show: props.option.visualMap?.show ?? false,
  orient: props.option.visualMap?.orient ?? 'horizontal',
  formatter: props.option.visualMap?.formatter,
}));

// ===================== 颜色工具 =====================

/** 解析十六进制颜色为 RGB */
function parseHex(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const full = h.length === 3
    ? h.split('').map(c => c + c).join('')
    : h;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

/** 线性插值颜色 */
function lerpColor(c1: string, c2: string, t: number): string {
  const [r1, g1, b1] = parseHex(c1);
  const [r2, g2, b2] = parseHex(c2);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${b})`;
}

// ===================== 数据预处理 =====================

/** 获取轴类目 */
const xCategories = computed(() => props.option.xAxis?.data ?? []);
const yCategories = computed(() => props.option.yAxis?.data ?? []);

/** 带位置和颜色的单元格数据 */
const cellData = computed(() => {
  const data = series.value.data;
  if (!data.length) return [];

  const vals = data.map(d => d[2]);
  const dataMin = props.option.visualMap?.min ?? Math.min(...vals);
  const dataMax = props.option.visualMap?.max ?? Math.max(...vals);
  const range = dataMax - dataMin || 1;
  const { minColor, maxColor } = visualMap.value;

  return data.map(([xi, yi, val]) => ({
    xi, yi, value: val,
    ratio: (val - dataMin) / range,
    color: lerpColor(minColor, maxColor, (val - dataMin) / range),
  }));
});

/** 入场动画延迟矩阵（按对角线分配） */
const animDelayMatrix = computed(() => {
  const xLen = xCategories.value.length;
  const yLen = yCategories.value.length;
  if (!xLen || !yLen) return [];

  const matrix: number[][] = [];
  const maxDiag = xLen + yLen - 2;
  for (let yi = 0; yi < yLen; yi++) {
    matrix[yi] = [];
    for (let xi = 0; xi < xLen; xi++) {
      const diag = xi + yi;
      matrix[yi][xi] = maxDiag > 0 ? diag / maxDiag : 0;
    }
  }
  return matrix;
});

// ===================== 绘图区域 =====================

const plotArea = computed(() => {
  const { w, h } = getSize();
  const hasTitle = !!props.option.title?.text;
  // 左侧留空给 Y 轴标签，底部留空给 X 轴标签
  const yLabelW = yCategories.value.length
    ? Math.max(...yCategories.value.map(l => measureText(ctx.value!, l, 11)), 0) + 14
    : 20;
  const xLabelH = 28;

  return {
    x: yLabelW,
    y: hasTitle ? 56 : 20,
    width: w - yLabelW - 20,
    height: h - (hasTitle ? 56 : 20) - xLabelH - 10,
  };
});

// ===================== 标题样式 =====================

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
  const xLabel = xCategories.value[p.dataIndex] ?? `X${p.dataIndex}`;
  const yLabel = p.seriesName ?? `Y${p.seriesIndex}`;
  const formatter = visualMap.value.formatter;
  const valStr = formatter ? formatter(p.value) : String(p.value);
  return `<div style="font-weight:600;margin-bottom:4px">${yLabel} / ${xLabel}</div>
    <div style="display:flex;align-items:center;gap:6px">
      <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${p.color}"></span>
      <span>数值：<b>${valStr}</b></span>
    </div>`;
});

// ===================== 主绘制 =====================

watch(
  () => [props.option, props.width, props.height, hoveredCell.value],
  () => draw(),
  { deep: true },
);
onMounted(() => nextTick(() => draw()));
onUnmounted(() => cancelAnim?.());

function draw() {
  const c = ctx.value;
  if (!c) return;
  clear();

  const xCats = xCategories.value;
  const yCats = yCategories.value;
  if (!xCats.length || !yCats.length) return;

  const plot = plotArea.value;
  const cells = cellData.value;
  const cellW = plot.width / xCats.length;
  const cellH = plot.height / yCats.length;
  const gap = props.option.itemStyle?.gap ?? 1;
  const borderRadius = props.option.itemStyle?.borderRadius ?? 2;
  const showVal = props.option.showValue ?? false;
  const activeCell = hoveredCell.value;
  const activeXC = activeCell >= 0 ? cells[activeCell]?.xi ?? -1 : -1;
  const activeYC = activeCell >= 0 ? cells[activeCell]?.yi ?? -1 : -1;

  // 建立 xi,yi -> cell 的映射
  const cellMap = new Map<string, typeof cells[0]>();
  for (const cell of cells) {
    cellMap.set(`${cell.xi},${cell.yi}`, cell);
  }

  // 绘制 Y 轴标签
  for (let yi = 0; yi < yCats.length; yi++) {
    const ly = plot.y + yi * cellH + cellH / 2;
    drawText(c, yCats[yi], plot.x - 8, ly, {
      color: '#666', fontSize: 11, align: 'right', baseline: 'middle',
    });
  }

  // 绘制 X 轴标签
  for (let xi = 0; xi < xCats.length; xi++) {
    const lx = plot.x + xi * cellW + cellW / 2;
    drawText(c, xCats[xi], lx, plot.y + plot.height + 14, {
      color: '#666', fontSize: 11, align: 'center', baseline: 'middle',
    });
  }

  // 绘制格子
  const hitZones: HitZone[] = [];

  for (let yi = 0; yi < yCats.length; yi++) {
    for (let xi = 0; xi < xCats.length; xi++) {
      const cell = cellMap.get(`${xi},${yi}`);
      if (!cell) continue;

      const x = plot.x + xi * cellW + gap / 2;
      const y = plot.y + yi * cellH + gap / 2;
      const w = cellW - gap;
      const h = cellH - gap;
      const isHovered = xi === activeXC && yi === activeYC;

      // 圆角格子
      c.beginPath();
      drawRoundRect(c, x, y, w, h, borderRadius);
      c.fillStyle = cell.color;
      c.fill();

      // hover 高亮边框
      if (isHovered) {
        c.strokeStyle = '#333';
        c.lineWidth = 2;
        c.stroke();
      }

      // 格子内数值文本（格子足够大时显示）
      if (showVal && w > 24 && h > 16) {
        const formatter = visualMap.value.formatter;
        const txt = formatter ? formatter(cell.value) : String(cell.value);
        // 根据背景亮度选择文字颜色
        const [r, g, b] = parseHex(cell.color.startsWith('#') ? cell.color : '#888');
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        const textColor = brightness > 140 ? '#333' : '#fff';
        drawText(c, txt, x + w / 2, y + h / 2, {
          color: textColor, fontSize: Math.min(10, w / txt.length * 1.2),
        });
      }

      // 注册命中区域
      hitZones.push({
        x: x + w / 2, y: y + h / 2,
        radius: Math.max(cellW, cellH) / 2 + 5,
        params: {
          seriesIndex: yi, dataIndex: xi,
          seriesName: yCats[yi] ?? '', name: xCats[xi] ?? '',
          value: cell.value,
          color: cell.color,
          extra: { cellIndex: yi * xCats.length + xi },
        },
      });
    }
  }

  registerHitZones(hitZones);
}

/** Canvas 圆角矩形辅助 */
function drawRoundRect(
  c: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  c.moveTo(x + r, y);
  c.lineTo(x + w - r, y);
  c.arcTo(x + w, y, x + w, y + r, r);
  c.lineTo(x + w, y + h - r);
  c.arcTo(x + w, y + h, x + w - r, y + h, r);
  c.lineTo(x + r, y + h);
  c.arcTo(x, y + h, x, y + h - r, r);
  c.lineTo(x, y + r);
  c.arcTo(x, y, x + r, y, r);
  c.closePath();
}

// ===================== Hover 状态监听 =====================

function onCanvasMouseMove(e: MouseEvent) {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  const plot = plotArea.value;
  const xCats = xCategories.value;
  const yCats = yCategories.value;
  if (!xCats.length || !yCats.length) return;

  const cellW = plot.width / xCats.length;
  const cellH = plot.height / yCats.length;

  // 判断鼠标所在格子
  const xi = Math.floor((mx - plot.x) / cellW);
  const yi = Math.floor((my - plot.y) / cellH);

  if (xi >= 0 && xi < xCats.length && yi >= 0 && yi < yCats.length) {
    const idx = yi * xCats.length + xi;
    // 确认该位置有数据
    const hasData = cellData.value.some(c => c.xi === xi && c.yi === yi);
    hoveredCell.value = hasData ? idx : -1;
  } else {
    hoveredCell.value = -1;
  }
}

function onCanvasMouseLeave() {
  hoveredCell.value = -1;
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

  const xCats = xCategories.value;
  const yCats = yCategories.value;
  if (!xCats.length || !yCats.length) return;

  const delayMatrix = animDelayMatrix.value;
  const animDuration = anim?.duration ?? 800;
  // 交错总时长 = 格子动画时长 + 交错跨度
  const staggerSpan = animDuration * 0.6;

  cancelAnim = animate({
    duration: animDuration + staggerSpan,
    easing: 'cubicOut',
    onProgress: (globalProgress) => {
      const c = ctx.value;
      if (!c) return;
      clear();

      const plot = plotArea.value;
      const cells = cellData.value;
      const cellW = plot.width / xCats.length;
      const cellH = plot.height / yCats.length;
      const gap = props.option.itemStyle?.gap ?? 1;
      const borderRadius = props.option.itemStyle?.borderRadius ?? 2;
      const showVal = props.option.showValue ?? false;

      const cellMap = new Map<string, typeof cells[0]>();
      for (const cell of cells) {
        cellMap.set(`${cell.xi},${cell.yi}`, cell);
      }

      // Y 轴标签
      for (let yi = 0; yi < yCats.length; yi++) {
        const ly = plot.y + yi * cellH + cellH / 2;
        drawText(c, yCats[yi], plot.x - 8, ly, {
          color: '#666', fontSize: 11, align: 'right', baseline: 'middle',
        });
      }
      // X 轴标签
      for (let xi = 0; xi < xCats.length; xi++) {
        const lx = plot.x + xi * cellW + cellW / 2;
        drawText(c, xCats[xi], lx, plot.y + plot.height + 14, {
          color: '#666', fontSize: 11, align: 'center', baseline: 'middle',
        });
      }

      const hitZones: HitZone[] = [];

      for (let yi = 0; yi < yCats.length; yi++) {
        for (let xi = 0; xi < xCats.length; xi++) {
          const cell = cellMap.get(`${xi},${yi}`);
          if (!cell) continue;

          const delay = delayMatrix[yi]?.[xi] ?? 0;
          const cellProgress = Math.max(0, Math.min(1, (globalProgress - delay) / (1 - delay)));
          if (cellProgress <= 0) continue;

          const x = plot.x + xi * cellW + gap / 2;
          const y = plot.y + yi * cellH + gap / 2;
          const w = (cellW - gap) * cellProgress;
          const h = (cellH - gap) * cellProgress;
          // 居中缩放
          const cx = x + (cellW - gap) / 2;
          const cy = y + (cellH - gap) / 2;

          c.beginPath();
          drawRoundRect(c, cx - w / 2, cy - h / 2, w, h, borderRadius * cellProgress);
          c.fillStyle = cell.color;
          c.globalAlpha = cellProgress;
          c.fill();
          c.globalAlpha = 1;

          if (showVal && w > 24 && h > 16) {
            const formatter = visualMap.value.formatter;
            const txt = formatter ? formatter(cell.value) : String(cell.value);
            const [r, g, b] = parseHex(cell.color.startsWith('#') ? cell.color : '#888');
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            const textColor = brightness > 140 ? '#333' : '#fff';
            c.globalAlpha = cellProgress;
            drawText(c, txt, cx, cy, {
              color: textColor, fontSize: Math.min(10, w / txt.length * 1.2),
            });
            c.globalAlpha = 1;
          }

          if (cellProgress >= 1) {
            hitZones.push({
              x: cx, y: cy,
              radius: Math.max(cellW, cellH) / 2 + 5,
              params: {
                seriesIndex: yi, dataIndex: xi,
                seriesName: yCats[yi] ?? '', name: xCats[xi] ?? '',
                value: cell.value,
                color: cell.color,
                extra: { cellIndex: yi * xCats.length + xi },
              },
            });
          }
        }
      }

      registerHitZones(hitZones);
    },
    onComplete: () => {
      cancelAnim = null;
      draw();
    },
  });
});
</script>

<template>
  <div ref="containerRef" class="heatmap-chart" :style="{ width: width + 'px' }">
    <!-- 标题 -->
    <div v-if="option.title?.text" class="heatmap-chart__title">
      <div
        class="heatmap-chart__title-text"
        :style="titleStyle.textStyle"
      >{{ titleStyle.text }}</div>
      <div
        v-if="titleStyle.subtext"
        class="heatmap-chart__title-sub"
        :style="titleStyle.subtextStyle"
      >{{ titleStyle.subtext }}</div>
    </div>

    <!-- Canvas 画布 -->
    <canvas
      ref="canvasRef"
      class="heatmap-chart__canvas"
      :style="{ width: width + 'px', height: height + 'px' }"
    ></canvas>

    <!-- 色阶条（可选） -->
    <div v-if="visualMap.show" class="heatmap-chart__legend">
      <div class="heatmap-chart__legend-bar" :style="{
        background: `linear-gradient(to right, ${visualMap.minColor}, ${visualMap.maxColor})`,
        width: visualMap.orient === 'horizontal' ? '160px' : '12px',
        height: visualMap.orient === 'horizontal' ? '12px' : '100px',
      }"></div>
      <div class="heatmap-chart__legend-labels" v-if="visualMap.orient === 'horizontal'">
        <span>{{ option.visualMap?.min ?? 'min' }}</span>
        <span>{{ option.visualMap?.max ?? 'max' }}</span>
      </div>
    </div>

    <!-- Tooltip 浮层 -->
    <div
      v-if="tooltipState.visible"
      class="heatmap-chart__tooltip"
      :style="tooltipState.style"
      v-html="tooltipHtml"
    ></div>
  </div>
</template>

<style scoped>
.heatmap-chart {
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
}
.heatmap-chart__title {
  padding: 4px 0 8px;
}
.heatmap-chart__title-text {
  line-height: 1.4;
}
.heatmap-chart__title-sub {
  line-height: 1.4;
  margin-top: 2px;
}
.heatmap-chart__canvas {
  display: block;
}
.heatmap-chart__legend {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 0 4px;
}
.heatmap-chart__legend-bar {
  border-radius: 2px;
}
.heatmap-chart__legend-labels {
  display: flex;
  justify-content: space-between;
  width: 160px;
  font-size: 10px;
  color: #999;
}
.heatmap-chart__tooltip {
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
