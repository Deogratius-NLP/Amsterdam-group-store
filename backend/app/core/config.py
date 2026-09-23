from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Amsterdam Group Ordering API"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Database: Supports SQLite (sqlite:///./amsterdam.db) or PostgreSQL
    DATABASE_URL: str = "sqlite:///./amsterdam.db"

    # Security
    SECRET_KEY: str = "amsterdam-super-secret-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # Admin seed
    ADMIN_DEFAULT_NAME: str = "Amsterdam Admin"
    ADMIN_DEFAULT_EMAIL: str = "admin@amsterdamgroup.co.tz"
    ADMIN_DEFAULT_PASSWORD: str = "Admin@Amsterdam2026!"

    # WhatsApp Business number (E.164 format without '+' e.g. 255651728851)
    WHATSAPP_NUMBER: str = "255651728851"

    # CORS
    CORS_ORIGINS: Union[str, List[str]] = "*"

    @field_validator("CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if v == "*":
            return ["*"]
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Static assets
    STATIC_DIR: str = "app/static"
    MEDIA_BASE_URL: str = "http://localhost:8000/static"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
