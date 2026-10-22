---
name: vue-ai-creative-workspace-skill
description: Vue3 AI 创作工作台技能。包含 4 种差异化风格（明亮编辑、沉浸暗色、移动灵感编辑器、分镜时间线），支持意图输入、模式选择、参数配置、结果画廊。触发词："AI 创作"、"创意工作台"、"AI 生成"、"创作页面"、"分镜"、"时间线"。
---

# Vue AI 创作工作台

用于生成有明确产品感的 AI 内容创作页：左侧工作区导航、中部创作画布、右侧参数栏、下方结果画廊。它是页面编排技能，不重复实现输入框、按钮、标签、下拉或弹窗。

## 先选择要实现的 Demo

必须先根据用户的页面目标选择一个 `variant`；未指定时使用 `editorial-light`。三个 variant 是不同的布局重心，不能仅通过替换颜色冒充另一种 Demo。

| variant | 对应 Demo | 适合场景 | 布局重点 |
|---|---|---|---|
| `editorial-light` | `01-creative-workspace.html` | 品牌物料、内容运营、视觉方向探索 | 明亮三栏、主画布优先、四张结果卡 |
| `immersive-dark` | `02-immersive-dark.html` | 图像生成、电影感素材、专业创作工具 | 深色沉浸、紧凑工具条、三张候选画面 |
| `mobile-inspiration` | `03-mobile-inspiration-editor.html` | 移动端收集灵感、编辑灵感板、轻创作 | 单列、拼贴灵感板、底部编辑器 |
| `storyboard-timeline` | `04-storyboard-timeline.html` | AI 短片、广告脚本、视频分镜 | 分镜列表、镜头预览、参数检查器、时间线 |

用户只说“做 AI 创作页”时，先从目标设备判断：桌面内容工具选 `editorial-light`；专业视觉生成选 `immersive-dark`；手机端或小程序式体验选 `mobile-inspiration`；涉及镜头、分镜、视频预览或时间线时选 `storyboard-timeline`。如果目标设备也未知，默认 `editorial-light` 并在交付说明中标明。

## 适用边界

- 适合：AI 海报、文案、图片、短视频脚本等「输入意图 → 配置参数 → 生成结果」的桌面端工作台。
- 不适合：聊天消息流（使用 `vue-chat-skill`）、后台指标看板（使用 `vue-dashboard-skill`）、登录页（使用 `vue-login-skill`）。
- 不包含：模型调用、任务队列、文件上传、权限、结果持久化。接口接入交给 `frontend-request-skill` 和业务层。

## 必须复用的能力

| 区域 | 必须使用 | 来源 |
|---|---|---|
| 全局 Token | `vue-theme-skill` | 颜色、间距、圆角、字号、阴影 |
| 页面布局 | `vue-layout-skill` | 应用壳、菜单与顶部区域 |
| 面板与结果卡 | `base-card` | `vue-base-skill` |
| 创作意图输入 | `base-input` | `vue-input-skill` |
| 主次操作 | `base-button` | `vue-button-skill` |
| 参数与状态 | `base-tag` | `vue-tag-skill` |
| 比例/风格选择 | `base-dropdown` | `vue-dropdown-skill` |
| 新建草稿/删除确认 | `base-dialog` / `base-confirm` | `vue-dialog-skill` |

禁止用裸 `div` 重新造输入框、按钮、标签、浮层或弹窗；禁止引入 Element Plus、Naive UI 等第三方组件库。

## 信息架构

```text
创作工作台
├─ 左栏：工作区 / 草稿 / 收藏入口（vue-layout-skill + vue-menu-skill）
├─ 顶栏：项目名、保存状态、账户菜单（vue-dropdown-skill）
├─ 主画布
│  ├─ 标题与任务说明
│  ├─ 意图输入（base-input）
│  ├─ 模式卡片（base-card）
│  └─ 生成操作（base-button）
├─ 右栏：比例、风格、数量等参数（base-dropdown + base-tag）
└─ 结果区：生成卡片（base-card）与状态标签（base-tag）
```

