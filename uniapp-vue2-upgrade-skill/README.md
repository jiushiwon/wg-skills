# UniApp Vue2 Upgrade Skill

将 Vue2 uniapp 项目或原生微信小程序**渐进式**迁移到 Vue3 + TypeScript + Pinia。

针对企业级超大项目（1000+ 页面）设计，**诊断先行、报告驱动**：先扫描全局生成逐文件修改报告，用户审阅批准后再执行迁移。

## 功能

- **技术差异分析**（Phase 0）：扫描项目源码，检出实际使用的 Vue2 模式，生成定制化差异报告 `tech-diff-report.md`
- **全量诊断报告**（Phase 1）：逐文件标注 Vue2 模式 → Vue3 替代方案 → 风险 → 工时 → 依赖，输出 `migration-report.csv`
- **骨架对齐**（Phase 2）：基于 `uniapp-app-generate-skill` 标准骨架初始化 Vue3 项目
- **逐模块迁移**（Phase 4）：按 `migration-report.csv` 的优先级排序逐文件执行
- **灰度切换**（Phase 5）：Feature Flag + 双版本路由 + 线上监控
- **渐进式 TS**：三阶段 TypeScript 引入策略
- **可回滚**：每个模块独立分支，Issue Flag 一键回退

## 使用方式

### 触发命令

```
/uniapp-upgrade
```

或描述以下场景："Vue2 升级到 Vue3"、"uniapp 迁移"、"大项目重构升级"等。

### 典型用法

```bash
> /uniapp-upgrade
# Phase 0: 生成技术差异分析
# Phase 1: 生成逐文件修改报告（migration-report.csv）
# 用户审阅 → 批准
# Phase 2-6: 按报告执行迁移
```

## 工作流

```
诊断组（只读）                   执行组（修改代码）
─────────────                   ─────────────────
Phase 0: 技术差异分析            Phase 2: 骨架对齐
Phase 1: 全量诊断报告            Phase 3: 基础设施层迁移
        ↓                       Phase 4: 逐模块迁移
   用户审阅批准                  Phase 5: 灰度验证
        ↓                       Phase 6: 收尾清理
        └──────────→ 开始迁移 ──→
```

## 资产四分类

迁移前自动扫描，将项目资产分为四类：

| 分类 | 策略 | 示例 |
|------|------|------|
| **可跳过** | 直接复制 | `static/` 图片、字体、音频 |
| **需核对** | 检查 Vue3 兼容版本 | uView、vant-weapp、uni-ui |
| **需适配** | 在新骨架中重新对接 | 阿里云 OSS、腾讯 IM、云函数 |
| **必须改** | 完整语法迁移 | `.vue` 组件、Vuex Store、Mixin |

## 迁移时间预估

| 项目规模 | 页面数 | 预估时间 | 建议策略 |
|----------|--------|----------|----------|
| 小 | < 50 | 2-4 周 | 可一次性迁移 |
| 中 | 50-200 | 4-8 周 | 按模块逐批迁移 |
| 大 | 200-1000 | 8-16 周 | 分多迭代 + 多模块并行 |
| 极大 | 1000+ | 16 周+ | 多团队并行模块迁移 |

## 输出文件

- `tech-diff-report.md` — 项目级技术差异分析
- `migration-report.csv` — **逐文件修改报告（核心交付物）**
- `migration-roadmap.md` — 迁移路线图（优先级 + 工时 + 团队分配）
- `module-map.json` — 模块与文件归属映射
- `module-deps.json` — 模块依赖关系图

## 协作技能

| 阶段 | 协作 Skill | 用途 |
|------|-----------|------|
| Phase 2 | `uniapp-app-generate-skill` | 生成标准 Vue3 骨架 |
| Phase 2 | `image-forge-skill` | 静态资源批量压缩 |
| Phase 2 | `uniapp-theme-skill` | 主题系统迁移 |
| Phase 3 | `frontend-request-skill` | 请求层标准化 |
| Phase 3 | `uniapp-standard-skill` | 规范基线对齐 |
| Phase 4 | `uniapp-page-components-skill` | 页面组件标准化 |
| Phase 6 | `uniapp-code-audit-skill` | 代码质量审计 |
| Phase 6 | `uniapp-style-skill` | 样式一致性审计 |
| Phase 6 | `frontend-style-harmonizer-skill` | 硬编码样式收敛 |
| Phase 6 | `uniapp-crossplatform-audit-skill` | 跨平台兼容性审计 |

## FAQ

### Q: 为什么先扫描再执行？

A: 1000+ 页面的项目如果一上来就改代码，会陷入"改到一半发现漏了大批文件"的困境。Phase 0+1 用只读扫描生成完整报告，让所有人和团队对范围、工时、风险有清晰共识，再动手。

### Q: migration-report.csv 里有什么？

A: 每个文件一行，包含：文件路径、所属分类（SKIP/CHECK/ADAPT/REWRITE）、检测到的 Vue2 模式、推荐 Vue3 方案、风险等级、预估工时、前置依赖。迁移时按依赖顺序逐行执行即可。

### Q: 迁移期间旧项目能否继续上线？

A: 可以。Phase 5 采用双版本共存策略，Feature Flag 控制，旧页面正常运行。

### Q: 出了 bug 怎么回滚？

A: 关闭 Feature Flag 立即回退到旧版本。每个模块在独立分支上迁移，不影响其他模块。

### Q: 迁移后和 `uniapp-app-generate-skill` 生成的项目一致吗？

A: Phase 2 骨架对齐阶段就已完成标准化，最终产物与 `uniapp-app-generate-skill` 生成的项目结构一致。
