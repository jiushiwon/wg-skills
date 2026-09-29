/**
 * useAnimation — requestAnimationFrame 动画驱动
 * 支持缓动函数、延迟、进度回调
 */

export type EasingType = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'cubicOut' | 'bounceOut';

const EASING: Record<EasingType, (t: number) => number> = {
  linear: (t) => t,
  easeIn: (t) => t * t,
  easeOut: (t) => 1 - (1 - t) ** 2,
  easeInOut: (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2),
  cubicOut: (t) => 1 - (1 - t) ** 3,
  bounceOut: (t) => {
    if (t < 1 / 2.75) return 7.5625 * t * t;
    if (t < 2 / 2.75) { t -= 1.5 / 2.75; return 7.5625 * t * t + 0.75; }
    if (t < 2.5 / 2.75) { t -= 2.25 / 2.75; return 7.5625 * t * t + 0.9375; }
    t -= 2.625 / 2.75; return 7.5625 * t * t + 0.984375;
  },
};

export interface AnimationOptions {
  duration?: number;
  easing?: EasingType;
  delay?: number;
  onProgress: (progress: number) => void;
  onComplete?: () => void;
}

export function animate(options: AnimationOptions) {
  const { duration = 800, easing = 'cubicOut', delay = 0, onProgress, onComplete } = options;
  const easingFn = EASING[easing] || EASING.cubicOut;

  let rafId = 0;
  let startTime = 0;
  let started = false;

  function tick(now: number) {
    if (!started) {
      startTime = now;
      started = true;
    }
    const elapsed = now - startTime - delay;
    if (elapsed < 0) {
      rafId = requestAnimationFrame(tick);
      return;
    }
    const raw = Math.min(elapsed / duration, 1);
    const progress = easingFn(raw);
    onProgress(progress);
    if (raw < 1) {
      rafId = requestAnimationFrame(tick);
    } else {
      onComplete?.();
    }
  }

  rafId = requestAnimationFrame(tick);

  return () => cancelAnimationFrame(rafId);
}

/**
 * 交错动画：多个元素按序延迟执行
 * @param count 元素数量
 * @param stagger 每个元素的延迟间隔（ms）
 * @param perItem 每个元素的动画时长（ms）
 * @param onItemProgress (index, progress) => void
 */
export function staggerAnimate(
  count: number,
  stagger: number,
  perItem: number,
  onItemProgress: (index: number, progress: number) => void,
  onComplete?: () => void,
) {
  const totalDuration = perItem + stagger * count;
  const cleanups: (() => void)[] = [];

  for (let i = 0; i < count; i++) {
    const cancel = animate({
      duration: perItem,
      easing: 'cubicOut',
      delay: i * stagger,
      onProgress: (p) => onItemProgress(i, p),
    });
    cleanups.push(cancel);
  }

  // 总完成回调
  const timer = setTimeout(() => onComplete?.(), totalDuration);

  return () => {
    cleanups.forEach((fn) => fn());
    clearTimeout(timer);
  };
}
