"""
知乎热榜抓取器
"""
import requests
from typing import List, Dict

# 知乎热榜 API
ZHIHU_API = "https://www.zhihu.com/api/v3/feed/topstory/hot-lists/total?limit=50"


def fetch_trends() -> List[Dict]:
    """获取知乎热榜"""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://www.zhihu.com/"
    }

    try:
        response = requests.get(ZHIHU_API, headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            trends = []
            for item in data.get("data", []):
                target = item.get("target", {})
                trends.append({
                    "title": target.get("title", ""),
                    "url": f"https://www.zhihu.com/question/{target.get('id', '')}",
                    "heat": item.get("detail_text", "").get("text", "0") if isinstance(item.get("detail_text"), dict) else 0
                })
            return trends
    except Exception as e:
        print(f"知乎 API 请求失败: {e}")

    # 降级方案：返回示例数据
    return [
        {"title": "有哪些适合发朋友圈的文案？", "url": "https://www.zhihu.com/", "heat": 5000},
        {"title": "2024年有哪些值得关注的科技趋势？", "url": "https://www.zhihu.com/", "heat": 4500},
        {"title": "如何提升自己的表达能力？", "url": "https://www.zhihu.com/", "heat": 4000},
    ]


if __name__ == "__main__":
    trends = fetch_trends()
    for t in trends[:5]:
        print(f"[{t['heat']}] {t['title']}")
