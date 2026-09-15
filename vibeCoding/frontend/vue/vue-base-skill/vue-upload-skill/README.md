# vue-upload-skill

> 一个 `base-upload` 组件，三种模式，覆盖所有上传场景。

## 快速开始

```vue
<!-- 文件上传 -->
<base-upload mode="file" v-model="files" action="/api/upload/file" drag />

<!-- 图片上传（裁剪+压缩） -->
<base-upload mode="image" v-model="images" action="/api/upload/image" crop compress />

<!-- 头像 -->
<base-upload mode="image" v-model="avatar" action="/api/upload/image" avatar />
```

## 文档

| 文件 | 说明 |
|------|------|
| [SKILL.md](SKILL.md) | 完整规范 |
| [base-upload.md](base-upload.md) | 核心组件（一个组件三种模式） |
| [references/backend-contract.md](references/backend-contract.md) | 后端契约（Go/Java/FastAPI） |
| [demo/00-showcase.html](demo-components/base-upload/html/00-showcase.html) | 可交互演示 |
