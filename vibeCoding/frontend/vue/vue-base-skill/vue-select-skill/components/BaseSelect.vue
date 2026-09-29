<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import type { SelectProps, SelectEmits, SelectOption } from '../types/select';

const props = withDefaults(defineProps<SelectProps>(), {
  options: () => [],
  placeholder: '请选择',
  disabled: false,
  multiple: false,
  searchable: false,
  clearable: false,
  size: 'md',
  maxTagCount: 3,
});

const emit = defineEmits<SelectEmits>();

const isOpen = ref(false);
const searchQuery = ref('');
const triggerRef = ref<HTMLDivElement>();
const dropdownRef = ref<HTMLDivElement>();
const searchInputRef = ref<HTMLDivElement>();

const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options;
  const query = searchQuery.value.toLowerCase();
  return props.options.filter((opt) => opt.label.toLowerCase().includes(query));
});

const selectedLabel = computed(() => {
  if (props.multiple) return '';
  const opt = props.options.find((o) => o.value === props.modelValue);
  return opt?.label ?? '';
});

const selectedTags = computed(() => {
  if (!props.multiple || !Array.isArray(props.modelValue)) return [];
  return props.modelValue.slice(0, props.maxTagCount).map((val) => {
    const opt = props.options.find((o) => o.value === val);
    return { value: val, label: opt?.label ?? String(val) };
  });
});

const overflowCount = computed(() => {
  if (!props.multiple || !Array.isArray(props.modelValue)) return 0;
  return Math.max(0, props.modelValue.length - props.maxTagCount);
});

const hasValue = computed(() => {
  if (props.multiple) return Array.isArray(props.modelValue) && props.modelValue.length > 0;
  return props.modelValue !== undefined && props.modelValue !== null && props.modelValue !== '';
});

function toggle() {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
  if (isOpen.value && props.searchable) {
    setTimeout(() => searchInputRef.value?.focus(), 0);
  }
}

function close() {
  isOpen.value = false;
  searchQuery.value = '';
}

function isSelected(val: unknown): boolean {
  if (props.multiple) {
    return Array.isArray(props.modelValue) && props.modelValue.includes(val);
  }
  return props.modelValue === val;
}

function handleSelect(opt: SelectOption) {
  if (opt.disabled || props.disabled) return;

  if (props.multiple) {
    const arr = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
    const idx = arr.indexOf(opt.value);
    if (idx > -1) {
      arr.splice(idx, 1);
    } else {
      arr.push(opt.value);
    }
    emit('update:modelValue', arr);
    emit('change', arr);
  } else {
    emit('update:modelValue', opt.value);
    emit('change', opt.value);
    close();
  }
}

function removeTag(val: unknown) {
  if (props.disabled) return;
  const arr = [...(props.modelValue as unknown[])];
  const idx = arr.indexOf(val);
  if (idx > -1) {
    arr.splice(idx, 1);
    emit('update:modelValue', arr);
    emit('change', arr);
  }
}

function handleClear() {
  if (props.multiple) {
    emit('update:modelValue', []);
  } else {
    emit('update:modelValue', undefined);
  }
  emit('clear');
}

