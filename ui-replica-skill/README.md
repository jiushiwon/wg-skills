# UI Replica Skill

把 UI 原型图/截图高还原地复刻成可运行代码。

## 功能

- 分析 UI 图片结构，拆解为页面 → 区块 → 卡片 → 元素
- 提取并收敛设计 Token（颜色、字号、间距、圆角、阴影）
- 输出完整可运行代码，默认单文件 HTML 方便即时查看
- 复杂元素优先用代码模拟，无法模拟再占位
- 补全关键状态，提升第一稿还原度

## 使用方式

### 触发词

```
复刻这张图
复刻这个页面
把这张原型图转成代码
把这张设计稿写成页面
图片转 HTML
图片转 Vue
图片转 React
截图转代码
仿照这个页面
Figma 转代码
Stitch 转代码
照着设计稿写页面
原型图复刻
```

### 使用示例

**示例 1：快速复刻本地图片**

```
用户：D:\projects\wg-skills\ui-copy\_4.png 这张图，帮我复刻成 HTML

AI：
1. 读图分析：中后台管理系统，侧边栏 + Header + 步骤条 + 双栏卡片
2. 生成代码：输出 replica.html（单文件，可直接浏览器打开）
3. 验证提醒：请打开浏览器检查，指出差异点我再精调
```

**示例 2：指定框架复刻在线图片**

```
用户：https://example.com/mockup.png 复刻成 Vue3

AI：
1. 下载/读取图片
2. 按完整模式执行，输出 Vue3 + Tailwind 版本
3. 给出 Token 表和还原度自评
```

**示例 3：接入已有项目**

```
用户：把这个设计稿接入当前 uniapp 项目

AI：
1. 检测当前目录为 uniapp 项目
2. 询问用户确认接入位置
3. 按项目技术栈生成页面和组件
```

## 两种模式

| 模式 | 触发方式 | 输出 |
|---|---|---|
| 快速模式 | 用户只发图，未指定框架 | 直接输出单文件 HTML |
| 完整模式 | 用户指定技术栈、要求接入项目、或多图 | 输出结构分析 + Token 表 + 代码 |

## 目录结构

```
ui-replica-skill/
├── SKILL.md                          # 技能入口与核心流程
├── README.md                         # 使用说明与示例
├── examples/                         # 复刻样例
│   ├── admin-dashboard/              # 中后台页面样例
│   ├── mobile-page/                  # 移动端页面样例
│   └── landing-page/                 # 营销页样例
└── references/
    ├── workflow.md                   # 详细复刻流程
    ├── checklist.md                  # 自检清单
    ├── token-template.md             # 设计 Token 模板
    ├── structure-template.md         # 结构拆解模板
    ├── complex-components.md         # 复杂组件处理（图表/表单/动画/地图）
    ├── integration-guide.md          # 项目集成指引
    └── multi-mockups.md              # 多原型图梳理与复刻计划
```

## 工作流

详见 [references/workflow.md](references/workflow.md)。

## 设计哲学

**不是“看图写代码”，而是“看图 → 结构化 → Token 化 → 代码化”。**

本 skill 专注第一稿还原度，目标 80% 以上即可交付。后续如需收敛样式、沉淀组件，再调用 `frontend-style-harmonizer-skill` 或 `ui-component-commands-skill`。
