# toast 使用示例

## 基础用法

```vue
<toast :show="showToast" message="操作成功" type="success" @close="showToast = false" />
```

## 错误提示

```vue
<toast :show="showError" message="加载失败" type="error" />
```

## 加载中

```vue
<toast :show="loading" message="加载中..." type="loading" :duration="0" />
```
