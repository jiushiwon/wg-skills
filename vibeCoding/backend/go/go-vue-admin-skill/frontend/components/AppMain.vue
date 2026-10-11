<script setup lang="ts">
/**
 * AppMain — 内容区（router-view 挂载点）
 * 自动避开 Header 和 Tabs 的高度
 */
interface Props {
  headerHeight: number;
  tabsHeight?: number;
}

withDefaults(defineProps<Props>(), {
  tabsHeight: 0,
});
</script>

<template>
  <main
    class="app-main"
    :style="{ paddingTop: (headerHeight + tabsHeight) + 'px' }"
  >
    <div class="app-main__content">
      <slot />
    </div>
  </main>
</template>
