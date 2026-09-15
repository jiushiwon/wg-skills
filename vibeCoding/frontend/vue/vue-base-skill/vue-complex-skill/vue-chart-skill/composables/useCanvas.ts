/**
 * useCanvas — Canvas 初始化 + DPR 适配 + 响应式重绘
 * 所有图表组件的基础 Hook
 */
import { ref, onMounted, onUnmounted, watch, type Ref, shallowRef } from 'vue';

export interface UseCanvasOptions {
  width: Ref<number> | number;
  height: Ref<number> | number;
  onReady?: (ctx: CanvasRenderingContext2D) => void;
}

export function useCanvas(
  canvasRef: Ref<HTMLCanvasElement | null>,
  options: UseCanvasOptions,
) {
  const ctx = shallowRef<CanvasRenderingContext2D | null>(null);
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

  function getSize() {
    const w = typeof options.width === 'number' ? options.width : options.width.value;
    const h = typeof options.height === 'number' ? options.height : options.height.value;
    return { w, h };
  }

  function init() {
    const canvas = canvasRef.value;
    if (!canvas) return;
    const { w, h } = getSize();
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const context = canvas.getContext('2d')!;
    context.scale(dpr, dpr);
    ctx.value = context;
    options.onReady?.(context);
  }

  function clear() {
    const { w, h } = getSize();
    ctx.value?.clearRect(0, 0, w, h);
  }

  // 响应式重绘
  let resizeObserver: ResizeObserver | null = null;

  onMounted(() => {
    init();
    // 监听容器尺寸变化
    if (canvasRef.value?.parentElement) {
      resizeObserver = new ResizeObserver(() => {
        init();
      });
      resizeObserver.observe(canvasRef.value.parentElement);
    }
  });

  onUnmounted(() => {
    resizeObserver?.disconnect();
  });

  return { ctx, dpr, clear, init, getSize };
}
