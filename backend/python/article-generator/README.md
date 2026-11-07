# article-generator

AI 文章生成技能 - 自动化内容生产

## 概述

基于 LLM 批量生成文章，支持多种风格和模板。

## 主要功能

- 模板化文章生成
- 多风格支持（技术、评论、教程等）
- 批量生成
- 内容审核

## 技术栈

- Python 3.10+
- OpenAI / Claude / DeepSeek
- Jinja2（模板）
- Redis（任务队列）

## 快速使用

```python
from article_generator import ArticleGenerator

gen = ArticleGenerator(model="claude")
article = gen.generate(
    topic="Vue 3 组合式 API",
    style="tutorial",
    length=2000
)
print(article.content)
```

## 输出格式

```json
{
  "title": "Vue 3 组合式 API 完全指南",
  "content": "...",
  "tags": ["Vue", "前端"],
  "summary": "...",
  "word_count": 2000
}
```

## 触发词

- AI 写文章
- 自动生成文章
- 批量内容生产
- 公众号文章生成
