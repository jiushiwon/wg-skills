# uniapp-theme-skill 个体规范

> 上位规范：[uniapp/AGENTS.md](../AGENTS.md)
> 本文件只写本模块特有约束；与上位规范重复的内容不再赘述。

## 一、模块定位

**第 0 层：变量真源层。**

本模块是整个 uniapp 技能群**唯一**的运行时 CSS 变量定义处。所有其他 skill 只能 `var(--xxx)` 引用，不得重定义同名变量、不得自造命名。

```
uniapp-theme-skill/templates/src/static/css/base.css    唯一真源
                           引用
        base-skill / style-skill / page-components …
```

## 二、依赖

| 依赖 | 方向 | 用途 |
|------|------|------|
| 无 | — | 本模块是链路最底层，不依赖任何 skill |

## 三、目录约定

```
uniapp-theme-skill/
├── SKILL.md                        # 入口
├── README.md                       # 使用说明
├── STANDARD.md                     # 本文件
├── theme-demo.html                 # 主题切换演示（自包含 HTML）
├── references/                     # 主题相关参考
└── templates/
    ├── scripts/                    # 色阶生成脚本
    ├── src/
    │   ├── static/css/base.css     #  唯一真源
    │   └── styles/                 # 页面级样式（不进真源）
    └── ...
```

- `base.css` 之外**不得**再出现第二份定义同名 CSS 变量的文件。
- `templates/src/styles/` 只放页面布局/工具类样式，不得定义颜色、圆角、间距变量。

## 四、变量命名空间

`base.css` 的 `:root, page` 选择器下，变量按语义前缀分组，完整清单见 `base.css` 本身与 `SKILL.md` 变量表。

| 前缀 | 语义 | 示例 |
|------|------|------|
| `--color-*` | 语义色 | `--color-primary` `--color-error` |
| `--text-*` | 文字层级 | `--text-primary` `--text-tertiary` `--text-inverse` |
| `--bg-*` | 背景层级 | `--bg-page` `--bg-card` `--bg-light` `--bg-overlay` |
| `--border` / `--border-*` | 线条 | `--border` `--border-light` |
| `--space-N` | 间距阶梯 | `--space-4` |
| `--radius-*` | 圆角阶梯 | `--radius-md` `--radius-card` `--radius-full` |
| `--font-*` | 字号阶梯 | `--font-md` `--font-lg` |
| `--height-*` / `--icon-*` / `--width-*` | 尺寸 | `--height-btn-md` `--icon-sm` |
| `--shadow-*` | 阴影 | `--shadow-sm` |
| `--transition-*` | 动效 | `--transition-fast` |
| `--z-index-*` | 层级 | `--z-index-modal` |

## 五、内置约束

**T01** `base.css` 是唯一定义处。新增变量必须先加进 `base.css` 再被引用。

**T02** 长度单位统一 **rpx**。仅以下场景允许 `px`：`1px` 细线、`env(safe-area-inset-*)`、必须物理像素的场景。

**T03** 每套主题（`[data-theme="xxx"]`）必须覆盖**同一组**变量名，不得出现某主题独有、某主题缺失的变量（避免换肤时 fallback 到裸值）。

**T04** 变量必须有兜底值语义：所有引用方写 `var(--xxx, #兜底)`，保证 `base.css` 未加载时组件仍可渲染。

**T05** 内置主题固定为 8 套：`cute` / `business` / `fresh` / `cyber` / `retro` / `glass` / `minimal` / `warm`。新增主题必须同步 `theme-demo.html`。

**T06** 主色必须来自主题变量。组件与业务代码禁止写死主色（`#007AFF` 这类历史值一律视为违规）。

**T07** 变体（`-alpha`、`-400`、`-600` 等）用 `color-mix(in srgb, ...)` 派生，不手写新色值。

**T08** 深色模式通过新增 `[data-theme]` 覆盖实现，不引入第二套变量名。

## 六、变更纪律

- 改 `base.css` → 必须同步 `SKILL.md` 变量表、`theme-demo.html`、本文件第五节命名空间表。
- 新增变量 → 全量检索引用方是否有同名旧变量需迁移（旧变量名不得留悬空定义）。
- 变量重命名属于**破坏性变更**，必须在 `README.md` 标注迁移方式。

## 七、自检

- [ ] `base.css` 之外无同名变量重复定义
- [ ] 8 套主题变量名集合一致
- [ ] 无 rpx/px 混用
- [ ] `theme-demo.html` 可直接打开且主题切换正常
- [ ] `bash scripts/check-skills.sh` 错误为 0
