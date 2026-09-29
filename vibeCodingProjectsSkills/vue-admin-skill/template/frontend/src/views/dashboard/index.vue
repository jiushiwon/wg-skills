<template>
  <div class="dashboard">
    <PageHeader
      :title="`欢迎回来，${userInfo?.nickname || userInfo?.username}`"
      description="祝你工作愉快"
    >
      <template #actions>
        <base-tag type="success" variant="light">{{ today }}</base-tag>
        <base-button size="sm" @click="refresh">刷新</base-button>
      </template>
    </PageHeader>

    <div class="kpi-grid">
      <base-card v-for="kpi in kpis" :key="kpi.label">
        <div class="kpi-card">
          <div class="kpi-icon" :style="{ background: kpi.color }">
            <!-- KPI 图标同样走 BaseIcon（图标名，见 frontend/ICONS.md） -->
            <BaseIcon :name="kpi.icon" :size="24" />
          </div>
          <div class="kpi-content">
            <div class="kpi-label text-secondary">{{ kpi.label }}</div>
            <div class="kpi-value">{{ kpi.value }}</div>
          </div>
        </div>
      </base-card>
    </div>

    <base-card>
      <template #header>
        <span class="base-card__title">系统说明</span>
      </template>
      <div class="info-block">
        <div class="info-line">本模板基于 wg-skills 技能矩阵，软链接 vue-base-skill 下属技能包</div>
        <div class="info-line">登录后默认账号 admin / admin123，可使用 user_admin 或 demo</div>
        <div class="info-line">侧边栏菜单根据后端 /api/auth/menus 动态渲染</div>
      </div>
    </base-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { BaseCard } from 'vue-card-skill';
import { BaseButton } from 'vue-button-skill';
import { BaseTag } from 'vue-tag-skill';
import PageHeader from '@/components/PageHeader.vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();
const userInfo = computed(() => userStore.userInfo);

const today = new Date().toLocaleDateString('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long'
});

const kpis = [
  { label: '今日访问', value: '1,286', icon: 'bar-chart-3', color: 'var(--color-primary)' },
  { label: '在线用户', value: '342', icon: 'users', color: 'var(--color-success)' },
  { label: '待办事项', value: '18', icon: 'settings', color: 'var(--color-warning)' },
  { label: '系统消息', value: '7', icon: 'alert-triangle', color: 'var(--color-danger)' }
];

function refresh() {
  // ponytail: 占位刷新，后续接 useUserStore.fetchUserInfo
  console.log('refresh dashboard');
}
</script>

<style scoped>
.dashboard {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-3);
}
.kpi-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.kpi-icon {
  width: var(--space-12);
  height: var(--space-12);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-inverse);
}
.kpi-label {
  font-size: var(--font-sm);
  margin-bottom: var(--space-1);
}
.kpi-value {
  font-size: var(--font-2xl);
  font-weight: 600;
}
.info-block {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  color: var(--color-text-secondary);
  line-height: 1.8;
}
</style>
