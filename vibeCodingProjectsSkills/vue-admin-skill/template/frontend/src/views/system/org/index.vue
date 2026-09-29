<template>
  <div class="page">
    <PageHeader title="组织管理" description="维护组织树、负责人与联系方式">
      <template #actions>
        <base-button v-permission="'system:org:create'" size="sm" type="primary" @click="openCreate(null)">新增根组织</base-button>
      </template>
    </PageHeader>

    <base-card>
      <div class="org-layout">
        <!-- 左：组织树 -->
        <div class="org-layout__tree">
          <base-tree :data="treeData" default-expand-all @node-click="onNodeClick" />
        </div>

        <!-- 右：编辑表单（表单必须包在 <base-form> 内，form-contract §十三 R1） -->
        <div class="org-layout__form">
          <base-form v-if="editing" :model="form" :rules="rules" @submit="handleSave">
            <base-form-item label="名称" prop="name">
              <base-input v-model="form.name" placeholder="请输入组织名称" />
            </base-form-item>
            <base-form-item label="上级组织" prop="parentId">
              <base-select v-model="form.parentId" :options="parentOptions" clearable placeholder="顶级组织" />
            </base-form-item>
            <base-form-item label="负责人" prop="leaderUserId">
              <base-input v-model="form.leaderUserId" placeholder="请输入负责人用户 ID" />
            </base-form-item>
            <!-- 电话 / 邮箱同属文本类，走共享规则（契约 subType: 'phone' / 'email'） -->
            <base-form-item label="联系电话" prop="phone">
              <base-input v-model="form.phone" placeholder="请输入联系电话" />
            </base-form-item>
            <base-form-item label="邮箱" prop="email">
              <base-input v-model="form.email" placeholder="请输入邮箱" />
            </base-form-item>
            <base-form-item label="排序" prop="sortOrder">
              <base-input v-model="form.sortOrder" placeholder="请输入排序号" />
            </base-form-item>
            <base-form-item label="状态" prop="status">
              <!-- 后端 status 是 Integer(0/1)，数值型字段禁止用 switch（form-contract §十三 R3） -->
              <base-select v-model="form.status" :options="statusOptions" />
            </base-form-item>

            <div class="form-actions">
              <base-button v-permission="'system:org:edit'" type="primary" native-type="submit">保存</base-button>
              <base-button v-if="form.id" v-permission="'system:org:delete'" type="danger" @click="handleDelete">删除</base-button>
            </div>
          </base-form>
          <p v-else class="text-secondary">请选择左侧组织查看详情</p>
        </div>
      </div>
    </base-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { BaseCard } from 'vue-card-skill';
import { BaseButton } from 'vue-button-skill';
import { BaseTree } from 'vue-tree-skill';
import { BaseForm, BaseFormItem } from 'vue-form-skill';
import { BaseInput } from 'vue-input-skill';
import { BaseSelect } from 'vue-select-skill';
import PageHeader from '@/components/PageHeader.vue';
import * as orgApi from '@/api/org';
import { STATUS_OPTIONS, emailRule, phoneRule, required } from '@/utils/validation';

const tree = ref<orgApi.OrgVO[]>([]);
const editing = ref(false);

const form = reactive({
  id: undefined as number | undefined,
  parentId: null as number | null,
  name: '',
  leaderUserId: '',
  phone: '',
  email: '',
  sortOrder: '1',
  status: 1
});

const rules: FormRules = {
  name: [required('请输入组织名称')],
  phone: [phoneRule],
  email: [emailRule],
  status: [required('请选择状态', 'change')]
};

/** 上级组织选项（一级组织，排除自身以免成环） */
const parentOptions = computed(() =>
  tree.value
    .filter((node) => node.id !== form.id)
    .map((node) => ({ label: node.name, value: node.id }))
);

const statusOptions = STATUS_OPTIONS;

const treeData = computed(() =>
  tree.value.map((n) => ({
    id: String(n.id),
    label: n.name,
    children: n.children?.map((c) => ({
      id: String(c.id),
      label: c.name
    }))
  }))
);

async function fetchTree() {
  tree.value = await orgApi.getOrgTree();
}

function onNodeClick(node: { id: string | number }) {
  const id = Number(node.id);
  const found = findNode(tree.value, id);
  if (!found) return;
  editing.value = true;
  Object.assign(form, {
    id: found.id,
    parentId: found.parentId,
    name: found.name,
    leaderUserId: found.leaderUserId == null ? '' : String(found.leaderUserId),
    phone: found.phone ?? '',
    email: found.email ?? '',
    sortOrder: String(found.sortOrder ?? 1),
    status: found.status
  });
}

function findNode(list: orgApi.OrgVO[], id: number): orgApi.OrgVO | null {
  for (const n of list) {
    if (n.id === id) return n;
    if (n.children?.length) {
      const r = findNode(n.children, id);
      if (r) return r;
    }
  }
  return null;
}

function openCreate(parentId: number | null) {
  editing.value = true;
  Object.assign(form, {
    id: undefined,
    parentId,
    name: '',
    leaderUserId: '',
    phone: '',
    email: '',
    sortOrder: '1',
    status: 1
  });
}

async function handleSave() {
  const payload = {
    parentId: form.parentId,
    name: form.name,
    leaderUserId: form.leaderUserId ? Number(form.leaderUserId) : null,
    phone: form.phone || null,
    email: form.email || null,
    sortOrder: Number(form.sortOrder) || 0,
    status: form.status
  };
  if (form.id) {
    await orgApi.updateOrg(form.id, payload);
  } else {
    await orgApi.createOrg(payload);
  }
  await fetchTree();
}

async function handleDelete() {
  if (!form.id) return;
  if (!confirm(`确认删除组织 ${form.name}？`)) return;
  await orgApi.deleteOrg(form.id);
  editing.value = false;
  await fetchTree();
}

onMounted(fetchTree);
</script>

<style scoped>
.page {
  padding: var(--space-4);
}
.org-layout {
  display: flex;
  gap: var(--space-4);
}
.org-layout__tree {
  flex: 0 0 320px;
  border-right: 1px solid var(--color-border);
  padding-right: var(--space-4);
}
.org-layout__form {
  flex: 1;
}
.form-actions {
  display: flex;
  gap: var(--space-2);
}
</style>
