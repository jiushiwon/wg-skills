# Frontend Code Doctor 🩺

> 前端代码自动审查工具，自动发现代码质量问题、性能问题和潜在 bug

## ✨ 功能特性

| 维度 | 说明 |
|------|------|
| **Urgent (P0)** | 必须修复的严重问题 |
| **TypeScript (P1)** | 类型安全、any 用法、类型推断 |
| **uniapp (P1)** | 条件编译、平台 API、安全区域 |
| **Vue3/React (P1)** | Hooks 规则、Composition API、响应式 |
| **Performance (P1)** | 内存泄漏、Magic Numbers、console 日志 |
| **Security (P1)** | XSS、CSRF、敏感信息泄露 |
| **i18n (P2)** | 硬编码中文、翻译 key |
| **Accessibility (P1)** | aria-*、键盘导航、焦点管理 |

## 🚀 快速开始

### 安装

安装 Claude Code（如果未安装）：

```bash
# macOS
brew install anthropic/formula/claude-code

# Windows
winget install Anthropic.ClaudeCode
```

验证安装：

```bash
claude --version
```

### 使用方式

当需要审查前端代码时，直接告诉 Claude：

```
/frontend-code-review
```

或描述性的自然语言：

```
帮我审查一下这个前端项目的代码
看看代码有什么问题
```

Claude 会自动：
1. 收集项目中的 `.vue`、`.ts`、`.tsx` 文件
2. 按照规则逐项检查
3. 输出结构化的审查报告

### 审查维度选择

可以在审查时指定特定维度：

```bash
# 只检查 TypeScript 和 Security 问题
Frontend Code Doctor - 仅检查 TypeScript 和 Security

# 检查 React 相关
Frontend Code Doctor - 只看 React hooks 规则
```

## 📋 审查规则详解

### Urgent 问题（P0）

| 规则 | 说明 |
|------|------|
| U1 | `any` 类型丢失类型提示 |
| U2 | 业务码异常未 throw |
| U3 | 内存泄漏（setTimeout 无清理） |
| U4 | 硬编码测试 URL |
| U5 | 图片下载失败无 fallback |

### TypeScript（P1）

| 规则 | 说明 |
|------|------|
| TS-001 | 变量声明为 `any` |
| TS-002 | 函数参数为 `any` |
| TS-010 | 省略类型导致推断错误 |
| TS-050 | `@ts-ignore` 滥用 |
| TS-060 | 混用 null 和 undefined |

### uniapp 特有规范（P1）

| 规则 | 说明 |
|------|------|
| UP-001 | `#ifdef` / `#ifndef` 未配对 |
| UP-010 | `uni.request` 返回类型为 `any` |
| UP-020 | fixed 元素未预留安全区域 |
| UP-040 | hardcode 测试环境 URL |

### Vue3 最佳实践（P1）

| 规则 | 说明 |
|------|------|
| V3-001 | ref/reactive 混用导致响应式丢失 |
| V3-010 | computed 内部创建新对象 |
| V3-020 | 缺少清理逻辑 |
| V3-040 | Props 未使用 defineProps 泛型 |
| V3-070 | 大列表未虚拟化 |

### React Hooks（P1）

| 规则 | 说明 |
|------|------|
| RH-001 | useState 初始值为函数时未使用 lazy init |
| RH-002 | useEffect 依赖数组缺失或错误 |
| RH-003 | useCallback/useMemo 未指定依赖数组 |
| RH-004 | 在循环/条件/嵌套中调用 hooks |
| RH-040 | queryKey 缺少依赖数组 |

### Performance（P1）

| 规则 | 说明 |
|------|------|
| PF-001 | setTimeout 无限递归无清理 |
| PF-002 | addEventListener 未 remove |
| PF-010 | 方法超过 500 行 |
| PF-050 | 生产环境 console.log 遗留 |
| PF-060 | 魔数 9999999 |

### Security（P1）

| 规则 | 说明 |
|------|------|
| SE-001 | API Key/Token 硬编码 |
| SE-010 | dangerouslySetInnerHTML 未校验输入 |
| SE-020 | POST 请求缺少 CSRF Token |
| SE-030 | 仅客户端校验 |
| SE-050 | HTTP 而非 HTTPS |

### i18n 国际化（P2）

| 规则 | 说明 |
|------|------|
| I18N-001 | JS/TS 文件中中文字符串 |
| I18N-010 | key 命名不一致 |
| I18N-020 | 复数未使用 ICU 格式 |
| I18N-050 | 方��样式硬编码 |

### Accessibility 无障碍（P1）

| 规则 | 说明 |
|------|------|
| A11Y-001 | img 缺少 alt 属性 |
| A11Y-010 | input 缺少关联 label |
| A11Y-020 | 可点击元素缺少 focus |
| A11Y-040 | 文本对比度 < 4.5:1 |
| A11Y-070 | 可点击区域 < 44x44px |

## 📖 输出示例

审查完成后，会输出如下格式的报告：

```markdown
# Frontend Code Doctor - my-project

> 审查时间：2024-01-15 10:30:00
> 技术栈：uniapp + Vue3 + TypeScript

---

## Found 3 urgent issues need to be fixed

## 1 any 类型丢失类型提示
FilePath: src/api/user.ts line 25

```typescript
const data: any = res.data;
```

### Suggested fix
明确指定返回类型：
interface UserInfo { id: number; name: string; }
const data: UserInfo = res.data;

---

## 统计

| 类别 | 数量 |
|------|------|
| Urgent 问题 | 3 |
| TypeScript 问题 | 5 |
| Performance 问题 | 2 |
| **总计** | 10 |
```

## 🔧 项目集成

### 在项目中添加审查脚本

创建 `scripts/code-review.mjs`：

```javascript
import { execSync } from 'child_process';
import { globSync } from 'glob';

const files = globSync(['src/**/*.{vue,ts,tsx}', '!src/**/*.d.ts']);
console.log(`审查 ${files.length} 个文件...`);
```

### CI 集成

```yaml
# .github/workflows/code-review.yml
name: Code Review
on: [pull_request]
jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Claude Code
        run: claude -p "审查 src/ 目录下的代码"
```

## 🤝 贡献指南

欢迎提交新的审查规则！

1. 在 `references/` 目录添加新的规则文件
2. 在 `SKILL.md` 中添加对应的检查命令
3. 更新统计表格

## 📄 License

MIT License