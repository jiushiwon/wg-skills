<template>
  <div class="page">
    <PageHeader title="菜单管理" description="配置路由、按钮权限与菜单层级">
      <template #actions>
        <base-button v-permission="'system:menu:create'" size="sm" type="primary" @click="openCreate(null)">新增根菜单</base-button>
      </template>
    </PageHeader>

    <base-card>
      <div class="menu-layout">
        <!-- 左：菜单树 -->
        <div class="menu-layout__tree">
          <base-tree :data="treeData" default-expand-all @node-click="onNodeClick as any" />
        </div>

        <!-- 右：编辑表单（表单必须包在 <base-form> 内，form-contract §十三 R1） -->
        <div class="menu-layout__form">
          <base-form v-if="editing" :model="form" :rules="rules as any" @submit="handleSave">
            <!-- R10：从前端 router 自动探测已注册路由，
                 选中后回填 name/path/component/permission（防止"路由有但菜单没"漂移） -->
            <div v-if="form.menuType === 'C' && availableRoutes.length > 0"
                 class="route-picker">
              <base-select
                v-model="pickedRoutePath"
                :options="routeOptions"
                placeholder="或从已注册路由导入（自动回填 path/component/permission/name）"
                clearable
                filterable
                @change="applyRoute"
              />
            </div>
            <base-form-item label="名称" prop="name">
              <base-input v-model="form.name" placeholder="请输入菜单名称" />
            </base-form-item>
            <base-form-item label="上级菜单" prop="parentId">
              <base-select v-model="form.parentId" :options="parentOptions" clearable placeholder="顶级菜单" />
            </base-form-item>
            <base-form-item label="路径" prop="path">
              <base-input v-model="form.path" placeholder="如 /system/user" />
            </base-form-item>
            <base-form-item label="组件" prop="component">
              <base-input v-model="form.component" placeholder="如 system/user/index" />
            </base-form-item>
            <base-form-item label="图标" prop="icon">
              <div class="icon-field">
                <base-input v-model="form.icon" placeholder="图标名，如 users" />
                <BaseIcon :name="form.icon || 'menu'" :size="18" />
              </div>
            </base-form-item>
            <base-form-item label="类型" prop="menuType">
              <base-select v-model="form.menuType" :options="menuTypeOptions" />
            </base-form-item>
            <base-form-item label="权限标识" prop="permission">
              <base-input v-model="form.permission" placeholder="三段式，如 system:user:list" />
            </base-form-item>
            <base-form-item label="排序" prop="sortOrder">
              <base-input v-model="form.sortOrder" placeholder="请输入排序号" />
            </base-form-item>
            <base-form-item label="状态" prop="status">
              <!-- 后端 status 是 Integer(0/1)，数值型字段禁止用 switch（form-contract §十三 R3） -->
              <base-select v-model="form.status" :options="statusOptions" />
            </base-form-item>

            <div class="form-actions">
              <base-button v-permission="'system:menu:edit'" type="primary" native-type="submit">保存</base-button>
              <base-button v-if="form.id" v-permission="'system:menu:delete'" type="danger" @click="handleDelete">删除</base-button>
            </div>
          </base-form>
          <p v-else class="text-secondary">请选择左侧菜单查看详情</p>
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
import BaseIcon from '@/components/icons/BaseIcon.vue';
import * as menuApi from '@/api/menu';
import router from '@/router';
import { STATUS_OPTIONS, required } from '@/utils/validation';

const tree = ref<menuApi.MenuVO[]>([]);
const editing = ref(false);

/** 表单模型与后端入参字段一一对应（camelCase） */
const form = reactive({
  id: undefined as number | undefined,
  parentId: null as number | null,
  name: '',
  path: '',
  component: '',
  icon: '',
  menuType: 'C' as menuApi.MenuType,
  permission: '',
  sortOrder: '1',
  status: 1
});

const rules: FormRules = {
  name: [required('请输入菜单名称')],
  menuType: [required('请选择菜单类型', 'change')],
  status: [required('请选择状态', 'change')]
};

/** M=目录 / C=菜单 / F=按钮（B 是历史数据里的按钮旧值，只读兼容） */
const menuTypeOptions = computed(() => {
  const options = [
    { label: '目录', value: 'M' },
    { label: '菜单', value: 'C' },
    { label: '按钮', value: 'F' }
  ];
  if (form.menuType === 'B') options.push({ label: '按钮（历史值 B）', value: 'B' });
  return options;
});

/** 上级菜单选项（一级目录，排除自身以免成环） */
const parentOptions = computed(() =>
  tree.value
    .filter((node) => node.id !== form.id)
    .map((node) => ({ label: node.name, value: node.id }))
);

const statusOptions = STATUS_OPTIONS;

