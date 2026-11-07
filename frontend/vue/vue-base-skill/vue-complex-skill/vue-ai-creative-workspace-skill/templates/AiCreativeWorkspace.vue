<script setup lang="ts">
import { computed, ref } from 'vue'

type CreativeMode = 'poster' | 'social' | 'storyboard'
type AspectRatio = '1:1' | '4:5' | '16:9'
type WorkspaceVariant = 'editorial-light' | 'immersive-dark' | 'mobile-inspiration'

interface Asset {
  id: string
  title: string
  subtitle: string
  tone: string
  favorite: boolean
}

const emit = defineEmits<{
  'create-task': [payload: { prompt: string; mode: CreativeMode; aspectRatio: AspectRatio }]
}>()

const props = withDefaults(defineProps<{
  /** 选择与 demo 对应的工作台结构，不是单纯换色。 */
  variant?: WorkspaceVariant
}>(), {
  variant: 'editorial-light',
})

const prompt = ref('为精品咖啡品牌制作一组秋日限定视觉，柔和光影与手工纸张质感。')
const activeMode = ref<CreativeMode>('poster')
const aspectRatio = ref<AspectRatio>('4:5')
const isGenerating = ref(false)
const aspectOptions = [
  { label: '1:1', value: '1:1' },
  { label: '4:5', value: '4:5' },
  { label: '16:9', value: '16:9' },
]
const countOptions = [
  { label: '1 张', value: '1' },
  { label: '2 张', value: '2' },
  { label: '4 张', value: '4' },
]
const modes: Array<{ key: CreativeMode; title: string; description: string }> = [
  { key: 'poster', title: '品牌海报', description: '重点表达品牌气质与主视觉' },
  { key: 'social', title: '社媒配图', description: '适配内容流与传播封面' },
  { key: 'storyboard', title: '故事分镜', description: '拆分画面节奏与叙事镜头' },
]
const assets = ref<Asset[]>([
  { id: 'amber', title: '秋日慢焙', subtitle: '4:5 · 品牌海报', tone: 'workspace-asset--amber', favorite: true },
  { id: 'violet', title: '温室来信', subtitle: '4:5 · 社媒配图', tone: 'workspace-asset--violet', favorite: false },
  { id: 'blue', title: '午后留白', subtitle: '4:5 · 品牌海报', tone: 'workspace-asset--blue', favorite: false },
  { id: 'pink', title: '纸上花园', subtitle: '4:5 · 故事分镜', tone: 'workspace-asset--pink', favorite: false },
])

const selectedMode = computed(() => modes.find((item) => item.key === activeMode.value)!)

function chooseMode(mode: CreativeMode) {
  activeMode.value = mode
}

function toggleFavorite(id: string) {
  const target = assets.value.find((item) => item.id === id)
  if (target) target.favorite = !target.favorite
}

function createTask() {
  if (!prompt.value.trim() || isGenerating.value) return
  isGenerating.value = true
  emit('create-task', { prompt: prompt.value.trim(), mode: activeMode.value, aspectRatio: aspectRatio.value })
}

function finishTask() {
  isGenerating.value = false
}
</script>

