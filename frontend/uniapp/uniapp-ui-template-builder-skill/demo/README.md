# uni-app 个人中心五场景

在此目录运行：

```sh
npm ci
npm run dev:h5
```

打开 http://127.0.0.1:5186/ ，可切换场景、数据状态和暗色模式。安装后首次启动会建立局部源码链接，请从完整的 wg-skills 仓库运行。单独下载 demo 目录无法解析共享组件。

| 场景 | 内容 | H5 实际截图 |
| --- | --- | --- |
| 简洁个人 | 资料、收藏、浏览、设置 | [查看](screenshots/simple.png) |
| 标准服务 | 预约详情、常用服务 | [查看](screenshots/service.png) |
| 商城订单 | 订单状态、物流、商品推荐 | [查看](screenshots/commerce.png) |
| 企业员工 | 组织身份、待办、考勤报销与审批入口 | [查看](screenshots/enterprise.png) |
| 会员权益 | 等级、签到、权益与积分兑换入口 | [查看](screenshots/member.png) |

五套使用同一个 [Vue 模板](../templates/uniapp-vue3/profile-gallery/profile-gallery.vue) 和 [五套模拟数据](src/api/_mocks_/profiles.ts)。接入项目时查看 [实施契约和调用示例](../references/profile-gallery.md)。菜单、订单、预约和审批提供本地交互反馈，真实业务由接入项目实现。签到仅更新本次演示数据。

```sh
npm run lint
npm run typecheck
npm run build:h5
npm run build:mp-weixin
```

H5 在 Edge 检查了五套页面和四档视口宽度，以及状态切换、失败重试、图片兜底、弹层和重复签到。详见 [浏览器验证记录](screenshots/verification.json)。小程序编译产物位于 dist/build/mp-weixin，开发者工具、真机和 App 验收待补。

可用 scripts/verify-browser.py 复跑 H5 检查。需提前启动演示服务器，并安装 Python Playwright 与 Edge。
