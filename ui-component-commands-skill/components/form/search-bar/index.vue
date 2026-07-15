<template>
  <view class="search-bar">
    <view class="search-bar__wrap">
      <view class="search-bar__icon">🔍</view>
      <input
        v-model="value"
        class="search-bar__input"
        type="text"
        :placeholder="placeholder"
        :disabled="disabled"
        @input="handleInput"
        @confirm="handleSearch"
      />
      <view v-if="value && clearable" class="search-bar__clear" @click="handleClear">×</view>
    </view>
    <view v-if="showCancel" class="search-bar__cancel" @click="handleCancel">取消</view>
  </view>
</template>

<script>
export default {
  name: 'SearchBar',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '搜索'
    },
    clearable: {
      type: Boolean,
      default: true
    },
    showCancel: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      value: this.modelValue
    }
  },
  watch: {
    modelValue(val) {
      this.value = val
    }
  },
  methods: {
    handleInput(e) {
      this.$emit('update:modelValue', e.detail.value)
      this.$emit('input', e.detail.value)
    },
    handleSearch() {
      this.$emit('search', this.value)
    },
    handleClear() {
      this.value = ''
      this.$emit('update:modelValue', '')
      this.$emit('clear')
    },
    handleCancel() {
      this.value = ''
      this.$emit('update:modelValue', '')
      this.$emit('cancel')
    }
  }
}
</script>

<style lang="scss" scoped>
.search-bar {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background: var(--bg-secondary, #f2f2f7);

  &__wrap {
    flex: 1;
    display: flex;
    align-items: center;
    height: 36px;
    background: #fff;
    border-radius: 18px;
    padding: 0 12px;
  }

  &__icon {
    margin-right: 8px;
    font-size: 14px;
  }

  &__input {
    flex: 1;
    font-size: 14px;
    color: var(--text-primary, #1C1C1E);

    &::placeholder {
      color: var(--text-secondary, #999);
    }
  }

  &__clear {
    padding: 4px;
    font-size: 16px;
    color: #999;
  }

  &__cancel {
    margin-left: 12px;
    font-size: 14px;
    color: var(--primary, #007AFF);
  }
}
</style>
