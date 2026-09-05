"""
文章生成器主入口
提供 REST API 服务，支持多平台文章生成与存储
"""
import json
import os
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

# 尝试导入平台适配器和 AI 客户端
try:
    from platforms import xiaohongshu, zhihu, toutiao, wechat, csdn
    from ai_client import AIClient
    COMPONENTS_AVAILABLE = True
except ImportError:
    COMPONENTS_AVAILABLE = False

# ============ 配置 ============
DATA_DIR = Path(__file__).parent.parent / "data"
DATA_FILE = DATA_DIR / "articles.json"

# 确保数据目录存在
DATA_DIR.mkdir(exist_ok=True)

# ============ 数据模型 ============
class ArticleGenerateRequest(BaseModel):
    topic: str
    platform: str
    style: Optional[str] = "default"
    length: Optional[str] = "medium"  # short/medium/long

class Article(BaseModel):
    id: int
    title: str
    content: str
    platform: str
    status: str  # draft/published
    hot_trend_id: Optional[int] = None
    tags: str = ""
    created_at: str
    updated_at: str

# ============ 数据存储 ============
def load_articles() -> List[dict]:
    """加载文章数据"""
    if DATA_FILE.exists():
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def save_articles(articles: List[dict]) -> None:
    """保存文章数据"""
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(articles, f, ensure_ascii=False, indent=2)

def get_next_id(articles: List[dict]) -> int:
    """生成新 ID"""
    if not articles:
        return 1
    return max(a["id"] for a in articles) + 1

# ============ 平台映射 ============
PLATFORMS = {
    "xhs": "xiaohongshu",
    "xiaohongshu": "xiaohongshu",
    "zhihu": "zhihu",
    "toutiao": "toutiao",
    "头条": "toutiao",
    "wechat": "wechat",
    "公众号": "wechat",
    "csdn": "csdn",
}

def get_platform_adapter(platform: str):
    """获取平台适配器"""
    if not COMPONENTS_AVAILABLE:
        return None

    platform_key = PLATFORMS.get(platform, platform)
    adapters = {
        "xiaohongshu": xiaohongshu.XiaohongshuAdapter,
        "zhihu": zhihu.ZhihuAdapter,
        "toutiao": toutiao.ToutiaoAdapter,
        "wechat": wechat.WechatAdapter,
        "csdn": csdn.CSDNAdapter,
    }
    return adapters.get(platform_key)

# ============ 文章生成 ============
def generate_article(topic: str, platform: str, style: str = "default", length: str = "medium") -> dict:
    """生成文章"""
    timestamp = datetime.now().isoformat()

    if COMPONENTS_AVAILABLE:
        adapter = get_platform_adapter(platform)
        if adapter:
            try:
                # 获取提示词模板
                prompt = adapter().generate_prompt(topic, style, length)

                # 调用 AI 生成
                ai_client = AIClient()
                content = ai_client.generate(prompt)

                return {
                    "title": topic,
                    "content": content,
                    "platform": platform,
                    "status": "draft",
                    "tags": "",
                    "created_at": timestamp,
                    "updated_at": timestamp
                }
            except Exception as e:
                print(f"AI 生成失败: {e}")

    # 降级方案：返回示例内容
    sample_content = get_sample_content(platform, topic)
    return {
        "title": topic,
        "content": sample_content,
        "platform": platform,
        "status": "draft",
        "tags": "",
        "created_at": timestamp,
        "updated_at": timestamp
    }

