from app.config import settings

if settings.db_type not in ("mongodb", "none"):
    from app.database import Base
    from app.models.user import User

    __all__ = ["Base", "User"]
else:
    __all__ = []