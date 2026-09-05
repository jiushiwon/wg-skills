"""
AI 客户端
支持多种 AI 提供商：Kimi、DeepSeek、MiniMax
"""
import os
import requests
from typing import Optional


class AIClient:
    """AI 客户端"""

    def __init__(self, provider: str = None):
        self.provider = provider or os.getenv("AI_PROVIDER", "kimi")

    def generate(self, prompt: str, model: str = None) -> str:
        """生成内容"""
        if self.provider == "kimi":
            return self._call_kimi(prompt, model)
        elif self.provider == "deepseek":
            return self._call_deepseek(prompt, model)
        elif self.provider == "minimax":
            return self._call_minimax(prompt, model)
        else:
            # 默认使用降级方案
            return self._fallback(prompt)

    def _call_kimi(self, prompt: str, model: str = None) -> str:
        """调用 Kimi API"""
        api_key = os.getenv("KIMI_API_KEY")
        if not api_key:
            return self._fallback(prompt)

        model = model or "moonshot-v1-8k-vision-preview"

        url = "https://api.moonshot.cn/v1/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
        data = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.8
        }

        try:
            response = requests.post(url, headers=headers, json=data, timeout=60)
            if response.status_code == 200:
                result = response.json()
                return result["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"Kimi API 调用失败: {e}")

        return self._fallback(prompt)

    def _call_deepseek(self, prompt: str, model: str = None) -> str:
        """调用 DeepSeek API"""
        api_key = os.getenv("DEEPSEEK_API_KEY")
        if not api_key:
            return self._fallback(prompt)

        model = model or "deepseek-chat"

        url = "https://api.deepseek.com/v1/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
        data = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.8
        }

        try:
            response = requests.post(url, headers=headers, json=data, timeout=60)
            if response.status_code == 200:
                result = response.json()
                return result["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"DeepSeek API 调用失败: {e}")

        return self._fallback(prompt)

    def _call_minimax(self, prompt: str, model: str = None) -> str:
        """调用 MiniMax API"""
        api_key = os.getenv("MINIMAX_API_KEY")
        if not api_key:
            return self._fallback(prompt)

        model = model or "abab6.5s-chat"

        url = "https://api.minimax.chat/v1/text/chatcompletion_pro"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
        data = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}]
        }

        try:
            response = requests.post(url, headers=headers, json=data, timeout=60)
            if response.status_code == 200:
                result = response.json()
                return result["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"MiniMax API 调用失败: {e}")

        return self._fallback(prompt)

    def _fallback(self, prompt: str) -> str:
        """降级方案：返回提示信息"""
        return f"""# 示例内容

根据您的主题「测试主题」，这是一篇示例文章。

由于 AI API 未配置或调用失败，以下是文章结构示例：

## 开篇
引入主题，说明背景

## 主体
详细展开论述

## 结尾
总结观点，引导互动

---

请配置 AI API Key 后重新生成。

支持的配置方式：
- KIMI_API_KEY
- DEEPSEEK_API_KEY
- MINIMAX_API_KEY
"""


if __name__ == "__main__":
    # 测试
    client = AIClient()
    result = client.generate("写一篇关于AI的文章")
    print(result)