<template>
  <div class="creative-workspace" :class="`creative-workspace--${props.variant}`">
    <div class="creative-workspace__sidebar">
      <div class="creative-workspace__brand">M</div>
      <div class="creative-workspace__nav" role="navigation" aria-label="创作工作区">
        <div class="creative-workspace__nav-item is-active">创作空间</div>
        <div class="creative-workspace__nav-item">我的草稿</div>
        <div class="creative-workspace__nav-item">灵感收藏</div>
      </div>
    </div>

    <div class="creative-workspace__main">
      <div class="creative-workspace__topbar">
        <div>
          <div class="creative-workspace__eyebrow">MOTION STUDIO</div>
          <div class="creative-workspace__title">创作一个新故事</div>
        </div>
        <base-tag type="success" variant="light">已自动保存</base-tag>
      </div>

      <base-card class="creative-workspace__canvas">
        <div class="creative-workspace__canvas-title">描述你想看见的画面</div>
        <base-input v-model="prompt" size="lg" clearable placeholder="输入创作意图、场景、情绪与主体" />
        <div class="creative-workspace__mode-list">
          <base-card
            v-for="mode in modes"
            :key="mode.key"
            class="creative-workspace__mode"
            :class="{ 'is-selected': mode.key === activeMode }"
            @click="chooseMode(mode.key)"
          >
            <div class="creative-workspace__mode-title">{{ mode.title }}</div>
            <div class="creative-workspace__mode-description">{{ mode.description }}</div>
          </base-card>
        </div>
        <div class="creative-workspace__canvas-footer">
          <base-tag type="primary" variant="light">{{ selectedMode.title }}</base-tag>
          <base-button type="primary" :loading="isGenerating" @click="createTask">
            {{ isGenerating ? '正在生成' : '开始生成' }}
          </base-button>
        </div>
      </base-card>

      <div class="creative-workspace__result-header">
        <div>
          <div class="creative-workspace__section-title">本次生成</div>
          <div class="creative-workspace__section-subtitle">保留满意的方向，再进入精修</div>
        </div>
        <base-button variant="ghost" @click="finishTask">结束演示状态</base-button>
      </div>
      <div class="creative-workspace__asset-grid" aria-live="polite">
        <base-card v-if="isGenerating" class="creative-workspace__asset creative-workspace__asset--loading">
          <div class="creative-workspace__skeleton" />
          <div class="creative-workspace__skeleton-line" />
        </base-card>
        <base-card v-for="asset in assets" :key="asset.id" class="creative-workspace__asset">
          <div class="creative-workspace__asset-image" :class="asset.tone" />
          <div class="creative-workspace__asset-body">
            <div>
              <div class="creative-workspace__asset-title">{{ asset.title }}</div>
              <div class="creative-workspace__asset-subtitle">{{ asset.subtitle }}</div>
            </div>
            <base-button variant="text" :aria-label="`收藏 ${asset.title}`" @click="toggleFavorite(asset.id)">
              {{ asset.favorite ? '已收藏' : '收藏' }}
            </base-button>
          </div>
        </base-card>
      </div>
    </div>

    <div class="creative-workspace__settings">
      <base-card class="creative-workspace__settings-card">
        <div class="creative-workspace__settings-title">生成参数</div>
        <div class="creative-workspace__settings-group">
          <div class="creative-workspace__settings-label">画面比例</div>
          <base-dropdown v-model="aspectRatio" mode="select" :options="aspectOptions" />
        </div>
        <div class="creative-workspace__settings-group">
          <div class="creative-workspace__settings-label">视觉风格</div>
          <div class="creative-workspace__tag-list">
            <base-tag type="primary" variant="light">编辑感</base-tag>
            <base-tag type="default" variant="light">柔和颗粒</base-tag>
            <base-tag type="default" variant="light">暖色底片</base-tag>
          </div>
        </div>
        <div class="creative-workspace__settings-group">
          <div class="creative-workspace__settings-label">生成数量</div>
          <base-dropdown mode="select" :options="countOptions" />
        </div>
      </base-card>
    </div>
  </div>
</template>

<style scoped>
.creative-workspace {
  --workspace-accent: var(--color-primary);
  --workspace-accent-soft: var(--color-primary-50);
  display: grid;
  grid-template-columns: minmax(var(--space-16), auto) minmax(0, 1fr) minmax(var(--space-16), auto);
  min-height: 100vh;
  background: var(--color-bg);
  color: var(--color-text);
}

.creative-workspace__sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  padding: var(--space-5) var(--space-3);
  background: var(--color-primary-950);
  color: var(--color-text-inverse);
}

.creative-workspace__brand {
  display: grid;
  width: var(--height-button-md);
  height: var(--height-button-md);
  place-items: center;
  border-radius: var(--radius-md);
  background: var(--workspace-accent);
  font-weight: var(--weight-bold);
}

