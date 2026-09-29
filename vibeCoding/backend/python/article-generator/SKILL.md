---
name: article-generator
description: 多平台文章生成工具，支持小红书、知乎、今日头条、公众号、CSDN 等平台的 AI 辅助创作
---

# Article Generator

多平台文章生成工具，基于热点通过 AI 生成适配各平台风格的初稿。

## 使用场景

- 自媒体创作者需要快速生成多平台适配的文章
- 需要根据热点话题生成创意内容
- 需要统一管理多平台文章

## 功能特性

### 支持的平台

| 平台 | 文章风格 | 字数范围 | 特点 |
|------|----------|----------|------|
| 小红书 | 种草安利、情感共鸣 | 300-1000 | 表情丰富、段落短、标签多 |
| 知乎 | 专业分析、深度解读 | 1000-3000 | 结构清晰、论据充分 |
| 今日头条 | 新闻资讯、热点评论 | 500-1500 | 标题党、观点鲜明 |
| 公众号 | 深度文章、个人观点 | 1000-2000 | 情感丰富、有带入感 |
| CSDN | 技术文章、教程 | 800-2000 | 代码示例、步骤清晰 |

### 核心功能

1. **热点关联** - 基于热点话题生成文章
2. **多平台适配** - 一键生成多平台版本
3. **风格模板** - 各平台预设写作风格
4. **AI 对接** - 支持 Kimi / DeepSeek / MiniMax

## 项目结构

```
article-generator/
├── SKILL.md
├── scripts/
│   ├── generator.py          # 主入口
│   ├── platforms/            # 平台适配器
│   │   ├── __init__.py
│   │   ├── base.py          # 基础类
│   │   ├── xiaohongshu.py   # 小红书
│   │   ├── zhihu.py         # 知乎
│   │   ├── toutiao.py       # 今日头条
│   │   ├── wechat.py        # 公众号
│   │   └── csdn.py          # CSDN
│   ├── ai_client.py         # AI 客户端
│   └── prompts/             # 提示词模板
│       ├── xiaohongshu.txt
│       ├── zhihu.txt
│       └── ...
└── assets/
    └── templates/           # 示例模板
```

## 使用方法

### 1. 安装依赖

```bash
pip install requests openai aiohttp
```

### 2. 配置 AI

在 `scripts/config.py` 中配置：

```python
# 选择 AI 提供商
AI_PROVIDER = "kimi"  # 或 deepseek, minimax

# API Keys
KIMI_API_KEY = "your-kimi-key"
DEEPSEEK_API_KEY = "your-deepseek-key"
MINIMAX_API_KEY = "your-minimax-key"
```

### 3. 启动服务

```bash
python scripts/generator.py
```

服务默认在 `http://localhost:8001` 启动。

### 4. API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/generate | 生成文章 |
| GET | /api/platforms | 获取支持的平台 |
| GET | /api/articles | 获取文章列表 |
| GET | /api/articles/{id} | 获取单篇文章 |
| PUT | /api/articles/{id} | 更新文章 |
| DELETE | /api/articles/{id} | 删除文章 |

### 5. 请求示例

```bash
curl -X POST http://localhost:8001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "年轻人为什么不爱换手机了",
    "platform": "xiaohongshu",
    "style": "种草安利",
    "length": "medium"
  }'
```

## 提示词模板

各平台的提示词模板存储在 `scripts/prompts/` 目录：

- `xiaohongshu.txt` - 小红书风格
- `zhihu.txt` - 知乎风格
- `toutiao.txt` - 今日头条风格
- `wechat.txt` - 公众号风格
- `csdn.txt` - CSDN 风格

## 扩展新平台

在 `scripts/platforms/` 目录下创建新的平台适配器：

```python
# scripts/platforms/new_platform.py
from .base import PlatformAdapter

class NewPlatformAdapter(PlatformAdapter):
    name = "new_platform"
    display_name = "新平台"

    def get_prompt_template(self) -> str:
        return """请帮我写一篇关于{topic}的文章...
        要求：
        - 风格：xxx
        - 字数：xxx
        - 格式：xxx
        """

    def format_output(self, content: str) -> str:
        # 格式化输出
        return content
```

## 注意事项

- 各平台文章风格差异大，建议先测试各平台的生成效果
- AI 生成的内容需要人工审核后再发布
- 注意保护个人隐私和商业机密
