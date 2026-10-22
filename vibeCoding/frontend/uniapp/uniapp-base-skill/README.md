# uniapp-base-skill

> uni-app **基础组件与容器库**，组件实现的唯一真源。
>
> 上位规范：[uniapp/AGENTS.md](../AGENTS.md)　个体规范：[STANDARD.md](STANDARD.md)

## 一、提供什么

| 层 | 位置 | 内容 |
|----|------|------|
| 根容器 | `containers/` | base-card / base-popup / base-form-item / base-avatar / base-navbar / base-tabbar |
| 内置组件 | `components/` | form 8 个、feedback 5 个、list 5 个、navigation 3 个、business 5 个 |
| 样式类 | `styles/` | button / line / shape / combo / card + 全局关键帧 `animation.scss` |
| 场景 demo | `demo-components/` | 卡片布局 / 表单输入 / 页面模板的 Markdown 规范 + HTML 参考图 |

## 二、容器与组件的关系

```
根容器层  containers/
  base-card ─┬─ base-popup（内置 base-card）
             ├─ base-form-item
             ├─ base-avatar
             ├─ base-navbar
             └─ base-tabbar
                    ↑
              内置组件层  components/
              product-card / article-card / list-item / coupon …
                    ↑
              场景 demo  demo-components/base-card-layout / base-form / base-page
```

**容器原则**：内容型组件（卡片、弹窗、表单行、列表项、面板、页签内容区）的外壳
必须来自根容器，禁止各自手写圆角 + 背景 + 边框。

| 场景 | 容器 |
|------|------|
| 卡片 / 面板 / 列表项 | base-card |
| 弹窗 / 抽屉 / 底部面板 | base-popup（内置 base-card） |
| 带标签的表单行 | base-form-item |
| 头像 | base-avatar |
| 顶部导航 | base-navbar |
| 底部菜单 | base-tabbar |

表单控件（switch / radio / checkbox / input）与纯展示件（empty-state / loading /
price-tag / progress-bar / count-down）不强制套容器。

## 三、容器清单

| 容器 | 说明 | 文档 |
|------|------|------|
| base-card | 基础卡片：圆角 / 背景 / 边框 / 阴影 / 头尾插槽 / 左侧图片 | [base-card.md](./base-card.md) |
| base-popup | 弹窗抽屉：5 方向 + 遮罩 + 安全区 + 内置 base-card | [base-popup.md](./base-popup.md) |
| base-form-item | 表单行：label + 必填星号 + 错误信息 | 实现见 `containers/base-form-item/` |
| base-avatar | 头像：图片 / 文字兜底 / 4 档尺寸 / 圆形或圆角 | 实现见 `containers/base-avatar/` |
| base-navbar | 顶部导航：状态栏占位 + 返回 + 标题 + 右侧插槽 / 胶囊 | 实现见 `containers/base-navbar/` |
| base-tabbar | 底部菜单：2~5 项 + 角标 + 安全区 + 固定 | 实现见 `containers/base-tabbar/` |

表单类组件（`input-field` / `search-bar`）见 [input-field.md](./input-field.md)。

## 四、内置组件清单

| 分类 | 组件 |
|------|------|
| form | button、search-bar、input-field、picker、date-picker、switch、checkbox-group、radio-group |
| feedback | toast、modal、action-sheet、loading、empty-state |
| list | list-item、product-card、article-card、chat-bubble、timeline |
| navigation | top-tab、side-menu、breadcrumb |
| business | price-tag、count-down、progress-bar、stepper、coupon |

每个组件目录固定三件套：`index.vue`（Vue 3 `<script setup lang="ts">`）、
`props.json`（契约）、`usage.md`（示例）。

## 五、依赖

| Skill | 关系 | 说明 |
|-------|------|------|
| `uniapp-theme-skill` | **变量真源** | `var(--xxx, 兜底)` 的变量名与兜底值以 `templates/src/static/css/base.css` 为准 |
| `uniapp-ui-component-commands-skill` | 被依赖 | 索引层，注册表 `path` 指向本模块，实现不在它那里 |

## 六、主题变量

命名空间与取值见 [SKILL.md 第六节](./SKILL.md)。要点：

- 一律 `var(--token, 兜底)`，兜底值必须等于 `base.css` 真值；
- 尺寸一律 rpx；
- 组件内不定义变量、不写 `@keyframes`（关键帧真源是 `styles/animation.scss`）；
- 主题切换通过根节点 `data-theme`，组件无需改动。

## 七、Demo

| 分类 | 入口 |
|------|------|
| 弹窗总览 | [00-showcase.html](./demo-components/base-popup/html/00-showcase.html) |
| 4 方向弹窗 | [底部](./demo-components/base-popup/html/popup-bottom.html) · [顶部](./demo-components/base-popup/html/popup-top.html) · [左侧](./demo-components/base-popup/html/popup-left.html) · [右侧](./demo-components/base-popup/html/popup-right.html) |
| 实战场景 | [表单筛选](./demo-components/base-popup/html/popup-form-filter.html) · [列表勾选](./demo-components/base-popup/html/popup-list-check.html) · [卡片选择](./demo-components/base-popup/html/popup-card-select.html) · [支付方式](./demo-components/base-popup/html/popup-pay-method.html) · [加入购物车](./demo-components/base-popup/html/popup-cart-spec.html) · [优惠券选择](./demo-components/base-popup/html/popup-coupon.html) · [搜索面板](./demo-components/base-popup/html/popup-search-panel.html) · [居中确认](./demo-components/base-popup/html/popup-dialog.html) · [全场景汇总](./demo-components/base-popup/html/popup-all-scenes.html) |
| 选择器 | [滚轮选择器](./demo-components/base-picker/html/picker-basic.html) · [多列选择器](./demo-components/base-picker/html/picker-multi.html) · [出生日期](./demo-components/base-picker/html/picker-birthdate.html) · [日期选择器](./demo-components/base-date-picker/html/date-picker-basic.html) |
| 卡片布局 | [案例总览](./demo-components/base-card-layout/README.md)（31 种：基础 / 信息流 / 图表卡片） |
| 表单输入 | [案例总览](./demo-components/base-form/base-input/README.md)（14 种：通用输入 8 种 + 搜索形态 6 种） |
| 页面模板 | [案例总览](./demo-components/base-page/)（登录 / 列表 / 详情等） |

子技能 demo 位于各 `uniapp-*-skill/demo-components/`。

## 八、使用方式

```markdown
/uniapp-base-skill 做一个弹窗
/uniapp-base-skill 做一个卡片
/uniapp-base-skill 做一个输入框
/uniapp-base-skill 做一个商品详情页
```

## 九、版本

### v3.0.0

- 组件实现全部迁入本模块，`uniapp-ui-component-commands-skill` 退化为索引层。
- 新增 `containers/` 根容器层，移除 `templates/` 目录。
- 全部内置组件重写为 Vue 3 `<script setup lang="ts">`。
- 新增 `styles/animation.scss` 作为全局关键帧唯一真源。
- 新增 `STANDARD.md` 与 `references/component-checklist.md`。
