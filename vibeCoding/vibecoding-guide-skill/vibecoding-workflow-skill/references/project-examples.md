# 实战项目案例

一句话：用 VibeCoding 思路从 0 到 1 落地的完整项目示例。

> 最后更新：2026-07-23。

## 案例一：个人 AI 笔记助手（Web 应用）

### 项目目标

做一个支持 AI 续写、总结、标签推荐的个人笔记 Web 应用。

### 技术栈

- 前端：React + Tailwind CSS
- 后端：Node.js + Express
- 数据库：PostgreSQL
- AI：OpenAI API / Claude API
- 部署：Vercel（前端）+ Railway（后端）

### 核心模块

| 模块 | 功能 | 实现要点 |
|------|------|----------|
| 用户系统 | 注册/登录 | JWT + bcrypt |
| 笔记编辑器 | 富文本/Markdown | TipTap 或 SimpleMDE |
| AI 续写 | 选中文字后生成后续内容 | 调用 LLM streaming API |
| AI 总结 | 一键总结全文 | prompt 模板 + 摘要 |
| AI 标签 | 自动提取标签 | 分类 prompt |
| 搜索 | 全文搜索笔记 | PostgreSQL 全文检索 |

### 推荐路线

1. 用 `vibecoding-workflow-skill` 输出 roadmap
2. 用 `backend-generate-skill` 生成 Node.js 骨架
3. 用 `frontend-ui-foundry` 生成前端界面
4. 用 `super-deploy-skills` 部署上线

---

## 案例二：微信小程序商城

### 项目目标

做一个支持商品展示、购物车、下单支付的微信小程序商城 MVP。

### 技术栈

- 前端：uni-app + Vue3 + TypeScript
- 后端：Java Spring Boot 或 Node.js
- 数据库：MySQL
- 支付：微信支付

### 核心模块

| 模块 | 功能 |
|------|------|
| 首页 | 商品列表、Banner、分类 |
| 商品详情 | 规格选择、加入购物车 |
| 购物车 | 增删改查、结算 |
| 订单 | 下单、支付、状态流转 |
| 我的 | 订单列表、地址管理 |

### 推荐路线

1. 用 `vibecoding-workflow-skill` 输出 roadmap
2. 用 `uniapp-app-generate-skill` 生成小程序项目
3. 用 `backend-generate-skill` 生成后端骨架
4. 用 `module-generate-skill` 添加支付模块
5. 用 `super-deploy-skills` 部署后端和小程序

---

## 案例三：Agent 数据分析师

### 项目目标

做一个能读取 Excel/CSV，自动生成图表并给出分析结论的 Agent。

### 技术栈

- 运行环境：Python
- 框架：自定义 ReAct Agent
- 工具：pandas、matplotlib、OpenAI API
- 界面：Streamlit（可选）

### 核心能力

| 能力 | 工具 |
|------|------|
| 读取文件 | pandas.read_csv / read_excel |
| 生成图表 | matplotlib / seaborn |
| 数据分析 | LLM + prompt |
| 输出报告 | markdown 生成 |

### 推荐路线

1. 用 `agent-learning-skill` 学习 Agent 基础
2. 参考 `min-agent-implementation.md` 实现核心循环
3. 用 Python 封装文件读取、图表生成工具
4. 接入 LLM API 完成数据分析 Agent

---

## 案例选择建议

| 你的情况 | 推荐案例 |
|----------|----------|
| 前端出身，想做 Web 产品 | 案例一 |
| 想接私活/做小程序 | 案例二 |
| 对 Agent 感兴趣 | 案例三 |
| 纯后端，想全栈 | 案例一 |
| 想做 AI 原生应用 | 案例四 |
| 企业内部提效 | 案例五 |

---

## 案例四：AI 客服助手（AI 原生应用）

### 项目目标

做一个基于企业知识库的 AI 客服助手，能回答用户常见问题，回答不了时转人工。

### 技术栈

- 前端：React + Tailwind CSS
- 后端：Python + FastAPI
- RAG：LangChain / LlamaIndex
- 向量数据库：Chroma / Pinecone / PGVector
- Embedding：OpenAI text-embedding-3 / 本地 BGE
- LLM：GPT-4o / Claude 4
- 部署：Docker + 阿里云

### 核心模块

| 模块 | 功能 | 实现要点 |
|------|------|----------|
| 知识库管理 | 上传文档、分块、生成向量 | 文档解析、Embedding、去重 |
| 对话接口 | 接收问题、检索知识、生成回答 | RAG 链路、上下文管理 |
| 转人工 | 置信度低时触发 | 答案评分、兜底策略 |
| 对话记录 | 存储历史对话 | 数据库、隐私合规 |
| 后台管理 | 查看对话、更新知识库 | 管理后台 |

### 推荐路线

1. 用 `vibecoding-workflow-skill` 输出 roadmap
2. 用 `backend-generate-skill` 生成 Python 后端骨架
3. 用 `frontend-ui-foundry` 生成管理后台界面
4. 用 `module-generate-skill` 添加 AI 聊天模块
5. 用 `super-deploy-skills` 部署上线

### 预计耗时

- **MVP**：2-3 周（1 人全栈）
- **可用生产版本**：1-2 个月

### 风险点

- 文档质量差会导致回答质量差
- 需要处理幻觉问题
- 企业数据隐私合规

---

## 案例五：AI 代码审查助手（企业内部提效）

### 项目目标

做一个 Git Hook / CI 插件，自动审查 PR 代码，输出潜在问题和改进建议。

### 技术栈

- 运行环境：Node.js / Python
- Git 集成：GitHub API / GitLab API
- LLM：Claude 4 Sonnet / GPT-4o
- 部署：Docker / Serverless

### 核心能力

| 能力 | 说明 |
|------|------|
| Diff 分析 | 提取 PR 变更内容 |
| 代码审查 | 调用 LLM 分析潜在问题 |
| 评论生成 | 在 PR 中自动发表评论 |
| 规则配置 | 自定义审查规则 |

### 推荐路线

1. 用 `vibecoding-workflow-skill` 输出 roadmap
2. 用 `backend-generate-skill` 生成 Node.js 服务
3. 接入 GitHub/GitLab Webhook
4. 用 LLM 分析 diff 并生成评论

### 预计耗时

- **MVP**：1 周（1 人）
- **完善版本**：2-3 周

### 风险点

- LLM 可能误报，需要人工复核
- API 成本随 PR 数量增长
- 需要处理大 diff 的分块

---

## 原有案例补充预计耗时

### 案例一：个人 AI 笔记助手

- **MVP**：1-2 周（1 人全栈）
- **风险点**：AI 续写质量不稳定、编辑器兼容性

### 案例二：微信小程序商城

- **MVP**：2-4 周（1 人全栈）
- **风险点**：微信支付接入审核、商品类目合规

### 案例三：Agent 数据分析师

- **MVP**：3-5 天（1 人，Python）
- **风险点**：LLM 对数据理解错误、图表生成不稳定
