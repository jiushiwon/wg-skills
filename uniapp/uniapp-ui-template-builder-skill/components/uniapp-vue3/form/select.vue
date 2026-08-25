<template>
  <view class="t-select" :class="{ 't-select--disabled': disabled }">
    <view
      class="t-select__trigger"
      @click="handleOpen"
    >
      <view class="t-select__value">
        <text v-if="selectedLabel" class="t-select__placeholder--hidden">
          {{ selectedLabel }}
        </text>
        <text v-else class="t-select__placeholder">
          {{ placeholder }}
        </text>
      </view>
      <view class="t-select__arrow" :class="{ 't-select__arrow--open': visible }">
        ▼
      </view>
    </view>

    <!-- 下拉选项 -->
    <view v-if="visible" class="t-select__dropdown">
      <view class="t-select__dropdown-inner">
        <view
          v-for="option in options"
          :key="option[valueKey]"
          class="t-select__option"
          :class="{
            't-select__option--selected': option[valueKey] === modelValue,
            't-select__option--disabled': option.disabled
          }"
          @click.stop="handleSelect(option)"
        >
          <text>{{ option[labelKey] }}</text>
          <text v-if="option[valueKey] === modelValue" class="t-select__check">✓</text>
        </view>

        <!-- 空状态 -->
        <view v-if="!options.length" class="t-select__empty">
          暂无数据
        </view>
      </view>
    </view>

    <!-- 遮罩层 -->
    <view
      v-if="visible"
      class="t-select__mask"
      @click="handleClose"
    />
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: '请选择'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  labelKey: {
    type: String,
    default: 'label'
  },
  valueKey: {
    type: String,
    default: 'value'
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'visible-change'])

const visible = ref(false)

// 选中的显示文本
const selectedLabel = computed(() => {
  if (!props.modelValue) return ''

  const selected = props.options.find(
    opt => opt[props.valueKey] === props.modelValue
  )
  return selected ? selected[props.labelKey] : ''
})

// 打开
function handleOpen() {
  if (props.disabled) return
  visible.value = true
  emit('visible-change', true)
}

// 关闭
function handleClose() {
  visible.value = false
  emit('visible-change', false)
}

// 选中
function handleSelect(option) {
  if (option.disabled) return

  emit('update:modelValue', option[props.valueKey])
  emit('change', option)
  handleClose()
}

// 点击遮罩关闭
watch(() => visible.value, (val) => {
  if (!val) {
    emit('visible-change', false)
  }
})
</script>

<style lang="scss" scoped>
.t-select {
  position: relative;
  width: 100%;
}

.t-select__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--input-padding-y, 8px) var(--input-padding-x, 12px);
  background: var(--color-bg-surface, #fff);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-input, 8px);
  cursor: pointer;
  transition: all 0.2s ease;
}

.t-select__trigger:active {
  border-color: var(--color-primary, #333);
}

.t-select--disabled .t-select__trigger {
  background: var(--color-bg-surface-hover, #f9fafb);
  cursor: not-allowed;
  opacity: 0.6;
}

.t-select__value {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.t-select__placeholder {
  color: var(--color-text-placeholder, #9ca3af);
}

.t-select__placeholder--hidden {
  color: var(--color-text-primary, #111827);
}

.t-select__arrow {
  margin-left: var(--space-2, 8px);
  font-size: 10px;
  color: var(--color-text-tertiary, #9ca3af);
  transition: transform 0.2s ease;
}

.t-select__arrow--open {
  transform: rotate(180deg);
}

.t-select__dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 100;
  max-height: 200px;
}

.t-select__dropdown-inner {
  background: var(--color-bg-surface, #fff);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  box-shadow: var(--shadow-popup, 0 4px 12px rgba(0, 0, 0, 0.1));
  overflow: auto;
}

.t-select__option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2, 8px) var(--space-3, 12px);
  font-size: var(--text-base, 16px);
  color: var(--color-text-primary, #111827);
  transition: background 0.15s ease;
}

.t-select__option:active {
  background: var(--color-bg-surface-hover, #f9fafb);
}

.t-select__option--selected {
  color: var(--color-primary, #333);
  font-weight: 500;
  background: var(--primary-50, #f9fafb);
}

.t-select__option--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.t-select__check {
  font-size: var(--text-sm, 14px);
  color: var(--color-primary, #333);
}

.t-select__empty {
  padding: var(--space-4, 16px);
  text-align: center;
  color: var(--color-text-tertiary, #9ca3af);
  font-size: var(--text-sm, 14px);
}

.t-select__mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
}
</style>

<!-- 使用示例 -->
<!--
<template>
  <t-select
    v-model="value"
    :options="options"
    placeholder="请选择城市"
    @change="handleChange"
  />
</template>

<script setup>
import { ref } from 'vue'
import TSelect from '@/components/uniapp-vue3/form/select.vue'

const value = ref('')

const options = [
  { label: '北京', value: 'beijing' },
  { label: '上海', value: 'shanghai' },
  { label: '广州', value: 'guangzhou' },
  { label: '深圳', value: 'shenzhen' }
]

function handleChange(option) {
  console.log('选中:', option)
}
</script>
-->
