# 模型底层知识

一句话：深入理解 LLM 工作原理。

## 必知概念

| 概念 | 说明 |
|------|------|
| Transformer | 基础架构 |
| Token | 最小处理单元 |
| Temperature | 随机性控制 |
| Top-p / Top-k | 采样策略 |
| Context Window | 上下文长度 |
| System Prompt | 系统提示词 |

## Token 计算

- 1 Token ≈ 0.75 英文单词
- 1 Token ≈ 1-2 个中文字符
- 用 `tiktoken` 库计算

## API 参数

```python
# Temperature: 0=确定性，1=创意性
# Top-p: 累积概率采样
# Max tokens: 生成上限
response = client.chat.completions.create(
    model="gpt-4",
    messages=[...],
    temperature=0.7,
    max_tokens=1000,
)
```

## 上下文管理

- 滑动窗口：保留最近 N tokens
- 摘要压缩：定期压缩历史
- 向量检索：相关上下文召回
