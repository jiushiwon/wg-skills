# 图片数据源参考

## 数据源类型

本技能支持三类图片源：

1. **自定义源**（推荐）：通过 `.env` 的 `IMAGE_SOURCE_URL` 配置任意远程地址。
2. **正版图库 API**：Pexels / Pixabay / Unsplash，需免费 Key，质量更高。
3. **默认兜底**：Lorem Flickr（关键词语义）+ Picsum（随机占位），无需任何配置。

## 自定义源

在 `.env` 中配置：

```bash
IMAGE_SOURCE_URL=https://your-cdn.com/api/images?q={query}&w={width}&h={height}&c={count}
```

支持占位符：

| 占位符 | 说明 |
|---|---|
| `{query}` | 英文搜索词 |
| `{width}` | `--width` 参数值 |
| `{height}` | `--height` 参数值（未指定为空） |
| `{count}` | `--count` 参数值 |
| `{orientation}` | `--orientation` 参数值 |

返回格式支持两种：

**字符串数组**：
```json
["https://example.com/a.jpg", "https://example.com/b.jpg"]
```

**对象数组**：
```json
[
  { "url": "https://example.com/a.jpg", "width": 1920, "height": 1080, "author": "..." }
]
```

对象字段映射：
- `url` / `downloadUrl` / `originalUrl` / `largeUrl`：原图地址（必填其一）
- `previewUrl` / `largeUrl` / `webformatURL`：预览/远程缩放地址
- `width`、`height`：原始尺寸
- `author` / `photographer` / `user`：作者
- `pageUrl` / `pageURL`：详情页
- `desc` / `alt` / `title` / `tags`：描述

配置自定义源后，技能会优先从该地址抓取。

## 正版图库 API 对比

| 维度 | Pexels | Pixabay | Unsplash |
|---|---|---|---|
| 申请地址 | https://www.pexels.com/api/new/ | https://pixabay.com/api/docs/ | https://unsplash.com/developers |
| Key 类型 | 注册后即时生成 | 注册后 API 文档页顶部显示 | 创建应用后获取 Access Key |
| 免费额度 | 200 次/小时 | 100 次/分钟 | 50 次/小时 |
| 搜索质量 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 内容类型 | 照片+视频 | 照片+插画+矢量+视频 | 高质量照片 |
| 中文支持 | 一般 | 一般 | 弱 |
| API 鉴权 | Header `Authorization: <key>` | Query `?key=<key>` | Header `Authorization: Client-ID <key>` |

## 默认兜底：Lorem Flickr + Picsum

当未配置 `IMAGE_SOURCE_URL` 且未配置任何 API Key 时，自动使用以下无 Key 源兜底：

### Lorem Flickr（推荐，有关键词语义）

```
https://loremflickr.com/{width}/{height}/{keyword}?lock={seed}
```

特点：
- 无需 Key，开箱即用
- 支持关键词（如 `cat`、`technology`、`office`）
- 返回真实 Flickr 照片
- `lock` 参数保证相同关键词返回相同图片（可复现）
- 适合做原型、Demo、占位图

注意：
- 图片内容由 Flickr 用户上传，关键词匹配是近似匹配
- 不保证商用授权，正式项目建议切换 Pexels/Pixabay/Unsplash

### Picsum（纯占位，无语义）

```
https://picsum.photos/seed/{query}-{index}/{width}/{height}
```

特点：
- 无需 Key
- 相同关键词 + 序号返回相同随机图片
- 适合做纯视觉占位，不追求语义

## 方向参数映射

本规范使用统一方向词 `landscape / portrait / squarish`，内部映射为各平台支持的值：

| 统一词 | Pexels | Pixabay | Unsplash | Lorem Flickr | Picsum |
|---|---|---|---|---|---|
| landscape | landscape | horizontal | landscape | 按宽高比 | 默认比例 16:9 |
| portrait | portrait | vertical | portrait | 按宽高比 | 默认比例 2:3 |
| squarish | square | 不支持（省略） | squarish | 按宽高比 | 1:1 |

## 降级策略

按 `.env` 中 `IMAGE_SOURCE_PRIORITY`（默认 `custom,pexels,pixabay,unsplash,loremflickr,picsum`）顺序尝试：
1. 自定义源（若配置）
2. 已配置 Key 的 API 源
3. Lorem Flickr（无 Key，有关键词语义）
4. Picsum（无 Key，纯占位）
5. 全部失败 → 报错

## 高频中文 → 英文搜索词（内置兜底表）

| 中文 | 英文 | 中文 | 英文 |
|---|---|---|---|
| 猫 | cat | 狗 | dog |
| 自然/风景 | nature / landscape | 科技 | technology |
| 办公 | office | 团队协作 | teamwork |
| 城市 | city | 美食 | food |
| 旅行 | travel | 健康/养生 | health / wellness |
| 运动健身 | fitness / workout | 教育 | education |
| 医疗 | medical | 金融理财 | finance |
| 家庭 | family | 咖啡 | coffee |
| 鲜花 | flowers | 大海 | ocean |
| 山 | mountain | 夜景 | night city |
| 商务 | business | 会议 | meeting |
| 数据分析 | data | 创新 | innovation |
| 抽象背景 | abstract background | 纹理 | texture |
| 简约 | minimal | 建筑 | architecture |

技巧：关键词越具体结果越好，可加修饰词：`cute cat`（萌猫）、`flat lay food`（俯拍美食）、`minimal office desk`（简约办公桌）。