.creative-workspace__nav { display: grid; gap: var(--space-2); }
.creative-workspace__nav-item { padding: var(--space-2); border-radius: var(--radius-sm); font-size: var(--font-xs); cursor: pointer; }
.creative-workspace__nav-item.is-active { background: var(--workspace-accent); }
.creative-workspace__main { min-width: 0; padding: var(--space-8); }
.creative-workspace__topbar, .creative-workspace__canvas-footer, .creative-workspace__result-header, .creative-workspace__asset-body { display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); }
.creative-workspace__eyebrow { color: var(--color-text-tertiary); font-size: var(--font-xs); letter-spacing: var(--space-1); }
.creative-workspace__title { margin-top: var(--space-2); font-size: var(--font-3xl); font-weight: var(--weight-bold); }
.creative-workspace__canvas { display: grid; gap: var(--space-5); margin-top: var(--space-8); padding: var(--space-8); border: 1px solid var(--color-border); box-shadow: var(--shadow-sm); }
.creative-workspace__canvas-title, .creative-workspace__section-title, .creative-workspace__settings-title { font-size: var(--font-xl); font-weight: var(--weight-semibold); }
.creative-workspace__mode-list { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-3); }
.creative-workspace__mode { min-height: var(--height-card-md); padding: var(--space-4); border: 1px solid var(--color-border); cursor: pointer; box-shadow: none; }
.creative-workspace__mode.is-selected { border-color: var(--workspace-accent); background: var(--workspace-accent-soft); }
.creative-workspace__mode-title { font-weight: var(--weight-semibold); }
.creative-workspace__mode-description, .creative-workspace__section-subtitle, .creative-workspace__asset-subtitle { margin-top: var(--space-1); color: var(--color-text-secondary); font-size: var(--font-sm); }
.creative-workspace__result-header { margin-top: var(--space-8); }
.creative-workspace__asset-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--space-4); margin-top: var(--space-4); }
.creative-workspace__asset { overflow: hidden; padding: 0; border: 1px solid var(--color-border); }
.creative-workspace__asset-image { min-height: var(--height-card-lg); background: var(--workspace-accent-soft); }
.workspace-asset--amber { background: linear-gradient(135deg, var(--color-warning-light), var(--color-primary-100)); }
.workspace-asset--violet { background: linear-gradient(135deg, var(--color-primary-100), var(--color-primary-300)); }
.workspace-asset--blue { background: linear-gradient(135deg, var(--color-primary-50), var(--color-primary-200)); }
.workspace-asset--pink { background: linear-gradient(135deg, var(--color-danger-light), var(--color-warning-light)); }
.creative-workspace__asset-body { padding: var(--space-3); }
.creative-workspace__asset-title { font-size: var(--font-base); font-weight: var(--weight-semibold); }
.creative-workspace__asset--loading { padding: var(--space-3); }
.creative-workspace__skeleton, .creative-workspace__skeleton-line { background: var(--color-bg-secondary); border-radius: var(--radius-sm); animation: workspace-pulse 1.2s ease-in-out infinite; }
.creative-workspace__skeleton { min-height: var(--height-card-lg); }
.creative-workspace__skeleton-line { height: var(--space-3); margin-top: var(--space-3); }
.creative-workspace__settings { padding: var(--space-8) var(--space-5); border-left: 1px solid var(--color-border); background: var(--color-surface); }
.creative-workspace__settings-card { display: grid; gap: var(--space-6); padding: var(--space-5); box-shadow: none; }
.creative-workspace__settings-group { display: grid; gap: var(--space-3); }
.creative-workspace__settings-label { color: var(--color-text-secondary); font-size: var(--font-sm); }
.creative-workspace__tag-list { display: flex; flex-wrap: wrap; gap: var(--space-2); }
.creative-workspace--immersive-dark { --workspace-accent: var(--color-primary-400); --workspace-accent-soft: var(--color-primary-950); background: var(--color-primary-950); color: var(--color-text-inverse); }
.creative-workspace--immersive-dark .creative-workspace__sidebar, .creative-workspace--immersive-dark .creative-workspace__settings { background: var(--color-primary-950); border-color: var(--color-primary-800); }
.creative-workspace--immersive-dark .creative-workspace__canvas, .creative-workspace--immersive-dark .creative-workspace__asset, .creative-workspace--immersive-dark .creative-workspace__settings-card, .creative-workspace--immersive-dark .creative-workspace__mode { background: var(--color-primary-900); border-color: var(--color-primary-800); }
.creative-workspace--immersive-dark .creative-workspace__mode.is-selected { background: var(--color-primary-800); border-color: var(--workspace-accent); }
.creative-workspace--immersive-dark .creative-workspace__eyebrow, .creative-workspace--immersive-dark .creative-workspace__mode-description, .creative-workspace--immersive-dark .creative-workspace__section-subtitle, .creative-workspace--immersive-dark .creative-workspace__asset-subtitle, .creative-workspace--immersive-dark .creative-workspace__settings-label { color: var(--color-primary-200); }
.creative-workspace--mobile-inspiration { grid-template-columns: 1fr; max-width: 430px; margin: 0 auto; }
.creative-workspace--mobile-inspiration .creative-workspace__sidebar, .creative-workspace--mobile-inspiration .creative-workspace__settings { display: none; }
.creative-workspace--mobile-inspiration .creative-workspace__main { padding: var(--space-5); }
.creative-workspace--mobile-inspiration .creative-workspace__topbar { align-items: flex-start; }
.creative-workspace--mobile-inspiration .creative-workspace__mode-list, .creative-workspace--mobile-inspiration .creative-workspace__asset-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
@keyframes workspace-pulse { 50% { opacity: 0.55; } }
@media (max-width: 1024px) { .creative-workspace { grid-template-columns: minmax(var(--space-16), auto) minmax(0, 1fr); } .creative-workspace__settings { display: none; } .creative-workspace__asset-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 640px) { .creative-workspace__main { padding: var(--space-4); } .creative-workspace__topbar, .creative-workspace__canvas-footer, .creative-workspace__result-header { align-items: flex-start; flex-direction: column; } .creative-workspace__mode-list, .creative-workspace__asset-grid { grid-template-columns: 1fr; } }
</style>
