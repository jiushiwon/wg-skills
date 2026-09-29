# OpenAI LLM 实现
# ✅ 修复 P0-P6: tenacity 指数退避重试 + RateLimitError/Timeout 处理

import asyncio
import json
from typing import List, Dict, Any, AsyncGenerator
from openai import AsyncOpenAI, RateLimitError, APITimeoutError, APIConnectionError
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from src.agent.llm.base import LLMBase, Message, LLMResponse, ToolCall


class OpenAILLM(LLMBase):
    """OpenAI LLM"""

    def __init__(
        self,
        model: str = "gpt-4o-mini",
        api_key: str = None,
        base_url: str = None,
        temperature: float = 0.7,
        max_tokens: int = 2048,
        timeout: float = 60.0  # 默认 60 秒超时
    ):
        self.model = model
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.timeout = timeout
        self.client = AsyncOpenAI(
            api_key=api_key,
            base_url=base_url,
            timeout=timeout
        )

    # ✅ 修复 P0-P6: tenacity 重试（仅限可重试异常）
    @retry(
        retry=retry_if_exception_type((RateLimitError, APITimeoutError, APIConnectionError, asyncio.TimeoutError)),
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True
    )
    async def chat(
        self,
        messages: List[Message],
        tools: List[Dict] = None,
        **kwargs
    ) -> LLMResponse:
        """同步对话（带重试）"""
        msg_list = [m.to_dict() for m in messages]

        request_params = {
            "model": self.model,
            "messages": msg_list,
            "temperature": kwargs.get("temperature", self.temperature),
            "max_tokens": kwargs.get("max_tokens", self.max_tokens)
        }

        if tools:
            request_params["tools"] = tools

        response = await self.client.chat.completions.create(**request_params)
        msg = response.choices[0].message

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

    @retry(
        retry=retry_if_exception_type((RateLimitError, APITimeoutError, APIConnectionError, asyncio.TimeoutError)),
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True
    )
    async def stream_chat(
        self,
        messages: List[Message],
        tools: List[Dict] = None,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        """流式对话（带重试）"""
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
            # ✅ 只 yield 文本内容，Tool 调用由 chat 接口处理
            if delta.content:
                yield delta.content
            # 注意：流式模式下的 Tool 调用通常由 chat() 完整接口处理，
            # 流式接口仅返回文本内容，避免魔术字符串污染 SSE 流

    async def get_embedding(self, text: str) -> List[float]:
        """获取嵌入"""
        response = await self.client.embeddings.create(
            model="text-embedding-3-small",
            input=text
        )
        return response.data[0].embedding