function handleClickOutside(e: Event) {
  const target = e.target as Node;
  if (triggerRef.value?.contains(target)) return;
  if (dropdownRef.value?.contains(target)) return;
  close();
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div
    ref="triggerRef"
    class="base-select"
    :class="[
      `base-select--${size}`,
      {
        'base-select--open': isOpen,
        'base-select--disabled': disabled,
        'base-select--multiple': multiple,
      },
    ]"
    @click="toggle"
  >
    <div class="base-select__trigger">
      <template v-if="multiple && selectedTags.length > 0">
        <span
          v-for="tag in selectedTags"
          :key="String(tag.value)"
          class="base-select__tag"
          @click.stop
        >
          {{ tag.label }}
          <span class="base-select__tag-close" @click.stop="removeTag(tag.value)">x</span>
        </span>
        <span v-if="overflowCount > 0" class="base-select__tag-overflow">
          +{{ overflowCount }}
        </span>
      </template>

      <span v-else-if="selectedLabel" class="base-select__value">
        {{ selectedLabel }}
      </span>

      <span v-else class="base-select__placeholder">{{ placeholder }}</span>

      <div
        v-if="searchable && isOpen"
        ref="searchInputRef"
        class="base-select__search"
        role="textbox"
        contenteditable="true"
        :data-placeholder="placeholder"
        @click.stop
        @input="searchQuery = ($event.target as HTMLElement).textContent || ''"
        @keydown.escape="close"
      />

      <span
        v-if="clearable && hasValue"
        class="base-select__clear"
        role="button"
        @click.stop="handleClear"
      >
        x
      </span>

      <span class="base-select__arrow" :class="{ 'base-select__arrow--up': isOpen }">v</span>
    </div>

    <!-- 下拉框直接放在组件内，避免 Teleport 定位问题 -->
    <div
      v-if="isOpen"
      ref="dropdownRef"
      class="base-select__dropdown"
    >
      <div v-if="filteredOptions.length === 0" class="base-select__empty">
        暂无数据
      </div>

      <div
        v-for="opt in filteredOptions"
        :key="String(opt.value)"
        class="base-select__option"
        :class="{
          'base-select__option--selected': isSelected(opt.value),
          'base-select__option--disabled': opt.disabled,
        }"
        @click.stop="handleSelect(opt)"
      >
        <span>{{ opt.label }}</span>
        <span v-if="isSelected(opt.value)" class="base-select__check">*</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.base-select {
  position: relative;
  display: inline-block;
  width: 240px;
  cursor: pointer;
}

.base-select--disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.base-select__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--height-input-md, 40px);
  padding: 0 32px 0 12px;
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #dcdfe6);
  border-radius: var(--radius-md, 8px);
  transition: all 0.2s;
}

.base-select:hover .base-select__trigger {
  border-color: var(--color-text-tertiary, #c0c4cc);
}

.base-select--open .base-select__trigger {
  border-color: var(--color-primary, #409eff);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.base-select__placeholder {
  color: var(--color-text-tertiary, #c0c4cc);
}

.base-select__value {
  color: var(--color-text, #606266);
  font-size: var(--font-base, 14px);
}

.base-select__tag {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  background: var(--color-bg-secondary, #f0f2f5);
  border-radius: var(--radius-md, 4px);
  font-size: 12px;
  color: var(--color-text, #606266);
}

.base-select__tag-close {
  margin-left: 4px;
  cursor: pointer;
  color: var(--color-text-secondary, #909399);
}

.base-select__tag-close:hover {
  color: var(--color-primary, #409eff);
}

.base-select__tag-overflow {
  font-size: 12px;
  color: var(--color-text-secondary, #909399);
}

.base-select__arrow {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-tertiary, #c0c4cc);
  font-size: 10px;
}

.base-select__arrow--up {
  transform: translateY(-50%) rotate(180deg);
}

.base-select__clear {
  margin-right: 4px;
  cursor: pointer;
  color: var(--color-text-secondary, #909399);
}

.base-select__clear:hover {
  color: var(--color-primary, #409eff);
}

.base-select__search {
  flex: 1;
  min-width: 60px;
  border: none;
  outline: none;
  font-size: var(--font-base, 14px);
}

.base-select__search:empty::before {
  content: attr(data-placeholder);
  color: var(--color-text-tertiary, #c0c4cc);
}

.base-select__dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  max-height: 240px;
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e4e7ed);
  border-radius: var(--radius-md, 8px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  z-index: 1001;
}

.base-select__empty {
  padding: 20px;
  text-align: center;
  color: var(--color-text-secondary, #909399);
}

.base-select__option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.15s;
}

.base-select__option:hover {
  background: var(--color-bg-secondary, #f5f7fa);
}

.base-select__option--selected {
  color: var(--color-primary, #409eff);
  background: var(--color-primary-light, #ecf5ff);
}

.base-select__option--disabled {
  color: var(--color-text-tertiary, #c0c4cc);
  cursor: not-allowed;
}

.base-select__check {
  font-weight: bold;
}

.base-select--sm .base-select__trigger { height: 32px; }
.base-select--md .base-select__trigger { height: 40px; }
.base-select--lg .base-select__trigger { height: 48px; }
</style>