# hot-trend-collector

热点趋势采集技能 - 自动化内容运营

## 概述

从各大平台采集热点话题，辅助内容创作和运营决策。

## 主要功能

- 多平台热点抓取（微博、知乎、抖音、B站等）
- 热度排序与去重
- 关键词提取
- 定时任务

## 技术栈

- Python 3.10+
- requests / httpx
- BeautifulSoup
- Redis（去重与缓存）
- APScheduler（定时任务）

## 快速使用

```python
from hot_trend import TrendCollector

collector = TrendCollector()
trends = collector.fetch_all()
for item in trends:
    print(f"{item['rank']}. {item['title']} - {item['platform']}")
```

## 输出格式

```json
{
  "platform": "weibo",
  "title": "热点话题",
  "url": "https://...",
  "hot": 1234567,
  "timestamp": "2026-10-12T10:00:00"
}
```

## 触发词

- 热点采集
- 微博热搜
- 知乎热榜
- 内容运营
