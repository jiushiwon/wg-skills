# 三端应用开发上线检查清单

> 本检查清单供 `uniapp-app-generate-skill` 生成的项目在每个阶段结束时自查，覆盖微信小程序、H5、App 三端。

## 一、启动阶段

- [ ] 已确认产品定位、目标用户、核心页面、目标平台（微信小程序 / H5 / App）
- [ ] 已生成 `spec.md` 并经过确认
- [ ] 已选择技术栈：uni-app（Vue3）+ TypeScript + Pinia + SCSS
- [ ] 已创建标准目录结构
- [ ] 已生成 `CLAUDE.md` 和 `AGENTS.md`
- [ ] 已创建 `.claudeignore` 和 `.gitignore`
- [ ] 已配置 `.env`（Pexels API Key、三端 baseURL 等）
- [ ] 已安装依赖并可运行 `npm run dev:mp-weixin` / `npm run dev:h5`

## 二、主题与样式

- [ ] 主题配置入口唯一：`src/styles/config/_theme-config.scss`
- [ ] 主色可生成完整色阶（50~900）
- [ ] 间距、字体、圆角由基数派生
- [ ] 业务代码未出现硬编码 `#xxx` 或具体 `rpx` 数值
- [ ] JS 侧 `src/constants/colors.ts` 与 SCSS 变量同步
- [ ] 已处理安全区、刘海屏、底部横条适配

## 三、跨平台兼容性

- [ ] 模板使用 uni-app 组件，未使用 `div`/`span`/`p`/`h1~h6`
- [ ] 图片使用 `image` 组件，未使用 `background-image: url(...)`
- [ ] 未使用 CSS 自定义属性 `var(--xxx)`
- [ ] 未使用 `window`/`document`/`localStorage`/`fetch`
- [ ] 已使用 `platform.ts` / `platform-auth.ts` / `platform-share.ts` / `platform-image.ts` 处理平台差异
- [ ] 条件编译 `#ifdef` 仅用于真正必要的平台差异

## 四、静态资源

- [ ] 图标统一为 PNG，tabBar 图标 81×81px
- [ ] 已生成或准备生成 tabBar 图标
- [ ] Banner / 空状态 / 装饰图使用真实照片（Pexels 或用户上传）
- [ ] 未使用 CSS 渐变或纯色块替代图片
- [ ] 未使用 emoji 作为 UI 元素
- [ ] 图片已压缩，单张 ≤ 100KB

## 五、页面与组件

- [ ] 首页、我的页面已搭建
- [ ] 核心流程页面已搭建
- [ ] 公共组件：`AppButton`、`AppCard`、`AppEmpty`、`AppAvatar` 等
- [ ] 页面使用语义 Token，无硬编码样式
- [ ] 未嵌套 `v-for`
- [ ] 列表使用懒加载 + 分页

## 六、状态与数据

- [ ] Pinia store 已配置
- [ ] 用户状态、应用状态已分离
- [ ] 本地缓存封装在 `src/utils/storage.ts`
- [ ] 登录态维护逻辑已确认（如需要）
- [ ] 接口定义在 `src/api/modules/`，含 Req/Res 类型和中文注释

## 七、网络与接口

- [ ] `src/utils/request.ts` 已封装 `uni.request`
- [ ] 三端 baseURL 已在 `.env` 中配置（`VITE_BASE_URL`、`VITE_H5_BASE_URL`、`VITE_APP_BASE_URL`）
- [ ] 请求失败会弹出 `uni.showToast` 提示
- [ ] token 注入和 401 处理逻辑已确认
- [ ] 微信小程序 request 合法域名已配置
- [ ] H5 跨域/代理问题已处理

## 八、性能

- [ ] 主包体积 ≤ 2MB（微信小程序限制）
- [ ] 已评估是否需要分包
- [ ] 长列表已做懒加载/分页
- [ ] 图片已做压缩或懒加载
- [ ] DOM 节点 ≤ 800
- [ ] 高频事件已节流

## 九、平台特有功能

### 微信小程序

- [ ] 分享转发已配置（如需要）
- [ ] 登录授权逻辑已确认
- [ ] 用户信息获取符合微信最新规范
- [ ] 版本更新提示已添加
- [ ] 订阅消息/支付已接入（如需要）
- [ ] 隐私保护指引已配置

### H5

- [ ] 路由模式（hash/history）已确认
- [ ] 浏览器兼容性已检查
- [ ] 分享逻辑已替换为 Web Share API 或复制链接
- [ ] 登录方式已替换为账号/OAuth
- [ ] 响应式布局已验证

### App

- [ ] 应用图标、启动图已配置
- [ ] Android/iOS 权限已声明
- [ ] 原生能力（扫码、定位、推送等）已测试
- [ ] 热更新/离线包策略已确认
- [ ] 刘海屏/灵动岛适配已验证

## 十、测试

- [ ] `npm run lint` 通过
- [ ] `npm run build:mp-weixin` 成功
- [ ] `npm run build:h5` 成功
- [ ] 微信开发者工具可正常导入
- [ ] H5 在主流浏览器中正常
- [ ] 真机调试通过（至少 iOS + Android 各一台，如目标含 App）
- [ ] 空状态、错误状态、网络异常已验证

## 十一、上线前

- [ ] `appid` 已配置在 `manifest.json`（微信小程序）
- [ ] 隐私协议、用户协议页面已准备
- [ ] 类目与资质符合各平台要求
- [ ] 首页、关于页面内容合规
- [ ] 客服、反馈入口可用
- [ ] 已提交微信小程序审核 / 已部署 H5 / 已打包 App

## 十二、规范文件

- [ ] `AGENTS.md`、`CLAUDE.md` 未随业务代码提交
- [ ] 规范变更已单独走审阅流程
