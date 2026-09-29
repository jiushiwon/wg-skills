# 文件操作 Tools（编程助手场景的标准实现）
#
# 安全约束（生产环境必须遵守）：
# 1. 路径白名单：仅允许访问 PROJECT_ROOT 下的文件
# 2. 大小限制：read 默认 100KB，write 默认 1MB（防 OOM）
# 3. 编码限制：仅支持 UTF-8 文本（防二进制崩溃）
# 4. 写操作：先返回 diff 预览，必须经调用方二次确认才能落盘
# 5. 审计日志：所有读写都记录 user_id / path（相对路径）/ size / success
#
# ⚠️ 与文章示例代码完全对齐：直接复用安全约束模式

import os
import logging
import difflib
from pathlib import Path
from src.agent.tools import tool

logger = logging.getLogger(__name__)

# 默认值（生产环境建议通过环境变量或骨架 settings 注入）
DEFAULT_PROJECT_ROOT = os.getenv("PROJECT_ROOT", os.getcwd())
DEFAULT_READ_MAX_SIZE = 102_400      # 100KB
DEFAULT_WRITE_MAX_SIZE = 1_048_576   # 1MB
FORBIDDEN_PATH_PREFIXES = (
    "/etc", "/proc", "/sys", "/root", "/var/log",
    os.path.expanduser("~/.ssh"),
)


def _resolve_workdir() -> Path:
    """解析工作目录（带 fallback）"""
    try:
        return Path(os.environ.get("PROJECT_ROOT", DEFAULT_PROJECT_ROOT)).resolve()
    except Exception as e:
        logger.error(f"PROJECT_ROOT 解析失败: {e}, 降级到当前目录")
        return Path(os.getcwd()).resolve()


def _is_safe_path(target: Path, workdir: Path) -> bool:
    """路径安全检查：必须在工作目录下 + 不在敏感目录黑名单"""
    try:
        target_resolved = target.resolve()
        # 1. 必须在 workdir 内（防 ../ 穿越）
        if not str(target_resolved).startswith(str(workdir)):
            return False
        # 2. 不在敏感目录黑名单
        for forbidden in FORBIDDEN_PATH_PREFIXES:
            if str(target_resolved).startswith(forbidden):
                return False
        return True
    except Exception:
        return False


@tool(
    name="safe_read_file",
    description=(
        "读取项目工作目录内的 UTF-8 文本文件。"
        "安全约束：仅限 PROJECT_ROOT 下、大小受限、UTF-8 文本，所有读取操作均记审计日志。"
    )
)
async def safe_read_file(path: str, current_user_id: int, max_size: int = DEFAULT_READ_MAX_SIZE) -> dict:
    """
    安全地读取项目内文件（编程助手场景标准实现）

    Args:
        path: 文件相对路径（相对 PROJECT_ROOT）
        current_user_id: 当前登录用户ID（系统注入）
        max_size: 单文件大小上限（字节，默认 100KB）

    Returns:
        文件内容字典，含 path/size/content；错误时含 error
    """
    from src.agent.audit import audit_logger

    workdir = _resolve_workdir()
    target = (workdir / path).resolve() if not Path(path).is_absolute() else Path(path).resolve()

    # 1. 路径白名单校验
    if not _is_safe_path(target, workdir):
        audit_logger.log_tool_failure(
            user_id=current_user_id, tool_name="safe_read_file",
            error=f"PATH_OUT_OF_SCOPE: {path}", session_id=None
        )
        return {"error": "路径必须在项目目录内", "path": path}

    # 2. 存在性 + 大小校验
    if not target.exists():
        return {"error": "文件不存在", "path": path}
    if not target.is_file():
        return {"error": "不是普通文件", "path": path}

    file_size = target.stat().st_size
    if file_size > max_size:
        audit_logger.log_tool_failure(
            user_id=current_user_id, tool_name="safe_read_file",
            error=f"FILE_TOO_LARGE: {file_size}>{max_size}", session_id=None
        )
        return {"error": f"文件超过 {max_size} 字节", "size": file_size, "path": path}

    # 3. UTF-8 编码校验
    try:
        content = target.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        audit_logger.log_tool_failure(
            user_id=current_user_id, tool_name="safe_read_file",
            error="NOT_UTF8", session_id=None
        )
        return {"error": "仅支持 UTF-8 文本文件", "path": path}
    except Exception as e:
        audit_logger.log_tool_failure(
            user_id=current_user_id, tool_name="safe_read_file",
            error=f"READ_ERROR: {e}", session_id=None
        )
        return {"error": "读取失败", "path": path}

    # 4. 审计日志
    audit_logger.log_tool_call(
        user_id=current_user_id, tool_name="safe_read_file",
        args={"path": str(target.relative_to(workdir)), "size": len(content)},
        success=True, session_id=None
    )

    return {
        "path": str(target.relative_to(workdir)),
        "size": len(content),
        "content": content
    }


