<!--
  PuzzleCaptcha.vue - 滑块拼图验证组件

  用法：
    <PuzzleCaptcha v-model="verified" />
    <LoginForm :disabled="!verified" ... />

  ponytail: 从 SKILL.md 第 443-602 行提取重构，独立成组件。
  - clip-path 凸字形拼图块
  - 拖动 slider 到正确位置释放后自动吸附 + 触发 verified = true
  - 拼图块位置 = 在拼图背景上随机抽出 (left, top) 位置，slider 拖动幅度 = 拼图块 left 偏移
-->
<template>
  <div class="puzzle-captcha" :class="{ 'is-verified': verified }">
    <!-- 拼图背景图（消费者可覆盖；默认纯渐变） -->
    <div
      ref="puzzleBgRef"
      class="puzzle-captcha__bg"
    >
      <!-- 拼图凹槽 -->
      <div
        v-show="!verified"
        class="puzzle-captcha__hole"
        :style="{ left: `${holeLeft}px`, top: `${holeTop}px` }"
      />
      <!-- 拼图凸块 -->
      <div
        v-show="!verified"
        class="puzzle-captcha__piece"
        :style="{
          left: `${pieceLeft}px`,
          top: `${holeTop}px`,
          backgroundPosition: `-${holeLeft}px -${holeTop}px`,
        }"
      />
      <!-- 已验证遮罩 -->
      <div v-if="verified" class="puzzle-captcha__success">
        <svg viewBox="0 0 24 24" width="32" height="32">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" :fill="successIconColor"/>
        </svg>
        <span>验证成功</span>
      </div>
    </div>

    <!-- 拖动 slider -->
    <div
      v-if="!verified"
      ref="trackRef"
      class="puzzle-captcha__track"
    >
      <div class="puzzle-captcha__hint">拖动滑块完成拼图</div>
      <div
        ref="sliderRef"
        class="puzzle-captcha__slider"
        :style="{ transform: `translateX(${sliderX}px)` }"
        @mousedown="onDragStart"
        @touchstart="onDragStart"
      >
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M8 5l-5 7 5 7m8-14l5 7-5 7" fill="none" stroke="currentColor" stroke-width="2"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

interface Props {
  /** 拼图背景色（消费者可覆盖；默认紫蓝渐变） */
  bgGradient?: string
  /** 拼图块/凹槽尺寸（默认 50px） */
  pieceSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  bgGradient: '',
  pieceSize: 50,
})

/** ponytail: 消费者没传 bgGradient 时，从主题色 token 拼一个 135deg 渐变（凡颜色必用 token） */
const resolvedBgGradient = computed(() => {
  if (props.bgGradient) return props.bgGradient
  if (typeof window === 'undefined') return ''
  const root = document.documentElement
  const c1 = getComputedStyle(root).getPropertyValue('--color-primary').trim()
  const c2 = getComputedStyle(root).getPropertyValue('--color-primary-dark').trim()
  if (!c1 || !c2) return ''
  return `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`
})

