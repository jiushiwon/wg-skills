<template>
  <view class="top-tab">
    <scroll-view
      class="top-tab__scroll"
      scroll-x
      :scroll-left="scrollLeft"
      :scroll-with-animation="true"
    >
      <view class="top-tab__wrap">
        <view
          v-for="(tab, index) in tabs"
          :key="index"
          :class="['top-tab__item', { 'top-tab__item--active': current === index }]"
          :style="{ color: current === index ? activeColor : inactiveColor }"
          @click="handleClick(index)"
        >
          <text>{{ tab.name || tab }}</text>
          <view v-if="current === index" class="top-tab__line" :style="{ background: activeColor }" />
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  name: 'TopTab',
  props: {
    tabs: {
      type: Array,
      default: () => []
    },
    current: {
      type: Number,
      default: 0
    },
    scroll: {
      type: Boolean,
      default: true
    },
    activeColor: {
      type: String,
      default: '#007AFF'
    },
    inactiveColor: {
      type: String,
      default: '#6C6C70'
    }
  },
  data() {
    return {
      scrollLeft: 0
    }
  },
  watch: {
    current: {
      immediate: true,
      handler(val) {
        this.$nextTick(() => {
          this.calcScrollLeft(val)
        })
      }
    }
  },
  methods: {
    handleClick(index) {
      if (this.current !== index) {
        this.$emit('change', index)
        this.$emit('update:current', index)
      }
    },
    calcScrollLeft(index) {
      // 简单计算，实际可能需要更精确的逻辑
      this.scrollLeft = Math.max(0, (index - 1) * 80)
    }
  }
}
</script>

<style lang="scss" scoped>
.top-tab {
  background: var(--bg-primary, #fff);

  &__scroll {
    white-space: nowrap;
  }

  &__wrap {
    display: inline-flex;
    padding: 0 16px;
  }

  &__item {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px 16px;
    font-size: 15px;
    transition: color 0.2s;
  }

  &__line {
    position: absolute;
    bottom: 0;
    width: 24px;
    height: 2px;
    border-radius: 1px;
  }
}
</style>
