---
name: frontend-code-doctor
description: 前端代码审查技能，支持 uniapp + Vue3 + React + TypeScript 项目。审查范围：类型安全、uniapp 特有规范、Vue3/React 最佳实践、性能问题、安全漏洞、i18n 国际化、Accessibility 无障碍。使用方式：当用户请求审查前端代码、进行 code review、检查代码质量问题时调用。
---

# Frontend Code Doctor - uniapp + Vue3 代码审查

本技能用于审查 uniapp + Vue3 + TypeScript 前端项目，发现代码质量问题、性能问题和潜在 bug。

## 审查维度

本技能从以下 5 个维度进行审查，默认全部开启：

| 维度 | 优先级 | 检查内容 |
|------|--------|----------|
| **Urgent** | P0 | 必须修复的严重问题 |
| **TypeScript** | P1 | 类型安全、`any` 用法、类型推断 |
| **uniapp 规范** | P1 | 条件编译、平台 API、安全区域 |
| **Performance** | P1 | 性能问题、内存泄漏 |
| **Business** | P2 | 业务逻辑、配置管理 |
| **React** | P1 | Hooks 规则、useEffect 依赖、自定义 hook |
| **Security** | P1 | XSS、CSRF、敏感信息、输入校验 |
| **i18n** | P2 | 硬编码中文、翻译 key、RTL 支持 |
| **Accessibility** | P1 | aria-*、键盘导航、焦点管理 |

## 开始审查

### Step 1: 收集文件

使用 Glob 收集待审查的源文件：

```bash
# Vue 文件
Glob "**/*.vue"

# TypeScript 文件
Glob "**/*.ts"
```

排除以下目录：
- `node_modules/`
- `dist/`
- `unpackage/`
- `.git/`

### Step 2: 执行审查

按照以下规则进行检查，将发现的违规标记到对应位置。

#### Urgent 问题（P0，必须修复）

| 规则 ID | 问题描述 | 检查模式 |
|---------|----------|----------|
| U1 | `any` 类型丢失类型提示 | Grep `: any` |
| U2 | 业务码异常未 throw | 检查 request.ts 错误处理 |
| U3 | 内存泄漏（setTimeout 无清理） | Grep `setTimeout.*50` 递归模式 |
| U4 | 硬编码测试 URL | 检查 deeflow.ts 中的 URL |
| U5 | 图片下载失败无 fallback | 检查 downloadProtectedFile |

#### TypeScript 类型安全（P1）

```bash
# 检查 any 类型用法
Grep ": any" --output_mode content -n
```

#### Performance 问题（P1）

```bash
# 检查 Math.random()（打字机效果等）
Grep "Math.random()" --output_mode content

# 检查 Magic Numbers
Grep "9999999" --output_mode content

# 检查 console 日志
Grep "console\.(log|info|warn)" --output_mode content
```

#### React Hooks 检查（P1）

```bash
# 检查 useEffect 依赖
Grep "useEffect\([^)]*\)" --output_mode content

# 检查 hooks 在循环/条件中调用
Grep "(useState|useEffect|useCallback).*\n.*if" --multiline --output_mode content
```

#### Security 安全检查（P1）

```bash
# 检查硬编码密钥
Grep "(apiKey|secretKey|token).*=.*['\"][a-zA-Z0-9_-]{20,}" --output_mode content

# 检查 localStorage token
Grep "localStorage\.(setItem|getItem).*token" --output_mode content
```

#### i18n 国际化检查（P2）

```bash
# 检查中文字符
Grep "[一-龥]" --output_mode content
```

#### Accessibility 无障碍检查（P1）

```bash
# img without alt
Grep "<img(?![^>]* alt)" --glob "*.vue" --output_mode content

# 检查 input without label
Grep "<input(?![^>]* aria-label)(?![^>]* aria-labelledby)" --glob "*.vue" --output_mode content
```

## 审查输出格式（必须严格遵守）

```markdown
# Frontend Code Doctor - <项目名>

> 审查时间：<YYYY-MM-DD HH:mm:ss>
> 技术栈：uniapp + Vue3 + TypeScript

---

## Found <N> urgent issues need to be fixed

## 1 <问题简述>
FilePath: <文件路径> line <行号>

<相关代码片段>

### Suggested fix
<修复建议>

---

## Found <M> suggestions for improvement

## 1 <问题简述>
FilePath: <文件路径> line <行号>

<相关代码片段>

### Suggested fix
<修复建议>

---

## 统计

| 类别 | 数量 |
|------|------|
| Urgent 问题 | N |
| TypeScript 问题 | M |
| Performance 问题 | K |
| React 问题 | R |
| Security 问题 | S |
| i18n 问题 | I |
| Accessibility 问题 | A |
| **总计** | Σ |

---

<如果发现 10+ 严重问题>
发现较多严重问题（10+），是否需要我应用 Suggested fix 进行修复？
```

## 注意事项

1. **报告头部**：必须是 "Code Doctor - 项目名"
2. **时间格式**：YYYY-MM-DD HH:mm:ss
3. **技术栈**：根据项目实际情况填写
4. **统计表格**：必须在最后输出

## 交付确认

如果发现的严重问题 >= 10 个，在末尾询问：

> 发现较多严重问题（10+），是否需要我应用 Suggested fix 进行修复？