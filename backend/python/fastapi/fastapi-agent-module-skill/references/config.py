# Agent 配置

from pydantic_settings import BaseSettings
from typing import Optional


class AgentSettings(BaseSettings):
    """Agent 配置"""

    # 模型配置
    AGENT_MODEL: str = "gpt-4o-mini"
    AGENT_TEMPERATURE: float = 0.7
    AGENT_MAX_TOKENS: int = 2048

    # 记忆配置
    AGENT_MEMORY_TURNS: int = 20

    # LLM 配置
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_BASE_URL: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None

    # 表前缀
    TABLE_PREFIX: str = "wg"

    class Config:
        env_file = ".env"
        extra = "allow"


# 全局配置
agent_settings = AgentSettings()
