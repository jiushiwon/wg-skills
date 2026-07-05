<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onPullDownRefresh } from '@dcloudio/uni-app';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppEmpty } from '@/components/AppEmpty';
import { AppNavbar } from '@/components/AppNavbar';
import { getDemoList, type DemoItem } from '@/api/modules/demo';
import { formatDateTime } from '@/utils/date';

const list = ref<DemoItem[]>([]);
const loading = ref(false);

async function loadList(refresh = false) {
  loading.value = true;
  try {
    const data = await getDemoList();
    list.value = data;
  } finally {
    loading.value = false;
    if (refresh) {
      uni.stopPullDownRefresh();
    }
  }
}

function goToForm(id?: string) {
  const url = id ? `/pages/form/index?id=${id}` : '/pages/form/index';
  uni.navigateTo({ url });
}

onMounted(() => loadList());

onPullDownRefresh(() => loadList(true));
</script>

<template>
  <view class="page list-page">
    <AppNavbar title="示例列表" :show-back="false" />

    <view class="list-page__header">
      <text class="list-page__title">
        数据列表
      </text>
      <AppButton
        type="primary"
        size="small"
        @click="goToForm()"
      >
        新增
      </AppButton>
    </view>

    <AppEmpty
      v-if="!loading && list.length === 0"
      title="暂无数据"
      description="点击右上角新增一条记录"
    />

    <view
      v-else
      class="list-page__content"
    >
      <AppCard
        v-for="item in list"
        :key="item.id"
        class="list-page__card"
        @tap="goToForm(item.id)"
      >
        <text class="list-page__card-title">
          {{ item.title }}
        </text>
        <text class="list-page__card-summary">
          {{ item.summary }}
        </text>
        <text class="list-page__card-time">
          {{ formatDateTime(item.createdAt) }}
        </text>
      </AppCard>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.list-page {
  min-height: 100vh;
  padding-top: var(--navbar-height, 0px);
  background: $color-bg-secondary;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $comp-page-padding;
  }

  &__title {
    font-size: $font-headline;
    font-weight: 600;
    color: $color-text-primary;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
    padding: 0 $comp-page-padding $comp-page-padding;
  }

  &__card {
    &:active {
      opacity: 0.8;
    }
  }

  &__card-title {
    display: block;
    font-size: $font-title;
    font-weight: 500;
    color: $color-text-primary;
    margin-bottom: $spacing-xs;
  }

  &__card-summary {
    display: block;
    font-size: $font-body;
    color: $color-text-secondary;
    margin-bottom: $spacing-sm;
  }

  &__card-time {
    display: block;
    font-size: $font-caption;
    color: $color-text-tertiary;
  }
}
</style>