def get_sample_content(platform: str, topic: str) -> str:
    """获取示例内容"""
    samples = {
        "xiaohongshu": f"""# {topic}

姐妹们！今天必须跟你们聊聊这个话题！👋

最近我发现{topic}真的超火🔥，忍不住来分享一波～

## 为什么这么说呢？

首先，这个话题真的戳中了很多人的痛点😢

> "只有经历过的人才懂"

### 我的使用体验

1. **超简单** - 几步就搞定
2. **效果好** - 真的爱了
3. **性价比高** - 钱包表示很友好

### 总结

总的来说，{topic}还是很值得尝试的！💕

#种草 #分享 #好物推荐""",

        "zhihu": f"""# {topic}

作为一个深度关注这个领域的人，我想从专业角度来分析一下这个话题。

## 背景分析

{topic}之所以引发广泛讨论，主要有以下几个原因：

### 1. 市场需求大

根据行业观察，这个领域的需求一直在持续增长。

### 2. 技术驱动

新技术的发展为这个领域带来了新的可能性。

### 3. 用户习惯变化

消费者的使用习惯正在发生改变。

## 深度解读

从多个维度来看，这个问题值得我们深入思考：

**优势方面：**
- 先行者优势明显
- 市场规模可观
- 发展潜力大

**挑战方面：**
- 竞争日趋激烈
- 用户要求提高
- 成本压力增大

## 结论

综上所述，{topic}是一个值得关注的重要话题。建议有兴趣的朋友可以深入了解。

---

欢迎在评论区分享你的看法！""",

        "toutiao": f"""重磅！{topic}引发热议，网友：太意外了！

近日，{topic}成为网友热议的话题。有网友表示："完全没想到会这样"，也有网友持不同观点。

## 发生了什么？

据多方消息，这个话题在短短几天内就冲上了热搜榜。业内专家分析认为，这与当前的市场环境密切相关。

## 网友观点

- 网友A：终于有人说出来了！
- 网友B：感觉还需要更多了解
- 网友C：期待后续发展

## 专家怎么说？

某知名分析师表示："{topic}反映了行业发展的一个新趋势。"

## 结语

对于这个话题，你怎么看？欢迎留言讨论！""",

        "wechat": f"""{topic}

文 | 你的朋友

---

不知道从什么时候开始，我们开始频繁地讨论这个话题。

## 01

那天和朋友聊天，无意间聊到了{topic}。

朋友说："你有没有发现，现在这个变化越来越明显了。"

我想了想，确实如此。

## 02

记得刚开始的时候，一切都那么简单。

> "那时候的我们，还相信努力就会有收获。"

可现在呢？

## 03

后来我查阅了很多资料，也和行业内的人士聊了聊。

发现这个问题远比我们想象的复杂。

## 04

但我想说的是：

无论外界如何变化，我们都应该保持自己的节奏。

## 写在最后

如果你也有类似的感受，欢迎在后台私信我，我们聊聊。

**点亮在看**，让更多朋友看到这篇文章。""",

        "csdn": f"""# {topic}

> 这篇文章主要介绍{topic}相关的知识点

## 前言

在当今快速发展的技术领域，{topic}是一个值得关注的重要主题。本文将详细介绍相关概念和实践方法。

## 环境准备

```bash
# 环境要求
- Python 3.8+
- Node.js 16+
```

## 核心概念

{topic}涉及以下几个核心概念：

### 1. 基础概念

这是最基本的内容，理解后才能更好地深入。

### 2. 进阶知识

在基础之上的扩展，需要有一定的经验。

### 3. 最佳实践

根据实际项目经验总结的推荐做法。

## 代码示例

```python
# 示例代码
def example():
    """这是一个示例函数"""
    pass
```

## 常见问题

| 问题 | 解决方案 |
|------|----------|
| 问题1 | 方案1 |
| 问题2 | 方案2 |

## 总结

本文详细介绍了{topic}的相关知识，希望对你有所帮助。

---

**参考资料**
- 官方文档
- 社区教程""",
    }

    return samples.get(platform, f"# {topic}\n\n这是一篇关于{topic}的文章。")

# ============ FastAPI ============
app = FastAPI(title="文章生成 API", version="1.0.0")

@app.post("/api/generate", response_model=Article)
def create_article(req: ArticleGenerateRequest):
    """生成文章"""
    articles = load_articles()

    # 生成文章
    article_data = generate_article(req.topic, req.platform, req.style, req.length)
    article_data["id"] = get_next_id(articles)

    articles.append(article_data)
    save_articles(articles)

    return article_data

@app.get("/api/articles", response_model=List[Article])
def get_articles(platform: Optional[str] = None, status: Optional[str] = None, limit: int = 50):
    """获取文章列表"""
    articles = load_articles()

    if platform:
        articles = [a for a in articles if a["platform"] == platform]
    if status:
        articles = [a for a in articles if a["status"] == status]

    return articles[:limit]

@app.get("/api/articles/{article_id}", response_model=Article)
def get_article(article_id: int):
    """获取单篇文章"""
    articles = load_articles()
    for a in articles:
        if a["id"] == article_id:
            return a
    raise HTTPException(status_code=404, detail="Article not found")

@app.put("/api/articles/{article_id}", response_model=Article)
def update_article(article_id: int, article: Article):
    """更新文章"""
    articles = load_articles()
    for i, a in enumerate(articles):
        if a["id"] == article_id:
            a["title"] = article.title
            a["content"] = article.content
            a["status"] = article.status
            a["tags"] = article.tags
            a["updated_at"] = datetime.now().isoformat()
            articles[i] = a
            save_articles(articles)
            return a
    raise HTTPException(status_code=404, detail="Article not found")

@app.delete("/api/articles/{article_id}")
def delete_article(article_id: int):
    """删除文章"""
    articles = load_articles()
    articles = [a for a in articles if a["id"] != article_id]
    save_articles(articles)
    return {"status": "ok"}

@app.get("/api/platforms")
def get_platforms():
    """获取支持的平台"""
    return [
        {"id": "xhs", "name": "小红书", "description": "种草安利、情感共鸣"},
        {"id": "zhihu", "name": "知乎", "description": "专业分析、深度解读"},
        {"id": "toutiao", "name": "今日头条", "description": "新闻资讯、热点评论"},
        {"id": "wechat", "name": "公众号", "description": "深度文章、个人观点"},
        {"id": "csdn", "name": "CSDN", "description": "技术文章、教程"},
    ]

# ============ 启动 ============
if __name__ == "__main__":
    print("=" * 50)
    print("文章生成服务启动中...")
    print(f"数据文件: {DATA_FILE}")
    print("=" * 50)
    uvicorn.run(app, host="0.0.0.0", port=8001)
