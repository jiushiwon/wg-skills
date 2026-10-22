<script setup lang="ts">
import { computed, ref } from 'vue'

interface Scene { id: string; title: string; duration: string; tone: string }

const emit = defineEmits<{
  'render-preview': [payload: { sceneId: string; lens: string; movement: string }]
}>()

const scenes = ref<Scene[]>([
  { id: 'arrival', title: '抵达山谷', duration: '4 秒', tone: 'storyboard__frame--arrival' },
  { id: 'gaze', title: '人物凝视', duration: '3 秒', tone: 'storyboard__frame--gaze' },
  { id: 'distance', title: '城堡远景', duration: '5 秒', tone: 'storyboard__frame--distance' },
  { id: 'fire', title: '夜火微光', duration: '3 秒', tone: 'storyboard__frame--fire' },
])
const activeSceneId = ref('arrival')
const lens = ref('35mm')
const movement = ref('推进')
const isRendering = ref(false)
const activeScene = computed(() => scenes.value.find((scene) => scene.id === activeSceneId.value)!)

function renderPreview() {
  if (isRendering.value) return
  isRendering.value = true
  emit('render-preview', { sceneId: activeSceneId.value, lens: lens.value, movement: movement.value })
}
</script>

<template>
  <div class="storyboard">
    <div class="storyboard__scene-list" role="navigation" aria-label="分镜列表">
      <div class="storyboard__label">STORYBOARD / {{ scenes.length }}</div>
      <base-card v-for="(scene, index) in scenes" :key="scene.id" class="storyboard__scene-item" :class="{ 'is-active': scene.id === activeSceneId }" @click="activeSceneId = scene.id">
        <div class="storyboard__scene-number">{{ String(index + 1).padStart(2, '0') }}</div>
        <div class="storyboard__scene-name">{{ scene.title }}</div>
      </base-card>
      <base-button variant="ghost">新建镜头</base-button>
    </div>
    <div class="storyboard__stage">
      <div class="storyboard__stage-header"><span>《群山回声》 / {{ activeScene.title }}</span><base-tag type="primary" variant="light">16:9 · {{ activeScene.duration }}</base-tag></div>
      <base-card class="storyboard__preview" :class="activeScene.tone"><div class="storyboard__preview-title">{{ activeScene.title }}</div></base-card>
      <div class="storyboard__playback"><base-button variant="ghost" circle>播放</base-button><div class="storyboard__progress"><div /></div><span>{{ activeScene.duration }}</span></div>
    </div>
    <div class="storyboard__inspector"><base-card class="storyboard__inspector-card"><div class="storyboard__inspector-title">镜头控制</div><div class="storyboard__field-label">镜头焦段</div><base-dropdown v-model="lens" mode="select" :options="[{ label: '35mm', value: '35mm' }, { label: '50mm', value: '50mm' }, { label: '85mm', value: '85mm' }]" /><div class="storyboard__field-label">运镜方式</div><div class="storyboard__tag-row"><base-tag v-for="item in ['静止', '推进', '环绕']" :key="item" :type="movement === item ? 'primary' : 'default'" variant="light" @click="movement = item">{{ item }}</base-tag></div><div class="storyboard__field-label">视觉色调</div><base-dropdown mode="select" :options="[{ label: '暮色暖调', value: 'warm' }, { label: '青灰清晨', value: 'cool' }]" /></base-card></div>
    <div class="storyboard__timeline"><div class="storyboard__timeline-header"><div><div class="storyboard__timeline-title">故事时间线</div><div v-if="isRendering" class="storyboard__status">正在渲染预览片段</div></div><base-button type="primary" :loading="isRendering" @click="renderPreview">渲染预览</base-button></div><div class="storyboard__clips"><base-card v-for="(scene, index) in scenes" :key="scene.id" class="storyboard__clip" :class="{ 'is-active': scene.id === activeSceneId }" @click="activeSceneId = scene.id"><div class="storyboard__clip-art" :class="scene.tone" /><div>{{ String(index + 1).padStart(2, '0') }} / {{ scene.title }}</div></base-card></div></div>
  </div>
