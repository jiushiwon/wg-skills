from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_name: str = "fastapi-init-demo"
    app_port: int = 8080
    app_debug: bool = True  # ⚠️ 生产环境必须设为 false，防止泄漏堆栈跟踪等敏感信息

    db_type: str = "mysql"  # mysql / postgresql / mongodb / none
    db_host: str = "localhost"
    db_port: int = 3306
    db_name: str = "app_db"
    db_user: str = "root"
    # 🔴 生产环境务必修改为强密码！
    db_password: str = "root"
    db_prefix: str = "wg"
    db_url: str | None = None

    cors_origins: str = "*"
    jwt_secret: str = "change-me-in-production"
    jwt_expires_in: int = 86400
    jwt_refresh_expires_in: int = 604800

    bcrypt_rounds: int = 12

    sse_retry_timeout: int = 3000

    upload_dir: str = "uploads"
    upload_max_size: int = 10
    upload_allowed_types: str = "image/jpeg,image/png,image/gif,application/pdf"

    @property
    def database_url(self) -> str:
        if self.db_url:
            return self.db_url
        if self.db_type == "mysql":
            return f"mysql+aiomysql://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}?charset=utf8mb4"
        if self.db_type == "postgresql":
            return f"postgresql+asyncpg://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"
        if self.db_type == "mongodb":
            return f"mongodb://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}?authSource=admin"
        return ""


settings = Settings()