## 视觉契约

1. 用「三栏宽屏 + 局部卡片」建立秩序，不能把每个区域都塞进重阴影卡片。
2. 主画布必须是视觉焦点；右栏仅承担配置，信息密度低于主画布。
3. 结果区以 2～4 张卡片形成节奏，缩略图比例、标题、元信息对齐。
4. 主题与布局使用现有 Token；仅在视觉参考图所要求的双强调色上新增受控的业务级 CSS 变量，并在页面根节点集中声明。
5. `editorial-light` 与 `immersive-dark` 小于 `1024px` 时收起右侧参数栏；`mobile-inspiration` 直接采用单列，主画布和结果区改为单列或双列；不得保留不可操作的横向挤压布局。

## 最小状态集

| 状态 | 要求 |
|---|---|
| 空白草稿 | 有可理解的提示与示例意图 |
| 可生成 | 主按钮可用，展示当前模式和参数摘要 |
| 生成中 | 主按钮 loading，结果区出现占位卡，禁止重复提交 |
| 成功 | 结果卡按时间排序，可收藏或重新生成 |
| 失败 | 仅展示可行动错误信息与重试按钮，不清空用户意图 |

## 接口边界

页面只消费业务层提供的 `createTask`、`getTask`、`listAssets` 等函数。轮询、SSE 或队列状态不可写死在页面组件中；按 `frontend-request-skill` 的请求封装接入。

## 交付物

- [明亮模板](templates/AiCreativeWorkspace.vue)：带 `variant` 入参的 Vue 组合骨架，对应 `editorial-light`。
- [暗色模板](templates/ImmersiveDarkWorkspace.vue)：独立的沉浸创作台结构，对应 `immersive-dark`。
- [移动模板](templates/MobileInspirationEditor.vue)：独立的拼贴灵感编辑器结构，对应 `mobile-inspiration`。
- [分镜模板](templates/StoryboardTimelineWorkspace.vue)：独立的短片分镜与时间线结构，对应 `storyboard-timeline`。
- [Demo 01](demo-components/creative-workspace/html/01-creative-workspace.html)：明亮编辑感桌面工作台。
- [Demo 02](demo-components/creative-workspace/html/02-immersive-dark.html)：沉浸暗色桌面工作台。
- [Demo 03](demo-components/creative-workspace/html/03-mobile-inspiration-editor.html)：移动端灵感编辑器。
- [Demo 04](demo-components/creative-workspace/html/04-storyboard-timeline.html)：短片分镜创作台。
- [设计参考图](assets/)：三个 Demo 对应的视觉资产，用于校准层级、色彩与分割节奏，不是运行截图。
- [验收清单](references/acceptance.md)：交付前核对。

## 使用示例

```vue
<script setup lang="ts">
import ImmersiveDarkWorkspace from './templates/ImmersiveDarkWorkspace.vue'

function createTask(payload: { prompt: string; mode: string }) {
  // 由业务层通过 frontend-request-skill 调用接口
  console.info(payload)
}
</script>

<template>
  <ImmersiveDarkWorkspace @create-task="createTask" />
</template>
```

## 验收

交付前阅读 [references/acceptance.md](references/acceptance.md)。

## 触发词

| 风格 | 核心差异 | 触发词 |
|------|----------|--------|
| **明亮编辑感** | 明亮三栏、品牌物料、内容运营 | 默认、"创作工作台"、"明亮" |
| **沉浸暗色** | 深色沉浸、专业图像生成 | "dark"、"暗色"、"沉浸" |
| **移动灵感** | 单列拼贴、移动端灵感收集 | "移动"、"mobile"、"灵感" |
| **分镜时间线** | 视频分镜、时间线、镜头预览 | "分镜"、"timeline"、"时间线" |
