<template>
  <view :class="['tab-bar', { 'tab-bar--fixed': fixed }]" :style="tabBarStyle">
    <view
      v-for="(tab, index) in tabs"
      :key="index"
      :class="['tab-bar__item', { 'tab-bar__item--active': current === index }]"
      @click="handleClick(index)"
    >
      <image
        v-if="tab.icon || tab.activeIcon"
        :src="current === index && tab.activeIcon ? tab.activeIcon : tab.icon"
        class="tab-bar__icon"
        mode="aspectFit"
      />
      <text :class="['tab-bar__text', { 'tab-bar__text--active': current === index }]">
        {{ tab.name }}
      </text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'TabBar',
  props: {
    tabs: {
      type: Array,
      default: () => []
    },
    current: {
      type: Number,
      default: 0
    },
    fixed: {
      type: Boolean,
      default: false
    },
    background: {
      type: String,
      default: '#ffffff'
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
  computed: {
    tabBarStyle() {
      return {
        background: this.background,
        '--active-color': this.activeColor,
        '--inactive-color': this.inactiveColor
      }
    }
  },
  methods: {
    handleClick(index) {
      if (this.current !== index) {
        this.$emit('change', index)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.tab-bar {
  display: flex;
  height: 50px;
  padding-bottom: env(safe-area-inset-bottom);
  background: var(--bg-primary, #fff);
  border-top: 1px solid #eee;

  &--fixed {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1000;
  }

  &__item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
  }

  &__icon {
    width: 22px;
    height: 22px;
  }

  &__text {
    font-size: 10px;
    color: var(----inactive-color, #6C6C70);

    &--active {
      color: var(----active-color, #007AFF);
    }
  }
}
</style>
