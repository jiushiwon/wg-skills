# 五场景个人中心实施契约

## 选择与依赖

| 场景 | scene | 核心模块 | 已有主题 |
|---|---|---|---|
| 简洁个人 | simple | 资料、收藏浏览、菜单 | minimal |
| 标准服务 | service | 预约、进度、八项服务、设置 | business |
| 商城订单 | commerce | 资产、订单状态、物流、服务、推荐 | warm |
| 企业员工 | enterprise | 组织、待办、考勤报销审批、账号 | business |
| 会员权益 | member | 等级、成长值、签到、权益、兑换 | fresh |

前置读取 uniapp-standard-skill、uniapp-theme-skill、uniapp-style-skill、uniapp-base-skill、uniapp-page-components-skill。图标沿 frontend-icon-skill 与 icon-catch 生成/抓取后本地化，不使用跨端不稳定的内联 SVG。接入真实 API、认证时另读 uniapp-request-skill 与 uniapp-auth-skill；本演示无网络业务请求，不新增请求封装。

## 文件与输出

- `templates/uniapp-vue3/profile-gallery/types.ts`：统一 Props 数据契约。
- `templates/uniapp-vue3/profile-gallery/profile-gallery.vue`：唯一视图实现。
- `demo/src/api/_mocks_/profiles.ts`：五份独立模拟数据与场景索引。
- `demo/src/pages/index.vue`：状态、事件路由、弹层、签到演示。
- `demo/scripts/prepare-sources.mjs`：生成局部源码链接，保留唯一真源；禁止把整个 uniapp 根目录链接进 src 导致循环监听。
- `demo/scripts/verify-browser.py`：可重复的 H5 浏览器检查与截图。

使用现有仓库的展示组件时运行演示即可；复制到实际业务工程时，将根容器按项目的统一组件目录接入并调整 import，保持与真源的来源记录，不能让 AI 重新写一份近似容器。保留五套 DTO 和状态语义，替换 mock 服务为真实接口；业务弹层样例不是业务列表页。

## 模板接口

必填 `data: ProfileData`；可选 `state`（ready/loading/error/guest/empty）、busy、activeTab、statusBarHeight、iconRoot。事件 action / product / checkin / retry / login / tab 由容器承接。所有 action 和 product 都是演示反馈，无真实订单、支付、审批或积分扣减。

`empty` 专门验证商城/会员商品区；其余场景没有商品列表，不因该状态清空整个个人中心。失效图片进入占位，替换商品数据后重置错误标记。

## 可复用调用提示词

> 使用 uniapp-ui-template-builder-skill 的 profile-gallery 真模板，生成 commerce 商城个人中心。导入 uniapp-theme-skill 的 base.css，使用 warm 主题，卡片/头像/导航/底栏/按钮/弹层必须复用 base-skill。按 types.ts 接收个人信息、订单和商品数据；先用独立 mock，事件交给页面容器。展示默认、未登录、加载、失败、空商品、长昵称和图片失败。订单与支付未接入时明确标注。给出源码位置、H5 截图、构建结果与未验证平台。

其他四种替换 scene，保留相同来源与验收要求，不依赖概念图的光影或透视实现。

## 验收

检查 320/390/430/768px；不横向溢出；宽屏内容和固定底栏限宽对齐；未登录和失败可恢复；菜单弹层可关闭；签到进行中禁用，重复点击不重复加积分。H5、微信编译、微信真机、App 分别记录，不跨平台推断通过。
