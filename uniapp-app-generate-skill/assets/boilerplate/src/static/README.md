# 静态资源目录

本目录存放小程序静态资源。

## 目录说明

- `icons/`：页面内小图标（PNG，48×48px 左右）
- `tab-bar/`：底部 tabBar 图标（PNG，81×81px，含激活/未激活态）
- `images/`：装饰图、Banner、空状态图（真实照片，≤ 100KB）
- `avatar-placeholder.png`：头像占位图

## 生成方式

- 图标：使用 `icon-forge` 技能生成。
- 真实照片：使用 Pexels API 搜索下载，Key 配置在 `.env`。
- 禁止：用 CSS 渐变或纯色块替代图片。

## 默认资源

boilerplate 已包含一组默认图标，可直接使用或后续替换：

- `tab-bar/home.png` / `tab-bar/home-active.png`
- `tab-bar/data.png` / `tab-bar/data-active.png`
- `tab-bar/profile.png` / `tab-bar/profile-active.png`
- `images/empty-data.png`
- `avatar-placeholder.png`

默认图标使用 `icon-forge` 生成，风格为线性 outline。如需替换，可用 `icon-forge` 重新生成或设计师提供。
