<template>
  <view
    :class="['user-avatar', `user-avatar--${size}`]"
    :style="avatarStyle"
    @click="handleClick"
  >
    <image v-if="src" :src="src" mode="aspectFill" class="user-avatar__img" />
    <text v-else class="user-avatar__text">{{ showText }}</text>
  </view>
</template>

<script>
export default {
  name: 'UserAvatar',
  props: {
    src: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'medium',
      validator: v => ['small', 'medium', 'large', 'xlarge'].includes(v)
    },
    round: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    showText() {
      if (!this.name) return '?'
      return this.name.slice(-2)
    },
    avatarStyle() {
      const sizeMap = {
        small: '40px',
        medium: '50px',
        large: '70px',
        xlarge: '100px'
      }
      return {
        width: sizeMap[this.size],
        height: sizeMap[this.size],
        borderRadius: this.round ? '50%' : '8px'
      }
    }
  },
  methods: {
    handleClick() {
      this.$emit('click')
    }
  }
}
</script>

<style lang="scss" scoped>
.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary, #f2f2f7);
  overflow: hidden;

  &__img {
    width: 100%;
    height: 100%;
  }

  &__text {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary, #6C6C70);
  }
}
</style>
