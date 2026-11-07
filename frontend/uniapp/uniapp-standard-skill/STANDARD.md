# uniapp-standard-skill 个体规范

> 上位规范：[uniapp/AGENTS.md](../AGENTS.md)
> 本文件只写本模块特有约束；与上位规范重复的内容不再赘述。

## 一、模块定位

**第 2 层：专项层（通用开发规范）。**

本模块定义 uni-app 微信小程序的**工程规范**：目录结构、命名、接口约定、状态管理、性能红线、Mock 约定、提交规范。

> **边界**：本模块管"工程怎么组织、接口怎么约定"，不管"长什么样"（那是 `uniapp-style-skill`）、不管"变量叫什么"（那是 `uniapp-theme-skill`）。

## 二、依赖

| 依赖 | 方向 | 用途 |
|------|------|------|
| 无 | — | 本模块是规范源，被其他专项层引用 |

被依赖方：`uniapp-style-skill`（前置依赖）、`uniapp-page-components-skill`、`uniapp-code-audit-skill`（规范来源）。

## 三、目录约定

本模块描述的是**使用方项目**的目录，不是自身仓库目录。

```
src/
├── api/           # 接口定义
├── components/
│   ├── common/    # 通用组件
│   └── business/  # 业务组件
├── pages/
├── stores/        # Pinia
├── services/      # 业务服务
├── utils/
├── config/
├── constants/
├── types/
├── composables/
└── styles/
    ├── config/_theme-config.scss
    ├── tokens/_primitive.scss
    ├── tokens/_semantic.scss
    ├── tokens/_components.scss
    ├── _functions.scss
    ├── _mixins.scss
    ├── _typography.scss
    ├── _animations.scss
    ├── _page.scss
    └── variables.scss
```

- `styles/` 清单必须与 `uniapp-style-skill` §2.1 的目录树**逐项一致**（历史上两边各漏了 `_components.scss` / `_typography.scss` / `_animations.scss` / `_page.scss`）。
- `tokens/_semantic.scss` 是业务代码引用语义变量的**唯一入口**。

## 四、内容清单

| 章节 | 内容 |
|------|------|
| §1 红线 | R01–R20 |
| §2 目录结构 | 上节目录树 + styles 清单 |
| §3 命名 | 目录 / 文件 / 类型命名 |
| §4 接口 | `RequestOptions` / `ApiResponse` / 拦截器 / Mock key / API 前缀 / 错误处理 |
| §5 性能 | DOM 数量、setData 限制、长列表、图片 |
| §6 命令 | 常用命令表 |
| §7 模板 | `templates/` 目录模板 |
| references | api-architecture / performance / store-guide / router-guide / analytics / component-communication / storage-guide |

## 五、内置约束

**T01** R01–R20 是本模块的红线集合。引用时**必须带 `R` 前缀**（"R10"），禁止裸写编号——`R01` 在 `uniapp-page-components-skill` 也存在且含义不同，裸编号会造成歧义。

**T02** R01 禁嵌套 `v-for`；R02 data 只存视图数据；R03 优先 `uni.xxx` API；R04 遵守小程序 DOM 限制。

**T03** R05 长列表分页；R06 控制 setData 体积与频次；R07 禁 `eval`。

**T04** R08 禁硬编码（业务常量进 `constants/`）；R09 请求防抖；R10 失败必须弹提示。

**T05** R11–R12 lint 规则；R13–R14 commit 信息中文且 ≤ 50 字。

**T06** R15 SCSS 用 Token；R16 Mock 放 `_mocks_/`；R17 请求只传业务路径。

**T07** R18 屏幕适配（rpx）；R19 鸿蒙降级；R20 认证服务收口。

**T08** 目录命名：全小写、多词用 `-` 连字符，禁止大写 / 下划线 / 中文 / 模糊命名（`util` 这类）。

**T09** 组件目录：`components/common/<PascalName>/index.vue` 或 `components/business/<PascalName>/index.vue`，目录即命名空间。

**T10** 类型定义用 `.d.ts` 或放 `types/`。

**T11** 接口响应统一信封 `{ code, message, data }`；请求只传业务路径，完整 URL 由拦截器拼接。

**T12** Mock key 格式固定 `METHOD:相对路径`。

**T13** API 前缀统一 `/api`（与仓库根 `AGENTS.md` §十三一致）。本模块正文中的 `API_PREFIX.DEFAULT` 必须与该前缀口径对齐，不得出现 `/api/v1` 之类的第二套写法。

**T14** 性能红线：单页 DOM ≤ 1000、列表项 ≤ 100、单列表项数 ≤ 50、setData 单次 ≤ 100KB 且 ≤ 20 次/秒、长列表每页 ≤ 20 且 > 1000 用虚拟列表。

**T15** 请求层与 `uniapp-request-skill` 的分工：接口约定（信封、拦截器语义、错误码、Mock 格式）归本模块；具体请求封装的实现与最佳实践归 `uniapp-request-skill`。两者不得各写一套信封定义。

## 六、变更纪律

- 改目录结构 → 同步 `SKILL.md` §2 与 `uniapp-style-skill` §2.1 目录树。
- 改接口约定 → 同步 §4 与 `references/api-architecture.md`。
- 改红线 → 同步 `SKILL.md` §1 与 `uniapp-code-audit-skill` 的审计维度映射表。

## 七、自检

- [ ] 引用红线带 `R` 前缀
- [ ] `styles/` 清单与 `uniapp-style-skill` 一致
- [ ] API 前缀只有一套写法
- [ ] 响应信封只有一套定义
- [ ] 组件目录命名规则不再自相矛盾
- [ ] `bash scripts/check-skills.sh` 错误为 0
