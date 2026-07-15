<template>
  <view class="input-field">
    <view v-if="label" class="input-field__label">{{ label }}</view>
    <view :class="['input-field__wrap', { 'input-field__wrap--error': error }]">
      <input
        v-model="value"
        class="input-field__input"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :maxlength="maxlength"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />
      <view v-if="clearable && value" class="input-field__clear" @click="handleClear">×</view>
    </view>
    <view v-if="error && errorMessage" class="input-field__error">{{ errorMessage }}</view>
  </view>
</template>

<script>
export default {
  name: 'InputField',
  props: {
    modelValue: {
      type: [String, Number],
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'text'
    },
    placeholder: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    maxlength: {
      type: Number,
      default: -1
    },
    clearable: {
      type: Boolean,
      default: false
    },
    error: {
      type: Boolean,
      default: false
    },
    errorMessage: {
      type: String,
      default: ''
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
    handleBlur(e) {
      this.$emit('blur', e)
    },
    handleFocus(e) {
      this.$emit('focus', e)
    },
    handleClear() {
      this.value = ''
      this.$emit('update:modelValue', '')
      this.$emit('clear')
    }
  }
}
</script>

<style lang="scss" scoped>
.input-field {
  padding: 12px 16px;
  background: var(--bg-primary, #fff);

  &__label {
    font-size: 14px;
    color: var(--text-primary, #1C1C1E);
    margin-bottom: 8px;
  }

  &__wrap {
    display: flex;
    align-items: center;
    height: 40px;
    background: var(--bg-secondary, #f2f2f7);
    border-radius: 8px;
    padding: 0 12px;

    &--error {
      border: 1px solid #ff4d4f;
    }
  }

  &__input {
    flex: 1;
    font-size: 15px;
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

  &__error {
    margin-top: 4px;
    font-size: 12px;
    color: #ff4d4f;
  }
}
</style>
