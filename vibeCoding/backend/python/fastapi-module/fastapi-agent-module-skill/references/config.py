# Agent 配置 - 扩展骨架 Settings
#
# 本文件不单独定义配置，而是说明如何在骨架的 app/config.py 中扩展 Agent 配置。
# 使用时请将以下字段添加到骨架的 Settings 类中。

"""
# === 在 app/config.py 的 Settings 类中添加以下字段 ===

# Agent 模块配置
agent_model: str = "gpt-4o-mini"
agent_temperature: float = 0.7
agent_max_tokens: int = 2048
agent_memory_turns: int = 20

# LLM API 配置
openai_api_key: str | None = None
openai_base_url: str | None = None
anthropic_api_key: str | None = None

# === 在 .env.example 中添加以下配置 ===

# Agent 模块配置
AGENT_MODEL=gpt-4o-mini
AGENT_TEMPERATURE=0.7
AGENT_MAX_TOKENS=2048
AGENT_MEMORY_TURNS=20

# OpenAI（可选）
OPENAI_API_KEY=your-key-here
OPENAI_BASE_URL=

# Anthropic（可选）
ANTHROPIC_API_KEY=
"""

# 使用示例：
# from app.config import settings
# model = settings.agent_model
# api_key = settings.openai_api_key
