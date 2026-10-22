# 组件完备性检查表

> 新增组件、修改组件、以及把组件从专项层迁入 `uniapp-base-skill` 时，逐项过一遍。
> 任一项不通过即视为组件未完成。
>
> 上位规范：[uniapp/AGENTS.md](../../AGENTS.md)　个体规范：[../STANDARD.md](../STANDARD.md)

## 一、归属与位置

- [ ] 已判定该组件属于 `form` / `feedback` / `list` / `navigation` / `business` 中的哪一类
- [ ] 已判定它是否属于**内容型组件**；属于则必须基于根容器实现
- [ ] 目录落在 `uniapp-base-skill/components/<category>/<name>/`，目录名与组件名一致（小写 kebab-case）
- [ ] 实现文件名统一为 `index.vue`
- [ ] **没有**在专项层（style / page-components / app-generate / template-builder …）另存一份同名实现
- [ ] 根容器放在 `uniapp-base-skill/containers/<name>/index.vue`

## 二、实现规范

- [ ] Vue 3 `<script setup lang="ts">`，无 `export default {}`、无 `data()`、无 `methods`、无 `this.$emit`
- [ ] props 用独立 `interface` 声明 + `withDefaults`，每个 prop 有默认值和中文注释
- [ ] 事件用 `defineEmits<{ 'event-name': [payloadType] }>()` 泛型元组，事件名用驼峰
- [ ] v-model 组件同时提供 `modelValue` prop 与 `update:modelValue` 事件
- [ ] 派生值用 `computed`，副作用用 `watch`，定时器在 `onUnmounted` / `onBeforeUnmount` 清理
- [ ] 无 `any`
- [ ] `<style scoped>`
- [ ] 组件内**未定义**任何 `--xxx:` 变量
- [ ] 组件内**未写** `@keyframes`
- [ ] 无 HTML5 标签（`div` / `span` / `img` / `button` / `p` / `h1~h6` / `ul` / `li` / `a`）
- [ ] 无 Emoji
- [ ] 无 `px` 尺寸（`env(safe-area-inset-*)` 除外）
- [ ] 无三方依赖

## 三、主题变量

- [ ] 所有颜色 / 尺寸 / 间距 / 圆角 / 字号都写成 `var(--token, 兜底)`
- [ ] 兜底值与 `uniapp-theme-skill/templates/src/static/css/base.css` 的真值**完全一致**
- [ ] 没有 `var(--token)` 裸引用（变量改名会静默失效）
- [ ] 没有使用 `base.css` 之外的变量名
- [ ] 变体色用 `color-mix` 基于变量派生，而不是硬编码 HEX
- [ ] 深色模式没有写 `@media (prefers-color-scheme: dark)` 分支

## 四、容器原则

- [ ] 内容型组件的外壳来自 `BaseCard` / `BasePopup` / `BaseFormItem` / `BaseAvatar` / `BaseNavbar` / `BaseTabbar`
- [ ] 子类**没有**重复设置容器已提供的圆角 / 背景 / 边框 / 阴影 / 安全区
- [ ] 传给容器的 props 是 token 化字符串（如 `padding="var(--space-4, 16rpx)"`），不是裸值
- [ ] 弹层类组件通过 `update:show` / `v-model:show` 管理开合状态
- [ ] 底部弹层处理了安全区

## 五、交互与可访问性

- [ ] 点击区不小于 `88rpx`
- [ ] 动画只改 `transform` / `opacity`
- [ ] 图片用 `image` 组件，写了 `mode`，有占位背景，有 `@error` 兜底
- [ ] 禁用态有明确视觉区分，且不触发事件
- [ ] 错误提示有对应样式（`--color-error`）

## 六、三件套契约

- [ ] `props.json` 是**合法 JSON**（无注释、无尾逗号），可直接 `JSON.parse`
- [ ] `props.json` 的 `category` 与目录归属一致
- [ ] `props.json` 的 `aliases` ≥ 3，含中文口语名、英文名、同义词
- [ ] `props.json` 里每个 prop 都能在实现中找到，且类型、默认值一致
- [ ] 实现里每个 prop 都在 `props.json` 中登记
- [ ] `events` 与实现里 `defineEmits` 一致
- [ ] `slots` 与实现里的插槽一致
- [ ] `usage.md` 至少 2 个场景，代码块使用 vue 语言标注
- [ ] `usage.md` 示例中出现的 prop 真实存在

## 七、索引与文档同步

- [ ] `uniapp-base-skill/components/_registry.json` 有且仅有一条记录，`path` 真实存在
- [ ] `uniapp-base-skill/commands/<category>.md` 有对应条目
- [ ] `uniapp-base-skill/references/matching-rules.md` 的别名表已同步
- [ ] 本模块 `SKILL.md` 的组件清单已同步
- [ ] 根 `README.md` / 根 `AGENTS.md` 的目录树已同步（结构有变化时）
- [ ] `docs/` 下的内容**未**提交（本地沉淀专用）

## 八、校验

```bash
# 1. 全部 .vue 编译通过
node D:/tmp/compile-vue-uniapp.js

# 2. 无悬空变量
node D:/tmp/check-vars-uniapp.js

# 3. 兜底值与真源一致
node D:/tmp/fix-fallbacks.js        # 不带 --apply 时只报告

# 4. 技能库自检
bash scripts/check-skills.sh
```

- [ ] 编译失败数为 0
- [ ] 悬空变量列表中不含本组件
- [ ] 兜底值检查无本组件的条目
