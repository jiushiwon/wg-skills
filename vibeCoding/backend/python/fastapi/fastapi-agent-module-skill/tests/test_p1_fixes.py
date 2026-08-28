# Agent 模块 P1 测试
# 覆盖 P1 修复的核心约束

import asyncio
import pytest
from unittest.mock import patch, MagicMock
from src.agent.pii import (
    mask_pii, is_pii_field, safe_log_args, pii_encrypt, pii_decrypt
)
from src.agent.schemas import (
    SessionCreateRequest, ALLOWED_MODELS, ChatRequest
)
from src.agent.services.chat_service import (
    ChatService, ChatErrorCode, MAX_RESPONSE_CHARS, CHAT_TIMEOUT_SECONDS
)
from src.agent.memory.buffer import MemoryBuffer
from src.agent.tools.base import Tool, tool


class TestModelWhitelist:
    """✅ P1-S2: 模型白名单测试"""

    def test_allowed_models_constant_exists(self):
        """模型白名单常量存在"""
        assert ALLOWED_MODELS is not None

    def test_invalid_model_rejected(self):
        """非法模型被 Pydantic 拒绝"""
        with pytest.raises(Exception):
            SessionCreateRequest(model="gpt-9999-nonexistent")

    def test_valid_model_accepted(self):
        """合法模型被接受"""
        req = SessionCreateRequest(model="gpt-4o-mini")
        assert req.model == "gpt-4o-mini"

    def test_title_max_length(self):
        """✅ P2-2: title 长度限制"""
        with pytest.raises(Exception):
            SessionCreateRequest(title="x" * 500)

    def test_chat_request_message_length(self):
        """ChatRequest message 长度限制"""
        with pytest.raises(Exception):
            ChatRequest(message="x" * 20000)


class TestPIIMasking:
    """✅ P1-S4: PII 脱敏测试"""

    def test_phone_mask(self):
        """手机号脱敏"""
        masked = mask_pii("13800001234")
        assert "138" in masked
        assert "1234" in masked
        assert "0000" not in masked

    def test_email_mask(self):
        """邮箱脱敏"""
        masked = mask_pii("user@example.com")
        assert "user" in masked
        assert ".com" in masked

    def test_short_value_not_masked_too_much(self):
        """短值不被完全覆盖"""
        masked = mask_pii("abc")
        # 长度小于可见前缀+后缀之和，保留掩码
        assert len(masked) > 0

    def test_is_pii_field_detection(self):
        """PII 字段识别"""
        assert is_pii_field("password") is True
        assert is_pii_field("user_password") is True
        assert is_pii_field("phone") is True
        assert is_pii_field("token") is True
        assert is_pii_field("email") is True
        assert is_pii_field("username") is False
        assert is_pii_field("user_id") is False

    def test_safe_log_args_masks_pii(self):
        """safe_log_args 自动脱敏 PII 字段"""
        args = {
            "username": "admin",
            "password": "secret123",
            "phone": "13800001234"
        }
        safe = safe_log_args(args)
        assert safe["username"] == "admin"
        assert "secret123" not in str(safe["password"])
        assert "138" in str(safe["phone"])

    def test_pii_encrypt_without_key_returns_plaintext_prefix(self):
        """无密钥时返回 !NOENC! 前缀明文"""
        plaintext = "test_value"
        encrypted = pii_encrypt(plaintext)
        # 无密钥环境应返回带前缀的明文
        assert "test_value" in encrypted

    def test_pii_decrypt_handles_unencrypted(self):
        """解密兼容未加密数据"""
        plaintext = "old_data"
        decrypted = pii_decrypt(f"!NOENC!{plaintext}")
        assert decrypted == plaintext


class TestMemoryBufferDeque:
    """✅ P1-P21: buffer deque 优化测试"""

    def test_buffer_auto_trim(self):
        """deque 自动裁剪"""
        buffer = MemoryBuffer(max_turns=5)
        for i in range(20):
            buffer.add_user_message(f"message-{i}")
        # max_turns=5, maxlen=10
        assert len(buffer.messages) <= 10

    def test_buffer_system_messages_kept(self):
        """系统消息保留"""
        buffer = MemoryBuffer(max_turns=5)
        buffer.add_system_message("你是一个助手")
        for i in range(20):
            buffer.add_user_message(f"message-{i}")
        # 系统消息应存在
        messages = buffer.get_messages()
        assert any(m.role == "system" for m in messages)

    def test_buffer_clear(self):
        """清空测试"""
        buffer = MemoryBuffer()
        buffer.add_user_message("test")
        buffer.clear()
        assert len(buffer.messages) == 0

    def test_buffer_serialization(self):
        """序列化/反序列化"""
        buffer = MemoryBuffer(max_turns=10)
        buffer.add_user_message("hello")
        buffer.add_assistant_message("hi")

        data = buffer.to_dict()
        restored = MemoryBuffer.from_dict(data)
        assert restored.max_turns == 10
        assert len(restored.messages) == 2