</template>

<style scoped>
.storyboard { display: grid; grid-template-columns: minmax(var(--space-16), auto) minmax(0, 1fr) minmax(var(--space-16), auto); grid-template-rows: minmax(0, 1fr) auto; min-height: 100vh; gap: var(--space-3); padding: var(--space-5); background: var(--color-bg); color: var(--color-text); }.storyboard__scene-list, .storyboard__stage, .storyboard__inspector, .storyboard__timeline { background: var(--color-primary-950); border-radius: var(--radius-lg); }.storyboard__scene-list { display: grid; align-content: start; gap: var(--space-3); padding: var(--space-4); }.storyboard__label, .storyboard__field-label { color: var(--color-primary-200); font-size: var(--font-xs); }.storyboard__scene-item { display: grid; grid-template-columns: auto 1fr; gap: var(--space-2); padding: var(--space-3); background: var(--color-primary-900); border: 1px solid var(--color-primary-800); color: var(--color-text-inverse); cursor: pointer; }.storyboard__scene-item.is-active, .storyboard__clip.is-active { border-color: var(--color-warning); }.storyboard__scene-number { color: var(--color-primary-200); }.storyboard__stage { min-height: var(--height-card-lg); padding: var(--space-5); }.storyboard__stage-header, .storyboard__playback, .storyboard__timeline-header { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); color: var(--color-text-inverse); }.storyboard__preview { min-height: var(--height-card-lg); margin-top: var(--space-4); border: 1px solid var(--color-primary-800); color: var(--color-text-inverse); }.storyboard__frame--arrival { background: linear-gradient(135deg, var(--color-primary-500), var(--color-warning-light)); }.storyboard__frame--gaze { background: linear-gradient(135deg, var(--color-danger-light), var(--color-primary-800)); }.storyboard__frame--distance { background: linear-gradient(135deg, var(--color-primary-800), var(--color-primary-300)); }.storyboard__frame--fire { background: linear-gradient(135deg, var(--color-primary-950), var(--color-danger)); }.storyboard__preview-title { padding: var(--space-5); font-size: var(--font-2xl); font-weight: var(--weight-bold); }.storyboard__playback { margin-top: var(--space-4); }.storyboard__progress { flex: 1; height: var(--space-1); border-radius: var(--radius-full); background: var(--color-primary-800); }.storyboard__progress > div { width: 38%; height: 100%; border-radius: inherit; background: var(--color-warning); }.storyboard__inspector { padding: var(--space-5); }.storyboard__inspector-card { display: grid; gap: var(--space-4); padding: var(--space-4); background: var(--color-primary-900); border: 1px solid var(--color-primary-800); }.storyboard__inspector-title, .storyboard__timeline-title { font-weight: var(--weight-semibold); }.storyboard__tag-row { display: flex; flex-wrap: wrap; gap: var(--space-2); }.storyboard__timeline { grid-column: 2 / 4; padding: var(--space-4); }.storyboard__status { margin-top: var(--space-1); color: var(--color-warning-light); font-size: var(--font-xs); }.storyboard__clips { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--space-3); margin-top: var(--space-3); }.storyboard__clip { padding: var(--space-2); background: var(--color-primary-900); border: 1px solid var(--color-primary-800); color: var(--color-text-inverse); font-size: var(--font-xs); cursor: pointer; }.storyboard__clip-art { min-height: var(--height-card-sm); margin-bottom: var(--space-2); border-radius: var(--radius-sm); }@media(max-width:1024px){.storyboard{grid-template-columns:auto minmax(0,1fr)}.storyboard__inspector{display:none}.storyboard__timeline{grid-column:1/3}}@media(max-width:640px){.storyboard{grid-template-columns:1fr;padding:var(--space-3)}.storyboard__scene-list{display:none}.storyboard__timeline{grid-column:auto}.storyboard__clips{grid-template-columns:repeat(2,minmax(0,1fr))}}
</style>
