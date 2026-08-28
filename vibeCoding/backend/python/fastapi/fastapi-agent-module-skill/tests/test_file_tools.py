# 文件操作 Tools 安全测试
# 覆盖：路径白名单、大小限制、UTF-8 校验、diff 预览、审计日志

import os
import tempfile
import asyncio
import pytest
from pathlib import Path


class TestSafeReadFile:
    """safe_read_file Tool 安全约束测试"""

    @pytest.fixture
    def project_dir(self, tmp_path, monkeypatch):
        """临时项目目录"""
        # 创建测试文件
        (tmp_path / "src").mkdir()
        (tmp_path / "src" / "main.py").write_text("print('hello')", encoding="utf-8")
        (tmp_path / "large.txt").write_text("x" * 200_000, encoding="utf-8")  # 200KB
        (tmp_path / "binary.bin").write_bytes(b"\x00\x01\xff\xfe")
        # 设置 PROJECT_ROOT
        monkeypatch.setenv("PROJECT_ROOT", str(tmp_path))
        return tmp_path

    @pytest.mark.asyncio
    async def test_read_within_project(self, project_dir):
        """读取项目内文件成功"""
        from src.agent.tools.file_tools import safe_read_file
        result = await safe_read_file.func(path="src/main.py", current_user_id=1)
        assert "error" not in result
        assert result["content"] == "print('hello')"
        assert result["size"] == len("print('hello')")
        assert result["path"] == "src/main.py"

    @pytest.mark.asyncio
    async def test_read_path_traversal_blocked(self, project_dir):
        """路径穿越被拦截"""
        from src.agent.tools.file_tools import safe_read_file
        result = await safe_read_file.func(
            path="../../../etc/passwd",
            current_user_id=1
        )
        assert "error" in result
        assert "项目目录内" in result["error"]

    @pytest.mark.asyncio
    async def test_read_absolute_path_outside_blocked(self, project_dir):
        """绝对路径访问 /etc 被拦截"""
        from src.agent.tools.file_tools import safe_read_file
        result = await safe_read_file.func(
            path="/etc/passwd",
            current_user_id=1
        )
        assert "error" in result

    @pytest.mark.asyncio
    async def test_read_forbidden_ssh_blocked(self, project_dir):
        """~/.ssh 路径被黑名单拦截"""
        from src.agent.tools.file_tools import safe_read_file
        ssh_dir = Path(project_dir).parent / ".ssh"
        ssh_dir.mkdir(exist_ok=True)
        (ssh_dir / "id_rsa").write_text("PRIVATE_KEY")
        result = await safe_read_file.func(
            path=str(ssh_dir / "id_rsa"),
            current_user_id=1
        )
        assert "error" in result

    @pytest.mark.asyncio
    async def test_read_file_too_large(self, project_dir):
        """超过大小限制被拒绝"""
        from src.agent.tools.file_tools import safe_read_file
        result = await safe_read_file.func(
            path="large.txt",
            current_user_id=1,
            max_size=100_000
        )
        assert "error" in result
        assert "超过" in result["error"]
        assert result.get("size") == 200_000

    @pytest.mark.asyncio
    async def test_read_non_utf8_rejected(self, project_dir):
        """非 UTF-8 文件被拒绝"""
        from src.agent.tools.file_tools import safe_read_file
        result = await safe_read_file.func(
            path="binary.bin",
            current_user_id=1
        )
        assert "error" in result
        assert "UTF-8" in result["error"]

    @pytest.mark.asyncio
    async def test_read_nonexistent_file(self, project_dir):
        """文件不存在返回错误"""
        from src.agent.tools.file_tools import safe_read_file
        result = await safe_read_file.func(
            path="nonexistent.py",
            current_user_id=1
        )
        assert "error" in result
        assert "不存在" in result["error"]

    @pytest.mark.asyncio
    async def test_read_audit_log_recorded(self, project_dir):
        """读取操作记录审计日志"""
        import logging
        from src.agent.tools.file_tools import safe_read_file

        with tempfile.NamedTemporaryFile(suffix=".log", delete=False, mode="w") as f:
            log_file = f.name
        handler = logging.FileHandler(log_file, encoding="utf-8")
        logging.getLogger("agent.audit").addHandler(handler)
        logging.getLogger("agent.audit").setLevel(logging.INFO)

        try:
            await safe_read_file.func(path="src/main.py", current_user_id=42)
            handler.flush()

            with open(log_file, "r", encoding="utf-8") as f:
                log_content = f.read()
            assert "safe_read_file" in log_content
            assert "42" in log_content  # user_id
        finally:
            os.unlink(log_file)


