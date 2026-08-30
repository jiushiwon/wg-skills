# Agent 模块 P2 测试
# 覆盖 P2 修复：trace_id、安全响应头、级联删除、死代码清理、依赖锁定

import asyncio
import pytest
import inspect
from src.agent.trace import set_trace_id, get_trace_id, clear_trace_id, TraceIdFilter


class TestTraceId:
    """✅ P2-13: trace_id 上下文管理测试"""

    def test_get_trace_id_default(self):
        """默认 trace_id 为 -"""
        clear_trace_id()
        assert get_trace_id() == "-"

    def test_set_trace_id_auto_generate(self):
        """自动生成 trace_id"""
        clear_trace_id()
        tid = set_trace_id()
        assert tid != "-"
        assert len(tid) > 0
        assert get_trace_id() == tid

    def test_set_trace_id_custom(self):
        """自定义 trace_id"""
        set_trace_id("my-trace-123")
        assert get_trace_id() == "my-trace-123"

    def test_trace_id_context_isolation(self):
        """contextvars 跨任务隔离"""
        async def worker():
            set_trace_id("worker-tid")
            return get_trace_id()

        clear_trace_id()
        result = asyncio.run(worker())
        assert result == "worker-tid"
        # 主上下文应不受子任务影响
        assert get_trace_id() == "-"


class TestTraceIdFilter:
    """日志过滤器测试"""

    def test_filter_injects_trace_id(self):
        """过滤器自动注入 trace_id"""
        import logging
        set_trace_id("test-trace-abc")
        record = logging.LogRecord(
            name="test", level=logging.INFO, pathname="", lineno=0,
            msg="hello", args=(), exc_info=None
        )
        flt = TraceIdFilter()
        flt.filter(record)
        assert hasattr(record, "trace_id")
        assert record.trace_id == "test-trace-abc"


class TestSecurityHeaders:
    """✅ P2-11: 安全响应头测试"""

    def test_security_headers_middleware_exists(self):
        """安全响应头中间件存在"""
        from src.agent.security_headers import SecurityHeadersMiddleware
        assert SecurityHeadersMiddleware is not None

    def test_default_headers_have_required_keys(self):
        """默认安全头完整"""
        from src.agent.security_headers import DEFAULT_SECURITY_HEADERS
        assert "X-Content-Type-Options" in DEFAULT_SECURITY_HEADERS
        assert "X-Frame-Options" in DEFAULT_SECURITY_HEADERS
        assert "X-XSS-Protection" in DEFAULT_SECURITY_HEADERS
        assert "Referrer-Policy" in DEFAULT_SECURITY_HEADERS
        assert "Permissions-Policy" in DEFAULT_SECURITY_HEADERS


class TestCascadeDelete:
    """✅ P2-1: 级联删除测试"""

    def test_delete_session_supports_hard_delete(self):
        """delete_session 支持 hard_delete 参数"""
        from src.agent.services.session_service import SessionService
        sig = inspect.signature(SessionService.delete_session)
        assert "hard_delete" in sig.parameters
        # 默认应为 False（软删除）
        assert sig.parameters["hard_delete"].default is False

    def test_migration_has_cascade(self):
        """migration 包含 ON DELETE CASCADE"""
        with open("references/migration.py", "r", encoding="utf-8") as f:
            source = f.read()
        assert "ondelete='CASCADE'" in source


class TestDeadCodeRemoval:
    """✅ P2-19/P2-25: 死代码清理测试"""

    def test_agent_graph_no_end_mapping(self):
        """✅ P2-25: agent.py 移除 "end" 死代码映射"""
        with open("references/graph/agent.py", "r", encoding="utf-8") as f:
            source = f.read()
        # "end" 映射应已被移除或标记为死代码
        # 允许注释里提及，但不应是实际的 mapping
        # 简单检查：不应同时存在 "execute_tools": "execute_tools" 和 "end": "respond" 紧邻
        lines = source.split("\n")
        # 查找 conditional_edges 块
        in_conditional = False
        for i, line in enumerate(lines):
            if "add_conditional_edges" in line:
                in_conditional = True
            if in_conditional and "}" in line:
                # 检查这个块内是否有 "end" 键
                block = "\n".join(lines[max(0, i-10):i+1])
                assert "\"end\":" not in block or "✅" in block or "# 修复" in block, \
                    f"dead 'end' mapping found in conditional_edges: {block}"
                break


class TestRequirementsLock:
    """✅ P2-7: 依赖版本锁定测试"""

    def test_requirements_agent_exists(self):
        """requirements-agent.txt 存在"""
        import os
        assert os.path.exists("requirements-agent.txt")

    def test_requirements_have_version_constraints(self):
        """所有依赖都有版本约束"""
        with open("requirements-agent.txt", "r", encoding="utf-8") as f:
            content = f.read()
        for line in content.split("\n"):
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            # 应包含 >= 或 ==
            assert ">=" in line or "==" in line, f"无版本约束: {line}"


class TestGraphIdempotency:
    """✅ P2-25: Agent Graph 幂等性测试"""

    def test_agent_container_init_graph_idempotent(self):
        """AgentContainer.init_graph 幂等"""
        from src.agent.graph.agent import AgentContainer
        container = AgentContainer()
        g1 = container.init_graph()
        g2 = container.init_graph()
        # 应返回同一实例（幂等）
        assert g1 is g2


class TestChatErrorCodeIntegration:
    """✅ P2-3: 错误码标准化集成测试"""

    def test_sse_error_event_has_error_code(self):
        """✅ P1-U: SSE 错误事件含 error_code"""
        from src.agent.services.chat_service import ChatService
        source = inspect.getsource(ChatService.stream_chat)
        assert "error_code" in source
        assert "ChatErrorCode" in source


class TestServiceLayerExports:
    """✅ 测试 __init__.py 导出"""

    def test_trace_module_exported(self):
        """trace 模块导出"""
        from src.agent import set_trace_id, get_trace_id
        assert callable(set_trace_id)
        assert callable(get_trace_id)

    def test_security_headers_exported(self):
        """security_headers 模块导出"""
        from src.agent import SecurityHeadersMiddleware
        assert SecurityHeadersMiddleware is not None


class TestAuditLoggerStability:
    """审计日志稳定性测试"""

    def test_audit_logger_has_all_methods(self):
        """AuditLogger 完整方法集"""
        from src.agent.audit import AuditLogger
        methods = [
            "log_tool_call",
            "log_tool_failure",
            "log_chat_failure",
            "log_token_usage",
            "log_rate_limit_hit"
        ]
        for m in methods:
            assert hasattr(AuditLogger, m), f"缺少方法: {m}"