<!--
  SearchPage 搜索组件化页面
  ============================================================
  结构：顶部搜索栏（input + 搜索/取消）+ 历史搜索（可删）+ 热门搜索 + 结果列表
  状态机：有关键字/结果 → 结果态；无 → 历史/热门态
  特性：
    - input 实时防抖 emit input（600ms）；
    - 历史搜索标签可逐个删除，也支持一键清空；
    - 结果列表项 slot 自由填充；空结果有内置 empty。
-->
<template>
  <view class="search-page">
    <view class="sp-bar">
      <slot name="bar">
        <view class="sp-search">
          <text class="sp-search-icon">⌕</text>
          <input
            :value="keyword"
            class="sp-input"
            :placeholder="placeholder"
            placeholder-class="sp-input-ph"
            confirm-type="search"
            :focus="focused"
            @input="onInput"
            @confirm="onSearch"
            @clear="onClearKeyword"
          />
          <view v-if="keyword" class="sp-clear" @click="onClearKeyword">
            <text class="sp-clear-icon">×</text>
          </view>
        </view>
        <view class="sp-action" @click="onSearch">
          <text class="sp-action-text">{{ searchText }}</text>
        </view>
      </slot>
    </view>

    <scroll-view class="sp-body" scroll-y>
      <!-- 结果态（有结果或已搜索过） -->
      <template v-if="searched || resultList.length">
        <view class="sp-results">
          <template v-if="resultList.length">
            <view v-for="(item, index) in resultList" :key="itemKey(item, index)" class="sp-result-item" @click="$emit('itemClick', item, index)">
              <slot name="result" :item="item" :index="index">
                <text class="sp-result-text">{{ itemText(item) }}</text>
              </slot>
            </view>
            <view v-if="finished" class="sp-finished">
              <text class="sp-finished-text">没有更多了</text>
            </view>
          </template>
          <slot v-else name="empty">
            <view class="sp-empty">
              <text class="sp-empty-text">暂无相关结果</text>
            </view>
          </slot>
        </view>
      </template>

      <!-- 历史 / 热门态 -->
      <template v-else>
        <view v-if="showHistory && historyList.length" class="sp-section">
          <view class="sp-section-head">
            <text class="sp-section-title">历史搜索</text>
            <view class="sp-section-clear" @click="$emit('clearHistory')">
              <text class="sp-section-clear-icon">🗑</text>
            </view>
          </view>
          <slot name="history">
            <view class="sp-tags">
              <view v-for="(h, i) in historyList" :key="i" class="sp-tag" @click="onTagClick(h)">
                <text class="sp-tag-text">{{ h }}</text>
                <text class="sp-tag-del" @click.stop="$emit('deleteHistory', h)">×</text>
              </view>
            </view>
          </slot>
        </view>

        <view v-if="showHot && hotList.length" class="sp-section">
          <view class="sp-section-head">
            <text class="sp-section-title">热门搜索</text>
          </view>
          <slot name="hot">
            <view class="sp-tags">
              <view v-for="(h, i) in hotList" :key="i" class="sp-tag is-hot" @click="onTagClick(h)">
                <text class="sp-tag-text">{{ h }}</text>
              </view>
            </view>
          </slot>
        </view>

        <slot v-if="!showHistory && !showHot" name="default" />
      </template>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  /** 搜索框占位 */
  placeholder?: string
  /** 搜索/取消按钮文案 */
  searchText?: string
  /** 历史搜索 */
  historyList?: string[]
  /** 热门搜索 */
  hotList?: string[]
  /** 是否显示历史区 */
  showHistory?: boolean
  /** 是否显示热门区 */
  showHot?: boolean
  /** 搜索结果（非空即结果态） */
  resultList?: any[]
  /** 是否已加载全部（结果态底部"没有更多"） */
  finished?: boolean
  /** 自动聚焦 */
  focused?: boolean
  /** 结果项文本字段 */
  itemField?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '搜索',
  searchText: '搜索',
  historyList: () => [],
  hotList: () => [],
  showHistory: true,
  showHot: true,
  resultList: () => [],
  finished: false,
  focused: false,
  itemField: 'title',
})