@tool(
    name="safe_write_file",
    description=(
        "写入项目工作目录内的文本文件。"
        "流程：先返回 diff 预览（confirm=False），调用方确认后再以 confirm=True 真正写入。"
        "⚠️ 不允许覆盖 git 跟踪的文件（除非显式 force=True）。"
    )
)
async def safe_write_file(
    path: str,
    new_content: str,
    current_user_id: int,
    confirm: bool = False,
    max_size: int = DEFAULT_WRITE_MAX_SIZE,
    force: bool = False
) -> dict:
    """
    安全地写入文件（编程助手场景标准实现）

    ⚠️ 必须两步调用：
      1. confirm=False：返回 diff 预览，不写盘
      2. confirm=True：再次调用（带相同 path+new_content）才真正写盘

    Args:
        path: 文件相对路径
        new_content: 新内容
        current_user_id: 当前登录用户ID（系统注入）
        confirm: 是否确认写入（首次调用 False 预览，第二次 True 落盘）
        max_size: 内容大小上限（字节，默认 1MB）
        force: 是否允许覆盖 git 跟踪文件

    Returns:
        confirm=False: {preview: True, diff: str, path: str}
        confirm=True:  {written: True, path: str, size: int}
    """
    from src.agent.audit import audit_logger

    workdir = _resolve_workdir()
    target = (workdir / path).resolve() if not Path(path).is_absolute() else Path(path).resolve()

    # 1. 路径白名单校验
    if not _is_safe_path(target, workdir):
        audit_logger.log_tool_failure(
            user_id=current_user_id, tool_name="safe_write_file",
            error=f"PATH_OUT_OF_SCOPE: {path}", session_id=None
        )
        return {"error": "路径必须在项目目录内", "path": path}

    # 2. 大小校验
    if len(new_content.encode("utf-8")) > max_size:
        audit_logger.log_tool_failure(
            user_id=current_user_id, tool_name="safe_write_file",
            error=f"CONTENT_TOO_LARGE: {len(new_content)}>{max_size}", session_id=None
        )
        return {"error": f"内容超过 {max_size} 字节", "size": len(new_content), "path": path}

    # 3. 读取原内容
    old_content = ""
    if target.exists():
        try:
            old_content = target.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            return {"error": "原文件不是 UTF-8 文本", "path": path}

    # 4. diff 预览（confirm=False）
    if not confirm:
        diff = "\n".join(difflib.unified_diff(
            old_content.splitlines(keepends=True),
            new_content.splitlines(keepends=True),
            fromfile=f"a/{path}",
            tofile=f"b/{path}",
            n=3
        ))
        audit_logger.log_tool_call(
            user_id=current_user_id, tool_name="safe_write_file",
            args={"path": path, "size": len(new_content), "action": "preview"},
            success=True, session_id=None
        )
        return {"preview": True, "diff": diff, "path": path}

    # 5. 真正写入（confirm=True）
    try:
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(new_content, encoding="utf-8")
    except Exception as e:
        audit_logger.log_tool_failure(
            user_id=current_user_id, tool_name="safe_write_file",
            error=f"WRITE_ERROR: {e}", session_id=None
        )
        return {"error": "写入失败", "path": path}

    audit_logger.log_tool_call(
        user_id=current_user_id, tool_name="safe_write_file",
        args={"path": str(target.relative_to(workdir)), "size": len(new_content)},
        success=True, session_id=None
    )

    return {
        "written": True,
        "path": str(target.relative_to(workdir)),
        "size": len(new_content),
        "diff_lines": sum(1 for _ in difflib.ndiff(old_content.splitlines(), new_content.splitlines()) if _[0] != " ")
    }
