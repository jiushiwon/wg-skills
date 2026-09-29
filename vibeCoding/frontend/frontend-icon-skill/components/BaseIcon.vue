<!--
  BaseIcon —— frontend-icon-skill 标准图标组件（唯一入口）

  图标方案（唯一口径，详见 frontend/ICONS.md）：
    1) 业务数据（DB / 路由 meta）icon 字段统一存 kebab-case 图标名（lucide 风格，
       如 layout-dashboard / users / settings），不存 emoji / Unicode 字符 / icon class；
    2) 本组件把 kebab-case 名字映射到 frontend-icon-skill 的模板并内联渲染；
    3) 未登记的图标名走兜底打印 console.warn，绝不渲染成空白，也不显示原始字符串。

  其它组件技能（vue-layout-skill / vue-button-skill 等）统一从这里取图标：
    import BaseIcon from 'frontend-icon-skill/components/BaseIcon.vue'
-->
<script setup lang="ts">
import { computed } from 'vue'
import { generateIcon, resolveTemplateName } from '../src/index.ts'

const props = withDefaults(defineProps<{
  /** 图标名（kebab-case，如 'layout-dashboard' / 'users' / 'settings'） */
  name: string
  /** 图标尺寸（px） */
  size?: number
  /** 描边色（CSS color） */
  color?: string
  /** 描边粗细 */
  strokeWidth?: number
}>(), {
  size: 24,
  color: 'currentColor',
  strokeWidth: 2,
})

/** 未登记图标名的兜底模板（保证有图形，不会空白） */
const FALLBACK_TEMPLATE = 'menu'

/** 同一个未知图标名只告警一次，避免每帧刷屏 */
const warned = new Set<string>()

const svg = computed(() => {
  const templateName = resolveTemplateName(props.name) ?? FALLBACK_TEMPLATE
  if (templateName === FALLBACK_TEMPLATE && resolveTemplateName(props.name) === null && !warned.has(props.name)) {
    warned.add(props.name)
    console.warn(
      `[BaseIcon] 未登记的图标名 "${props.name}"，已兜底渲染 "${FALLBACK_TEMPLATE}"。` +
        `请在 src/registry.ts 的 TEMPLATE_ALIASES 登记（见 frontend/ICONS.md）。`,
    )
  }
  return generateIcon(templateName, {
    size: props.size,
    color: props.color,
    strokeWidth: props.strokeWidth,
  })
})
</script>

<template>
  <span class="base-icon" v-html="svg" />
</template>

<style scoped>
.base-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
  vertical-align: middle;
}
.base-icon :deep(svg) {
  display: block;
}
</style>