const emit = defineEmits<{
  input: [keyword: string]
  search: [keyword: string]
  clearHistory: []
  deleteHistory: [keyword: string]
  hotClick: [keyword: string]
  itemClick: [item: any, index: number]
  clear: []
}>()

const keyword = ref('')
const searched = ref(false)
let inputTimer: ReturnType<typeof setTimeout> | undefined

function onInput(e: any) {
  keyword.value = e.detail.value
  if (inputTimer) clearTimeout(inputTimer)
  inputTimer = setTimeout(() => {
    emit('input', keyword.value.trim())
  }, 600)
}

function onSearch() {
  searched.value = true
  emit('search', keyword.value.trim())
}

function onClearKeyword() {
  keyword.value = ''
  searched.value = false
  emit('clear')
}

function onTagClick(keyword: string) {
  searched.value = true
  emit('hotClick', keyword)
  // 点击历史/热门标签同时触发一次搜索
  emit('search', keyword)
}

function itemKey(item: any, index: number) {
  return item && item.id != null ? item.id : index
}

function itemText(item: any) {
  return item && item[props.itemField] != null ? item[props.itemField] : String(item)
}
</script>

<style lang="scss" scoped>
.search-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-bg-page);
}

/* ---- 搜索栏 ---- */
.sp-bar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-bg-surface);
  border-bottom: 1rpx solid var(--color-border-light);
}

.sp-search {
  flex: 1;
  display: flex;
  align-items: center;
  height: var(--height-btn-md);
  padding: 0 var(--spacing-md);
  border-radius: var(--radius-btn);
  background: var(--color-bg-page);
}

.sp-search-icon {
  margin-right: var(--spacing-xs);
  font-size: var(--font-lg);
  color: var(--color-text-tertiary);
  line-height: 1;
}

.sp-input {
  flex: 1;
  min-width: 0;
  font-size: var(--font-md);
  color: var(--color-text-primary);
}

.sp-input-ph {
  color: var(--color-text-tertiary);
}

.sp-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--height-btn-sm);
  height: var(--height-btn-sm);
}

.sp-clear-icon {
  font-size: var(--font-lg);
  color: var(--color-text-tertiary);
  line-height: 1;
}

.sp-action {
  margin-left: var(--spacing-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 88rpx;
  min-height: 88rpx;
}

.sp-action-text {
  font-size: var(--font-md);
  color: var(--color-primary);
}

/* ---- 内容区 ---- */
.sp-body {
  flex: 1;
  min-height: 0;
}

.sp-section {
  padding: var(--spacing-lg) var(--spacing-lg) 0;
}

.sp-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sp-section-title {
  font-size: var(--font-md);
  font-weight: 600;
  color: var(--color-text-primary);
}

.sp-section-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 88rpx;
  min-height: 88rpx;
  margin: calc(-1 * var(--spacing-sm)) 0;
}

.sp-section-clear-icon {
  font-size: var(--font-md);
  color: var(--color-text-tertiary);
}

.sp-tags {
  display: flex;
  flex-wrap: wrap;
  margin-top: var(--spacing-md);
}

.sp-tag {
  margin-right: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  display: flex;
  align-items: center;
  height: var(--height-btn-sm);
  padding: 0 var(--spacing-md);
  border-radius: var(--radius-tag);
  background: var(--color-bg-surface);

  &.is-hot {
    background: var(--color-bg-tinted);
  }
}

.sp-tag-text {
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
}

.sp-tag-del {
  margin-left: var(--spacing-xs);
  font-size: var(--font-sm);
  color: var(--color-text-tertiary);
  line-height: 1;
}

/* ---- 结果 ---- */
.sp-results {
  padding: var(--spacing-md) var(--spacing-lg) var(--spacing-2xl);
}

.sp-result-item {
  padding: var(--spacing-md) 0;
  border-bottom: 1rpx solid var(--color-border-light);

  &:active {
    opacity: 0.7;
  }
}

.sp-result-text {
  font-size: var(--font-md);
  color: var(--color-text-primary);
}

.sp-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3xl) 0;
}

.sp-empty-text {
  font-size: var(--font-md);
  color: var(--color-text-tertiary);
}

.sp-finished {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md) 0;
}

.sp-finished-text {
  font-size: var(--font-sm);
  color: var(--color-text-tertiary);
}
</style>
