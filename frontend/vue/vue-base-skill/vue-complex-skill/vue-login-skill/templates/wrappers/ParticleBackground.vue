<!--
  ParticleBackground.vue - 粒子背景层

  封装 particle-engine.js（ES5 全局类 ParticleBackground）为 Vue 组件。
  直接铺满父容器，提供粒子连线动画背景。

  用法：放在 LoginForm (variant="particles") 同级，父容器 position: relative
  （具体示例见 SKILL.md Wrappers 章节）。

  ponytail: particle-engine.js 是 ES5 全局类，不导出 ES module。
  通过 declare global 拿类型 + 副作用 import 触发脚本挂载。
-->
<template>
  <canvas ref="canvasRef" class="particles-canvas" />
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import './shared/particle-engine'

declare global {
  interface Window {
    ParticleBackground: new (canvas: HTMLCanvasElement, options?: any) => {
      init(): void
      destroy(): void
    }
  }
}

interface Props {
  /** 粒子数（默认 80） */
  particleCount?: number
  /** 连线最大距离（默认 120） */
  connectionDistance?: number
  /** 粒子基础尺寸（默认 2） */
  particleSize?: number
  /** 移动速度（默认 1） */
  speed?: number
  /** 粒子 / 连线颜色（默认读取 --color-primary；留空则 fallback 到引擎默认蓝） */
  color?: string
  /** 粒子不透明度（默认 0.6） */
  opacity?: number
  /** 鼠标交互半径（默认 150） */
  mouseRadius?: number
  /** 是否启用 init()（默认 true；首次挂载时调用） */
  autoInit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  particleCount: 80,
  connectionDistance: 120,
  particleSize: 2,
  speed: 1,
  color: '',
  opacity: 0.6,
  mouseRadius: 150,
  autoInit: true,
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
let engine: InstanceType<Window['ParticleBackground']> | null = null

/** ponytail: 从 :root 读取 --color-primary 解析后的 hex/hsl 字符串；
   拿不到（SSR / 无 token）则返回空，引擎内自 fallback 到默认蓝 */
function resolveThemeColor(): string {
  if (props.color) return props.color
  if (typeof window === 'undefined') return ''
  return getComputedStyle(document.documentElement)
    .getPropertyValue('--color-primary')
    .trim()
}

onMounted(() => {
  if (!canvasRef.value) return
  // ponytail: 等下一帧让 canvas 进入 DOM 并拿到正确 width/height，
  // 否则第一次 resize 时 canvas 尺寸还是 0
  requestAnimationFrame(() => {
    if (!canvasRef.value) return
    engine = new window.ParticleBackground(canvasRef.value, {
      particleCount: props.particleCount,
      connectionDistance: props.connectionDistance,
      particleSize: props.particleSize,
      speed: props.speed,
      color: resolveThemeColor(),
      opacity: props.opacity,
      mouseRadius: props.mouseRadius,
    })
    if (props.autoInit) engine.init()
  })
})

onBeforeUnmount(() => {
  engine?.destroy()
  engine = null
})
</script>

<style scoped>
.particles-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: auto;
}
</style>