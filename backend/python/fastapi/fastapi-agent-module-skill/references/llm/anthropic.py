# Anthropic Claude LLM 实现

from typing import List, Dict, Any, AsyncGenerator
from anthropic import AsyncAnthropic
from src.agent.llm.base import LLMBase, Message, LLMResponse, ToolCall


class AnthropicLLM(LLMBase):
    """Anthropic Claude LLM"""

    def __init__(
        self,
        model: str = "claude-3-haiku-20240307",
        api_key: str = None,
        temperature: float = 0.7,
        max_tokens: int = 2048
    ):
        self.model = model
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.client = AsyncAnthropic(api_key=api_key)

    async def chat(
        self,
        messages: List[Message],
        tools: List[Dict] = None,
        **kwargs
    ) -> LLMResponse:
        """同步对话"""
        # Anthropic 消息格式转换
        msg_list = []
        system_prompt = ""

        for m in messages:
            if m.role == "system":
                system_prompt = m.content
            else:
                msg_list.append({"role": m.role, "content": m.content})

        # 构建请求
        request_params = {
            "model": self.model,
            "messages": msg_list,
            "temperature": kwargs.get("temperature", self.temperature),
            "max_tokens": kwargs.get("max_tokens", self.max_tokens)
        }

        if system_prompt:
            request_params["system"] = system_prompt

        # Anthropic tools 格式不同，需要转换
        if tools:
            request_params["tools"] = self._convert_tools(tools)

        response = await self.client.messages.create(**request_params)

        # 解析响应
        tool_calls = []
        content = ""

        for block in response.content:
            if block.type == "text":
                content += block.text
            elif block.type == "tool_use":
                tool_calls.append(ToolCall(
                    name=block.name,
                    arguments=block.input
                ))

        return LLMResponse(
            content=content,
            tool_calls=tool_calls,
            finish_reason=response.stop_reason
        )

    async def stream_chat(
        self,
        messages: List[Message],
        tools: List[Dict] = None,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        """流式对话"""
        msg_list = []
        system_prompt = ""

        for m in messages:
            if m.role == "system":
                system_prompt = m.content
            else:
                msg_list.append({"role": m.role, "content": m.content})

        request_params = {
            "model": self.model,
            "messages": msg_list,
            "temperature": kwargs.get("temperature", self.temperature),
            "max_tokens": kwargs.get("max_tokens", self.max_tokens),
            "stream": True
        }

        if system_prompt:
            request_params["system"] = system_prompt

        if tools:
            request_params["tools"] = self._convert_tools(tools)

        async with self.client.messages.stream(**request_params) as stream:
            async for chunk in stream:
                if chunk.type == "content_block_delta":
                    if chunk.delta.type == "text_delta":
                        yield chunk.delta.text
                    elif chunk.delta.type == "input_json_delta":
                        yield f"[TOOL_ARG]{chunk.delta.partial_json}"

    def _convert_tools(self, tools: List[Dict]) -> List[Dict]:
        """转换 tools 格式为 Anthropic 格式"""
        converted = []
        for t in tools:
            converted.append({
                "name": t.get("name"),
                "description": t.get("description"),
                "input_schema": t.get("parameters", {"type": "object", "properties": {}})
            })
        return converted

    async def get_embedding(self, text: str) -> List[float]:
        """Claude 不直接支持嵌入，使用 TextLoader"""
        raise NotImplementedError("Anthropic 不支持直接获取嵌入")
