# Demo 说明

| 文件 | 用途 | 格式与体积 |
|---|---|---|
| `screenshots/member-center-default.webp` | 默认态高保真视觉 Demo，用于 README、门户和文章展示 | WebP，约 103 KB |

Demo 的作用是让使用者在阅读 Skill 前先理解预期效果。它不替代运行中的模板截图：业务项目接入后，应补充真实数据、加载、空态和失败态的实机截图。

## 运行演示

在完整仓库的本目录执行 npm ci 后，使用 npm run dev:h5 启动。构建使用 npm run build:h5 或 npm run build:mp-weixin。启动和构建会在 src/skills 建立局部源码链接，直接引用共享组件和主题。H5 与微信小程序编译已验证，微信真机待验收。
