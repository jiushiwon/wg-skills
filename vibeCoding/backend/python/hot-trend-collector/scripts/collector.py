"""
热点抓取器主入口
提供 REST API 服务，支持热点抓取、存储、查询
"""
import json
import os
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import schedule
import time
import threading

# 尝试导入抓取器，失败时提供降级方案
try:
    from collectors import zhihu, weibo
    COLLECTORS_AVAILABLE = True
except ImportError:
    COLLECTORS_AVAILABLE = False

# ============ 配置 ============
DATA_DIR = Path(__file__).parent.parent / "data"
DATA_FILE = DATA_DIR / "trends.json"
COLLECT_INTERVAL_HOURS = 1

# 确保数据目录存在
DATA_DIR.mkdir(exist_ok=True)

# ============ 数据模型 ============
class HotTrend(BaseModel):
    id: int
    title: str
    source: str
    url: Optional[str] = None
    heat: int = 0
    tags: str = ""
    created_at: str

class HotTrendCreate(BaseModel):
    title: str
    source: str
    url: Optional[str] = None
    heat: int = 0
    tags: str = ""

# ============ 数据存储 ============
def load_trends() -> List[dict]:
    """加载热点数据"""
    if DATA_FILE.exists():
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def save_trends(trends: List[dict]) -> None:
    """保存热点数据"""
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(trends, f, ensure_ascii=False, indent=2)

def get_next_id(trends: List[dict]) -> int:
    """生成新 ID"""
    if not trends:
        return 1
    return max(t["id"] for t in trends) + 1

# ============ 抓取逻辑 ============
def collect_all() -> List[dict]:
    """抓取所有平台的热点"""
    new_trends = []
    timestamp = datetime.now().isoformat()

    if COLLECTORS_AVAILABLE:
        # 知乎热榜
        try:
            zhihu_trends = zhihu.fetch_trends()
            for t in zhihu_trends:
                new_trends.append({
                    "id": 0,  # 临时占位
                    "title": t["title"],
                    "source": "zhihu",
                    "url": t.get("url", ""),
                    "heat": t.get("heat", 0),
                    "tags": "",
                    "created_at": timestamp
                })
        except Exception as e:
            print(f"知乎抓取失败: {e}")

        # 微博热搜
        try:
            weibo_trends = weibo.fetch_trends()
            for t in weibo_trends:
                new_trends.append({
                    "id": 0,
                    "title": t["title"],
                    "source": "weibo",
                    "url": t.get("url", ""),
                    "heat": t.get("heat", 0),
                    "tags": "",
                    "created_at": timestamp
                })
        except Exception as e:
            print(f"微博抓取失败: {e}")

    # 合并到现有数据
    trends = load_trends()
    for t in new_trends:
        t["id"] = get_next_id(trends)
        trends.append(t)

    # 按热度排序，保留最新的 100 条
    trends = sorted(trends, key=lambda x: x["heat"], reverse=True)[:100]
    save_trends(trends)

    return trends

# ============ FastAPI ============
app = FastAPI(title="热点抓取 API", version="1.0.0")

@app.get("/api/trends", response_model=List[HotTrend])
def get_trends(source: Optional[str] = None, limit: int = 50):
    """获取热点列表"""
    trends = load_trends()
    if source:
        trends = [t for t in trends if t["source"] == source]
    return trends[:limit]

@app.post("/api/trends", response_model=HotTrend)
def add_trend(trend: HotTrendCreate):
    """手动添加热点"""
    trends = load_trends()
    new_trend = {
        "id": get_next_id(trends),
        "title": trend.title,
        "source": trend.source,
        "url": trend.url or "",
        "heat": trend.heat,
        "tags": trend.tags,
        "created_at": datetime.now().isoformat()
    }
    trends.append(new_trend)
    save_trends(trends)
    return new_trend

@app.delete("/api/trends/{trend_id}")
def delete_trend(trend_id: int):
    """删除热点"""
    trends = load_trends()
    trends = [t for t in trends if t["id"] != trend_id]
    save_trends(trends)
    return {"status": "ok"}

@app.post("/api/trends/collect")
def trigger_collect():
    """手动触发抓取"""
    trends = collect_all()
    return {"status": "ok", "count": len(trends)}

@app.get("/api/trends/sources")
def get_sources():
    """获取支持的热点来源"""
    sources = [
        {"id": "zhihu", "name": "知乎热榜"},
        {"id": "weibo", "name": "微博热搜"},
        {"id": "baidu", "name": "百度指数"},
        {"id": "wechat", "name": "微信指数"},
        {"id": "manual", "name": "手动输入"}
    ]
    return sources

# ============ 定时任务 ============
def run_scheduler():
    """运行定时任务"""
    def job():
        print(f"[{datetime.now()}] 开始抓取热点...")
        collect_all()
        print(f"[{datetime.now()}] 热点抓取完成")

    schedule.every(COLLECT_INTERVAL_HOURS).hours.do(job)

    # 立即执行一次
    job()

    while True:
        schedule.run_pending()
        time.sleep(60)

def start_scheduler_thread():
    """在后台线程启动定时任务"""
    thread = threading.Thread(target=run_scheduler, daemon=True)
    thread.start()

# ============ 启动 ============
if __name__ == "__main__":
    print("=" * 50)
    print("热点抓取服务启动中...")
    print(f"数据文件: {DATA_FILE}")
    print("=" * 50)

    # 启动定时任务
    start_scheduler_thread()

    # 启动 API 服务
    uvicorn.run(app, host="0.0.0.0", port=8000)
