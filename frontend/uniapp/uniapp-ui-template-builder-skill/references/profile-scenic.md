# 个人中心第二组：场景背景实施契约

这是一份共享 Vue3 模板、六份场景 mock（五种带图场景 + 一种纯色圆环）和五张本地背景。不要将预览 HTML 复制进 uni-app，也不要让生成图承担真实文字、按钮与业务状态。

## 场景与唯一真源

| id | 场景 | 模块组合 / 主题 |
|---|---|---|
| glacier | 会员服务、预约、轻奢生活 | 统计、权益横幅、服务网格、菜单 / fresh |
| coral | 潮流商城、美妆零售 | 权益、订单网格、资产双卡、售后 / warm |
| aurora | 创作者、游戏社群 | 创作统计、通行证、工作台、挑战 / dark |
| forest | 户外旅行、活动社区 | 行程、足迹、路线双卡、出行服务 / fresh |
| cloud | 阅读打卡、学习成长 | 打卡进度、书架手记、积分、计划 / glass |
| solid | 通用工具、企业服务、轻量个人账户 | 纯色底、三层圆形装饰、常用入口、账户菜单 / business |

- 模板与类型：templates/uniapp-vue3/profile-scenic/。
- 五份可复制数据：同目录 mock.ts；调用 createScenicProfile 返回独立副本，防止页面相互污染。
- 背景真源：assets/profile-scenic/，含五张 PNG、提示词和来源说明；不用外链，不需现场重新生成。
- 图标沿第一组 demo/src/static/profile-icons 的本地资源，新增时走 frontend-icon-skill 与 icon-catch；深色使用同一批图标的 dark 派生版本。
- 容器：BaseCard / BaseAvatar / BaseNavbar / BaseTabbar / BaseButton / BasePopup 与 Empty 全部导入仓库真源。新模板不定义主题 token、不复制容器、不自行写请求。

## 素材配置与降级

运行配置使用 assets/profile-scenic/runtime 的轻量 JPEG，原 PNG 保留在素材根目录。image.backgroundSrc 是页面装饰背景，widthFix 保持比例；image.bannerSrc 可选，缺失或加载失败时保留横幅文本与动作。avatar 使用 BaseAvatar 的失败占位。装饰背景失败时回到主题底色，不影响资料与入口。

Hero 使用 BaseCard 的显式半透明白背景（深色用主题实色），属于沉浸式展示例外，旨在给复杂底图上的文字提供稳定底层；不新增 token，不用 backdrop-filter，不修改全局卡片风格。其他业务卡片走 theme 的 bg-card。光纹、玻璃和极光来自静态位图，不宣称有实时动效。

backgroundSrc 改变时重置失败状态。用户自备图需保证文字区低细节、合适对比度，并拥有使用权限。生产应用需要检查包体、懒加载和压缩：原图每张约 1.5–2.3 MB，五张全部放入小程序主包可能超过预算，应仅选择实际场景，或按工程分包/受控 CDN 资源策略部署，不能默认五图全打进生产主包。

## Demo

在 demo 中执行 npm ci、npm run dev:h5，访问 /#/pages/scenic。scene 参数选择 glacier/coral/aurora/forest/cloud/solid，preview=1 隐藏演示控制面板。原 /#/pages/index 第一组不受影响。

构建脚本仅从 assets/profile-scenic/runtime 复制 JPEG 到 demo/src/static/profile-scenic，此复制品 gitignore，不维护第二个素材真源。正式业务将选定素材放工程 static/profile-scenic，或明确受控资源位置。

展示组件接收 data/state/busy/checkedIn/activeTab/statusBarHeight/dark/iconRoot；action/retry/login/checkin/tab 事件交给页面容器。演示签到只改本地状态，不提交后端；订单、权益和导航为反馈弹层，没有真实扣费、购买或路由业务。生产签到由后端保证幂等与权限，不能以按钮禁用替代。

正式接入先读 uniapp-standard/theme/style/base 与旧 profile-gallery 契约；接 API、登录再读 request/auth。保留页面的状态、事件与 mock 边界，更新项目接口契约。

## 使用提示词

