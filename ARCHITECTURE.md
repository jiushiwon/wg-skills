# ARCHITECTURE — wg-skills 拓扑

> 本文件描述仓库的**实际结构**与核心机制，供维护者与深度使用者理解「技能之间怎么连起来」。

## 1. 板块拓扑

```
wg-skills/
├── AGENTS.md                    # 仓库级规范（唯一 SoT）
├── CLAUDE.md                    # Claude Code 入口（引用 AGENTS.md）
├── README.md                    # 产品页（能力地图）
├── ONBOARDING.md                # 5 分钟新手路径
├── CHANGELOG.md                 # 变更聚合
├── MISSING_SKILLS.md            # 私有仓库 skill 登记
├── scripts/                     # 健康检查 + 维护工具
│
├── vibeCoding/                  # 板块一：编程开发（~90%）
│   ├── backend/                 #   后端 5 语言 + 数据库 + 元工具 + shared
│   ├── frontend/                #   前端 4 套体系 + 公共能力 + Electron
│   ├── super-deploy-skills/     #   部署套件（16 个）
│   └── vibecoding-guide-skill/  #   VibeCoding 工作流方法论（4 个）
│
└── others/                      # 板块二：其他领域工具（~10%）
    ├── ai-speech-detector / humanizer / skill-auditor
    ├── workflow-diagram-skill / xhs-style-writer-skill
    ├── electron-native-abi-fix
    └── video/ (ffmpeg / remotion)
```

## 2. 前后端一体化（契约连接）

前后端不通过口头约定，而通过**接口契约**连接：

```
后端 shared/ 六份 spec
  ├─ response-envelope-spec   { code, message, data }
  ├─ error-code-spec          0 成功 / 负数失败 / -3xxx 模块扩展
  ├─ jwt-auth-spec            Bearer + HS256
  ├─ pagination-spec          page + pageSize（camelCase）
  ├─ api-contract-template    init-skill 基础接口
  └─ module-output-spec       module-skill 增量契约
        │
        ▼
  init-skill ──生成──▶ api-contract.md
  module-skill ──追加──▶ api-contract-<module>.md
        │
        ▼
  frontend-request-skill ──消费──▶ request.ts / ERROR_CODE_MAP / upload / sse
```

## 3. 技术栈矩阵

| 层 | Java | Python | Go | Node.js | Rust |
|----|------|--------|-----|---------|------|
| 初始化 | springboot-init | fastapi-init | go-gin-init / go-frame-init / go-grpc-init | nodejs-init | rust-backend |
| 业务模块 | 14 个 module | 15 个 module | go-auth / go-ws / go-storage | — | — |
| 快速入门 | java-fast | python-fast | — | — | — |

| 前端体系 | Vue | UniApp | React | HTML |
|---------|-----|--------|-------|------|
| 完成度 | 85% | 90% | 30% | 10%（重点方向） |
| 组件/容器 | vue-base（30+ 子） | uniapp-base（26 组件 + 6 容器） | — | — |
| 主题 | vue-theme | uniapp-theme | — | — |
| 项目生成 | vue-generate / nuxt | uniapp-app-generate | react / next / react-native | html-template |

## 4. 规范分层（三层单向）

```
仓库级  AGENTS.md（根）               ── 定位 / 目录 / 跨栈规则
   ▲
模块级  <栈>/AGENTS.md                ── 层级架构 / 唯一真源 / 协作规则
   ▲   （frontend、uniapp 已建，其余待补）
个体级  <skill>/STANDARD.md           ── 特有红线（编号约束）/ 自检清单
   （uniapp 15/15、frontend 公共层 3 个，其余渐进补齐）
```

## 5. 父子嵌套（串接触发）

- `vue-base-skill` → 30+ 子组件（button/card/table/form/tree/...）+ `vue-complex-skill`（7 复合场景）
- `uniapp-base-skill` → 6 根容器 + 26 组件
- `icon-image-catch-skill` → 图标抓取 + 图片抓取
- `super-deploy-skills` → 数据库安装 / 运行时安装 / Docker / 原生 / Nginx / 服务器 / 检测

## 6. 关键机制

- **唯一真源（SoT）**：同一事实只存一份（主题变量、容器实现、错误码表、组件注册表），其余引用。
- **契约赢**：`api-contract.md` 是前后端唯一事实来源，实现与契约冲突时契约优先。
- **容器原则**：内容型组件外壳必须来自根容器，禁止手写圆角 / 遮罩 / 弹窗。
- **零 HTML5 标签**：`.md` 组件文档用 `<div role="*">` + ARIA 替代原生控件；demo HTML 豁免。
- **只读优先**：审查类 skill（style-harmonizer / safe-area-audit）默认只报告，确认后才 `--apply`。
