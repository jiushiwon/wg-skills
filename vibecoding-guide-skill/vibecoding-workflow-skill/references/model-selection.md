# 模型选型参考

一句话：帮助用户根据场景选择合适的 AI 模型。

## 主流模型对比

| 模型 | 适用场景 | 优点 | 缺点 | 价格（参考） |
|------|----------|------|------|--------------|
| GPT-4o | 通用、复杂推理 | 能力强、生态丰富 | 较贵 | $15/1M input |
| Claude 3.5 Sonnet | 编码、分析 | 代码能力强 | 上下文略短 | $3/1M input |
| Gemini 1.5 Pro | 长上下文 | 100万上下文 | 中文优化一般 | $1.25/1M input |

> ⚠️ 价格信息仅供参考，需自行核实最新信息。

## 按场景选型

- **代码生成 / 重构**：Claude 3.5 Sonnet、GPT-4o
- **长文本分析 / RAG**：Gemini 1.5 Pro、Claude 3.5 Sonnet
- **低成本原型**：GPT-4o mini、Gemini Flash
- **中文场景**：Claude、GPT 中文优化较好

## 选型决策树

1. 预算优先？→ GPT-4o mini / Gemini Flash
2. 代码能力优先？→ Claude 3.5 Sonnet
3. 长上下文优先？→ Gemini 1.5 Pro
4. 生态成熟度优先？→ GPT-4o
