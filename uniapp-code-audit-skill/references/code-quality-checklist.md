# 代码质量检查清单

> 本清单用于 `uniapp-code-audit-skill` 代码质量审计时参考。所有条目仅用于识别风险并输出报告，不输出修复方案。
> 提示：表格内"检测命令"列中的 `\|` 为 markdown 表格转义，实际执行时按 `|`（POSIX ERE 分组交替符）处理；命令基于 Unix 工具，Windows 环境可用内置 Grep 工具或 ripgrep（`rg`）替代。

## 1. TypeScript 安全

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| `: any` 滥用 | P1 | 类型系统失效，隐藏运行时错误 | 源代码中出现 `: any` 类型注解 | `uniapp-standard-skill` R11 | `grep -rnE ': any' src/` |
| `as any` 断言 | P1 | 强制绕过类型检查 | 源代码中出现 `as any` | 通用 TS 规范 | `grep -rnE 'as any' src/` |
| 隐式 any | P2 | 未启用严格模式或缺少类型注解 | `tsconfig.json` 未启用 `strict` 或函数参数无类型 | `uniapp-standard-skill` 2.2 | 检查 `tsconfig.json` 与源码 |
| 未定义返回值类型 | P2 | 函数契约不清晰 | 导出函数缺少返回类型注解 | 通用 TS 规范 | 人工检查 `src/utils/`、`src/api/` 导出函数 |

## 2. 硬编码

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 文字硬编码 | P2 | 维护困难，难以支持 i18n | 页面/组件中直接写死中文文案 | `uniapp-standard-skill` R08 | `grep -rnE "['\"][^'\"]{10,}['\"]" src/pages/` |
| URL 硬编码 | P2 | 环境切换困难 | 代码中直接写死 `https://` 完整域名 | `uniapp-standard-skill` R08 / R17 | `grep -rnE 'https?://' src/` |
| 配置硬编码 | P2 | 环境/业务配置分散 | 超时、分页大小等配置未集中 | `uniapp-standard-skill` R08 | 检查 `src/config/` 与页面代码 |
| 颜色硬编码 | P2 | 主题难以维护 | SCSS/TS 中出现裸 `#hex`/`rgb()`/`rgba()`/`hsl()` | `uniapp-app-generate-skill` theme-system | `grep -rnE '#[0-9a-fA-F]{3,6}\|rgb\(|rgba\(|hsl\(' src/` |

## 3. 代码重复

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 相同 API 请求多处 | P1 | 一处变更需多处同步 | 同一接口在多个页面重复定义 | `uniapp-standardization-skill` 2.1 | `grep -rnE 'uni\.request\|post\|get\(' src/pages/` |
| 相同逻辑多处 | P2 | 工具函数未抽离 | 日期格式化、金额格式化等在多页面重复 | `uniapp-standard-skill` R08 | 人工检查常见工具函数 |
| 相同 UI 多处 | P2 | 组件复用不足 | 两个及以上页面存在相似模板与样式 | `uniapp-app-generate-skill` component-standards | 人工比对页面模板 |
| 相同样式多处 | P3 | 样式散落，维护困难 | 多页面出现相同 CSS 声明块 | `uniapp-app-generate-skill` theme-system | 人工检查 `.scss` 文件 |

## 4. 错误处理

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 请求无错误处理 | P1 | 异常无提示，用户无法感知失败 | `request`/`get`/`post` 调用未 `catch` 或未 `await try-catch` | `uniapp-standard-skill` R10 | `grep -rnE 'request\(|get\(|post\(' src/pages/ \| grep -v 'catch\|try'` |
| 无 try-catch | P2 | 同步异常可能导致页面白屏 | 可能抛异常的同步代码未包裹 try-catch | 通用代码规范 | 人工检查关键同步逻辑 |
| 无空状态处理 | P2 | 数据为空时页面空白 | 列表/详情页未处理空数据 | `uniapp-standard-skill` R10 | 检查页面 `v-if`/`v-else` 分支 |
| 无网络状态处理 | P2 | 断网时无提示 | 未监听网络状态变化 | 通用代码规范 | 检查 `uni.onNetworkStatusChange` 使用 |

