# stack — 技术栈最佳实践

输出指定技术栈的完整最佳实践：项目结构、初始化、配置、组件、Token 应用、性能、验证。

## 用法

```
stack <name> [--topic setup|components|tokenization|performance|all]
```

### 支持的栈

`html-tailwind` / `react-nextjs` / `vue-nuxt` / `uniapp` / `react-native` / `svelte`

### 参数

| 参数 | 说明 | 默认 |
|------|------|------|
| `<name>` | 必填，技术栈 | — |
| `--topic` | 主题 | all |

## 流程

### 1. 加载栈文档

读取 `references/stacks/<name>.md`，输出结构化方案。

### 2. 输出（按 topic）

**setup**：项目结构、初始化、配置文件
**components**：基础组件、布局、路由
**tokenization**：如何接入 foundry Token
**performance**：优化清单
**all**：综合方案

## 输出格式

```markdown
# 技术栈方案 — <name>

> 主题：all

---

## 项目结构

```
project/
├── ...
```

## 初始化

```bash
npx ...
```

## 配置文件

```ts
// tailwind.config.ts
...
```

## 基础组件

```vue
<!-- components/ui/Button.vue -->
...
```

## Token 接入

1. 复制 `templates/tokens.css.tpl` 到 `src/styles/tokens.css`
2. 引入到 `main.ts` / `App.vue`
3. 替换 `tailwind.config.ts` 的 colors 段
4. ...

## 性能优化

- 图片：<Image> 自动优化
- 字体：next/font
- 代码分割：自动
- 预取：<Link prefetch>

## 验证清单

- [ ] ...
- [ ] ...
```

## 用途

- 选型阶段：对比不同栈
- 启动阶段：按模板快速搭建
- 升级阶段：检查是否跟上最佳实践
- 培训：作为新成员 onboarding 资料

## 示例

```bash
# Next.js 完整方案
stack react-nextjs

# 只看 Token 接入
stack react-nextjs --topic tokenization

# uniapp 性能优化
stack uniapp --topic performance

# 对比 React 与 Vue
stack react-nextjs
stack vue-nuxt
```

## 与其他子命令协同

- `stack <name>` 提供栈方案 → `forge <scenario> --stack <name>` 实际生成
- `optimize` 自动检测栈 → 用 `stack` 输出验证
- `audit` 评审 → 用 `stack` 输出最佳实践