> 使用 uniapp-ui-template-builder-skill 的 profile-scenic 共享模板生成 coral 商城个人中心。使用技能 assets/profile-scenic/coral-background.png，在当前项目选择性部署素材，不把五张大图全塞进小程序主包。沿已有 warm 主题、base-card/avatar/navbar/tabbar/button/popup 和本地图标；读取 types.ts 与 mock.ts，保持展示与容器事件分离。订单、礼券、积分、售后按业务模块组合，图片失败退回主题底色。验证 320/390/430/768px、长昵称、未登录、失败恢复、图片失败与底栏避让，分别报告 H5、微信编译、微信真机、App 的真实结果。

## 验证记录

见 profile-scenic-verification.md。视觉参考、H5 实际运行、平台编译与真机验证分开记录，禁止互相替代。

## 纯色圆环方案

createScenicProfile('solid') 返回 backgroundMode='solid-rings' 与空 backgroundSrc；三个 view 绘制静态半透明圆形，尺寸/颜色来自已有主题 token，不需要背景 PNG、Canvas、SVG 或滤镜。装饰层 pointer-events:none、aria-hidden，不能挡住内容与触控，不启用自定义关键帧。内容仍使用同一共享组件与基础容器。用户换图与纯色通过 backgroundMode 明确选择，不靠图片加载失败猜测。

验证脚本：安装 Playwright 与本机 Edge 后，用 python demo/scripts/verify-scenic.py --url http://127.0.0.1:5192 --output <本机证据目录>；需先启动构建产物的静态服务。此端口是测试默认值，可用参数修改。

## 当前主题主色色阶

| 场景 | theme | --primary-500 |
|---|---|---|
| 冰川玻璃 | fresh | #34D399 |
| 珊瑚潮流 | warm | #F97316 |
| 极光夜色 | dark | #14B8A6 |
| 森林露营 | fresh | #34D399 |
| 奶油云朵 | glass | #8B5CF6 |
| 纯色圆环 | business | #2563EB |

颜色来自 theme/base.css。背景是多色位图；语义变量与主色色阶分别维护，不保证所有公共按钮都读取 primary-500。纯色版最小调用见 templates/uniapp-vue3/profile-scenic/solid-example.vue，真实页面按原规范传运行时状态栏高度与事件。

## 纯色圆环完整调用示例

使用 wg-skills 的 uniapp-ui-template-builder-skill，为当前 uni-app Vue3 项目生成个人中心。

1. 使用 profile-scenic 共享模板，场景选择 solid（纯色圆环）。读取该模板的 types.ts、mock.ts 和 references/profile-scenic.md，不从零重写页面。
2. 先遵循 uniapp-standard-skill、uniapp-theme-skill、uniapp-style-skill。纯色版采用已有 business 主题，主色色阶为 #2563EB；通过主题真源维护颜色，不在页面私自创建平行变量。
3. 卡片、头像、导航、底栏、按钮与弹层必须导入现有 base-card、base-avatar、base-navbar、base-tabbar、base-button、base-popup，空态使用已有 Empty。图标复用技能内的本地资源。
4. 纯色背景采用 solid-rings：三个低透明度圆形由代码绘制，不加载背景大图，不引入 Canvas、WebGL 或动画库。装饰层不能挡住点击。
5. 页面包含资料区、收藏、足迹、关注、预约、地址、安全与帮助等入口。先使用独立 mock；展示组件只发事件，路由、弹层和接口副作用由页面容器处理。不要伪造真实业务成功。
6. 保留加载、未登录、失败重试、空记录、长昵称和图片失败状态。状态栏高度使用运行时值，底栏与内容按原安全区规范处理。
7. 检查 320/390/430/768px，验证菜单与弹层、键盘操作、主题和失败恢复。分别报告类型检查、H5 运行、微信编译、微信真机与 App 的结果；没执行的明确标注。
8. 交付源码位置、素材清单、启动方式、截图和未接入的业务项。已有项目只合并必要改动，不覆盖原有主题、请求层、认证层和路由配置。

本轮为避免原图增加演示主包，已内置 runtime/ 轻量 JPEG（像素尺寸不变，五张合计 563491 字节），预构建脚本仅复制这些派生文件；原 PNG 与预览保留为技能素材。无需安装图像处理工具即可运行。
