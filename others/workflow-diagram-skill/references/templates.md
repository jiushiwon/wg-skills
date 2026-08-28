# 流程图模板库

本文件定义 workflow-diagram-skill 的现成模板。

Claude 在匹配到用户请求后，读取对应模板并传入 `scripts/generate_diagram.py` 生成图解。

## 模板字段说明

```yaml
- id: 模板唯一标识（用于命令行和内部匹配）
  name: 显示名称
  category: 分类
  tags: [匹配关键词列表]
  default_style: flat | sketchy | dark
  nodes:
    - id: 节点标识
      label: 节点标题（≤6 字）
      sub: 副标题（≤14 字）
      icon: 图标名，见 references/icon-library.md
  edges:
    - from: 源节点 id
      to: 目标节点 id
      label: 可选，箭头标签
      dashed: 可选，是否虚线
```

---

templates:
  # AI / 开发
  - id: vibe-coding
    name: Vibe Coding 流程
    category: AI开发
    tags: [vibe coding, AI编程, 迭代开发, 氛围编程]
    default_style: flat
    groups:
      - name: 需求探索
        nodes: [idea, brainstorm, clarify]
      - name: AI 规划
        nodes: [parse, arch, product]
      - name: AI 生成
        nodes: [codegen, run, check]
      - name: 反馈迭代
        nodes: [feedback, natural]
      - name: 部署上线
        nodes: [git, probe, install, release]
    nodes:
      - { id: idea, label: 用户想法, sub: 自然语言描述要做的东西, icon: user }
      - { id: brainstorm, label: 头脑风暴, sub: brainstorming / grill-me, icon: chat }
      - { id: clarify, label: 需求澄清, sub: 拆 MVP、明确边界、排优先级, icon: brain }
      - { id: parse, label: 意图解析, sub: LLM 理解需求、拆任务, icon: brain }
      - { id: arch, label: 技术架构选型, sub: 前端 / 后端 / 数据库, icon: code }
      - { id: product, label: 产品形态定型, sub: 小程序 / H5 / App / 自动化工具, icon: rocket }
      - { id: codegen, label: 生成代码, sub: 自动写出可运行代码, icon: code }
      - { id: run, label: 自动运行预览, sub: 执行、预览、报错兜底, icon: play }
      - { id: check, label: 验收检查, sub: 功能 / 样式 / 边界条件, icon: eye }
      - { id: feedback, label: 反馈迭代, sub: 满意？继续改 / 加功能, icon: loop }
      - { id: natural, label: 自然语言反馈, sub: "这里再口语化一点", icon: chat }
      - { id: git, label: 上传 Git, sub: commit / push / tag, icon: git }
      - { id: probe, label: 环境探测, sub: OS / 运行时 / 依赖版本, icon: server }
      - { id: install, label: 环境安装, sub: Docker / Nginx / 数据库, icon: server }
      - { id: release, label: 正式发布, sub: 域名 / HTTPS / 监控, icon: rocket }
    edges:
      - { from: idea, to: brainstorm }
      - { from: brainstorm, to: clarify }
      - { from: clarify, to: parse }
      - { from: parse, to: arch }
      - { from: arch, to: product }
      - { from: product, to: codegen }
      - { from: codegen, to: run }
      - { from: run, to: check }
      - { from: check, to: feedback }
      - { from: feedback, to: natural }
      - { from: natural, to: git }
      - { from: git, to: probe }
      - { from: probe, to: install }
      - { from: install, to: release }
      - { from: feedback, to: parse, label: 不满意继续迭代, dashed: true }

  - id: claude-code
    name: Claude Code 开发流程
    category: AI开发
    tags: [claude code, claude, AI开发, 编程助手]
    default_style: flat
    nodes:
      - { id: prompt, label: 输入需求, sub: 用自然语言描述任务, icon: user }
      - { id: plan, label: 制定计划, sub: Claude 拆解步骤并确认, icon: brain }
      - { id: explore, label: 探索代码库, sub: grep / read / 理解上下文, icon: eye }
      - { id: edit, label: 编辑代码, sub: 自动修改文件并测试, icon: code }
      - { id: verify, label: 验证结果, sub: 运行测试 / 检查输出, icon: play }
      - { id: commit, label: 提交代码, sub: git commit / push, icon: git }
    edges:
      - { from: prompt, to: plan }
      - { from: plan, to: explore }
      - { from: explore, to: edit }
      - { from: edit, to: verify }
      - { from: verify, to: commit }
      - { from: verify, to: edit, label: 测试失败, dashed: true }

  - id: codex
    name: Codex 开发流程
    category: AI开发
    tags: [codex, openai, AI开发]
    default_style: flat
    nodes:
      - { id: task, label: 描述任务, sub: 在沙盒中描述需求, icon: user }
      - { id: agent, label: Agent 规划, sub: Codex 规划工具和步骤, icon: brain }
      - { id: exec, label: 执行工具, sub: 代码编辑 / 终端 / 测试, icon: code }
      - { id: review, label: 结果审查, sub: 检查变更和输出, icon: eye }
      - { id: merge, label: 合并提交, sub: PR / merge 到主分支, icon: git }
    edges:
      - { from: task, to: agent }
      - { from: agent, to: exec }
      - { from: exec, to: review }
      - { from: review, to: merge }
      - { from: review, to: agent, label: 需调整, dashed: true }

  - id: ai-learning
    name: AI 学习路径
    category: AI开发
    tags: [AI学习, 学习路径, 机器学习, LLM]
    default_style: flat
    nodes:
      - { id: basic, label: 基础概念, sub: 线性代数 / 概率 / Python, icon: brain }
      - { id: ml, label: 机器学习, sub: 监督 / 无监督 / 深度学习, icon: code }
      - { id: llm, label: 大模型, sub: Transformer / 预训练 / 微调, icon: brain }
      - { id: agent, label: Agent 开发, sub: RAG / 工具调用 / 记忆, icon: rocket }
      - { id: project, label: 实战项目, sub: 端到端 AI 应用, icon: play }
    edges:
      - { from: basic, to: ml }
      - { from: ml, to: llm }
      - { from: llm, to: agent }
      - { from: agent, to: project }

  - id: llm-internals
    name: LLM 内部结构
    category: AI开发
    tags: [LLM, 大模型, 原理, transformer]
    default_style: flat
    nodes:
      - { id: input, label: 输入文本, sub: Token 化 + 嵌入, icon: user }
      - { id: embed, label: 词向量, sub: Embedding + 位置编码, icon: brain }
      - { id: attn, label: 注意力层, sub: Self-Attention / 多头, icon: brain }
      - { id: ffn, label: 前馈网络, sub: Feed-Forward / 激活函数, icon: code }
      - { id: output, label: 输出概率, sub: Softmax / 采样生成, icon: play }
    edges:
      - { from: input, to: embed }
      - { from: embed, to: attn }
      - { from: attn, to: ffn }
      - { from: ffn, to: output }

  - id: rag-flow
    name: RAG 检索增强生成
    category: AI开发
    tags: [RAG, 检索, 向量数据库, AI]
    default_style: flat
    nodes:
      - { id: docs, label: 文档输入, sub: PDF / 网页 / 笔记, icon: user }
      - { id: chunk, label: 分块, sub: 按语义 / 固定长度切分, icon: brain }
      - { id: embed2, label: 向量化, sub: Embedding 模型编码, icon: code }
      - { id: store, label: 向量存储, sub: 写入向量数据库, icon: server }
      - { id: query, label: 用户查询, sub: 自然语言提问, icon: user }
      - { id: retrieve, label: 检索, sub: 相似度召回 Top-K, icon: eye }
      - { id: augment, label: 增强, sub: 拼接上下文, icon: brain }
      - { id: generate, label: 生成回答, sub: LLM 基于上下文作答, icon: play }
    edges:
      - { from: docs, to: chunk }
      - { from: chunk, to: embed2 }
      - { from: embed2, to: store }
      - { from: query, to: retrieve }
      - { from: retrieve, to: augment }
      - { from: store, to: retrieve, dashed: true }
      - { from: augment, to: generate }

  # 通用职场
  - id: onboarding
    name: 入职流程
    category: 通用职场
    tags: [入职, 新员工, HR, 流程]
    default_style: flat
    nodes:
      - { id: offer, label: 接收 Offer, sub: 签署合同 / 确认入职时间, icon: user }
      - { id: materials, label: 准备材料, sub: 身份证 / 学历证明 / 体检, icon: brain }
      - { id: firstday, label: 入职当天, sub: 办理工卡 / 领电脑 / 签合同, icon: play }
      - { id: training, label: 入职培训, sub: 公司制度 / 系统权限, icon: brain }
      - { id: mentor, label: 导师带教, sub: 熟悉业务 / 交接任务, icon: chat }
      - { id: trial, label: 试用期, sub: 目标设定 / 定期反馈, icon: loop }
    edges:
      - { from: offer, to: materials }
      - { from: materials, to: firstday }
      - { from: firstday, to: training }
      - { from: training, to: mentor }
      - { from: mentor, to: trial }

  - id: programmer-daily
    name: 程序员上班一天
    category: 通用职场
    tags: [程序员, 上班, 日常, 开发]
    default_style: sketchy
    nodes:
      - { id: standup, label: 站会, sub: 同步进度 / 阻塞点, icon: chat }
      - { id: code, label: 写代码, sub: feature / bugfix / review, icon: code }
      - { id: lunch, label: 午饭, sub: 干饭 / 刷手机, icon: user }
      - { id: meeting, label: 开会, sub: 需求评审 / 技术方案, icon: chat }
      - { id: test, label: 自测, sub: 本地跑通 / 修 bug, icon: play }
      - { id: commit2, label: 提交, sub: git push / PR, icon: git }
    edges:
      - { from: standup, to: code }
      - { from: code, to: lunch }
      - { from: lunch, to: meeting }
      - { from: meeting, to: test }
      - { from: test, to: commit2 }

  - id: meeting-flow
    name: 会议组织流程
    category: 通用职场
    tags: [会议, 组织, 流程, 会议管理]
    default_style: flat
    nodes:
      - { id: goal, label: 明确目标, sub: 确定议题和预期产出, icon: brain }
      - { id: invite, label: 邀请人员, sub: 只叫必要的人, icon: user }
      - { id: agenda, label: 准备议程, sub: 时间分配 / 材料, icon: brain }
      - { id: host, label: 主持会议, sub: 控场 / 记录 / 决策, icon: chat }
      - { id: minutes, label: 输出纪要, sub: Todo / 负责人 / 截止时间, icon: code }
      - { id: follow, label: 跟进执行, sub: 定期检查进度, icon: loop }
    edges:
      - { from: goal, to: invite }
      - { from: invite, to: agenda }
      - { from: agenda, to: host }
      - { from: host, to: minutes }
      - { from: minutes, to: follow }

  # 学术 / 医疗
  - id: phd-research
    name: 博士生研究流程
    category: 学术医疗
    tags: [博士, 研究, 学术, 论文]
    default_style: flat
    nodes:
      - { id: topic, label: 选题, sub: 文献调研 / 导师沟通, icon: brain }
      - { id: proposal, label: 开题报告, sub: 研究问题 / 方法 / 创新点, icon: code }
      - { id: experiment, label: 实验, sub: 设计 / 数据采集 / 分析, icon: play }
      - { id: paper, label: 撰写论文, sub: 结构 / 图表 / 反复修改, icon: code }
      - { id: defense, label: 答辩, sub: 预答辩 / 正式答辩, icon: chat }
      - { id: graduate, label: 毕业, sub: 论文提交 / 学位授予, icon: rocket }
    edges:
      - { from: topic, to: proposal }
      - { from: proposal, to: experiment }
      - { from: experiment, to: paper }
      - { from: paper, to: defense }
      - { from: defense, to: graduate }
      - { from: experiment, to: proposal, label: 假设不成立, dashed: true }

  - id: graduation
    name: 毕业流程
    category: 学术医疗
    tags: [毕业, 大学生, 论文, 答辩]
    default_style: flat
    nodes:
      - { id: course, label: 完成课程, sub: 修满学分, icon: brain }
      - { id: thesis, label: 毕业论文, sub: 选题 / 撰写 / 查重, icon: code }
      - { id: review, label: 论文评审, sub: 导师 / 盲审 / 修改, icon: eye }
      - { id: defense2, label: 毕业答辩, sub: 准备 PPT / 回答问题, icon: chat }
      - { id: submit, label: 材料提交, sub: 论文终稿 / 档案, icon: git }
      - { id: ceremony, label: 毕业典礼, sub: 领证 / 拍照, icon: rocket }
    edges:
      - { from: course, to: thesis }
      - { from: thesis, to: review }
      - { from: review, to: defense2 }
      - { from: defense2, to: submit }
      - { from: submit, to: ceremony }

  - id: medical-conference
    name: 医学报告大会流程
    category: 学术医疗
    tags: [医学, 报告大会, 学术会议, 医疗]
    default_style: flat
    nodes:
      - { id: call, label: 征文通知, sub: 发布议题 / 截止日期, icon: chat }
      - { id: submit3, label: 投稿, sub: 摘要 / 全文 / 伦理审批, icon: user }
      - { id: review3, label: 专家评审, sub: 盲审 / 修改意见, icon: eye }
      - { id: accept, label: 录用通知, sub: 注册缴费 / 准备 PPT, icon: brain }
      - { id: present, label: 大会报告, sub: 演讲 / 问答 / 海报, icon: play }
      - { id: publish, label: 成果发表, sub: 会议论文 / 视频回放, icon: rocket }
    edges:
      - { from: call, to: submit3 }
      - { from: submit3, to: review3 }
      - { from: review3, to: accept }
      - { from: review3, to: submit3, label: 需修改, dashed: true }
      - { from: accept, to: present }
      - { from: present, to: publish }

  # 内容创作
  - id: short-drama-ai-video
    name: 短剧 AI 视频制作流程
    category: 内容创作
    tags: [短剧, AI视频, 内容创作, 视频制作]
    default_style: sketchy
    nodes:
      - { id: script, label: 剧本策划, sub: 选题 / 分集 / 人设, icon: brain }
      - { id: split, label: 分镜拆解, sub: 场景 / 镜头 / 台词, icon: eye }
      - { id: image, label: AI 生图, sub: Midjourney / SD / 即梦, icon: play }
      - { id: video, label: AI 转视频, sub: Runway / 可灵 / Veo, icon: play }
      - { id: dub, label: AI 配音, sub: 克隆音色 / 对口型, icon: chat }
      - { id: edit, label: 剪辑发布, sub: 剪映 / 字幕 / 平台分发, icon: rocket }
    edges:
      - { from: script, to: split }
      - { from: split, to: image }
      - { from: image, to: video }
      - { from: video, to: dub }
      - { from: dub, to: edit }

  - id: xiaohongshu-start
    name: 小红书起号流程
    category: 内容创作
    tags: [小红书, 起号, 自媒体, 内容创作]
    default_style: sketchy
    nodes:
      - { id: position, label: 定位, sub: 赛道 / 人设 / 目标用户, icon: brain }
      - { id: research, label: 对标研究, sub: 找爆款 / 拆选题 / 学风格, icon: eye }
      - { id: content, label: 内容生产, sub: 图文 / 视频 / 标题, icon: code }
      - { id: post, label: 发布测试, sub: 发布时间 / 标签 / 互动, icon: play }
      - { id: data, label: 数据分析, sub: 小眼睛 / 点赞 / 收藏, icon: brain }
      - { id: iterate, label: 迭代优化, sub: 复制爆款 / 调整方向, icon: loop }
    edges:
      - { from: position, to: research }
      - { from: research, to: content }
      - { from: content, to: post }
      - { from: post, to: data }
      - { from: data, to: iterate }
      - { from: iterate, to: content, label: 继续产出, dashed: true }

  # ============ 学习流程 ============
  - id: english-learning
    name: 英语学习路径
    category: 学习流程
    tags: [英语, 学习, 外语, 语言学习]
    default_style: flat
    nodes:
      - { id: phase1, label: 音标入门, sub: 48个音标/发音规则, icon: user }
      - { id: phase2, label: 基础词汇, sub: 2000核心词/词根记忆, icon: brain }
      - { id: phase3, label: 语法入门, sub: 时态/从句/基本句型, icon: brain }
      - { id: phase4, label: 听力入门, sub: 慢速VOA/听力材料, icon: eye }
      - { id: phase5, label: 口语基础, sub: 跟读/影子法/发音, icon: chat }
      - { id: phase6, label: 阅读提升, sub: 外刊/原版书/分级阅读, icon: document }
      - { id: phase7, label: 写作入门, sub: 句子/段落/模板, icon: document }
      - { id: phase8, label: 高级提升, sub: 雅思/托福/商务英语, icon: rocket }
    edges:
      - { from: phase1, to: phase2 }
      - { from: phase2, to: phase3 }
      - { from: phase3, to: phase4 }
      - { from: phase4, to: phase5 }
      - { from: phase5, to: phase6 }
      - { from: phase6, to: phase7 }
      - { from: phase7, to: phase8 }

  - id: finance-learning
    name: 理财学习路径
    category: 学习流程
    tags: [理财, 投资, 金融, 钱]
    default_style: flat
    nodes:
      - { id: f1, label: 存钱基础, sub: 记账/预算/紧急备用金, icon: brain }
      - { id: f2, label: 理财观念, sub: 复利/风险/资产配置, icon: brain }
      - { id: f3, label: 基金入门, sub: 货币基金/债券基金, icon: star }
      - { id: f4, label: 股票基础, sub: 财报/估值/基本面, icon: code }
      - { id: f5, label: 保险配置, sub: 医疗/寿险/意外险, icon: star }
      - { id: f6, label: 可转债, sub: 打新/套利/双低策略, icon: star }
      - { id: f7, label: 资产配置, sub: 分散投资/定投, icon: brain }
      - { id: f8, label: 财务自由, sub: 被动收入/FIRE, icon: rocket }
    edges:
      - { from: f1, to: f2 }
      - { from: f2, to: f3 }
      - { from: f3, to: f4 }
      - { from: f4, to: f5 }
      - { from: f5, to: f6 }
      - { from: f6, to: f7 }
      - { from: f7, to: f8 }

  - id: coding-learning
    name: 编程学习路径
    category: 学习流程
    tags: [编程, 程序员, 开发, 码农]
    default_style: flat
    nodes:
      - { id: c1, label: 编程入门, sub: Python/变量/循环, icon: code }
      - { id: c2, label: 数据结构, sub: 数组/链表/栈/队列, icon: brain }
      - { id: c3, label: 算法基础, sub: 排序/查找/递归, icon: brain }
      - { id: c4, label: 计算机基础, sub: 计网/操作系统/数据库, icon: server }
      - { id: c5, label: 前端入门, sub: HTML/CSS/JS, icon: code }
      - { id: c6, label: 后端入门, sub: Java/Go/数据库, icon: server }
      - { id: c7, label: 项目实战, sub: 毕设/开源/实习, icon: rocket }
      - { id: c8, label: 求职准备, sub: 刷题/八股/项目, icon: chat }
    edges:
      - { from: c1, to: c2 }
      - { from: c2, to: c3 }
      - { from: c3, to: c4 }
      - { from: c4, to: c5 }
      - { from: c4, to: c6 }
      - { from: c5, to: c7 }
      - { from: c6, to: c7 }
      - { from: c7, to: c8 }

  - id: fitness-flow
    name: 健身流程
    category: 日常流程
    tags: [健身, 运动, 锻炼, 减肥]
    default_style: cute
    nodes:
      - { id: g1, label: 热身, sub: 动态拉伸/跑步机, icon: play }
      - { id: g2, label: 力量训练, sub: 哑铃/杠铃/自重, icon: bolt }
      - { id: g3, label: 有氧训练, sub: 跑步/划船/单车, icon: star }
      - { id: g4, label: 核心训练, sub: 卷腹/平板支撑, icon: star }
      - { id: g5, label: 拉伸放松, sub: 静态拉伸/泡沫轴, icon: user }
      - { id: g6, label: 蛋白质补充, sub: 蛋白粉/鸡胸/鸡蛋, icon: cloud }
    edges:
      - { from: g1, to: g2 }
      - { from: g2, to: g3 }
      - { from: g3, to: g4 }
      - { from: g4, to: g5 }
      - { from: g5, to: g6 }

  - id: morning-routine
    name: 早起流程
    category: 日常流程
    tags: [早起, 晨间, 习惯, 自律]
    default_style: sketchy
    nodes:
      - { id: m1, label: 闹钟响起, sub: 立即起床/不赖床, icon: user }
      - { id: m2, label: 喝杯温水, sub: 补充水分/唤醒身体, icon: cloud }
      - { id: m3, label: 简单拉伸, sub: 舒展筋骨/清醒大脑, icon: user }
      - { id: m4, label: 晨读/学习, sub: 看书/背单词/听播客, icon: brain }
      - { id: m5, label: 早餐准备, sub: 营养均衡/自己做, icon: star }
      - { id: m6, label: 出门准备, sub: 穿搭/整理/检查, icon: rocket }
    edges:
      - { from: m1, to: m2 }
      - { from: m2, to: m3 }
      - { from: m3, to: m4 }
      - { from: m4, to: m5 }
      - { from: m5, to: m6 }

  - id: house-buying
    name: 买房流程
    category: 日常流程
    tags: [买房, 房产, 购房, 安家]
    default_style: flat
    nodes:
      - { id: h1, label: 预算评估, sub: 首付/月供/税费, icon: brain }
      - { id: h2, label: 需求梳理, sub: 地段/户型/学区, icon: brain }
      - { id: h3, label: 看房选房, sub: 新房/二手房/法拍, icon: eye }
      - { id: h4, label: 谈判签约, sub: 谈价/签合同/付定金, icon: document }
      - { id: h5, label: 贷款办理, sub: 银行面签/批贷, icon: star }
      - { id: h6, label: 过户交房, sub: 缴税/过户/拿房本, icon: rocket }
      - { id: h7, label: 装修入住, sub: 装修/散味/搬家, icon: rocket }
    edges:
      - { from: h1, to: h2 }
      - { from: h2, to: h3 }
      - { from: h3, to: h4 }
      - { from: h4, to: h5 }
      - { from: h5, to: h6 }
      - { from: h6, to: h7 }

  - id: travel-flow
    name: 自助旅行流程
    category: 日常流程
    tags: [旅行, 旅游, 自助游, 出行]
    default_style: sketchy
    nodes:
      - { id: t1, label: 确定目的地, sub: 预算/天数/季节, icon: brain }
      - { id: t2, label: 机票酒店, sub: 抢票/预订/比价, icon: star }
      - { id: t3, label: 行程规划, sub: 景点/交通/美食, icon: eye }
      - { id: t4, label: 签证材料, sub: 护照/签证/保险, icon: document }
      - { id: t5, label: 物品准备, sub: 行李/转换插/现金, icon: user }
      - { id: t6, label: 出发旅行, sub: 打卡/拍照/体验, icon: rocket }
      - { id: t7, label: 回顾分享, sub: 发朋友圈/写游记, icon: chat }
    edges:
      - { from: t1, to: t2 }
      - { from: t2, to: t3 }
      - { from: t3, to: t4 }
      - { from: t4, to: t5 }
      - { from: t5, to: t6 }
      - { from: t6, to: t7 }

  - id: exam-cert
    name: 考证流程
    category: 学习流程
    tags: [考证, 考试, 证书, 职业]
    default_style: flat
    nodes:
      - { id: e1, label: 选证, sub: 行业认可度/含金量, icon: brain }
      - { id: e2, label: 了解考试, sub: 科目/时间/题型, icon: eye }
      - { id: e3, label: 制定计划, sub: 周期/重点/方法, icon: document }
      - { id: e4, label: 第一轮复习, sub: 看书/听课/打基础, icon: brain }
      - { id: e5, label: 第二轮复习, sub: 刷题/重点/错题, icon: code }
      - { id: e6, label: 冲刺押题, sub: 模拟卷/背诵, icon: star }
      - { id: e7, label: 考前准备, sub: 准考证/考场, icon: user }
      - { id: e8, label: 查分领证, sub: 等成绩/拿证书, icon: rocket }
    edges:
      - { from: e1, to: e2 }
      - { from: e2, to: e3 }
      - { from: e3, to: e4 }
      - { from: e4, to: e5 }
      - { from: e5, to: e6 }
      - { from: e6, to: e7 }
      - { from: e7, to: e8 }

  - id: side-hustle
    name: 副业赚钱流程
    category: 日常流程
    tags: [副业, 赚钱, 兼职, 变现]
    default_style: flat
    nodes:
      - { id: s1, label: 技能盘点, sub: 会什么/能做什么, icon: brain }
      - { id: s2, label: 市场调研, sub: 需求/竞品/定价, icon: eye }
      - { id: s3, label: 选方向, sub: 带货/接单/知识付费, icon: star }
      - { id: s4, label: 搭建基础, sub: 账号/工具/作品集, icon: code }
      - { id: s5, label: 冷启动, sub: 引流/内容/积累, icon: play }
      - { id: s6, label: 变现尝试, sub: 接单/卖货/收会员, icon: star }
      - { id: s7, label: 放大复制, sub: 规模化/团队化, icon: rocket }
    edges:
      - { from: s1, to: s2 }
      - { from: s2, to: s3 }
      - { from: s3, to: s4 }
      - { from: s4, to: s5 }
      - { from: s5, to: s6 }
      - { from: s6, to: s7 }

  - id: healthy-life
    name: 健康生活流程
    category: 日常流程
    tags: [健康, 养生, 习惯, 生活方式]
    default_style: cute
    nodes:
      - { id: hl1, label: 早起, sub: 固定时间/不赖床, icon: user }
      - { id: hl2, label: 运动, sub: 每周3次/30分钟, icon: bolt }
      - { id: hl3, label: 饮食, sub: 均衡营养/七分饱, icon: star }
      - { id: hl4, label: 工作, sub: 专注/番茄钟/休息, icon: code }
      - { id: hl5, label: 睡眠, sub: 固定作息/睡前不玩手机, icon: cloud }
      - { id: hl6, label: 复盘, sub: 每日总结/习惯追踪, icon: document }
    edges:
      - { from: hl1, to: hl2 }
      - { from: hl2, to: hl3 }
      - { from: hl3, to: hl4 }
      - { from: hl4, to: hl5 }
      - { from: hl5, to: hl6 }

  - id: product-launch
    name: 产品上线流程
    category: 工作流程
    tags: [产品, 上线, 发布, 开发]
    default_style: flat
    nodes:
      - { id: p1, label: 需求评审, sub: PRD/原型/优先级, icon: brain }
      - { id: p2, label: 设计评审, sub: UI/UX/交互, icon: eye }
      - { id: p3, label: 开发联调, sub: 前端/后端/接口, icon: code }
      - { id: p4, label: 测试验收, sub: 功能/性能/回归, icon: play }
      - { id: p5, label: 灰度发布, sub: 小流量/监控/回滚, icon: cloud }
      - { id: p6, label: 全量上线, sub: 公告/推广/监控, icon: rocket }
      - { id: p7, label: 复盘总结, sub: 数据/问题/迭代, icon: document }
    edges:
      - { from: p1, to: p2 }
      - { from: p2, to: p3 }
      - { from: p3, to: p4 }
      - { from: p4, to: p5 }
      - { from: p5, to: p6 }
      - { from: p6, to: p7 }

