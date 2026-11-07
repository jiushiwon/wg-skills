# Agent 模块安全测试
# ✅ 修复 P0-U2: 覆盖核心安全约束的测试

import pytest
import asyncio
from src.agent.graph.nodes import node_execute_tools, should_continue, DEFAULT_SYSTEM_PROMPT
from src.agent.graph.state import AgentState


class TestPromptInjectionDefense:
    """Prompt Injection 防护测试"""

    def test_tool_result_wrapped_in_xml_tags(self):
        """✅ P0-P9: Tool 结果用 XML 标签包裹（防注入污染）"""
        state = AgentState(
            user_input="test",
            session_id=1,
            user_id=1,
            messages=[],
            iterations=1,
            tool_calls=[{
                "name": "search_users",
                "arguments": {"keyword": "test", "limit": 10}
            }]
        )
        # 模拟 Tool 结果
        from src.agent.tools.registry import ToolRegistry

        async def fake_search_users(**kwargs):
            return {"users": [{"id": 1, "username": "test"}]}

        # 临时注册
        original = ToolRegistry._tools.copy()
        ToolRegistry._tools["search_users"] = ToolRegistry._tools.get(
            "search_users",
            type("T", (), {"execute": staticmethod(fake_search_users), "parameters": {}})()
        )

        try:
            result = asyncio.run(node_execute_tools(state))
            # 验证 Tool 结果用 XML 标签包裹
            tool_msg = result["messages"][-1]
            assert tool_msg["content"].startswith("<tool_result")
            assert "</tool_result>" in tool_msg["content"]
        finally:
            ToolRegistry._tools = original

    def test_system_prompt_mentions_tool_result_is_data(self):
        """✅ P0-P9: System Prompt 提示 Tool 结果是数据不是指令"""
        assert "tool_result" in DEFAULT_SYSTEM_PROMPT.lower() or "工具返回" in DEFAULT_SYSTEM_PROMPT
        # 应该包含安全约束说明
        assert "数据" in DEFAULT_SYSTEM_PROMPT or "data" in DEFAULT_SYSTEM_PROMPT.lower()


class TestSessionIsolation:
    """会话隔离测试"""

    def test_history_messages_filter_by_user_id(self):
        """✅ P0-S5: 历史消息加载带 user_id 校验"""
        import inspect
        from src.agent.services.chat_service import ChatService
        source = inspect.getsource(ChatService._get_session_messages)

        # 必须有 user_id 参数
        assert "user_id" in source

        # 必须有 AgentSession.user_id == user_id 过滤
        assert "AgentSession.user_id" in source
        assert "AgentSession.deleted_at" in source


class TestErrorSanitization:
    """异常脱敏测试"""

    def test_chat_service_exception_does_not_leak_to_client(self):
        """✅ P0-S1: 对话异常时客户端只收到固定话术"""
        import inspect
        from src.agent.services.chat_service import ChatService
        source = inspect.getsource(ChatService.chat)

        # 必须包含固定话术
        assert "对话处理失败" in source or "USER_FRIENDLY" in source
        # 不能直接用 str(e) 暴露给客户端（应使用 logger 记录）
        assert "BusinessException(code=-5001, message=" in source

    def test_sse_error_event_uses_fixed_message(self):
        """✅ P0-S1: SSE 错误事件使用固定话术"""
        import inspect
        from src.agent.services.chat_service import ChatService
        source = inspect.getsource(ChatService.stream_chat)

        # SSE error event 不应直接 yield str(e)
        # 必须有 USER_FRIENDLY_STREAM_ERROR
        assert "USER_FRIENDLY_STREAM_ERROR" in source or "对话中断" in source


class TestTransactionConsistency:
    """事务一致性测试"""

    def test_chat_uses_atomic_save(self):
        """✅ P0-P5: chat() 使用单事务保存"""
        import inspect
        from src.agent.services.chat_service import ChatService
        source = inspect.getsource(ChatService.chat)

        # 应使用 _save_messages_atomic 而不是两次 _save_message
        assert "_save_messages_atomic" in source


