# Roadmap 输出模板

一句话：说明 `vibecoding-workflow-skill` 生成的 `docs/vibecoding/roadmap.md` 应该包含哪些内容。

## 文件位置

```
docs/vibecoding/roadmap.md
```

## 推荐结构

```markdown
# [项目名称] VibeCoding 路线图

## 1. 项目目标

- 一句话描述项目
- 目标用户
- 核心解决的问题

## 2. 技术栈推荐

### 前端
- 框架：React / Vue / UniApp
- UI 库：
- 状态管理：

### 后端
- 语言/框架：Node.js / Java / Go / Python
- 数据库：
- 缓存：

### AI
- LLM：
- Embedding（如有 RAG）：
- 其他 AI 能力：

### 部署
- 前端：
- 后端：

## 3. 功能模块拆解

| 模块 | 功能点 | 优先级 | 预计耗时 |
|------|--------|--------|----------|
| 用户系统 | 注册/登录/授权 | P0 | 2 天 |
| ... | ... | ... | ... |

## 4. 开发顺序

1. 阶段一：MVP（核心功能）
2. 阶段二：增强体验
3. 阶段三：优化与扩展

## 5. 接口与数据设计

- 核心接口列表
- 核心数据表/实体

## 6. 推荐使用的 Skill

| 阶段 | 推荐 Skill |
|------|------------|
| 生成前端 | `frontend-ui-foundry` |
| 生成后端 | `backend-generate-skill` |
| 加业务模块 | `module-generate-skill` |
| 抓素材 | `icon-image-catch-skill` |
| 部署 | `super-deploy-skills` |

## 7. 风险与注意事项

- 技术风险
- 成本风险
- 合规风险

## 8. 下一步行动

- [ ] 确认技术栈
- [ ] 调用对应 Skill 生成代码
- [ ] 编写接口契约
```

## 生成原则

- 内容要具体，不要泛泛而谈
- 每个模块都要有优先级和预计耗时
- 必须推荐下一步可使用的 Skill
- 风险提示不能缺
- 根据用户约束（预算、时间、平台）动态调整
