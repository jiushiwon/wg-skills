<template>
  <view class="stepper">
    <view
      :class="['stepper__btn', { 'stepper__btn--disabled': value <= min }]"
      @click="handleMinus"
    >
      <text>-</text>
    </view>
    <input
      :value="value"
      class="stepper__input"
      type="number"
      :disabled="!editable"
      @input="handleInput"
      @blur="handleBlur"
    />
    <view
      :class="['stepper__btn', { 'stepper__btn--disabled': value >= max }]"
      @click="handlePlus"
    >
      <text>+</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'Stepper',
  props: {
    modelValue: {
      type: Number,
      default: 0
    },
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 999
    },
    step: {
      type: Number,
      default: 1
    },
    editable: {
      type: Boolean,
      default: true
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
    handleMinus() {
      const newVal = this.value - this.step
      if (newVal >= this.min) {
        this.updateValue(newVal)
      }
    },
    handlePlus() {
      const newVal = this.value + this.step
      if (newVal <= this.max) {
        this.updateValue(newVal)
      }
    },
    handleInput(e) {
      const val = parseInt(e.detail.value) || this.min
      this.value = val
    },
    handleBlur() {
      let val = this.value
      if (val < this.min) val = this.min
      if (val > this.max) val = this.max
      this.updateValue(val)
    },
    updateValue(val) {
      this.value = val
      this.$emit('update:modelValue', val)
      this.$emit('change', val)
    }
  }
}
</script>

<style lang="scss" scoped>
.stepper {
  display: inline-flex;
  align-items: center;
  border: 1px solid #eee;
  border-radius: 4px;
  overflow: hidden;

  &__btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    font-size: 18px;
    color: #333;

    &--disabled {
      color: #ccc;
    }
  }

  &__input {
    width: 50px;
    height: 32px;
    text-align: center;
    font-size: 14px;
    border-left: 1px solid #eee;
    border-right: 1px solid #eee;
    background: #fff;
  }
}
</style>