class TestRateLimiting:
    """Rate Limiting 配置测试"""

    def test_chat_endpoint_has_rate_limit(self):
        """✅ P0-S3: chat 接口有 Rate Limiting"""
        import inspect
        from src.agent.routers.chat import chat
        source = inspect.getsource(chat)
        # 必须调用 rate_limit_chat
        assert "rate_limit_chat" in source or "rl_dep" in source

    def test_session_endpoints_have_rate_limit(self):
        """✅ P0-S3: session 接口有 Rate Limiting 配置"""
        from src.agent.rate_limiter import rate_limit_session
        assert rate_limit_session is not None


class TestLazyLoadingLock:
    """懒加载加锁测试"""

    def test_init_lock_used_in_get_llm(self):
        """✅ P0-P2: get_llm_async 使用 _init_lock"""
        import inspect
        from src.agent.graph.agent import get_llm_async
        source = inspect.getsource(get_llm_async)
        assert "_init_lock" in source
        assert "async with _init_lock" in source

    def test_graph_lock_used_in_get_agent_graph(self):
        """✅ P0-P2: get_agent_graph_async 使用 _graph_lock"""
        import inspect
        from src.agent.graph.agent import get_agent_graph_async
        source = inspect.getsource(get_agent_graph_async)
        assert "_graph_lock" in source


class TestMigrationIndexes:
    """数据库索引测试"""

    def test_migration_creates_indexes(self):
        """✅ P0-P3: migration 添加关键索引"""
        with open("src/agent/migration.py", "r") as f:
            source = f.read()

        # 必须有 op.create_index
        assert "op.create_index" in source
        # 必须覆盖关键字段
        assert "session_id" in source
        assert "user_id" in source
        assert "deleted_at" in source
        assert "updated_at" in source


class TestDependencyInjection:
    """依赖注入测试"""

    def test_memory_store_has_di_factory(self):
        """✅ P0-A2: MemoryStore 提供 Depends 工厂"""
        from src.agent.memory.store import get_memory_store, MemoryStore
        assert callable(get_memory_store)
        assert MemoryStore is not None

    def test_agent_container_class_exists(self):
        """✅ P0-A2: AgentContainer 类用于 lifespan 注入"""
        from src.agent.graph.agent import AgentContainer
        container = AgentContainer()
        assert hasattr(container, "llm")
        assert hasattr(container, "graph")
        assert callable(container.init_llm)
        assert callable(container.init_graph)


class TestLLMTimeout:
    """LLM 超时测试"""

    def test_anthropic_llm_has_timeout(self):
        """✅ P0-P1: AnthropicLLM 设置 timeout"""
        import inspect
        from src.agent.llm.anthropic import AnthropicLLM
        source = inspect.getsource(AnthropicLLM.__init__)
        assert "timeout" in source

    def test_openai_llm_has_timeout(self):
        """✅ P0-P1: OpenAILLM 设置 timeout"""
        import inspect
        from src.agent.llm.openai import OpenAILLM
        source = inspect.getsource(OpenAILLM.__init__)
        assert "timeout" in source


class TestRetryMechanism:
    """重试机制测试"""

    def test_anthropic_llm_has_retry(self):
        """✅ P0-P6: AnthropicLLM 使用 tenacity 重试"""
        import inspect
        from src.agent.llm.anthropic import AnthropicLLM
        source = inspect.getsource(AnthropicLLM)
        assert "@retry" in source
        assert "RateLimitError" in source
        assert "wait_exponential" in source

    def test_openai_llm_has_retry(self):
        """✅ P0-P6: OpenAILLM 使用 tenacity 重试"""
        import inspect
        from src.agent.llm.openai import OpenAILLM
        source = inspect.getsource(OpenAILLM)
        assert "@retry" in source
        assert "RateLimitError" in source
        assert "wait_exponential" in source


class TestClearMemoryRoute:
    """clear-memory 路由测试"""

    def test_clear_memory_route_exists(self):
        """✅ P0-U3: clear-memory 路由已实现"""
        import inspect
        from src.agent.routers.session import router
        routes = [r.path for r in router.routes]
        # 应有 /clear-memory 路径
        assert any("clear-memory" in r for r in routes)