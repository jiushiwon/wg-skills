# mock-contract-product 商品信息模拟契约

> 契约驱动的「商品信息」ERP 表单模拟契约。覆盖 12 种字段类型，作为 `base-form-render` 的完整落地示例。
>
> 字段名（`prop`）严格对齐后端 `api-contract.md` 的入参，提交走 `frontend-request-skill` 的统一信封。

## 一、契约定义

```typescript
// src/contracts/goods.contract.ts
import type { FormSchema } from '@/components/form/types'

/**
 * 商品信息表单契约
 * 字段顺序 = 渲染顺序，columns = 2 表示两列布局
 */
export const goodsSchema: FormSchema = {
  layout: 'vertical',
  labelWidth: '110px',
  labelAlign: 'right',
  columns: 2,
  fields: [
    // ---- 文本输入 ----
    {
      prop: 'goodsName',
      label: '商品名称',
      type: 'input',
      required: true,
      maxlength: 60,
      placeholder: '请输入商品名称',
    },
    {
      prop: 'skuCode',
      label: '商品编码',
      type: 'input',
      required: true,
      maxlength: 32,
      placeholder: '如 SPU-2026-0001',
    },

    // ---- 数字（特殊类型）----
    {
      prop: 'price',
      label: '售价（元）',
      type: 'number',
      required: true,
      placeholder: '请输入售价',
    },

    // ---- 下拉选择 ----
    {
      prop: 'categoryId',
      label: '商品分类',
      type: 'select',
      required: true,
      options: [
        { label: '数码家电', value: 'digital' },
        { label: '服饰鞋包', value: 'fashion' },
        { label: '美妆个护', value: 'beauty' },
        { label: '食品生鲜', value: 'food' },
        { label: '图书文娱', value: 'book' },
      ],
    },

    // ---- 多选（复选框组）----
    {
      prop: 'tags',
      label: '商品标签',
      type: 'checkbox',
      options: [
        { label: '新品', value: 'new' },
        { label: '热销', value: 'hot' },
        { label: '特惠', value: 'sale' },
        { label: '包邮', value: 'free-shipping' },
      ],
    },

    // ---- 单选（单选组）----
    {
      prop: 'channel',
      label: '销售渠道',
      type: 'radio',
      required: true,
      options: [
        { label: '仅线上', value: 'online' },
        { label: '仅线下', value: 'offline' },
        { label: '全渠道', value: 'all' },
      ],
    },

    // ---- 开关 ----
    {
      prop: 'onSale',
      label: '是否上架',
      type: 'switch',
      defaultValue: true,
    },

    // ---- 文本域 ----
    {
      prop: 'description',
      label: '商品描述',
      type: 'textarea',
      rows: 4,
      maxlength: 500,
      placeholder: '请输入商品卖点、规格、售后说明等',
    },

    // ---- 上传 ----
    {
      prop: 'images',
      label: '商品主图',
      type: 'upload',
      maxCount: 5,
      accept: 'image/*',
      help: '支持 jpg/png，单张不超过 5MB，最多 5 张',
    },

    // ---- 日期选择 ----
    {
      prop: 'launchDate',
      label: '上架日期',
      type: 'datepicker',
      dateType: 'date',
    },

    // ---- 特殊类型：手机号 ----
    {
      prop: 'supplierPhone',
      label: '供应商电话',
      type: 'phone',
      required: true,
      placeholder: '请输入供应商联系电话',
    },

    // ---- 特殊类型：身份证 ----
    {
      prop: 'supplierIdCard',
      label: '供应商证件号',
      type: 'idcard',
      placeholder: '请输入供应商法人身份证号',
    },
  ],
}
```

## 二、前端使用

```vue
<template>
  <base-card title="新增商品">
    <base-form-render
      ref="formRenderRef"
      v-model="goodsForm"
      :schema="goodsSchema"
    >
      <template #footer>
        <div class="form-actions">
          <base-button @click="handleReset">重置</base-button>
          <base-button type="primary" @click="handleSubmit">提交</base-button>
        </div>
      </template>
    </base-form-render>
  </base-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { goodsSchema } from '@/contracts/goods.contract'
import { createGoods } from '@/api/goods'

const formRenderRef = ref()
const goodsForm = ref<Record<string, unknown>>({})

async function handleSubmit() {
  const valid = await formRenderRef.value?.validate()
  if (!valid) return

  // 提交：字段名直接对齐后端入参，走统一信封
  await createGoods(goodsForm.value)
}

function handleReset() {
  formRenderRef.value?.resetFields()
}
</script>
```

## 三、后端契约对齐（api-contract.md）

```markdown
### POST /api/goods/create —— 创建商品

请求体（body）：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| goodsName | string | 是 | 商品名称 |
| skuCode | string | 是 | 商品编码 |
| price | number | 是 | 售价（元） |
| categoryId | string | 是 | 商品分类 |
| tags | string[] | 否 | 商品标签 |
| channel | string | 是 | 销售渠道：online/offline/all |
| onSale | boolean | 否 | 是否上架，默认 true |
| description | string | 否 | 商品描述 |
| images | string[] | 否 | 商品主图 URL 列表 |
| launchDate | string | 否 | 上架日期 YYYY-MM-DD |
| supplierPhone | string | 是 | 供应商电话 |
| supplierIdCard | string | 否 | 供应商法人身份证号 |

响应：统一信封 `{ code, message, data }`，code = 0 成功
```

## 四、契约字段类型覆盖清单

| 字段 | prop | FieldType | 覆盖能力 |
|------|------|-----------|---------|
| 商品名称 | goodsName | input | 文本输入 |
| 商品编码 | skuCode | input | 文本输入 |
| 售价 | price | number | 数字特殊类型 |
| 商品分类 | categoryId | select | 下拉 |
| 商品标签 | tags | checkbox | 多选 |
| 销售渠道 | channel | radio | 单选 |
| 是否上架 | onSale | switch | 开关 |
| 商品描述 | description | textarea | 文本域 |
| 商品主图 | images | upload | 上传 |
| 上架日期 | launchDate | datepicker | 日期 |
| 供应商电话 | supplierPhone | phone | 手机号特殊类型 |
| 供应商证件号 | supplierIdCard | idcard | 身份证特殊类型 |

> 密码（`password`）类型在商品场景不常用，完整示例见 [form-contract.md](./form-contract.md) 第九节「完整字段类型示例契约」。
