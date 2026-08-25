# OpenAI LLM 实现

import json
from typing import List, Dict, Any, AsyncGenerator
from openai import AsyncOpenAI
from src.agent.llm.base import LLMBase, Message, LLMResponse, ToolCall


class OpenAILLM(LLMBase):
    """OpenAI LLM"""

    def __init__(
        self,
        model: str = "gpt-4o-mini",
        api_key: str = None,
        base_url: str = None,
        temperature: float = 0.7,
        max_tokens: int = 2048
    ):
        self.model = model
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.client = AsyncOpenAI(
            api_key=api_key,
            base_url=base_url
        )

    async def chat(
        self,
        messages: List[Message],
        tools: List[Dict] = None,
        **kwargs
    ) -> LLMResponse:
        """同步对话"""
        # 构建消息
        msg_list = [m.to_dict() for m in messages]

        # 构建请求
        request_params = {
            "model": self.model,
            "messages": msg_list,
            "temperature": kwargs.get("temperature", self.temperature),
            "max_tokens": kwargs.get("max_tokens", self.max_tokens)
        }

        if tools:
            request_params["tools"] = tools

        # 调用 API
        response = await self.client.chat.completions.create(**request_params)
        msg = response.choices[0].message

        # 解析 Tool Calls
        tool_calls = []
        if msg.tool_calls:
            for tc in msg.tool_calls:
                try:
                    arguments = json.loads(tc.function.arguments)
                except (json.JSONDecodeError, TypeError):
                    arguments = {}
                tool_calls.append(ToolCall(
                    name=tc.function.name,
                    arguments=arguments
                ))

        return LLMResponse(
            content=msg.content or "",
            tool_calls=tool_calls,
            finish_reason=response.choices[0].finish_reason
        )

    async def stream_chat(
        self,
        messages: List[Message],
        tools: List[Dict] = None,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        """流式对话"""
        msg_list = [m.to_dict() for m in messages]

        request_params = {
            "model": self.model,
            "messages": msg_list,
            "temperature": kwargs.get("temperature", self.temperature),
            "max_tokens": kwargs.get("max_tokens", self.max_tokens),
            "stream": True
        }

        if tools:
            request_params["tools"] = tools

        response = await self.client.chat.completions.create(**request_params)

        async for chunk in response:
            delta = chunk.choices[0].delta
            if delta.content:
                yield delta.content
            if delta.tool_calls:
                for tc in delta.tool_calls:
                    yield f"[TOOL_CALL]{tc.function.name}|{tc.function.arguments}"

    async def get_embedding(self, text: str) -> List[float]:
        """获取嵌入"""
        response = await self.client.embeddings.create(
            model="text-embedding-3-small",
            input=text
        )
        return response.data[0].embedding
