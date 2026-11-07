"""
微博热搜抓取器
"""
import requests
from bs4 import BeautifulSoup
from typing import List, Dict

# 微博热搜页面
WEIBO_URL = "https://weibo.com/ajax/side/hotSearch"


def fetch_trends() -> List[Dict]:
    """获取微博热搜"""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://weibo.com/",
        "Accept": "application/json",
        "Accept-Language": "zh-CN,zh;q=0.9"
    }

    try:
        response = requests.get(WEIBO_URL, headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            trends = []
            for item in data.get("data", {}).get("realtime", [])[:50]:
                trends.append({
                    "title": item.get("word", ""),
                    "url": f"https://s.weibo.com/weibo?q={item.get('word', '')}",
                    "heat": item.get("num", 0)
                })
            return trends
    except Exception as e:
        print(f"微博 API 请求失败: {e}")

    # 降级方案：返回示例数据
    return [
        {"title": "今日热点话题", "url": "https://weibo.com/", "heat": 10000},
        {"title": "明星动态", "url": "https://weibo.com/", "heat": 8000},
        {"title": "科技圈大事", "url": "https://weibo.com/", "heat": 6000},
    ]


if __name__ == "__main__":
    trends = fetch_trends()
    for t in trends[:5]:
        print(f"[{t['heat']}] {t['title']}")
