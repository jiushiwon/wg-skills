<template>
  <view class="t-form">
    <slot />
  </view>
</template>

<script setup>
import { provide, ref } from 'vue'

const props = defineProps({
  model: {
    type: Object,
    required: true
  },
  rules: {
    type: Object,
    default: () => ({})
  },
  labelWidth: {
    type: String,
    default: '80px'
  },
  labelPosition: {
    type: String,
    default: 'left' // left, top
  }
})

const emit = defineEmits(['validate'])

// 表单项实例集合
const fields = ref([])

// 注册表单项
function addField(field) {
  fields.value.push(field)
}

// 移除表单项
function removeField(field) {
  const index = fields.value.indexOf(field)
  if (index > -1) {
    fields.value.splice(index, 1)
  }
}

// 验证单个字段
async function validateField(prop) {
  const field = fields.value.find(f => f.prop === prop)
  if (field) {
    return await field.validate()
  }
  return true
}

// 验证全部字段
async function validate() {
  const promises = fields.value.map(field => field.validate())
  const results = await Promise.all(promises)
  const valid = results.every(r => r)

  emit('validate', valid)
  return valid
}

// 清除验证
function clearValidate(props = []) {
  if (props.length === 0) {
    fields.value.forEach(field => field.clearValidate())
  } else {
    fields.value
      .filter(field => props.includes(field.prop))
      .forEach(field => field.clearValidate())
  }
}

// 重置表单
function resetFields() {
  fields.value.forEach(field => field.resetField())
}

// 提供给子组件
provide('t-form', {
  model: props.model,
  rules: props.rules,
  labelWidth: props.labelWidth,
  labelPosition: props.labelPosition,
  addField,
  removeField
})

defineExpose({
  validate,
  validateField,
  clearValidate,
  resetFields
})
</script>

<style lang="scss" scoped>
.t-form {
  width: 100%;
}
</style>

<!-- 使用示例 -->
<!--
<template>
  <t-form ref="formRef" :model="formData" :rules="rules" label-width="80px">
    <t-form-item label="用户名" prop="username">
      <t-input v-model="formData.username" placeholder="请输入用户名" />
    </t-form-item>
    <t-form-item label="邮箱" prop="email">
      <t-input v-model="formData.email" placeholder="请输入邮箱" />
    </t-form-item>
    <t-form-item>
      <t-button type="primary" @click="handleSubmit">提交</t-button>
      <t-button @click="handleReset">重置</t-button>
    </t-form-item>
  </t-form>
</template>

<script setup>
import { ref, reactive } from 'vue'
import TForm from '@/components/uniapp-vue3/form/form.vue'
import TFormItem from '@/components/uniapp-vue3/form/form-item.vue'
import TInput from '@/components/uniapp-vue3/form/input.vue'
import TButton from '@/components/uniapp-vue3/button/button.vue'

const formRef = ref(null)

const formData = reactive({
  username: '',
  email: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

async function handleSubmit() {
  const valid = await formRef.value.validate()
  if (valid) {
    console.log('提交成功', formData)
  }
}

function handleReset() {
  formRef.value.resetFields()
}
</script>
-->
