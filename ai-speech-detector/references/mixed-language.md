# 中英混合文本检测规则

本文档定义中英混合文案中的 AI 风味特征。

---

## 一、英文词汇中式用法

中文句子中插入英文单词，且用法生硬：

| 模式 | 风险等级 | 示例 | 自然表达 |
|------|----------|------|----------|
| "很 + 英文形容词" | 🟠 High | 这个 feature 真的很 robust | 这个功能很稳定 |
| "是 + 英文形容词 + 的" | 🟠 High | 这个方案是 feasible 的 | 这个方案可行 |
| "把...一下" | 🟠 High | 把代码 review 一下 |  review 一下代码 |
| "做...一下" | 🟠 High | 做个 double check | 再检查一遍 |
| "搞...一下" | 🟡 Medium | 把方案 align 一下 | 对齐一下方案 |

---

## 二、中英套话混合

将英文 AI 套话直译为中文，或中英夹杂：

| 模式 | 风险等级 | 示例 | 自然表达 |
|------|----------|------|----------|
| "Dive into" | 🔴 Critical | 让我们 dive into 这个话题 | 让我们深入这个话题 |
| "Delve into" | 🔴 Critical | 需要 delve into 细节 | 需要深入细节 |
| "Align" | 🟠 High | 先 align 一下 | 先对齐一下 |
| "Sync" | 🟠 High | sync 一下进度 | 同步一下进度 |
| "Review" | 🟡 Medium | review 一下方案 | 看看方案 |
| "Follow up" | 🟠 High | 需要 follow up | 需要跟进 |
| "Double check" | 🟡 Medium | double check 一下 | 再检查一遍 |
| "Deep dive" | 🔴 Critical | 做个 deep dive | 深入分析 |
| "Takeaway" | 🟠 High | 有几个 takeaway | 有几个收获 |
| "Action item" | 🟠 High | 有几个 action item | 有几项任务 |
| "Bottom line" | 🟠 High | bottom line 是 | 底线是 / 关键是 |
| "Game changer" | 🔴 Critical | 这是个 game changer | 这改变了一切 |
| "Low hanging fruit" | 🟠 High | 先摘 low hanging fruit | 先做简单的 |
| "Moving forward" | 🟠 High | moving forward 我们要 | 接下来我们要 |
| "Circle back" | 🟠 High | 稍后 circle back | 稍后回来讨论 |

---

## 三、强行翻译腔

英文句式直译为中文，语法生硬：

| 模式 | 风险等级 | 示例 | 自然表达 |
|------|----------|------|----------|
| "值得一提的是" | 🟠 High | It's worth noting that | 值得注意的是 |
| "正如前面提到的" | 🟡 Medium | As mentioned earlier | 前面说过 |
| "也就是说" | 🟡 Medium | That is to say | 也就是说 |
| "更具体地说" | 🟡 Medium | More specifically | 具体来说 |
| "换句话说" | 🟡 Medium | In other words | 换句话说 |
| "从...的角度来看" | 🟡 Medium | From the perspective of | 从...角度看 |
| "在...的背景下" | 🟠 High | In the context of | 在...背景下 |
| "基于...的考虑" | 🟡 Medium | Based on the consideration of | 考虑到... |
| "就...而言" | 🟡 Medium | In terms of | 就...来说 |
| "鉴于..." | 🟡 Medium | Given that | 考虑到... |

---

## 四、中英标点混用

| 模式 | 风险等级 | 示例 |
|------|----------|------|
| 中文句子用英文逗号 | 🟡 Medium | 你好, 世界 |
| 英文单词前后用中文标点 | 🟡 Medium | 这个feature，真的robust。 |
| 中英文括号混用 | 🟡 Medium | （test）/ (测试) |
| 中英文引号混用 | 🟡 Medium | "hello" / 「hello」 |

---

## 五、检测规则

### Grep 检查命令

```bash
# 检测中英夹杂的 AI 词汇
Grep "(align|sync|review|follow up|deep dive|takeaway|action item|bottom line|game changer|moving forward|circle back)" --output_mode content

# 检测强行翻译腔
Grep "(值得一提的是|正如前面提到的|更具体地说|在...的背景下)" --output_mode content

# 检测英文形容词中式用法
Grep "(很|是)\s+[a-zA-Z]+" --output_mode content
```

### 评分标准

| 命中数 | 等级 |
|--------|------|
| 0-2 | 🟢 自然 |
| 3-5 | 🟡 轻度 |
| 6-10 | 🟠 中度 |
| 10+ | 🔴 重度 |
