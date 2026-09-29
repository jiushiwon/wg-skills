<template>
  <div class="page">
    <PageHeader title="商品管理" description="维护商品信息、库存与上下架状态">
      <template #actions>
        <base-button v-permission="'example:product:create'" type="primary" @click="openCreate">新增商品</base-button>
      </template>
    </PageHeader>

    <!-- 搜索区：搜索区也是表单，必须包在 <base-form> 内（form-contract §十三 R1） -->
    <base-card>
      <base-form :model="query" layout="inline" @submit="handleSearch">
        <base-form-item label="关键字" prop="keyword">
          <base-input v-model="query.keyword" placeholder="商品名/编码" clearable />
        </base-form-item>
        <base-form-item>
          <div class="form-actions">
            <base-button type="primary" @click="handleSearch">查询</base-button>
            <base-button @click="handleReset">重置</base-button>
          </div>
        </base-form-item>
      </base-form>
    </base-card>

    <base-card>
      <base-table :data="rows" :columns="columns" :loading="loading">
        <template #_action="{ row }">
          <base-button v-permission="'example:product:edit'" size="sm" @click="openEdit(row)">编辑</base-button>
          <base-button v-permission="'example:product:delete'" size="sm" type="danger" @click="handleDelete(row)">删除</base-button>
        </template>
      </base-table>

      <base-paginated
        v-model:page="query.page"
        v-model:page-size="query.pageSize"
        :total="total"
        show-total
        position="right"
        @change="onPageChange"
      />
    </base-card>

    <!-- 新增/编辑弹窗：按钮放在 base-form 内，native-type="submit" 才会触发 :rules 校验 -->
    <base-dialog v-model:visible="dialogVisible" :title="editing ? '编辑商品' : '新增商品'" :footer="false">
      <base-form :model="form" :rules="rules" @submit="handleSubmit">
        <base-form-item label="名称" prop="name">
          <base-input v-model="form.name" placeholder="请输入商品名称" />
        </base-form-item>
        <base-form-item label="编码" prop="code">
          <base-input v-model="form.code" :disabled="editing" placeholder="请输入商品编码" />
        </base-form-item>
        <base-form-item label="分类" prop="category">
          <base-input v-model="form.category" placeholder="请输入商品分类" />
        </base-form-item>
        <base-form-item label="价格" prop="price">
          <base-input v-model="form.price" placeholder="请输入价格" />
        </base-form-item>
        <base-form-item label="库存" prop="stock">
          <base-input v-model="form.stock" placeholder="请输入库存" />
        </base-form-item>
        <base-form-item label="描述" prop="description">
          <base-input v-model="form.description" type="textarea" />
        </base-form-item>
        <base-form-item label="状态" prop="status">
          <!-- 后端 status 是 Integer(0/1)，数值型字段禁止用 switch（form-contract §十三 R3） -->
          <base-select v-model="form.status" :options="statusOptions" />
        </base-form-item>

        <div class="dialog-actions">
          <base-button @click="dialogVisible = false">取消</base-button>
          <base-button type="primary" native-type="submit">确定</base-button>
        </div>
      </base-form>
    </base-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, h, onMounted } from 'vue';
import { BaseCard } from 'vue-card-skill';
import { BaseButton } from 'vue-button-skill';
import { BaseTag } from 'vue-tag-skill';
import { BaseTable, BasePaginated } from 'vue-table-skill';
import { BaseDialog } from 'vue-dialog-skill';
import { BaseForm, BaseFormItem } from 'vue-form-skill';
import { BaseInput } from 'vue-input-skill';
import { BaseSelect } from 'vue-select-skill';
import PageHeader from '@/components/PageHeader.vue';
import * as productApi from '@/api/product';
import { required } from '@/utils/validation';

const query = reactive<productApi.ProductQuery>({ page: 1, pageSize: 10, keyword: '' });
const rows = ref<productApi.ProductVO[]>([]);
const total = ref(0);
const loading = ref(false);

const statusOptions = [
  { label: '在售', value: 1 },
  { label: '下架', value: 0 }
];

const dialogVisible = ref(false);
const editing = ref(false);
/** 价格 / 库存用文本输入承载，提交时再转 number（base-input 不支持 number 类型） */
const form = reactive({
  id: undefined as number | undefined,
  name: '',
  code: '',
  category: '',
  price: '',
  stock: '',
  description: '',
  status: 1
});

const rules: FormRules = {
  name: [required('请输入商品名称')],
  code: [required('请输入商品编码')],
  price: [required('请输入价格'), { pattern: /^\d+(\.\d{1,2})?$/, message: '价格最多保留两位小数' }],
  stock: [required('请输入库存'), { pattern: /^\d+$/, message: '库存必须是非负整数' }],
  status: [required('请选择状态', 'change')]
};

const columns = computed(() => [
  { key: 'id', title: 'ID', width: 80 },
  { key: 'name', title: '名称' },
  { key: 'code', title: '编码' },
  { key: 'category', title: '分类' },
  {
    key: 'price',
    title: '价格',
    width: 100,
    render: (row: productApi.ProductVO) => `¥${Number(row.price ?? 0).toFixed(2)}`
  },
  { key: 'stock', title: '库存', width: 80 },
  {
    key: 'status',
    title: '状态',
    width: 100,
    render: (row: productApi.ProductVO) =>
      h(BaseTag, { type: row.status === 1 ? 'success' : 'danger' }, () => (row.status === 1 ? '在售' : '下架'))
  },
  { key: 'createdAt', title: '创建时间', width: 180 },
  { key: '_action', title: '操作', width: 160 }
]);

async function fetchList() {
  loading.value = true;
  try {
    const res = await productApi.getProductList({ ...query });
    rows.value = res.list;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  query.page = 1;
  fetchList();
}

function handleReset() {
  query.keyword = '';
  query.page = 1;
  fetchList();
}

function onPageChange(page: number) {
  query.page = page;
  fetchList();
}

function openCreate() {
  editing.value = false;
  Object.assign(form, { id: undefined, name: '', code: '', category: '', price: '', stock: '', description: '', status: 1 });
  dialogVisible.value = true;
}

function openEdit(row: productApi.ProductVO) {
  editing.value = true;
  Object.assign(form, {
    id: row.id,
    name: row.name,
    code: row.code,
    category: row.category ?? '',
    price: String(row.price ?? ''),
    stock: String(row.stock ?? ''),
    description: row.description ?? '',
    status: row.status
  });
  dialogVisible.value = true;
}

async function handleSubmit() {
  const payload: productApi.SaveProductRequest = {
    name: form.name,
    code: form.code,
    category: form.category || undefined,
    price: Number(form.price),
    stock: Number(form.stock),
    description: form.description || undefined,
    status: form.status
  };
  if (editing.value && form.id) {
    await productApi.updateProduct(form.id, payload);
  } else {
    await productApi.createProduct(payload);
  }
  dialogVisible.value = false;
  fetchList();
}

async function handleDelete(row: productApi.ProductVO) {
  if (!confirm(`确认删除商品 ${row.name}？`)) return;
  await productApi.deleteProduct(row.id);
  fetchList();
}

onMounted(fetchList);
</script>

<style scoped>
.page {
  padding: var(--space-4);
}
.form-actions {
  display: flex;
  gap: var(--space-2);
}
.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  padding-top: var(--space-2);
}
</style>
