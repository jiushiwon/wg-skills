<script setup lang="ts">
import { ref } from 'vue'

type CreativeMode = 'atmosphere' | 'portrait' | 'narrative'

const emit = defineEmits<{
  'create-task': [payload: { prompt: string; mode: CreativeMode; ratio: string }]
}>()

const prompt = ref('一束月光穿过夜色山谷，冷紫色花朵在水面上发光，电影感构图。')
const activeMode = ref<CreativeMode>('atmosphere')
const ratio = ref('4:5')
const isGenerating = ref(false)
const modes: Array<{ key: CreativeMode; label: string; description: string }> = [
  { key: 'atmosphere', label: '氛围图像', description: '先确定光线、情绪与主体' },
  { key: 'portrait', label: '角色肖像', description: '控制人物关系与镜头语言' },
  { key: 'narrative', label: '品牌叙事', description: '构建完整的故事视觉线' },
]

function createTask() {
  if (!prompt.value.trim() || isGenerating.value) return
  isGenerating.value = true
  emit('create-task', { prompt: prompt.value.trim(), mode: activeMode.value, ratio: ratio.value })
}
</script>

<template>
  <div class="immersive-workspace">
    <div class="immersive-workspace__rail" role="navigation" aria-label="创作工具">
      <div class="immersive-workspace__mark">✦</div>
      <div class="immersive-workspace__rail-item is-active">创作</div>
      <div class="immersive-workspace__rail-item">素材</div>
      <div class="immersive-workspace__rail-item">收藏</div>
    </div>
    <div class="immersive-workspace__main">
      <div class="immersive-workspace__topbar">
        <div>ORBIT STUDIO / NEW CANVAS</div>
        <base-tag type="primary" variant="light">已保存</base-tag>
      </div>
      <div class="immersive-workspace__title">让灵感进入轨道</div>
      <div class="immersive-workspace__subtitle">沉浸式创作台，专注画面、材质与光线关系。</div>

      <base-card class="immersive-workspace__prompt-panel">
        <base-input v-model="prompt" size="lg" clearable placeholder="描述场景、镜头、主体和情绪" />
        <div class="immersive-workspace__tools">
          <base-button variant="ghost">参考图</base-button>
          <base-button variant="ghost">构图</base-button>
          <base-button type="primary" :loading="isGenerating" @click="createTask">
            {{ isGenerating ? '正在生成' : '生成视觉' }}
          </base-button>
        </div>
      </base-card>

      <div class="immersive-workspace__mode-grid">
        <base-card v-for="mode in modes" :key="mode.key" class="immersive-workspace__mode" :class="{ 'is-active': activeMode === mode.key }" @click="activeMode = mode.key">
          <div class="immersive-workspace__mode-label">{{ mode.label }}</div>
          <div class="immersive-workspace__mode-description">{{ mode.description }}</div>
        </base-card>
      </div>

      <div class="immersive-workspace__result-heading">
        <div>
          <div class="immersive-workspace__section-title">候选画面</div>
          <div class="immersive-workspace__section-subtitle">选中一个方向，再在右侧深化参数。</div>
        </div>
        <base-button variant="ghost" @click="isGenerating = false">结束演示状态</base-button>
      </div>
      <div class="immersive-workspace__gallery">
        <base-card v-for="item in ['月落群山', '紫夜花序', '雾中来信']" :key="item" class="immersive-workspace__asset">
          <div class="immersive-workspace__art" :class="`immersive-workspace__art--${item}`" />
          <div class="immersive-workspace__asset-title">{{ item }}</div>
          <base-tag type="primary" variant="light">电影感</base-tag>
        </base-card>
      </div>
    </div>
    <div class="immersive-workspace__inspector">
      <base-card class="immersive-workspace__inspector-card">
        <div class="immersive-workspace__inspector-title">创作控制</div>
        <div class="immersive-workspace__field-label">画面比例</div>
        <base-dropdown v-model="ratio" mode="select" :options="[{ label: '1:1', value: '1:1' }, { label: '4:5', value: '4:5' }, { label: '16:9', value: '16:9' }]" />
        <div class="immersive-workspace__field-label">色彩倾向</div>
        <div class="immersive-workspace__tags"><base-tag type="primary" variant="light">冷紫月光</base-tag><base-tag type="default" variant="light">柔金暖调</base-tag></div>
      </base-card>
    </div>
  </div>
