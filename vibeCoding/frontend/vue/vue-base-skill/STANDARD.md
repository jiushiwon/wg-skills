# vue-base-skill 个体规范

> 上位规范：[vue/AGENTS.md](../AGENTS.md)　本文件：个体规范

## 一、模块定位

- **做什么**：Vue 组件体系的**父技能**——承载 `base-card` 根容器 + 30+ 子组件 skill，是"内容型组件"的唯一实现来源。
- **不做什么**：不定义主题 Token（→ `vue-theme-skill`）；不定义工具类/动画（→ `vue-style-skill`）；不生成完整项目（→ `vue-generate-skill`）；不实现复合业务场景（→ `vue-complex-skill`）。

## 二、依赖

| 依赖 | 方向 | 说明 |
|------|------|------|
| `vue-theme-skill` | 上游（唯一真源） | 所有颜色/间距/圆角/字号/阴影引用其 `tokens.css` |
| `vue-style-skill` | 下游 | 样式基础设施复用本 skill 的组件 |

## 三、目录约定

```
vue-base-skill/
├── SKILL.md              # 父技能入口（零 HTML5 标签红线 + 组件索引）
├── README.md             # 组件清单（30+ 子 skill 状态表）
├── COMPONENT_SPEC.md     # 组件实现统一规范（npm 软链接/TS/契约）
├── STANDARD.md           # 本文件
├── base-card.md          # 根容器规格（唯一真源）
├── base-input.md         # 输入框根规格
├── vue-{xxx}-skill/      # 30+ 子组件（每个含 SKILL.md/README.md/base-{xxx}.md）
│   ├── vue-complex-skill/  # 复合场景（7 子：chat/crud/login/dashboard/upload-integration/ai-creative-workspace/chart）
│   ├── vue-generate-skill/ # 项目生成
│   └── universal-login-page/
└── references/           # 组件体系引用资料
```

## 四、内容清单

- **根容器**：`base-card`（卡片外壳，唯一真源）
- **表单控件**：button / input / select / checkbox / radio / switch / datepicker / cascader / form（含 form-item/form-render）
- **展示件**：tag / status / badge / loading / empty / toast
- **容器件**：card / dialog / dropdown / collapse / tree / menu / layout / list-item / list-page
- **复合场景**（vue-complex-skill 下）：chat / crud / login / dashboard / upload-integration / ai-creative-workspace / chart
- **其他**：table（23 形态）、upload、contextmenu

## 五、内置约束（编号红线）

- **V01**：所有 `.md` 组件文档实现代码零 HTML5 标签（唯一豁免 `base-upload.md` 的隐藏 file 控件）。
- **V02**：零硬编码 CSS——颜色/间距/圆角/字号/阴影必须 `var(--xxx, 兜底)`。
- **V03**：内容型组件外壳必须来自 `base-card`，禁止手写圆角/分割线/内边距。
- **V04**：零彩色 emoji（代码与 demo 可见 UI）。
- **V05**：唯一真源——组件实现与规格（`base-{xxx}.md`）各只有一份，其余位置引用，禁止复制源码。
- **V06**：契约同步——`base-{xxx}.md` 的 props/events/slots 与实现逐条一致，改一处必须同步另一处。
- **V07**：命名统一——组件名 PascalCase、文件名 PascalCase、模板 kebab-case、props camelCase、布尔属性不加 `is` 前缀。

## 六、变更纪律

1. 改组件实现 → 同步 `base-{xxx}.md`、`README.md` 状态表。
2. 改 `base-card.md` → 检查所有引用它的子 skill 是否受影响。
3. 新增子 skill → 同步 `SKILL.md` 组件索引、`README.md` 清单、根 `AGENTS.md` 第三节。
4. 触发词变化 → 同步 `README.md` 使用示例，检查与其他子 skill 是否冲突。

## 七、自检清单

- [ ] 零 HTML5 标签（`grep -rnE '<(button|input|select|table|...)' --include="*.md"`）
- [ ] 零硬编码（`grep -rnE '#[0-9a-f]{3,6}|[0-9]+px' --include="*.md"` 排除 demo）
- [ ] 内容型组件基于 `base-card`
- [ ] 零彩色 emoji
- [ ] `base-{xxx}.md` 与实现一致
- [ ] 组件名/文件名/模板命名统一
