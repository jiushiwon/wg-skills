# humanizer

> 去除 AI 写作味道，让文字读起来像人写的，不改变原意。基于维基百科「AI 写作迹象」项目的 35 个模式。

## 快速上手

```
/humanizer
[粘贴文本]
```

或自然语言：

```
帮我去除这段文字的 AI 味道：[粘贴文本]
去掉 docs/launch-post.md 的 AI 味道
```

想匹配自己的风格，附 2-3 段你自己的样本即可。

## 核心原则

保留所有事实、不编造细节、匹配作者风格、允许不完美（保留人的痕迹）。

## 与 ai-speech-detector 的配合

先用 `ai-speech-detector` 检测评分，再用 `humanizer` 逐项改写。

## 详细规范 → [SKILL.md](SKILL.md)
