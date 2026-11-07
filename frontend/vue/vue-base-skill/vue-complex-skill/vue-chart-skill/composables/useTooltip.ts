/**
 * useTooltip — Canvas 图表鼠标悬浮 Tooltip
 * 监听 canvas mousemove，计算最近数据点，返回 tooltip 位置和数据
 */
import { ref, onMounted, onUnmounted, type Ref, type CSSProperties } from 'vue';

export interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  style: CSSProperties;
  /** 当前悬浮命中的数据信息（由图表组件填充） */
  params: TooltipHit | null;
}

export interface TooltipHit {
  seriesIndex: number;
  dataIndex: number;
  seriesName: string;
  name: string;
  value: number;
  color: string;
  percent?: number;
  extra?: Record<string, unknown>;
}

export interface HitZone {
  /** 数据点坐标（画布逻辑像素） */
  x: number;
  y: number;
  /** 命中半径 */
  radius: number;
  /** 对应的数据信息 */
  params: TooltipHit;
}

export function useTooltip(
  canvasRef: Ref<HTMLCanvasElement | null>,
  containerRef: Ref<HTMLElement | null>,
) {
  const state = ref<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    style: {},
    params: null,
  });

  /** 图表组件注册的命中区域 */
  let hitZones: HitZone[] = [];

  /** 注册命中区域（图表每次重绘时调用） */
  function registerHitZones(zones: HitZone[]) {
    hitZones = zones;
  }

  function onMouseMove(e: MouseEvent) {
    const canvas = canvasRef.value;
    const container = containerRef.value;
    if (!canvas || !container) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // 找最近命中点
    let closest: HitZone | null = null;
    let minDist = Infinity;
    for (const zone of hitZones) {
      const dist = Math.hypot(zone.x - mx, zone.y - my);
      if (dist < zone.radius && dist < minDist) {
        closest = zone;
        minDist = dist;
      }
    }

    if (closest) {
      // tooltip 位置：相对容器偏移
      const containerRect = container.getBoundingClientRect();
      let tx = e.clientX - containerRect.left + 12;
      let ty = e.clientY - containerRect.top - 10;

      state.value = {
        visible: true,
        x: tx,
        y: ty,
        style: {
          position: 'absolute',
          left: `${tx}px`,
          top: `${ty}px`,
          pointerEvents: 'none',
          zIndex: 100,
        },
        params: closest.params,
      };
    } else {
      state.value.visible = false;
      state.value.params = null;
    }
  }

  function onMouseLeave() {
    state.value.visible = false;
    state.value.params = null;
  }

  onMounted(() => {
    canvasRef.value?.addEventListener('mousemove', onMouseMove);
    canvasRef.value?.addEventListener('mouseleave', onMouseLeave);
  });

  onUnmounted(() => {
    canvasRef.value?.removeEventListener('mousemove', onMouseMove);
    canvasRef.value?.removeEventListener('mouseleave', onMouseLeave);
  });

  return { state, registerHitZones };
}
