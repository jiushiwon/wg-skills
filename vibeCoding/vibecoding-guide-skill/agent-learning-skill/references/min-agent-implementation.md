# 最小 Agent 实现

一句话：100 行代码实现一个可用的 Agent。

## 核心循环

```python
def agent(prompt, tools):
    messages = [{"role": "user", "content": prompt}]

    while True:
        response = llm.chat(messages)

        if response.tool_calls:
            for call in response.tool_calls:
                result = tools[call.name](call.args)
                messages.append({
                    "role": "tool",
                    "content": result,
                    "tool_call_id": call.id
                })
        else:
            return response.content
```

## ReAct 模式

```python
def react_agent(prompt):
    thought = prompt
    while True:
        action = llm.chat(f"{thought}\n思考下一步行动")
        if action.type == "finish":
            return action.result
        observation = execute_tool(action)
        thought += f"\n行动: {action}\n观察: {observation}"
```

## 必备工具

- 搜索工具（SerpAPI、DuckDuckGo）
- 代码执行工具（Python REPL）
- 文件读取工具

## 扩展方向

- 添加 Memory（对话历史）
- 添加 Planning（任务拆解）
- 添加多 Agent 协作
