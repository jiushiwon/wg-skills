from app.config import settings
from app.routers import health, sse, upload

if settings.db_type not in ("none", "mongodb"):
    from app.routers import auth, users
    __all__ = ["health", "auth", "users", "sse", "upload"]
else:
    __all__ = ["health", "sse", "upload"]