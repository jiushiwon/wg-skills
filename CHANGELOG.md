# CHANGELOG

> 本文件聚合自 git 提交历史，按时间倒序记录仓库的关键变更。
> 详细条目以 `git log` 为准；本文件只保留对使用者有感知的里程碑。

## 2026-11-07 根模块迁移与文档校验

- 五个根模块分别维护前端、后端、数据库、部署与学习辅助，共 152 个技能。
- 独立工具及 prompts 已迁入私有 wg-project-kits，旧路径需要更新。
- 修复全仓 Markdown 相对链接、根导航与脚本目录校验。

## 2026-10-26

- **新增** `go-perf-demo`：AI 写的 Go 后端 vs 修复版的压测对照（性能反例教学）。

## 2026-10-24

- **uniapp** 技能大盘点第 1 批 + 第 4 批：修复小程序端断链，补齐专项规范。

## 2026-10-23

- **新增** `crypto-scenario-skill`：按场景给出加密选型结论（密码存储 / 支付验签 / JWT / 敏感字段 / 文件校验）。
- **修复** 用 crypto-scenario-skill 审计 Go demo，修复三处安全缺口。

## 2026-10-22

- **重构** `video` 技能迁入 `others/` 板块。
- **规范** 根 `AGENTS.md` 补齐「仓库级 / 模块级 / 个体级」三层规范分层体系。
- **重构** uniapp 索引层并入 `uniapp-base-skill`，删除 `uniapp-ui-component-commands-skill`。
- **修复** `python-fast-skill` 缺失的 8 篇 references 笔记；历史遗留 `docs/` 跟踪文件移出版本控制；删除误建的 `vue-empty-skill` 重复副本。
- **脚本** `check-skills.sh` 增加技能目录位置校验。

## 2026-10-13

- **修复** 多处引用与数字漂移：README 数量校准、清理 7 处假依赖、删除 `vue-theme-skill` 副本。
- **新增** `scripts/check-skills.sh`（仓库健康检查）、`ONBOARDING.md`（5 分钟上手）、`MISSING_SKILLS.md`（私有 skill 登记）。
- **批量** 补 22 个 SKILL.md 的触发词段。
- **契约** Python auth 契约对齐 Java auth（camelCase + 负数错误码）。
- **安全** `.gitignore` 补全证书 / 私钥 / 数据库 / Java 模式。

## 2026-10-11 ~ 12

- **新增** 4 个支付 skill（Java / Python × 微信 / 支付宝）、`go-vue-admin-skill`、`fastapi-qr-login-skill`、`electron-react-skill`。
- **重构** 项目级技能迁移至私有仓库 `wg-project-kits`。

## 2026-10-04 ~ 07

- **新增** `vue-badge-skill`、`vue-menu-skill`、`vue-layout-skill`；完善 `go-frame-init-skill`。

## 2026-09-29

- **重大调整** 全量公开：从精选 23 个升级到全量 149 个。

## 2026-09-14 ~ 16

- **审计** 前后端一体化全局审计：建立公共规范层、补齐契约、修复冲突。
- **重构** 精简为精选技能，完整体系迁移至 `vibecoding-portal`。

## 2026-09-06 ~ 09

- **新增** `database-learning-skill`、契约驱动表单体系 `vue-form-skill`。
- **重构** `go-init-skill` 重命名为 `go-gin-init-skill`，对齐 FastAPI / SpringBoot 接口契约。
