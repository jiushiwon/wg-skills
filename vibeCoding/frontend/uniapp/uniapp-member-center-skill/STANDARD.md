# uniapp-member-center-skill 个体规范

> 上位规范：[uniapp/AGENTS.md](../AGENTS.md)
> 本文件只写本模块特有约束；与上位规范重复的内容不再赘述。

## 一、模块定位

**第 2 层：专项层（会员中心）。**

本模块提供会员中心场景的**整包能力**：页面模板、会员卡、权益展示、积分/成长值、订单入口、演示工程。

> **边界**：本模块是**业务场景包**，不新造通用组件。页面里的卡片、标签、按钮等一律用 `uniapp-base-skill` 的容器与零件，页面骨架用 `uniapp-page-components-skill` 的整页组件。

## 二、依赖

| 依赖 | 方向 | 用途 |
|------|------|------|
| `uniapp-theme-skill` | 依赖（变量真源） | 主题变量 |
| `uniapp-base-skill` | 依赖（容器与零件） | `base-card` / `base-popup` / `user-avatar` / `price-tag` / `badge` |
| `uniapp-page-components-skill` | 依赖（页面骨架） | `profile-page` / `list-page` 等整页组件 |
| `uniapp-auth-skill` | 依赖 | 登录态 |
| `uniapp-request-skill` | 依赖 | 会员数据接口 |

## 三、目录约定

```
uniapp-member-center-skill/
├── SKILL.md
├── README.md
├── STANDARD.md                       # 本文件
├── agents/                           # 角色提示词
├── assets/                           # 图片、图标等静态资源
├── demo/
│   └── screenshots/                  # 效果图
├── references/                       # 业务规则说明
└── templates/                        # 页面模板
```

- `demo/screenshots/` 为**效果图**，不作为实现依据；实现依据是 `templates/`。
- `agents/` 中的角色提示词只描述职责，不重复规范条款。

## 四、内容清单

| 章节 / 目录 | 内容 |
|-------------|------|
| §1 会员中心结构 | 页面分区与信息层级 |
| §2 会员卡 | 等级、权益、有效期、状态 |
| §3 权益与积分 | 展示口径与交互 |
| `templates/` | 页面模板 |
| `demo/` | 可运行演示与效果图 |

## 五、内置约束

**M01** 会员卡等**内容型**组件必须基于 `base-card`；弹层（权益说明、兑换确认）必须基于 `base-popup`。

**M02** 会员等级、积分等**展示口径统一由数据字段决定**，组件内不做等级换算。换算逻辑归业务层。

**M03** 样式引用 Token，禁止写死；会员卡的品牌感通过主题变量实现，不在组件里硬编码金色/黑色等。

**M04** 演示与效果图用**示例数据**，必须集中在模板顶部的 `mock` 常量区，方便替换。

**M05** 会员数据请求由外部传入或经 `api/` 调用，组件内不直接发请求（与上位规范一致）。

**M06** `demo/screenshots/` 的图必须与当前模板实现一致；模板改了必须重出图。

**M07** 模板中的可交互区域必须留扩展口（props / slot / emit），不写死业务文案。

**M08** 本模块不得重复实现 `uniapp-base-skill` 已有组件；确需定制时用 props 透传或包装，不复制源码。

## 六、变更纪律

- 改会员卡结构 → 同步 `templates/`、`demo/screenshots/`、`SKILL.md` §2。
- 改字段口径 → 同步 `references/` 的业务规则说明。

## 七、自检

- [ ] 会员卡基于 `base-card`
- [ ] 无硬编码品牌色
- [ ] 示例数据集中且可替换
- [ ] 效果图与模板一致
- [ ] 无重复实现已有组件
- [ ] `bash scripts/check-skills.sh` 错误为 0
