<template>
  <view class="count-down">
    <template v-if="!isEnd">
      <view v-if="showDay && day > 0" class="count-down__item">
        <text class="count-down__num">{{ dayText }}</text>
        <text v-if="showUnit" class="count-down__unit">天</text>
      </view>
      <view class="count-down__item">
        <text class="count-down__num">{{ hourText }}</text>
        <text v-if="showUnit" class="count-down__unit">:</text>
      </view>
      <view class="count-down__item">
        <text class="count-down__num">{{ minuteText }}</text>
        <text v-if="showUnit" class="count-down__unit">:</text>
      </view>
      <view class="count-down__item">
        <text class="count-down__num">{{ secondText }}</text>
      </view>
    </template>
    <view v-else class="count-down__end">
      <slot name="end">{{ endText }}</slot>
    </view>
  </view>
</template>

<script>
export default {
  name: 'CountDown',
  props: {
    timestamp: {
      type: Number,
      default: 0
    },
    showDay: {
      type: Boolean,
      default: false
    },
    showUnit: {
      type: Boolean,
      default: true
    },
    endText: {
      type: String,
      default: '已结束'
    },
    autostart: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      timer: null,
      remaining: 0,
      isEnd: false
    }
  },
  computed: {
    day() {
      return Math.floor(this.remaining / (1000 * 60 * 60 * 24))
    },
    hour() {
      return Math.floor((this.remaining / (1000 * 60 * 60)) % 24)
    },
    minute() {
      return Math.floor((this.remaining / (1000 * 60)) % 60)
    },
    second() {
      return Math.floor((this.remaining / 1000) % 60)
    },
    dayText() {
      return String(this.day).padStart(2, '0')
    },
    hourText() {
      return String(this.hour).padStart(2, '0')
    },
    minuteText() {
      return String(this.minute).padStart(2, '0')
    },
    secondText() {
      return String(this.second).padStart(2, '0')
    }
  },
  mounted() {
    if (this.autostart && this.timestamp) {
      this.start()
    }
  },
  beforeUnmount() {
    this.stop()
  },
  methods: {
    start() {
      this.remaining = this.timestamp - Date.now()
      if (this.remaining <= 0) {
        this.isEnd = true
        return
      }
      this.timer = setInterval(() => {
        this.remaining -= 1000
        if (this.remaining <= 0) {
          this.stop()
          this.isEnd = true
          this.$emit('end')
        }
      }, 1000)
    },
    stop() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.count-down {
  display: inline-flex;
  align-items: center;

  &__item {
    display: flex;
    align-items: center;
  }

  &__num {
    display: inline-block;
    min-width: 20px;
    padding: 2px 4px;
    background: #fff;
    color: #333;
    font-size: 14px;
    font-weight: 600;
    text-align: center;
  }

  &__unit {
    margin: 0 2px;
    font-size: 14px;
    color: #333;
  }

  &__end {
    font-size: 14px;
    color: #999;
  }
}
</style>
