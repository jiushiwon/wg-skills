<script setup lang="ts">
/**
 * BaseProgressRing — 进度环组件
 * 特性：圆形进度条 / 轨道层+进度层 / 圆角端点 / 渐变色 / 中心内容 / 入场动画 / 多环嵌套
 */
import { ref, watch, onMounted, nextTick } from 'vue';
import { useCanvas } from '../composables/useCanvas';
import { animate, type EasingType } from '../composables/useAnimation';
import { drawText, hexToRgba } from '../composables/draw-helpers';
import type { ProgressRingOption } from '../types/chart';

/** 单环配置项 */
interface RingItem {
  name?: string;
  percent: number;
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  color?: string | [number, string][];
  roundCap?: boolean;
  content?: ProgressRingOption['content'];
  animation?: ProgressRingOption['animation'];
}

const props = withDefaults(defineProps<{
  /** 单项或多项嵌套 */
  option: RingItem | RingItem[];
  width?: number;
  height?: number;
}>(), {
  width: 240,
  height: 240,
});

const canvasRef = ref<HTMLCanvasElement | null>(null);

const { ctx, clear, getSize } = useCanvas(canvasRef, {
  width: () => props.width,
  height: () => props.height,
});

/** 当前动画进度 0~1 */
let currentProgress = 0;
/** 动画取消函数 */
let cancelAnim: (() => void) | null = null;

/** 规范化输入为数组 */
function getRings(): RingItem[] {
  return Array.isArray(props.option) ? props.option : [props.option];
}

/** 计算绘制区域 */
function getDrawArea() {
  const rings = getRings();
  const { w, h } = getSize();
  // 外层环的最大尺寸决定 padding
  const outerSize = rings[0]?.size ?? 200;
  const outerStroke = rings[0]?.strokeWidth ?? 10;
  const padding = outerStroke / 2 + 2;
  return {
    centerX: w / 2,
    centerY: h / 2,
    radius: outerSize / 2 - padding,
  };
}

function draw() {
  const c = ctx.value;
  if (!c) return;

  const rings = getRings();
  const anim = rings[0]?.animation;
  const duration = anim?.duration ?? 1200;
  const easing: EasingType = (anim?.easing as EasingType) ?? 'cubicOut';

  function render(progress: number) {
    currentProgress = progress;
    const c2 = ctx.value;
    if (!c2) return;
    clear();
    drawRings(c2, rings, progress);
  }

  if (anim?.enabled === false) {
    render(1);
  } else {
    cancelAnim?.();
    cancelAnim = animate({ duration, easing, onProgress: render });
  }
}

/** 绘制所有环 */
function drawRings(
  c: CanvasRenderingContext2D,
  rings: RingItem[],
  progress: number,
) {
  const area = getDrawArea();

  for (let i = rings.length - 1; i >= 0; i--) {
    const ring = rings[i];
    const { centerX, centerY, radius } = area;
    const size = ring.size ?? 200;
    const strokeWidth = ring.strokeWidth ?? 10;
    const padding = strokeWidth / 2 + 2;
    const r = size / 2 - padding;
    const roundCap = ring.roundCap !== false;
    const percent = Math.max(0, Math.min(ring.percent, 100));
    const animatedPercent = percent * progress;
    const startAngle = -Math.PI / 2; // 12 点钟方向
    const endAngle = startAngle + (animatedPercent / 100) * Math.PI * 2;
    const trackColor = ring.trackColor ?? '#e8e8e8';

    // ---- 轨道层（灰色底圈）----
    c.beginPath();
    c.arc(centerX, centerY, r, 0, Math.PI * 2);
    c.strokeStyle = trackColor;
    c.lineWidth = strokeWidth;
    c.lineCap = roundCap ? 'round' : 'butt';
    c.stroke();

    // ---- 进度层 ----
    if (animatedPercent > 0) {
      c.beginPath();
      c.arc(centerX, centerY, r, startAngle, endAngle);
      c.lineWidth = strokeWidth;
      c.lineCap = roundCap ? 'round' : 'butt';

      // 渐变色处理
      const color = ring.color;
      if (Array.isArray(color) && color.length >= 2) {
        // 创建从左到右的线性渐变（覆盖环形区域）
        const grad = c.createLinearGradient(
          centerX - r - strokeWidth, centerY,
          centerX + r + strokeWidth, centerY,
        );
        for (const [pos, col] of color) {
          grad.addColorStop(Math.max(0, Math.min(pos, 1)), col);
        }
        c.strokeStyle = grad;
      } else if (typeof color === 'string') {
        c.strokeStyle = color;
      } else {
        c.strokeStyle = '#5470c6';
      }

      c.stroke();
    }
  }

  // ---- 中心内容（仅当有单个环或第一个环定义了 content 时绘制）----
  const primaryRing = rings[0];
  if (primaryRing?.content) {
    const content = primaryRing.content;
    const cx = area.centerX;
    const cy = area.centerY;

    // 数值（大号居中）
    if (content.value) {
      const valueStyle = content.valueStyle || {};
      drawText(c, content.value, cx, cy - (content.title ? 6 : 0), {
        color: valueStyle.color || '#333',
        fontSize: valueStyle.fontSize || 32,
        fontWeight: (valueStyle.fontWeight as 'bold' | 'normal') || 'bold',
      });
    }

    // 小标题（数值下方）
    if (content.title) {
      const titleStyle = content.titleStyle || {};
      const titleY = cy + (content.value ? 18 : 0);
      drawText(c, content.title, cx, titleY, {
        color: titleStyle.color || '#999',
        fontSize: titleStyle.fontSize || 13,
      });
    }
  }
}

watch(() => props.option, () => draw(), { deep: true });
onMounted(() => nextTick(() => {
  currentProgress = 0;
  draw();
}));
</script>

<template>
  <div class="progress-ring" :style="{ width: width + 'px' }">
    <!-- Canvas -->
    <canvas
      ref="canvasRef"
      class="progress-ring__canvas"
      :style="{ width: width + 'px', height: height + 'px' }"
    ></canvas>
  </div>
</template>

<style scoped>
.progress-ring {
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
.progress-ring__canvas {
  display: block;
}
</style>
