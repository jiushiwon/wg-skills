<template>
  <!-- 组件模板 -->
  <view :class="['组件名', className]" :style="style">
    <slot></slot>
  </view>
</template>

<script>
export default {
  name: '组件名',
  props: {
    className: {
      type: String,
      default: ''
    },
    style: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {}
  },
  methods: {}
}
</script>

<style lang="scss" scoped>
.组件名 {
  // 样式
}
</style>
