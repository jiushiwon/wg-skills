# modal 使用示例

## 基础用法

```vue
<modal
  :show="showModal"
  title="提示"
  message="确定要删除吗？"
  @confirm="handleConfirm"
  @cancel="handleCancel"
  @close="showModal = false"
/>
```

## 自定义按钮

```vue
<modal
  :show="showModal"
  title="温馨提示"
  message="内容"
  confirm-text="我知道了"
  :show-cancel="false"
  @confirm="showModal = false"
/>
```
