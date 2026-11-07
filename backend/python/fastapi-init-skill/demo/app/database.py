from app.config import settings

if settings.db_type == "mongodb":
    from motor.motor_asyncio import AsyncIOMotorClient

    _mongo_client: AsyncIOMotorClient | None = None

    async def connect_db():
        global _mongo_client
        _mongo_client = AsyncIOMotorClient(settings.database_url)

    async def close_db():
        global _mongo_client
        if _mongo_client:
            _mongo_client.close()

    async def get_db():
        if _mongo_client is None:
            await connect_db()
        return _mongo_client[settings.db_name]


elif settings.db_type == "none":
    class DummyDB:
        async def execute(self, *args, **kwargs):
            return None

        async def command(self, *args, **kwargs):
            return None

    async def get_db():
        return DummyDB()


else:
    from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
    from sqlalchemy.orm import DeclarativeBase

    engine = create_async_engine(
        settings.database_url,
        echo=settings.app_debug,
        pool_size=10,
        max_overflow=20,
        pool_recycle=3600,      # 1 小时后回收连接，防止数据库端连接失效
        pool_pre_ping=True,     # 连接前发送 ping，自动重连失效连接
    )
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


    class Base(DeclarativeBase):
        pass


    async def get_db():
        async with async_session() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise