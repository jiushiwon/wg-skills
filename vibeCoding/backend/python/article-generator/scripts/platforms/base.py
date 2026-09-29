"""
平台适配器基类
"""
from abc import ABC, abstractmethod
from typing import Optional


class PlatformAdapter(ABC):
    """平台适配器基类"""

    name: str = "base"
    display_name: str = "基础平台"

    @abstractmethod
    def generate_prompt(self, topic: str, style: str = "default", length: str = "medium") -> str:
        """生成提示词"""
        pass

    @abstractmethod
    def format_output(self, content: str) -> str:
        """格式化输出"""
        pass

    def get_length_words(self, length: str) -> tuple:
        """获取字数范围"""
        lengths = {
            "short": (300, 500),
            "medium": (500, 1000),
            "long": (1000, 2000),
        }
        return lengths.get(length, (500, 1000))

    def get_style_description(self, style: str) -> str:
        """获取风格描述"""
        return ""
