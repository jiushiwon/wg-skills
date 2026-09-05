---
name: hot-trend-collector
description: 热点抓取工具，支持知乎、微博、百度指数等平台热点数据采集与 REST API 服务
---

# Hot Trend Collector

热点抓取工具，提供多平台热点数据采集能力，并暴露 REST API 供前端调用。

## 使用场景

- 自媒体运营平台需要热点数据作为创作素材
- 需要定时抓取热点并存储
- 需要手动添加热点作为补充

## 功能特性

### 支持的热点来源

| 来源 | 类型 | 说明 |
|------|------|------|
| 知乎热榜 | API/爬虫 | 获取知乎实时热榜 |
| 微博热搜 | 爬虫 | 获取微博热搜榜 |
| 百度指数 | 爬虫 | 获取搜索热度 |
| 微信指数 | 爬虫 | 获取公众号热度 |
| 手动输入 | 人工 | 支持手动添加热点 |

### 核心功能

1. **热点抓取** - 定时/手动抓取多平台热点
2. **热点管理** - 列表展示、筛选、删除
3. **REST API** - 提供热点数据的增删改查接口

## 项目结构

```
hot-trend-collector/
├── SKILL.md
├── scripts/
│   ├── collector.py          # 抓取脚本入口
│   ├── collectors/           # 各平台抓取器
│   │   ├── __init__.py
│   │   ├── zhihu.py         # 知乎热榜
│   │   ├── weibo.py         # 微博热搜
│   │   ├── baidu.py         # 百度指数
│   │   └── wechat.py        # 微信指数
│   └── scheduler.py         # 定时任务
├── references/
│   └── api.md               # API 文档
└── assets/
    └── sample_data.json     # 示例数据
```

## 使用方法

### 1. 安装依赖

```bash
pip install requests beautifulsoup4 aiohttp schedule
```

### 2. 启动服务

```bash
python scripts/collector.py
```

服务默认在 `http://localhost:8000` 启动。

### 3. API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/trends | 获取热点列表 |
| POST | /api/trends | 手动添加热点 |
| DELETE | /api/trends/{id} | 删除热点 |
| POST | /api/trends/collect | 触发抓取 |
| GET | /api/trends/sources | 获取支持的来源 |

### 4. 定时任务

启动时会自动开启定时任务，每小时抓取一次热点。

## 配置说明

在 `scripts/config.py` 中配置：

```python
# 抓取间隔（小时）
COLLECT_INTERVAL = 1

# 是否启用定时任务
ENABLE_SCHEDULER = True

# 数据存储文件
DATA_FILE = "data/trends.json"
```

## 扩展新的热点源

在 `scripts/collectors/` 目录下创建新的抓取器：

```python
# scripts/collectors/new_source.py
import requests

def fetch_trends():
    """获取新平台热点"""
    # 实现抓取逻辑
    return [
        {"title": "热点标题", "url": "链接", "heat": 100, "source": "new_source"}
    ]
```

然后在 `collector.py` 中注册：

```python
from collectors import new_source
```

## 注意事项

- 遵守各平台的 Robots.txt 规则
- 合理设置抓取频率，避免对目标网站造成压力
- 微博等平台可能需要 Cookie，建议登录后抓取