// 转为 base-tree 期望的 TreeNode 契约（label 用菜单名，图标由 BaseIcon 单独渲染）
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

/**
 * R10：从 router.options.routes 抽取可作为菜单的路由项。
 *
 * <p>过滤规则：
 * <ol>
 *   <li>必须有 {@code meta.title}（无 title 表示框架页/嵌套路由容器）</li>
 *   <li>必须有 {@code path}（空 path 通常是 Layout 占位）</li>
 *   <li>必须有 {@code meta.permission}（与后端 @PreAuthorize 对齐的权限码）</li>
 *   <li>跳过 {@code meta.public} 的公开页（如 /login）</li>
 * </ol>
 *
 * <p>type C 的菜单才能选；type F（按钮）的 permission 与路由无关，由管理员按后端 AuthPerms 手填。</p>
 */
interface RouteOption {
  label: string;
  value: string;             // 唯一路径
  path: string;
  name?: string | symbol;
  component?: string | null;
  permission?: string;
  metaTitle: string;
}

const availableRoutes = computed<RouteOption[]>(() => {
  const out: RouteOption[] = [];
  function walk(rs: any[], prefix = '') {
    for (const r of rs) {
      const meta = r.meta || {};
      const fullPath = prefix + (r.path || '');
      if (!meta.public && meta.title && fullPath && meta.permission) {
        // 第一个 component 名（典型项目里只一个）
        const comp = r.components
          ? Object.values(r.components)[0] as any
          : null;
        const componentName = comp && typeof comp === 'object' && '__name' in comp
          ? String((comp as { __name?: string }).__name)
          : (typeof comp === 'string' ? comp : null);
        out.push({
          label: `${meta.title} (${fullPath})`,
          value: fullPath,
          path: fullPath,
          name: r.name,
          component: componentName,
          permission: meta.permission as string,
          metaTitle: meta.title as string
        });
      }
      if (r.children?.length) walk(r.children, fullPath + '/');
    }
  }
  walk([...router.options.routes]);
  return out;
});

const routeOptions = computed(() =>
  availableRoutes.value.map(r => ({ label: r.label, value: r.value }))
);

/** 路由选择器当前值。独立 ref 不污染 form.path（applyRoute 后才同步）。 */
const pickedRoutePath = ref<string>('');

function applyRoute(picked: any) {
  if (!picked) return;
  const r = availableRoutes.value.find(x => x.value === picked);
  if (!r) return;
  form.name = r.metaTitle;
  form.path = r.path;
  if (r.component) form.component = r.component;
  if (r.permission) form.permission = r.permission;
}

async function fetchTree() {
  tree.value = await menuApi.getMenuTree();
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
    path: found.path ?? '',
    component: found.component ?? '',
    icon: found.icon ?? '',
    menuType: found.menuType,
    permission: found.permission ?? '',
    sortOrder: String(found.sortOrder ?? 1),
    status: found.status
  });
}

function findNode(list: menuApi.MenuVO[], id: number): menuApi.MenuVO | null {
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
  pickedRoutePath.value = '';
  Object.assign(form, {
    id: undefined,
    parentId,
    name: '',
    path: '',
    component: '',
    icon: '',
    menuType: 'C',
    permission: '',
    sortOrder: '1',
    status: 1
  });
}

async function handleSave() {
  const payload = {
    parentId: form.parentId,
    name: form.name,
    path: form.path || null,
    component: form.component || null,
    menuType: form.menuType,
    icon: form.icon || null,
    permission: form.permission || null,
    sortOrder: Number(form.sortOrder) || 0,
    status: form.status
  };
  if (form.id) {
    await menuApi.updateMenu(form.id, payload);
  } else {
    await menuApi.createMenu(payload);
  }
  await fetchTree();
}

async function handleDelete() {
  if (!form.id) return;
  if (!confirm(`确认删除菜单 ${form.name}？`)) return;
  await menuApi.deleteMenu(form.id);
  editing.value = false;
  await fetchTree();
}

onMounted(fetchTree);
</script>

<style scoped>
.page {
  padding: var(--space-4);
}
.menu-layout {
  display: flex;
  gap: var(--space-4);
}
.menu-layout__tree {
  flex: 0 0 320px;
  border-right: 1px solid var(--color-border);
  padding-right: var(--space-4);
}
.menu-layout__form {
  flex: 1;
}
.form-actions {
  display: flex;
  gap: var(--space-2);
}
.icon-field {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.route-picker {
  background: var(--color-background-soft, #f8fafc);
  border: 1px dashed var(--color-border);
  padding: var(--space-3);
  border-radius: 4px;
  margin-bottom: var(--space-3);
}
.route-picker .base-select,
.route-picker :deep(.base-select) {
  width: 100%;
}
</style>
