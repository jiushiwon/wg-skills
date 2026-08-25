# input-field 使用示例

## 基础用法

```vue
<input-field v-model="username" label="用户名" placeholder="请输入用户名" />
```

## 带清除按钮

```vue
<input-field v-model="keyword" placeholder="搜索" :clearable="true" />
```

## 错误状态

```vue
<input-field
  v-model="phone"
  label="手机号"
  placeholder="请输入手机号"
  :error="!isValid"
  error-message="手机号格式不正确"
/>
```
