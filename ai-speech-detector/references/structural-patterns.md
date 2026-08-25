# 结构模式检测规则

本文档定义 AI 文案的结构模式检测规则。

---

## 一、Binary Contrasts（二元对立）

### 检测模式

| 模式 | 风险等级 | 示例 |
|------|----------|------|
| "Not X. Y." | 🔴 Critical | Not a trend. A revolution. |
| "Not X, it's Y" | 🔴 Critical | It's not a bug, it's a feature. |
| "No X. No Y. Just Z." | 🔴 Critical | No fluff. No filler. Just facts. |

### 修改建议

直接陈述 Y，不要对比。

```diff
- Not a tool. A platform.
+ This is a platform, not just a tool.
```

---

## 二、Negative Listings（否定列举）

### 检测模式

| 模式 | 风险等级 | 示例 |
|------|----------|------|
| "Not a X. Not a Y. A Z." | 🔴 Critical | Not a bank. Not a wallet. A movement. |

### 修改建议

去掉否定，直接陈述。

```diff
- Not a tool. Not a platform. A revolution.
+ This changes how we think about the entire industry.
```

---

## 三、Dramatic Fragmentation（戏剧化断句）

### 检测模式

| 模式 | 风险等级 | 示例 |
|------|----------|------|
| 单字/短词断句 | 🔴 Critical | Speed. That's it. That's the tradeoff. |
| 三个短句堆叠 | 🔴 Critical | Simple. Fast. Reliable. |

### 修改建议

合并为完整句子。

```diff
- Speed. That's it. That's the tradeoff.
+ The tradeoff is speed.
```

---

## 四、Self-Posed Rhetorical Questions（自问自答）

### 检测模式

| 模式 | 风险等级 | 示例 |
|------|----------|------|
| "The result? X." | 🔴 Critical | The result? Devastating. |
| "The answer? X." | 🔴 Critical | The answer? Simple. |
| "What happened? X." | 🔴 Critical | What happened? Everything changed. |

### 修改建议

改为陈述句。

```diff
- The result? Devastating.
+ The results were devastating.
```

---

## 五、Anaphora/Tricolon Abuse（首语重复/三列滥用）

### 检测模式

| 模式 | 风险等级 | 示例 |
|------|----------|------|
| 连续三句同开头 | 🟠 High | It is... It is... It is... |
| 连续三个例子 | 🟠 High | First... Second... Third... |
| 连续三个形容词 | 🟠 High | fast, reliable, scalable |

### 修改建议

打破三列模式，用两或四个。

```diff
- It is fast. It is reliable. It is scalable.
+ It's fast and reliable. It also scales well.
```

---

## 六、Listicles Disguised as Prose（伪装成散文的列表）

### 检测模式

| 模式 | 风险等级 | 示例 |
|------|----------|------|
| "The first X... The second X..." | 🟠 High | The first challenge is... The second challenge is... |
| 编号段落 | 🟠 High | 1. ... 2. ... 3. ... |

### 修改建议

改为流畅的论述。

---

## 七、Fractal Summaries（分形总结）

### 检测模式

| 模式 | 风险等级 | 示例 |
|------|----------|------|
| 先说将要说什么 | 🔴 Critical | In this section, we'll explore... |
| 说完再总结 | 🔴 Critical | To summarize what we've discussed... |
| 中间插入预告 | 🟠 High | As we'll see later... |

### 修改建议

删除预告和总结，直接说内容。

---

## 八、Passive Voice Overuse（被动语态滥用）

### 检测模式

| 模式 | 风险等级 |
|------|----------|
| 连续三句被动语态 | 🟠 High |
| 无明确主语的被动 | 🟠 High |

### 修改建议

找到动作发出者，改为主动语态。

```diff
- The bug was fixed by the team.
+ The team fixed the bug.
```

---

## 九、Sentence Length Uniformity（句子长度一致）

### 检测模式

| 模式 | 风险等级 |
|------|----------|
| 连续三句长度相同（±3词） | 🔴 Critical |
| 所有句子都在 15-25 词之间 | 🔴 Critical |

### 修改建议

刻意变化句子长度，短到 3-5 词，长到 35+ 词。

---

## 十、Em Dash Overuse（破折号滥用）

### 检测模式

| 模式 | 风险等级 |
|------|----------|
| 使用 em dash (—) | 🔴 Critical |
| 使用 en dash (–) | 🔴 Critical |
| 每段都有破折号 | 🔴 Critical |

### 修改建议

用逗号、句号或括号替代。

---

## 十一、Bold-First Bullets（粗体首词列表）

### 检测模式

| 模式 | 风险等级 |
|------|----------|
| 每个列表项以粗体词开头 | 🔴 Critical |

### 修改建议

去掉粗体，或改为自然句子。

---

## 十二、Unicode Arrows（Unicode 箭头）

### 检测模式

| 模式 | 风险等级 |
|------|----------|
| → ← ↑ ↓ | 🟠 High |
| ⇒ ⇐ ⇔ | 🟠 High |

### 修改建议

用文字替代箭头。

---

## 十三、Participial Tack-Ons（分词附加语）

### 检测模式

| 模式 | 风险等级 | 示例 |
|------|----------|------|
| ", highlighting..." | 🔴 Critical | ..., highlighting its importance |
| ", underscoring..." | 🔴 Critical | ..., underscoring the significance |
| ", reflecting..." | 🔴 Critical | ..., reflecting broader trends |
| ", contributing to..." | 🔴 Critical | ..., contributing to the broader |
| ", showcasing..." | 🔴 Critical | ..., showcasing how... |
| ", ensuring..." | 🔴 Critical | ..., ensuring that... |

### 修改建议

改为独立句子或删除。

```diff
- The project was completed in 2024, highlighting the team's dedication.
+ The project was completed in 2024. The team's dedication made this possible.
```

---

## 十四、False Agency（虚假主体）

### 检测模式

| 模式 | 风险等级 | 示例 |
|------|----------|------|
| 无生命物体做主语 | 🟠 High | The complaint becomes a fix |
| 抽象概念做动作 | 🟠 High | Technology drives change |

### 修改建议

找到真正的人或组织做主语。

```diff
- The complaint becomes a fix.
+ The team turns complaints into fixes.
```