/** ponytail: SVG 成功勾号颜色用 --color-success token（解析后塞 inline fill） */
const successIconColor = computed(() => {
  if (typeof window === 'undefined') return ''
  return getComputedStyle(document.documentElement)
    .getPropertyValue('--color-success')
    .trim()
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const verified = ref(false)
const sliderX = ref(0)
const isDragging = ref(false)
const startX = ref(0)

const trackRef = ref<HTMLDivElement | null>(null)
const sliderRef = ref<HTMLDivElement | null>(null)
const puzzleBgRef = ref<HTMLDivElement | null>(null)

const holeLeft = ref(0)
const holeTop = ref(0)
const pieceLeft = ref(0)

const trackWidth = computed(() => trackRef.value?.clientWidth ?? 300)
const sliderWidth = 44

function randomHolePosition() {
  // 拼图背景图尺寸（消费者可覆盖）：默认 300x150
  const bgWidth = puzzleBgRef.value?.clientWidth ?? 300
  const bgHeight = puzzleBgRef.value?.clientHeight ?? 150
  const margin = 20
  const maxLeft = bgWidth - props.pieceSize - margin
  const maxTop = bgHeight - props.pieceSize - margin
  holeLeft.value = margin + Math.random() * (maxLeft - margin)
  holeTop.value = margin + Math.random() * (maxTop - margin)
  pieceLeft.value = 0
  sliderX.value = 0
}

onMounted(() => {
  randomHolePosition()
})

function onDragStart(e: MouseEvent | TouchEvent) {
  isDragging.value = true
  startX.value = 'touches' in e ? e.touches[0].clientX : e.clientX
  document.addEventListener('mousemove', onDragMove)
  document.addEventListener('mouseup', onDragEnd)
  document.addEventListener('touchmove', onDragMove)
  document.addEventListener('touchend', onDragEnd)
}

function onDragMove(e: MouseEvent | TouchEvent) {
  if (!isDragging.value) return
  const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const delta = currentX - startX.value
  const maxX = trackWidth.value - sliderWidth
  sliderX.value = Math.max(0, Math.min(maxX, delta))
  pieceLeft.value = sliderX.value
}

function onDragEnd() {
  if (!isDragging.value) return
  isDragging.value = false
  document.removeEventListener('mousemove', onDragMove)
  document.removeEventListener('mouseup', onDragEnd)
  document.removeEventListener('touchmove', onDragMove)
  document.removeEventListener('touchend', onDragEnd)

  // 验证：sliderX 应等于 holeLeft（归一化到 track 坐标）
  // track 宽度和 bg 宽度按相同比例映射
  const bgWidth = puzzleBgRef.value?.clientWidth ?? 300
  const expectedSliderX = (holeLeft.value / bgWidth) * trackWidth.value
  const tolerance = 6

  if (Math.abs(sliderX.value - expectedSliderX) < tolerance) {
    sliderX.value = expectedSliderX
    pieceLeft.value = (sliderX.value / trackWidth.value) * bgWidth
    verified.value = true
    emit('update:modelValue', true)
  } else {
    // 失败回弹
    sliderX.value = 0
    pieceLeft.value = 0
  }
}
</script>

<style scoped>
.puzzle-captcha {
  width: 100%;
  margin-bottom: var(--space-4);
}

.puzzle-captcha__bg {
  position: relative;
  width: 100%;
  height: 150px;
  background: v-bind('resolvedBgGradient');
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-bottom: var(--space-3);
}

/* 拼图凹槽（深色挖空示意） */
.puzzle-captcha__hole {
  position: absolute;
  width: v-bind('pieceSize + "px"');
  height: v-bind('pieceSize + "px"');
  background: color-mix(in srgb, var(--color-text) 50%, transparent);
  border: 2px dashed color-mix(in srgb, var(--color-text-inverse) 80%, transparent);
  /* 凸字形：左上凸、右下凸 */
  clip-path: polygon(
    0 0,
    35% 0,
    35% 25%,
    65% 25%,
    65% 0,
    100% 0,
    100% 65%,
    75% 65%,
    75% 90%,
    100% 90%,
    100% 100%,
    0 100%
  );
}

/* 拼图凸块（亮色 + 与背景同位置 background-position） */
.puzzle-captcha__piece {
  position: absolute;
  width: v-bind('pieceSize + "px"');
  height: v-bind('pieceSize + "px"');
  background: v-bind('resolvedBgGradient');
  background-size: v-bind('"100% 100%"');
  border: 1px solid color-mix(in srgb, var(--color-text-inverse) 50%, transparent);
  cursor: grab;
  transition: none;
  clip-path: polygon(
    0 0,
    35% 0,
    35% 25%,
    65% 25%,
    65% 0,
    100% 0,
    100% 65%,
    75% 65%,
    75% 90%,
    100% 90%,
    100% 100%,
    0 100%
  );
  box-shadow: 0 2px 8px color-mix(in srgb, var(--color-text) 20%, transparent);
}

/* 已验证遮罩 */
.puzzle-captcha__success {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  background: color-mix(in srgb, var(--color-text-inverse) 95%, transparent);
  color: var(--color-success);
  font-size: var(--font-base);
  font-weight: var(--weight-semibold);
}

/* slider 轨道 */
.puzzle-captcha__track {
  position: relative;
  width: 100%;
  height: 44px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  overflow: hidden;
}

.puzzle-captcha__hint {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-sm);
  color: var(--color-text-tertiary);
  pointer-events: none;
}

.puzzle-captcha__slider {
  position: absolute;
  left: 0;
  top: 0;
  width: 44px;
  height: 100%;
  background: var(--color-primary);
  color: var(--color-text-inverse);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  border-radius: var(--radius-md);
  user-select: none;
  transition: transform 0.2s ease-out;
}

.puzzle-captcha.is-verified .puzzle-captcha__track {
  opacity: 0.5;
}
</style>