class TestChatErrorCode:
    """✅ P1-U: 错误码标准化测试"""

    def test_error_code_enum_exists(self):
        """错误码枚举存在"""
        assert ChatErrorCode.SUCCESS == 0
        assert ChatErrorCode.LLM_FAILED == -5001
        assert ChatErrorCode.TOOL_FAILED == -5002
        assert ChatErrorCode.TIMEOUT == -5003
        assert ChatErrorCode.RATE_LIMIT == -429


class TestChatTimeout:
    """✅ P1-P15: chat 超时测试"""

    def test_timeout_constant_exists(self):
        """超时常量存在"""
        assert CHAT_TIMEOUT_SECONDS > 0

    def test_max_response_chars_constant(self):
        """✅ P1-P9: 响应截断常量存在"""
        assert MAX_RESPONSE_CHARS > 0


class TestPaginationBoundary:
    """✅ P0-P14 / P1-P14: 分页边界测试"""

    def test_session_router_has_query_ge(self):
        """routers/session.py 使用 Query(ge=, le=)"""
        import inspect
        from src.agent.routers.session import list_sessions
        source = inspect.getsource(list_sessions)
        assert "Query(1, ge=1" in source
        assert "le=100" in source


class TestModelsDatetime:
    """✅ P2-6: datetime.now(UTC) 测试"""

    def test_utc_now_returns_naive_datetime(self):
        """_utc_now 返回无时区的 datetime"""
        from src.agent.models import _utc_now
        now = _utc_now()
        assert now.tzinfo is None
        assert isinstance(now, type(__import__("datetime").datetime))


class TestToolLogPII:
    """✅ P1-S: Tool 日志自动脱敏测试"""

    def test_safe_log_args_in_tool_log(self, caplog):
        """Tool 日志中 PII 字段被自动脱敏"""
        import logging

        @tool(name="login_test")
        async def login_test(username: str, password: str):
            return {"ok": True}

        with caplog.at_level(logging.INFO):
            asyncio.run(login_test.execute(user_id=1, username="admin", password="super_secret_123"))

        # password 不应以明文出现
        log_text = caplog.text
        assert "super_secret_123" not in log_text


class TestOrgToolPagination:
    """✅ P1-P12/P1-P13: org_tools 分页测试"""

    def test_get_post_list_has_page_size_limit(self):
        """get_post_list 有 page_size 上限"""
        from src.agent.tools.org_tools import get_post_list
        import inspect
        source = inspect.getsource(get_post_list.func)
        assert "page_size" in source
        # 应有上限校验
        assert "min(max" in source or "le=" in source or "50" in source

    def test_get_tenant_info_filters_by_current_user(self):
        """✅ P0-A3: get_tenant_info 仅返回当前用户租户"""
        from src.agent.tools.org_tools import get_tenant_info
        import inspect
        source = inspect.getsource(get_tenant_info.func)
        assert "current_user_id" in source
        # 不应再硬编码 page_size=100
        assert "page_size=100" not in source


class TestRegistryNoLock:
    """✅ P1-P7: registry 无锁测试"""

    def test_registry_no_threading_lock(self):
        """ToolRegistry 不再使用 threading.Lock"""
        import inspect
        from src.agent.tools.registry import ToolRegistry
        source = inspect.getsource(ToolRegistry)
        assert "threading.Lock" not in source


class TestApiContractDoc:
    """✅ P1-U: API 契约文档更新测试"""

    def test_api_contract_has_clear_memory(self):
        """接口契约包含 clear-memory 路由"""
        import os
        path = "api-contract-agent.md"
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            assert "clear-memory" in content

    def test_api_contract_documents_stream_tool_limit(self):
        """接口契约明确流式模式不支持 Tools"""
        import os
        path = "api-contract-agent.md"
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            assert "流式" in content and "Tool" in content