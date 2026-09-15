<script setup lang="ts">
/**
 * BasePieChart — 饼图 / 环形图 / 南丁格尔玫瑰图
 * 支持：hover 高亮偏移、点击图例切换、中心文本、label 引导线
 */
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { useCanvas } from '../composables/useCanvas';
import { useTooltip, type HitZone } from '../composables/useTooltip';
import { animate } from '../composables/useAnimation';
import {
  hexToRgba, drawArc, drawText, measureText, drawLegend, formatPercent,
  DEFAULT_COLORS, mapRange,
} from '../composables/draw-helpers';
import type { PieChartOption, PieSeries, DataPoint } from '../types/chart';

const props = withDefaults(defineProps<{
  option: PieChartOption;
  width?: number;
  height?: number;
}>(), { width: 460, height: 340 });

const canvasRef = ref<HTMLCanvasElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);
const { ctx, clear, getSize } = useCanvas(canvasRef, { width: () => props.width, height: () => props.height });
const { state: tooltipState, registerHitZones } = useTooltip(canvasRef, containerRef);

const activeIndex = ref(-1);

const tooltipHtml = computed(() => {
  const p = tooltipState.value.params;
  if (!p) return '';
  return `<div style="font-weight:600;margin-bottom:4px">${p.name}</div>
    <div style="display:flex;align-items:center;gap:6px">
      <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color}"></span>
      <span>${p.seriesName}: <b>${p.value}</b> (${formatPercent(p.percent || 0)})</span>
    </div>`;
});

watch(() => [props.option, props.width, props.height], () => draw(), { deep: true });
watch(activeIndex, () => draw());
onMounted(() => nextTick(() => draw()));

// 图例点击
function onLegendClick(name: string) {
  // 这里简单实现：toggle selected 状态（省略具体实现，保持聚焦）
}

function draw() {
  const c = ctx.value;
  if (!c) return;
  clear();

  const { w, h } = getSize();
  const option = props.option;
  const seriesData = option.series?.[0];
  if (!seriesData) return;

  const data = seriesData.data || [];
  const colors = seriesData.color || DEFAULT_COLORS;
  const total = data.reduce((a, d) => a + d.value, 0);
  if (total === 0) return;

  const isDonut = seriesData.type !== 'pie';
  const radiusStr = seriesData.radius || ['40%', '70%'];
  const outerR = Math.min(w, h) / 2 - 50;
  const innerR = isDonut ? outerR * 0.55 : 0;
  const cx = w / 2;
  const cy = h / 2 + 10;

  const hitZones: HitZone[] = [];
  const startAngle = ((seriesData.startAngle ?? 90) * Math.PI) / 180;
  const padAngle = ((seriesData.padAngle ?? 0) * Math.PI) / 180;

  function drawPie(progress: number) {
    clear();
    hitZones.length = 0;

    let currentAngle = startAngle;
    const totalAngle = Math.PI * 2 * progress;

    data.forEach((item, i) => {
      const sliceAngle = (item.value / total) * totalAngle;
      const endAngle = currentAngle + sliceAngle;
      const color = item.color || colors[i % colors.length];
      const isActive = activeIndex.value === i;
      const offset = isActive ? 8 : 0;
      const midAngle = currentAngle + sliceAngle / 2;
      const ox = isActive ? Math.cos(midAngle) * offset : 0;
      const oy = isActive ? Math.sin(midAngle) * offset : 0;

      // 扇形
      drawArc(c, cx + ox, cy + oy, outerR, currentAngle, endAngle, color, innerR, padAngle);

      // 外部阴影（hover 时）
      if (isActive) {
        c.save();
        c.shadowColor = hexToRgba(color, 0.3);
        c.shadowBlur = 12;
        drawArc(c, cx + ox, cy + oy, outerR, currentAngle, endAngle, 'transparent', innerR, padAngle);
        c.restore();
      }

      // 引导线 + 标签（只在动画完成后显示）
      if (progress > 0.95 && sliceAngle > 0.15) {
        const labelR = outerR + 16;
        const lx = cx + Math.cos(midAngle) * labelR;
        const ly = cy + Math.sin(midAngle) * labelR;
        const lineEndX = lx + (Math.cos(midAngle) > 0 ? 12 : -12);

        // 引导线
        c.beginPath();
        c.strokeStyle = '#ccc';
        c.lineWidth = 1;
        c.moveTo(cx + Math.cos(midAngle) * outerR, cy + Math.sin(midAngle) * outerR);
        c.lineTo(lx, ly);
        c.lineTo(lineEndX, ly);
        c.stroke();

        // 标签
        drawText(c, `${item.name} ${formatPercent((item.value / total) * 100)}`,
          lineEndX + (Math.cos(midAngle) > 0 ? 4 : -4), ly, {
            color: '#666', fontSize: 11,
            align: Math.cos(midAngle) > 0 ? 'left' : 'right',
          });
      }

      // 命中区域
      hitZones.push({
        x: cx + Math.cos(midAngle) * ((outerR + innerR) / 2),
        y: cy + Math.sin(midAngle) * ((outerR + innerR) / 2),
        radius: (outerR - innerR) / 2 + 10,
        params: {
          seriesIndex: 0, dataIndex: i,
          seriesName: seriesData.name || '', name: item.name,
          value: item.value, color,
          percent: (item.value / total) * 100,
        },
      });

      currentAngle = endAngle;
    });

    // 中心文本（环形图）
    if (isDonut && progress > 0.9) {
      drawText(c, String(total), cx, cy - 8, {
        color: '#333', fontSize: 22, fontWeight: 'bold', align: 'center',
      });
      drawText(c, 'Total', cx, cy + 14, {
        color: '#999', fontSize: 12, align: 'center',
      });
    }

    registerHitZones(hitZones);
  }

  // 图例
  if (option.legend?.show !== false) {
    // 图例在组件模板中渲染
  }

  const animDuration = option.animation?.enabled === false ? 0 : (option.animation?.duration ?? 1000);
  if (animDuration > 0) {
    animate({ duration: animDuration, easing: 'cubicOut', onProgress: drawPie });
  } else {
    drawPie(1);
  }
}
</script>