</template>

<style scoped>
.immersive-workspace { display: grid; grid-template-columns: auto minmax(0, 1fr) minmax(var(--space-16), auto); min-height: 100vh; color: var(--color-text-inverse); background: var(--color-primary-950); }
.immersive-workspace__rail { display: grid; align-content: start; gap: var(--space-4); padding: var(--space-5) var(--space-3); border-right: 1px solid var(--color-primary-800); }
.immersive-workspace__mark { display: grid; width: var(--height-button-md); height: var(--height-button-md); place-items: center; border-radius: var(--radius-md); background: var(--color-primary-500); }
.immersive-workspace__rail-item { padding: var(--space-2); border-radius: var(--radius-sm); color: var(--color-primary-200); font-size: var(--font-xs); cursor: pointer; }
.immersive-workspace__rail-item.is-active { background: var(--color-primary-800); color: var(--color-text-inverse); }
.immersive-workspace__main { padding: var(--space-8); }
.immersive-workspace__topbar, .immersive-workspace__tools, .immersive-workspace__result-heading { display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); }
.immersive-workspace__topbar, .immersive-workspace__subtitle, .immersive-workspace__mode-description, .immersive-workspace__section-subtitle, .immersive-workspace__field-label { color: var(--color-primary-200); font-size: var(--font-sm); }
.immersive-workspace__title { margin-top: var(--space-6); font-size: var(--font-3xl); font-weight: var(--weight-bold); }
.immersive-workspace__subtitle { margin-top: var(--space-2); }
.immersive-workspace__prompt-panel, .immersive-workspace__mode, .immersive-workspace__asset, .immersive-workspace__inspector-card { background: var(--color-primary-900); border: 1px solid var(--color-primary-800); }
.immersive-workspace__prompt-panel { display: grid; gap: var(--space-4); margin-top: var(--space-8); padding: var(--space-6); }
.immersive-workspace__tools { justify-content: flex-end; }
.immersive-workspace__mode-grid, .immersive-workspace__gallery { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-3); margin-top: var(--space-4); }
.immersive-workspace__mode { padding: var(--space-4); cursor: pointer; }
.immersive-workspace__mode.is-active { border-color: var(--color-primary-400); background: var(--color-primary-800); }
.immersive-workspace__mode-label, .immersive-workspace__section-title, .immersive-workspace__inspector-title { font-size: var(--font-lg); font-weight: var(--weight-semibold); }
.immersive-workspace__mode-description, .immersive-workspace__section-subtitle { margin-top: var(--space-2); }
.immersive-workspace__result-heading { margin-top: var(--space-8); }
.immersive-workspace__asset { overflow: hidden; padding: var(--space-3); }
.immersive-workspace__art { min-height: var(--height-card-lg); border-radius: var(--radius-md); background: var(--color-primary-800); }
.immersive-workspace__art--月落群山 { background: linear-gradient(135deg, var(--color-primary-600), var(--color-primary-950)); }
.immersive-workspace__art--紫夜花序 { background: linear-gradient(135deg, var(--color-primary-400), var(--color-primary-900)); }
.immersive-workspace__art--雾中来信 { background: linear-gradient(135deg, var(--color-primary-300), var(--color-primary-800)); }
.immersive-workspace__asset-title { margin: var(--space-3) 0 var(--space-2); font-weight: var(--weight-semibold); }
.immersive-workspace__inspector { padding: var(--space-8) var(--space-5); border-left: 1px solid var(--color-primary-800); }
.immersive-workspace__inspector-card { display: grid; gap: var(--space-4); padding: var(--space-5); }
.immersive-workspace__field-label { margin-top: var(--space-2); }.immersive-workspace__tags { display: flex; flex-wrap: wrap; gap: var(--space-2); }
@media (max-width: 1024px) { .immersive-workspace { grid-template-columns: auto minmax(0, 1fr); }.immersive-workspace__inspector { display: none; } }
@media (max-width: 640px) { .immersive-workspace__main { padding: var(--space-4); }.immersive-workspace__mode-grid, .immersive-workspace__gallery { grid-template-columns: 1fr; }.immersive-workspace__result-heading { align-items: flex-start; flex-direction: column; } }
</style>
