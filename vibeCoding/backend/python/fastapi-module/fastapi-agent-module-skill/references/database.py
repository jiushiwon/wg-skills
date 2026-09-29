# Agent 模块数据库连接适配器
# 兼容两种骨架路径：app.database 或 database

from typing import AsyncGenerator
import logging

logger = logging.getLogger(__name__)

# 尝试从骨架导入 get_session
try:
    # 方式一：app/database.py（fastapi-init-skill 标准路径）
    from app.database import get_session
    logger.debug("使用 app.database.get_session")
except ImportError:
    try:
        # 方式二：database.py（项目根目录直接放置）
        from database import get_session
        logger.debug("使用 database.get_session")
    except ImportError:
        # 方式三：app.main 中的别名
        try:
            from app.main import get_session
            logger.debug("使用 app.main.get_session")
        except ImportError:
            raise ImportError(
                "无法导入 get_session。请确保骨架已正确生成数据库连接模块。"
                "支持路径：app/database.py、database.py"
            )

__all__ = ["get_session"]