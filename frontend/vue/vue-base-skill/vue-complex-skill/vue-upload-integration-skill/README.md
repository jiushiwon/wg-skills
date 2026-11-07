# vue-upload-integration-skill

> 上传 + 表单 + 后端契约的全链路集成（综合级别），整合 vue-upload-skill + vue-form-skill + frontend-request-skill，实现「表单 + 上传 + 后端对接」即插即用。

## 快速上手

```
做一个商品发布页（含图片上传）
做一个头像设置页
做一个文件管理页面
做一个批量导入功能
```

## 覆盖场景

| 场景 | 组件组合 |
|------|---------|
| 头像设置 | base-card + base-upload(image avatar) + base-button |
| 商品发布 | base-card + base-form + base-upload(image crop) + base-button |
| 文件管理 | base-card + base-upload(file drag) + base-upload(list) + base-tag |
| 批量导入 | base-card + base-upload(autoUpload:false) + base-button |

## 定位

本技能不重新定义上传组件（→ vue-upload-skill）、不重新定义表单（→ vue-form-skill），只做集成编排并对齐后端契约。

## 后端契约

FastAPI / Spring Boot / Go Gin 三端上传契约对齐，统一响应 `{ code: 0, message: 'success', data: { url, name, size } }`。

## 详细规范 → [SKILL.md](SKILL.md)

## 相关技能

- [vue-upload-skill](../../vue-upload-skill/SKILL.md) — base-upload 组件
- [vue-form-skill](../../vue-form-skill/SKILL.md) — base-form 表单
- [frontend-request-skill](../../../../frontend-request-skill/SKILL.md) — upload() 请求封装
