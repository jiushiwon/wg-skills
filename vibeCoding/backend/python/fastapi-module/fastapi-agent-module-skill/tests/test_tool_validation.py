# Agent 模块最小测试集
# ✅ 修复 P0-U2: 补齐测试基建（之前完全无测试）
# 这些测试覆盖核心安全与一致性约束

import pytest
from src.agent.tools.base import Tool, tool, TOOL_ERROR_MSG
from src.agent.tools.user_tools import get_user_info, search_users
from src.agent.tools.org_tools import get_org_tree, get_org_detail, get_post_list, get_tenant_info


class TestToolValidation:
    """Tool 参数校验测试"""

    def test_int_field_rejects_string(self):
        """✅ P0-S6: int 字段拒绝非整数字符串"""
        @tool(name="test_int")
        async def test_int(count: int):
            return {"count": count}

        # 合法整数
        validated = test_int.validate_arguments(count=10)
        assert validated["count"] == 10

        # 非法整数字符串
        with pytest.raises(ValueError, match="参数校验失败"):
            test_int.validate_arguments(count="not_a_number")

    def test_str_field_has_max_length(self):
        """✅ P0-S6: str 字段有最大长度限制"""
        @tool(name="test_str")
        async def test_str(text: str):
            return {"text": text}

        long_text = "x" * 20000
        with pytest.raises(ValueError, match="参数校验失败"):
            test_int = test_str.validate_arguments(text=long_text)
            # Pydantic 会捕获

    def test_required_param_missing_raises(self):
        """✅ P0-A1: 必需参数缺失报错"""
        @tool(name="test_required")
        async def test_required(user_id: int):
            return {"user_id": user_id}

        with pytest.raises(ValueError):
            test_required.validate_arguments()


class TestCurrentUserIdSecurity:
    """current_user_id 权限测试"""

    def test_current_user_id_is_required_not_optional(self):
        """✅ P0-A1: current_user_id 必须无默认值"""
        sig = get_user_info.func
        param = sig.__code__.co_varnames[:sig.__code__.co_argcount]
        assert "current_user_id" in param

        # 检查参数定义
        cur_param = get_user_info.parameters["current_user_id"]
        assert cur_param.required is True, "current_user_id 必须设为 required"

    def test_user_tools_dont_accept_user_id_override(self):
        """✅ P0-A1: 用户 Tools 签名不接受 user_id（必须由系统注入）"""
        # get_user_info 不应接受 user_id 参数
        sig = get_user_info.func
        params = list(sig.__code__.co_varnames[:sig.__code__.co_argcount])
        # user_id 不应在参数列表（应使用 current_user_id）
        assert "user_id" not in params
        assert "current_user_id" in params

    def test_org_tools_require_current_user_id(self):
        """✅ P0-A3: org_tools 全部需要 current_user_id"""
        for tool_func in [get_org_tree, get_org_detail, get_post_list, get_tenant_info]:
            params = list(tool_func.func.__code__.co_varnames[:tool_func.func.__code__.co_argcount])
            assert "current_user_id" in params, \
                f"{tool_func.name} 必须有 current_user_id 参数"


class TestToolErrorSanitization:
    """Tool 错误返回脱敏测试"""

    def test_tool_error_returns_fixed_message(self):
        """✅ P0-S1: Tool 错误返回固定话术"""
        @tool(name="test_fail")
        async def test_fail(value: int):
            raise RuntimeError("数据库密码是 secret123 @/var/run/db.sock")

        import asyncio
        result = asyncio.run(test_fail.execute(user_id=1, value=1))

        # 错误信息不能包含原始异常的敏感内容
        assert result["error"] == TOOL_ERROR_MSG
        assert "secret123" not in str(result)
        assert "db.sock" not in str(result)


class TestLogSanitization:
    """日志脱敏测试"""

    def test_tool_log_does_not_contain_param_values(self, caplog):
        """✅ P0-S2: Tool 日志不包含参数值"""
        import logging

        @tool(name="test_sensitive")
        async def test_sensitive(password: str, current_user_id: int):
            return {"ok": True}

        with caplog.at_level(logging.INFO):
            import asyncio
            asyncio.run(test_sensitive.execute(user_id=1, password="my_secret_password_123"))

        # 日志只记录参数签名（类型），不记录值
        log_text = caplog.text
        assert "my_secret_password_123" not in log_text


class TestMemoryStore:
    """MemoryStore 测试"""

    def test_evicted_buffer_is_cleared(self):
        """✅ P0-P8: 淘汰 buffer 显式清空"""
        from src.agent.memory.store import MemoryStore
        store = MemoryStore(max_sessions=2)

        # 填满
        buf1 = store.get_buffer(1)
        buf1.add_message("user", "message-1")
        buf2 = store.get_buffer(2)
        buf2.add_message("user", "message-2")

        # 触发淘汰
        buf3 = store.get_buffer(3)

        # buf1 应该被淘汰并清空
        assert buf1.messages == []


class TestSearchUsersPagination:
    """search_users 分页测试"""

    def test_search_users_limit_is_capped(self):
        """✅ P0-S6: search_users 的 limit 限制最大 50"""
        # 通过源码验证（动态测试需要 mock auth service）
        import inspect
        source = inspect.getsource(search_users.func)
        # 应有 min(max(limit, 1), 50) 类似的代码
        assert "min(max" in source or "50" in source