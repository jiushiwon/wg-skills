<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  'create-task': [payload: { prompt: string; style: string; inspirationIds: string[] }]
}>()

const prompt = ref('在地中海午后，把自然纹理、暖色纸张和安静的生活方式组合成一组品牌故事。')
const activeStyle = ref('编辑感')
const selectedInspirationIds = ref(['coast'])
const isGenerating = ref(false)
const inspirations = [
  { id: 'coast', title: '海岸留白', tone: 'mobile-editor__mood--coast' },
  { id: 'portrait', title: '花影肖像', tone: 'mobile-editor__mood--portrait' },
  { id: 'still-life', title: '无花果静物', tone: 'mobile-editor__mood--still-life' },
  { id: 'collage', title: '纸上拼贴', tone: 'mobile-editor__mood--collage' },
]

function toggleInspiration(id: string) {
  selectedInspirationIds.value = selectedInspirationIds.value.includes(id)
    ? selectedInspirationIds.value.filter((item) => item !== id)
    : [...selectedInspirationIds.value, id]
}

function createTask() {
  if (!prompt.value.trim() || isGenerating.value) return
  isGenerating.value = true
  emit('create-task', { prompt: prompt.value.trim(), style: activeStyle.value, inspirationIds: selectedInspirationIds.value })
}
</script>

<template>
  <div class="mobile-editor">
    <div class="mobile-editor__topbar">
      <base-button variant="ghost" circle>菜单</base-button>
      <base-tag type="primary" variant="light">灵感板</base-tag>
      <base-button variant="ghost" circle>搜索</base-button>
    </div>
    <div class="mobile-editor__title">编辑灵感板</div>
    <div class="mobile-editor__subtitle">收集画面，再用一句话推进它。</div>
    <div class="mobile-editor__mood-grid">
      <base-card v-for="item in inspirations" :key="item.id" class="mobile-editor__mood" :class="[item.tone, { 'is-selected': selectedInspirationIds.includes(item.id) }]" @click="toggleInspiration(item.id)">
        <div class="mobile-editor__mood-status">{{ selectedInspirationIds.includes(item.id) ? '已选' : '选择' }}</div>
        <div class="mobile-editor__mood-title">{{ item.title }}</div>
      </base-card>
    </div>
    <base-card class="mobile-editor__composer">
      <div class="mobile-editor__composer-title">把这些画面串起来</div>
      <div class="mobile-editor__style-list">
        <base-tag v-for="style in ['编辑感', '柔和颗粒', '暖色底片']" :key="style" :type="activeStyle === style ? 'primary' : 'default'" variant="light" @click="activeStyle = style">{{ style }}</base-tag>
      </div>
      <base-input v-model="prompt" clearable placeholder="描述你要延展的视觉故事" />
      <div class="mobile-editor__composer-footer">
        <base-tag type="default" variant="light">{{ selectedInspirationIds.length }} 个灵感</base-tag>
        <base-button type="primary" :loading="isGenerating" @click="createTask">{{ isGenerating ? '生成中' : '生成灵感' }}</base-button>
      </div>
    </base-card>
  </div>
</template>

<style scoped>
.mobile-editor { max-width: 430px; min-height: 100vh; margin: 0 auto; padding: var(--space-5); background: var(--color-bg); color: var(--color-text); }
.mobile-editor__topbar, .mobile-editor__composer-footer { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); }
.mobile-editor__title { margin-top: var(--space-6); font-size: var(--font-3xl); font-weight: var(--weight-bold); }.mobile-editor__subtitle { margin-top: var(--space-2); color: var(--color-text-secondary); font-size: var(--font-sm); }
.mobile-editor__mood-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-3); margin-top: var(--space-5); }
.mobile-editor__mood { position: relative; min-height: var(--height-card-lg); padding: var(--space-3); overflow: hidden; border: 1px solid var(--color-border); cursor: pointer; }.mobile-editor__mood.is-selected { border-color: var(--color-primary); box-shadow: 0 0 0 var(--space-1) var(--color-primary-100); }
.mobile-editor__mood--coast { background: linear-gradient(135deg, var(--color-primary-200), var(--color-primary-700)); }.mobile-editor__mood--portrait { background: linear-gradient(135deg, var(--color-danger-light), var(--color-primary-200)); }.mobile-editor__mood--still-life { background: linear-gradient(135deg, var(--color-warning-light), var(--color-primary-100)); }.mobile-editor__mood--collage { background: linear-gradient(135deg, var(--color-primary-800), var(--color-danger-light)); }
.mobile-editor__mood-status { display: inline-flex; padding: var(--space-1) var(--space-2); border-radius: var(--radius-full); background: var(--color-surface); color: var(--color-text-secondary); font-size: var(--font-2xs); }.mobile-editor__mood-title { position: absolute; right: var(--space-3); bottom: var(--space-3); color: var(--color-text-inverse); font-size: var(--font-sm); font-weight: var(--weight-semibold); }
.mobile-editor__composer { display: grid; gap: var(--space-4); margin-top: var(--space-5); padding: var(--space-5); border: 1px solid var(--color-border); }.mobile-editor__composer-title { font-size: var(--font-lg); font-weight: var(--weight-semibold); }.mobile-editor__style-list { display: flex; flex-wrap: wrap; gap: var(--space-2); }
</style>
