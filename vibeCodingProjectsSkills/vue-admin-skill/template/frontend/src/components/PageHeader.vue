<!--
  PageHeader — 页面级标题 + 描述 + 操作区

  替代原来嵌在 BaseCard #header 里的"页面标题"，把页面级元信息和
  内容容器（BaseCard）解耦，符合 vue-base-skill 容器原则。

  用法：
  <PageHeader title="用户管理" description="管理系统用户、分配角色与重置密码">
    <template #actions>
      <BaseButton type="primary" @click="onCreate">新增用户</BaseButton>
    </template>
  </PageHeader>
-->
<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <header class="page-header">
    <div class="page-header__main">
      <h2 class="page-header__title">{{ title }}</h2>
      <p v-if="description" class="page-header__description">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="page-header__actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}
.page-header__main {
  min-width: 0;
  flex: 1;
}
.page-header__title {
  margin: 0;
  font-size: var(--font-xl);
  font-weight: var(--weight-semibold);
  color: var(--color-text);
  line-height: 1.3;
}
.page-header__description {
  margin: var(--space-1) 0 0;
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
  line-height: 1.5;
}
.page-header__actions {
  display: flex;
  gap: var(--space-2);
  flex-shrink: 0;
  align-items: center;
}
</style>