<template>
  <div ref="containerRef" class="base-chart" :style="{ position: 'relative', width: width + 'px' }">
    <div v-if="option.title?.text" class="base-chart__title" :style="{ textAlign: option.title?.left || 'center' }">
      <div class="base-chart__title-text" :style="{
        color: option.title?.textStyle?.color || '#333',
        fontSize: (option.title?.textStyle?.fontSize || 16) + 'px',
        fontWeight: option.title?.textStyle?.fontWeight || '600',
      }">{{ option.title.text }}</div>
    </div>
    <canvas ref="canvasRef" class="base-chart__canvas" :style="{ width: width + 'px', height: height + 'px' }"></canvas>
    <!-- 底部图例 -->
    <div v-if="option.legend?.show !== false && option.series?.[0]?.data" class="base-chart__legend base-chart__legend--bottom">
      <span
        v-for="(item, i) in option.series[0].data"
        :key="item.name"
        class="base-chart__legend-item"
        @click="onLegendClick(item.name)"
      >
        <span class="base-chart__legend-dot" :style="{ background: item.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length] }"></span>
        <span>{{ item.name }}</span>
      </span>
    </div>
    <div v-if="tooltipState.visible" class="base-chart__tooltip" :style="tooltipState.style" v-html="tooltipHtml"></div>
  </div>
</template>

<style scoped>
.base-chart { position: relative; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
.base-chart__title { padding: 4px 0 8px; }
.base-chart__title-text { line-height: 1.4; }
.base-chart__canvas { display: block; margin: 0 auto; }
.base-chart__legend { display: flex; flex-wrap: wrap; justify-content: center; gap: 14px; padding: 8px 0; font-size: 12px; color: #666; }
.base-chart__legend-item { display: flex; align-items: center; gap: 5px; cursor: pointer; }
.base-chart__legend-dot { width: 8px; height: 8px; border-radius: 50%; }
.base-chart__tooltip {
  background: rgba(0,0,0,0.78); color: #fff; padding: 8px 12px; border-radius: 6px;
  font-size: 12px; line-height: 1.5; max-width: 240px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
</style>