class TestSafeWriteFile:
    """safe_write_file Tool 安全约束测试"""

    @pytest.fixture
    def project_dir(self, tmp_path, monkeypatch):
        """临时项目目录"""
        (tmp_path / "src").mkdir()
        (tmp_path / "src" / "main.py").write_text("old content\n", encoding="utf-8")
        monkeypatch.setenv("PROJECT_ROOT", str(tmp_path))
        return tmp_path

    @pytest.mark.asyncio
    async def test_write_preview_first(self, project_dir):
        """第一次调用仅返回 diff 预览，不写入"""
        from src.agent.tools.file_tools import safe_write_file
        result = await safe_write_file.func(
            path="src/main.py",
            new_content="new content\n",
            current_user_id=1,
            confirm=False
        )
        assert result.get("preview") is True
        assert "diff" in result
        assert "+" in result["diff"] or "-" in result["diff"]

        # 文件未变
        assert (project_dir / "src" / "main.py").read_text(encoding="utf-8") == "old content\n"

    @pytest.mark.asyncio
    async def test_write_confirm_writes_file(self, project_dir):
        """confirm=True 真正写入"""
        from src.agent.tools.file_tools import safe_write_file
        result = await safe_write_file.func(
            path="src/main.py",
            new_content="new content\n",
            current_user_id=1,
            confirm=True
        )
        assert result.get("written") is True
        assert result["size"] == len("new content\n")

        # 文件已变更
        assert (project_dir / "src" / "main.py").read_text(encoding="utf-8") == "new content\n"

    @pytest.mark.asyncio
    async def test_write_path_traversal_blocked(self, project_dir):
        """路径穿越拦截"""
        from src.agent.tools.file_tools import safe_write_file
        result = await safe_write_file.func(
            path="../../../tmp/evil.py",
            new_content="malicious",
            current_user_id=1,
            confirm=True
        )
        assert "error" in result

    @pytest.mark.asyncio
    async def test_write_content_too_large(self, project_dir):
        """内容超过大小限制被拒绝"""
        from src.agent.tools.file_tools import safe_write_file
        result = await safe_write_file.func(
            path="src/main.py",
            new_content="x" * 2_000_000,  # 2MB
            current_user_id=1,
            confirm=True
        )
        assert "error" in result
        assert "超过" in result["error"]

    @pytest.mark.asyncio
    async def test_write_creates_parent_dirs(self, project_dir):
        """自动创建父目录"""
        from src.agent.tools.file_tools import safe_write_file
        result = await safe_write_file.func(
            path="src/new/nested/file.py",
            new_content="# new\n",
            current_user_id=1,
            confirm=True
        )
        assert result.get("written") is True
        assert (project_dir / "src" / "new" / "nested" / "file.py").exists()


class TestToolRegistration:
    """Tool 注册测试"""

    def test_safe_read_file_registered(self):
        """safe_read_file 已注册"""
        from src.agent.tools.registry import ToolRegistry
        assert ToolRegistry.get("safe_read_file") is not None

    def test_safe_write_file_registered(self):
        """safe_write_file 已注册"""
        from src.agent.tools.registry import ToolRegistry
        assert ToolRegistry.get("safe_write_file") is not None

    def test_file_tools_in_definitions(self):
        """Tool 定义列表包含 file tools"""
        from src.agent.tools.registry import ToolRegistry
        defs = ToolRegistry.get_definitions()
        names = [d["name"] for d in defs]
        assert "safe_read_file" in names
        assert "safe_write_file" in names
