# AI Speech Detector 🗣️

> 检测文案中的 AI 风味词汇、套话、车轱辘话，提供修改方案

## ✨ 功能特性

| 维度 | 说明 | 优先级 |
|------|------|--------|
| **开头套话** | 说句大实话、扎心真相、揭秘 | P0 |
| **车轱辘话** | 首先/其次/最后、总而言之 | P0 |
| **虚词堆砌** | 其实、而且、但是、实际上 | P1 |
| **短句短语** | 列表式短句、两字短语堆砌 | P1 |
| **结尾套话** | 最后说一句、评论区见 | P2 |
| **英文 AI 词汇** | delve, tapestry, robust, pivotal 等 | P1 |
| **结构模式** | 二元对立、戏剧化断句、分形总结 | P1 |
| **格式模式** | 粗体首词列表、Unicode 箭头、破折号 | P2 |

## 🚀 快速开始

### 使用方式

当需要检测文案是否为 AI 生成、或审查文案质量时，告诉 Claude：

```
/ai-speech-detector
```

或描述性的自然语言：

```
帮我检测下这篇文章的AI风
看看这篇文章有没有AI味
分析下这段文案像不像AI写的
```

Claude 会自动：
1. 分析文案的 AI 风味特征
2. 标记问题词汇位置
3. 提供修改建议

### 指定文本

可以直接传入要检测的文案：

```
检测这段话的AI风：
近年来，随着XXX的快速发展，
我们需要首先了解其背景，
其次掌握其核心要点...
```

## 📋 AI 风词汇详解

### 开头套话（P0）

这些词通常出现在文章开头，故作神秘或激烈情绪：

| 词汇 | 风险 |
|------|------|
| 说句大实话 | 🔴 Critical |
| 扎心的真相 | 🔴 Critical |
| 揭秘 | 🔴 Critical |
| 说一句大实话 | 🔴 Critical |
| 说实在的 | 🟠 High |

### 车轱辘话（P0）

机械罗列要点，缺乏有机论述：

| 词汇 | 风险 |
|------|------|
| 首先 | 🔴 Critical |
| 其次 | 🔴 Critical |
| 最后 | 🔴 Critical |
| 总的来说 | 🔴 Critical |
| 一句话概括 | 🔴 Critical |

### 虚词堆砌（P1）

过多的连接词和转折词，让文章显得空洞：

| 词汇 | 风险 |
|------|------|
| 其实 | 🟠 High |
| 而且 | 🟠 High |
| 但是 | 🟠 High |
| 实际上 | 🟠 High |

### 结尾套话（P2）

机械的互动引导，降低专业感：

| 词汇 | 风险 |
|------|------|
| 最后说一句 | 🔴 Critical |
| 有什么看法 | 🟠 High |
| 觉得有用点个赞 | 🟠 High |
| 评论区聊聊 | 🟠 High |

### 英文 AI 词汇（P1）

英文文案中的典型 AI 用词：

| 类别 | 示例 |
|------|------|
| 重要性夸大词 | pivotal, crucial, vital, significant, profound |
| AI 分析动词 | delve, embark, leverage, utilize, facilitate, foster |
| 诗意名词 | tapestry, landscape, realm, paradigm, nexus |
| 推销形容词 | vibrant, comprehensive, robust, seamless, innovative |
| 夸大副词 | seamlessly, meticulously, profoundly, remarkably |
| 开头套话 | "In today's world", "In conclusion", "Overall" |
| 虚假真诚 | "Here's the truth", "Let me be clear", "But honestly?" |
| 公式化模式 | "It's not just X, it's Y", "Not only X, but also Y" |

### 结构模式（P1）

跨语言的 AI 写作结构：

| 模式 | 示例 |
|------|------|
| 二元对立 | Not a tool. A platform. |
| 戏剧化断句 | Speed. That's it. That's the tradeoff. |
| 自问自答 | The result? Devastating. |
| 三列滥用 | fast, reliable, scalable |
| 分形总结 | In this section, we'll explore... |
| 被动语态 | The bug was fixed by the team. |
| 分词附加语 | ..., highlighting its importance |

### 格式模式（P2）

视觉上的 AI 痕迹：

| 模式 | 说明 |
|------|------|
| 粗体首词列表 | 每个列表项以粗体词开头 |
| Unicode 箭头 | → ← ↑ ↓ ⇒ ⇐ |
| 破折号滥用 | 使用 em dash (—) 或 en dash (–) |
| 句子长度一致 | 所有句子都在 15-25 词之间 |

## ✏️ 修改技巧

### 1. 开头套话 → 删

```diff
- 说句大实话，这个行业真的卷不动了。
+ 这几年行业变化确实很大。
```

去掉故作激烈的情绪词，用事实开头。

### 2. 车轱辘话 → 融

```diff
- 首先，要有目标。其次，要坚持。最后，要执行。
+ 关键是找准目标，然后持续行动。
```

把并列的点融合成流畅的句子，而不是列表式罗列。

### 3. 虚词堆砌 → 删

```diff
- 其实吧，我觉得这个问题呢，首先要搞清楚...
+ 这个问题的核心是...
```

删除冗余的过渡词，直接进入主题。

### 4. 短句 → 长句

```diff
- 两个字：坚持靠谱。
+ 成功的本质是持续的投入和积累。
```

把单词总结扩展为完整的句子表达。

### 5. 英文 AI 词汇 → 替换

```diff
- This is a robust solution that leverages cutting-edge technology.
+ This solution uses the latest technology and works reliably.
```

用简单直接的词替代 AI 高频词。

### 6. 结构模式 → 改写

```diff
- Not a tool. A platform.
+ This is a platform, not just a tool.
```

去掉戏剧化的对比，直接陈述。

## 📖 输出示例

```markdown
# AI 风检测 - 我的文章

> 检测时间：2024-01-15 10:30:00

---

## P0 问题（必须修改）

### 1. 开头套话 - "说句大实话"
位置：第 1 行

原文：
> 说句大实话，这个行业真的太难了。

问题：使用"说句大实话"故作神秘，属于典型的 AI 开头套路。

### Suggested fix
去掉套话，直接陈述：
> 近几年，行业竞争确实越来越激烈。

---

## P1 问题（建议修改）

### 2. 虚词堆砌 - "其实"
位置：第 3 行

原文：
> 其实我认为解决这个问题...

问题：过多的"其实"、"我认为"削弱了专业感。

### Suggested fix
直接陈述观点：
> 解决这个问题的关键是...

---

## 统计

| 维度 | 出现次数 |
|------|----------|
| 开头套话 | 2 |
| 车轱辘话 | 1 |
| 虚词堆砌 | 3 |
| 短句短语 | 1 |
| **总计** | 7 |
```

## 💡 使用场景

| 场景 | 说明 |
|------|------|
| 公众号审稿 | 检查文章是否 AI 写的 |
| 面试文案 | 确保简历不是 AI 写的 |
| 电商文案 | 去除套话，提升转化率 |
| 社媒运营 | 检测笔记是否有 AI 风 |
| 演讲稿 | 让内容更 human |
| 英文论文 | 去除 AI 词汇，提升学术感 |
| 英文博客 | 避免 AI 套路，增加个性 |
| 产品文案 | 去掉夸大词，用真实描述 |

## 📄 License

MIT License