# user-avatar 使用示例

## 基础用法

```vue
<user-avatar src="/static/avatar.png" />
```

## 无头像显示名字

```vue
<user-avatar name="张三" />
```

## 不同尺寸

```vue
<user-avatar src="/static/avatar.png" size="small" />
<user-avatar src="/static/avatar.png" size="medium" />
<user-avatar src="/static/avatar.png" size="large" />
```

## 方形头像

```vue
<user-avatar src="/static/avatar.png" :round="false" />
```