## 5. 代码规范

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 未使用的 import | P3 | 代码冗余 | 文件中存在未被引用的 import | 通用代码规范 | `npm run lint` 或 ESLint 检查 |
| 未使用的变量 | P3 | 代码冗余 | 定义后未被使用的变量 | 通用代码规范 | `npm run lint` |
| 注释掉的代码 | P3 | 增加噪音 | 文件中存在大量注释掉的代码 | 通用代码规范 | `grep -rnE '^\s*//.*const\|^\s*//.*function' src/` |
| 命名不一致 | P2 | 可读性差 | 目录/文件/变量命名未遵循 kebab-case/camelCase/PascalCase | `uniapp-standard-skill` 2.2 / `uniapp-app-generate-skill` project-structure | 检查 `src/` 目录命名 |

## 6. 组件规范

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 组件 props 无类型 | P2 | 类型不安全 | `defineProps` 未定义类型 | `uniapp-app-generate-skill` component-standards | 检查 `src/components/` |
| 组件 props 无默认值 | P2 | 使用时可能报错 | 可选 prop 未设置默认值 | `uniapp-app-generate-skill` component-standards | 检查 `src/components/` |
| 组件 emit 无类型 | P2 | 事件契约不清晰 | `defineEmits` 未定义类型 | `uniapp-app-generate-skill` component-standards | 检查 `src/components/` |
| 组件名不符合规范 | P2 | 可读性差 | 公共组件未使用 PascalCase 或大驼峰目录 | `uniapp-standard-skill` 2.2 | 检查 `src/components/` |

## 7. 状态管理

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 未使用 Pinia | P1 | 全局状态管理混乱 | 项目未引入 Pinia 或仍使用 Vuex/options API 全局变量 | `uniapp-app-generate-skill` 3.7 | 检查 `package.json` 与 `src/stores/` |
| store 未按模块拆分 | P2 | store 臃肿 | 所有状态集中在一个 store 文件 | `uniapp-standard-skill` 2.1 | 检查 `src/stores/modules/` |
| 页面间传值用 URL | P2 | 复杂状态通过 URL 传递，难以维护 | 页面跳转通过 URL 传递对象/复杂参数 | `uniapp-standard-skill` 2.1 | 检查 `uni.navigateTo` 的 `url` 参数 |
| 全局状态散落 | P2 | 状态未收口到 store | 组件/页面中存在跨页面共享的局部变量 | `uniapp-standardization-skill` 2.3 | 人工检查跨页面状态 |

## 8. Vue3 / Composition API 规范

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 未使用 `script setup` | P3 | 代码冗余 | 新项目组件仍使用 Options API 或冗长 setup 函数 | `uniapp-app-generate-skill` 3.6 | 抽样检查 `.vue` 文件 |
| 生命周期未清理副作用 | P1 | 内存泄漏 | `watch`、`setTimeout`、`uni.$on` 等未在 `onUnmounted` 清理 | 通用代码规范（内存与生命周期） | 检查组件生命周期 |
| `ref` 与 `reactive` 混用不当 | P2 | 响应式行为难以预测 | 应使用 `ref` 的场景使用了 `reactive` 解构 | 通用 Vue3 规范 | 人工检查组合式函数 |
| `watch` 监听大对象 | P2 | 性能开销大 | `watch` 直接监听整个响应式对象 | 通用 Vue3 规范 | `grep -rnE 'watch\(' src/` |

## 9. Accessibility / i18n

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 硬编码中文且项目需国际化 | P2 | 无法支持多语言 | 页面文案无 i18n key | 通用产品规范 | `grep -rnE '[一-龥]{4,}' src/pages/` |
| 图片缺少 alt/aria-label | P3 | 无障碍支持不足 | `<image>` 无 `alt` 或 `aria-label` | 通用无障碍规范 | `grep -rn '<image' src/ \| grep -v 'alt\|aria-label'` |
| 焦点管理缺失 | P3 | 键盘/读屏用户操作困难 | 表单/弹窗未管理焦点 | 通用无障碍规范 | 人工检查表单与弹窗组件 |

## 代码质量评分参考

| 分数 | 描述 |
|------|------|
| A | 基本无问题，代码质量高 |
| B | 有少量 P3 问题，不影响维护 |
| C | 存在 P2 问题，建议治理 |
| D | 存在 P0/P1 问题，需要重点关注 |
