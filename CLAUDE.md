# wg-skills 项目规范

## 项目定位

本仓库是 Claude Code 的**技能集合（Skills）**，每个目录对应一个独立技能。技能通过 `SKILL.md` 定义触发条件、审查维度与输出格式。

## 开发原则

1. **技能自治**：每个 skill 目录自包含，修改时只动目标 skill，不影响其他技能。
2. **入口一致**：每个 skill 必须提供 `SKILL.md`；面向用户的说明写入同目录 `README.md`。
3. **触发词稳定**：修改 `SKILL.md` 的触发条件后，必须同步更新 `README.md` 中的使用示例。
4. **参考资料沉淀**：通用规则、词表、案例放入 skill 内 `references/`；避免把长文本直接塞进 `SKILL.md`。
5. **向后兼容**：已有触发词和命令行保持可用；破坏性变更需在 `README.md` 中标注迁移方式。

## 分支与提交规范

- **所有变更直接提交并推送到 `main` 分支**。
- **禁止在未获得用户明确授权的情况下自行创建功能分支或 Pull Request**。
- 若用户要求创建分支，须使用用户指定的分支名；未指定时须先询问。

## 目录结构

```
wg-skills/
├── CLAUDE.md              # 本文件：项目级规范
├── .claudeignore          # Claude 索引忽略配置
├── README.md              # 仓库总览
├── .gitignore
├── frontend-code-doctor/  # 前端代码审查技能
├── ai-speech-detector/    # AI 风检测技能
├── frontend-ui-foundry/   # 综合前端 UI 技能
├── ui-replica-skill/      # UI 原型图复刻技能
├── uniapp-app-generate-skill/
├── backend-generate-skill/
├── super-deploy-skills/     # 一键部署套件（父技能 + 5 嵌套子技能）
├── backend-analysis-skill/  # 后端项目全景分析（接口/技术栈/数据库/业务 4 份报告）
├── icon-image-catch-skill/  # 素材抓取套件（父技能 + icon/image 2 嵌套子技能）
├── module-generate-skill/   # 后端业务模块生成套件（父技能 + 5 嵌套子技能）
└── icon-forge/
```

> 说明：`super-deploy-skills/` 是父技能目录，内含 5 个嵌套子技能；`backend-generate-skill/` 也是父技能目录，内含 7 个嵌套子技能（`backend-select-skill`、`backend-convention-skill`、`java-backend-skill`、`go-backend-skill`、`python-backend-skill`、`nodejs-backend-skill`、`database-skill`）；`icon-image-catch-skill/` 同为父技能目录，内含 2 个嵌套子技能（`icon-catch-skill`、`image-catch-skill`）；`module-generate-skill/` 同为父技能目录，内含 5 个嵌套子技能（`auth-skill`、`org-permission-skill`、`ai-chat-skill`、`notification-skill`、`payment-skill`）。这四个目录采用「父子嵌套」结构；其他技能仍为扁平目录。

## 新增 Skill 流程

1. 创建 `<skill-name>/` 目录，目录名使用 kebab-case。
2. 写入 `SKILL.md`，必填前置元数据：
   ```yaml
   ---
   name: skill-name
   description: 一句话描述技能用途
   ---
   ```
3. 写入 `README.md`，包含：功能、使用方式、示例、目录说明。
4. 需要参考资料时，创建 `references/` 目录并按主题拆分文件。
5. 更新根目录 `README.md` 的“当前可用 Skills”表格。

## 修改现有 Skill 规范

- 优先改 `SKILL.md`，再同步 `README.md` 与 `references/`。
- 触发词变化必须检查是否有其他 skill 冲突。
- 删除或重命名 references 文件时，检查 SKILL.md 中的引用路径。

## 输出要求

- 所有解释、注释、文档使用中文。
- 修改代码时给出完整函数或文件，避免使用 `// ... rest of code`。
- 若变更可能破坏现有 skill 调用方式，在末尾明确发出兼容性警告。
