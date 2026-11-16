# 个人中心场景背景素材

五张无字 PNG，2026-11-16 通过内置图片生成工具生成，由本仓库随技能提供，按仓库 LICENSE 使用；不承诺生成资产的独占性或商标权利。提示词见 prompts.json，不含人物肖像、文字、按钮和品牌标识。无需调用图片生成服务即可使用现有资产。

| 文件 | 业务场景 |
|---|---|
| glacier-background.png | 会员权益、预约、服务平台 |
| coral-background.png | 潮流商城、美妆零售、品牌会员 |
| aurora-background.png | 创作者、游戏社群、数字会员 |
| forest-background.png | 旅行、露营、活动社区 |
| cloud-background.png | 阅读、学习、成长打卡 |

原图保留生成尺寸，比例约 9:19.5；实际尺寸以文件为准，不能将提示词目标分辨率当实际输出。接入时拷贝到项目 static/profile-scenic，本演示预构建脚本只同步 runtime 中的轻量 JPEG，不复制原 PNG。位图负责光纹、玻璃、植被等静态效果；真实文字、头像、入口与卡片由组件渲染。生产按需要生成压缩派生图，先验收质量和加载性能。

## 视觉与运行预览

previews/ 中每场景分别保存 *-preview.png（视觉参考）和 *-runtime.png（H5 首屏）。两者明确区分。预览不复制进运行时 static，运行时只使用 runtime 中的五张 JPEG。

纯色圆环 solid 不加载背景位图，装饰代码维护于共享 Vue 模板。previews/solid-runtime.png 是运行效果参考，不是运行时背景依赖。

本轮为避免原图增加演示主包，已内置 runtime/ 轻量 JPEG（像素尺寸不变，五张合计 563491 字节），预构建脚本仅复制这些派生文件；原 PNG 与预览保留为技能素材。无需安装图像处理工具即可运行。
