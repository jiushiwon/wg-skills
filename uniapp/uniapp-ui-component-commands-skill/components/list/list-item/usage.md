# list-item 使用示例

## 基础用法

```vue
<list-item title="设置" arrow @click="goToSettings" />
```

## 带描述

```vue
<list-item title="用户名" label="微信号: wx123456" arrow />
```

## 带图标

```vue
<list-item icon="/static/user.png" title="个人资料" arrow />
```

## 带值

```vue
<list-item title="版本" value="v1.0.0" />
```

## 使用插槽

```vue
<list-item>
  <template #right>
    <switch />
  </template>
</list-item>
```
