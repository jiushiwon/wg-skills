from app.exceptions import BusinessException
from app.models.user import User
from app.utils.security import hash_password, verify_password


class UserService:

    @staticmethod
    async def create_user(db, username: str, password: str, email: str | None = None, phone: str | None = None) -> User:
        existing = await UserService._find_by_username(db, username)
        if existing:
            raise BusinessException(-1005, "用户名已存在")
        user = User(
            username=username,
            password=hash_password(password),
            email=email,
            phone=phone,
        )
        db.add(user)
        try:
            await db.flush()
        except Exception:
            await db.rollback()
            raise BusinessException(-1005, "用户名已存在")
        return user

    @staticmethod
    async def authenticate(db, username: str, password: str) -> User:
        user = await UserService._find_by_username(db, username)
        if not user or not verify_password(password, user.password):
            raise BusinessException(-1002, "用户名或密码错误")
        if not user.is_active:
            raise BusinessException(-1002, "用户名或密码错误")
        return user

    @staticmethod
    async def _find_by_username(db, username: str) -> User | None:
        from sqlalchemy import select
        result = await db.execute(select(User).where(User.username == username))
        return result.scalar_one_or_none()