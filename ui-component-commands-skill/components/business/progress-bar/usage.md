# progress-bar 使用示例

## 基础用法

```vue
<progress-bar :percent="60" />
```

## 不同类型

```vue
<progress-bar :percent="60" type="success" />
<progress-bar :percent="60" type="warning" />
<progress-bar :percent="60" type="error" />
```

## 自定义文字

```vue
<progress-bar :percent="60" text="下载中..." />
```
