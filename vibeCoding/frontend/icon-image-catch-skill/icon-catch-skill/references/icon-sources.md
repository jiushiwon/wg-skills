# 图标数据源参考

## Iconify：一个 API 覆盖全部主流图标库

[Iconify](https://icon-sets.iconify.design/) 聚合 100+ 开源图标集、20 万+ 图标，提供**免费、无需 Key** 的 HTTP API，是 AI 调用首选（AI 友好度 ⭐⭐⭐⭐⭐）。

| 端点 | 说明 |
|---|---|
| `GET https://api.iconify.design/search?query={关键词}&limit={数量}` | 搜索图标，返回 `prefix:name` 候选列表 |
| `GET https://api.iconify.design/{prefix}/{name}.svg?color=%23xxx&width=24&height=24` | 下载 SVG，支持换色、改尺寸、旋转、翻转 |

## 文章推荐的 9 大图标库对照表

| 图标库 | Iconify prefix | 风格 | 协议 | 特点 | 优先级 |
|---|---|---|---|---|---|
| Lucide | `lucide` | 线性 | MIT | 现代前端事实标准，命名与前端术语对齐，AI 命中率最高 | 1（默认首选） |
| Tabler | `tabler` | 线性（含 filled） | MIT | 5000+ 业务图标，电商/金融/医疗等细分场景全 | 2 |
| Heroicons | `heroicons` | outline/solid | MIT | Tailwind 官方，小而精 | 3 |
| Phosphor | `ph` | 6 种风格 | MIT | thin/light/regular/bold/fill/duotone 全场景 | 4 |
| Remix Icon | `ri` | 线性+填充 | Apache 2.0 | 中文语义匹配度高，国内业务适配好 | 5 |
| Feather | `feather` | 线性 | MIT | 280+ 基础图标，极简 | 6 |
| Simple Icons | `simple-icons` | 品牌 Logo | CC0 | 3000+ 品牌单色 Logo，无使用限制 | 7（品牌类首选） |
| Material Icons | `mdi` / `material-symbols` | 多风格 | Apache 2.0 | 谷歌官方，数量庞大 | 8（兜底） |

## 选择策略

1. **默认链路**：`lucide → tabler → heroicons → ph → ri → feather → simple-icons → mdi`。
2. **品牌 Logo**（微信、支付宝、GitHub…）：直接用 `simple-icons`。
3. **填充风格**：tabler 有 `*-filled`、ph 有 fill 变体、ri 有 `*-fill`。
4. **同一项目只用一个图标集**，避免视觉风格割裂。

## 高频中英文映射（内置兜底表）

> Claude 调用前应尽量自行翻译为精准英文；此表用于未翻译时的兜底，持续补充。

| 中文 | 英文 | 中文 | 英文 | 中文 | 英文 |
|---|---|---|---|---|---|
| 首页 | home | 用户/我的 | user | 设置 | settings |
| 搜索 | search | 消息 | message | 通知 | bell |
| 购物车 | shopping-cart | 收藏 | star | 点赞 | thumbs-up |
| 分享 | share | 返回 | arrow-left | 关闭 | x |
| 菜单 | menu | 更多 | more-horizontal | 电话 | phone |
| 邮箱 | mail | 定位/地址 | map-pin | 时间 | clock |
| 日历 | calendar | 相机 | camera | 图片 | image |
| 视频 | video | 音乐 | music | 文件 | file |
| 下载 | download | 上传 | upload | 删除 | trash |
| 编辑 | edit | 添加 | plus | 确认 | check |
| 警告 | alert-triangle | 信息 | info | 帮助 | help-circle |
| 锁 | lock | 钱包 | wallet | 订单 | receipt |
| 客服 | headphones | 安全 | shield | 数据/图表 | bar-chart |
| 团队 | users | 公司 | building | 教育 | graduation-cap |
| 医疗/健康 | heart-pulse | 食物 | utensils | 运动 | dumbbell |
| 旅行 | plane | 猫 | cat | 狗 | dog |
| 优惠券 | ticket | 会员 | crown | 支付 | credit-card |

## 版权说明

各图标集遵循自身开源协议（主流为 MIT / Apache 2.0 / CC0），**商用无风险**。唯一注意点：Simple Icons 的品牌 Logo 仅表示品牌本身，不可用于暗示品牌背书。
