import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    PROJECT_NAME: str = "Yuva Energy — Agricultural Intelligence API"
    PROJECT_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1"
    ENVIRONMENT: str = "development"

    # Database Configuration
    DATABASE_HOST: str = "127.0.0.1"
    DATABASE_PORT: int = 55432
    DATABASE_USER: str = "yuva_test_admin"
    DATABASE_PASSWORD: str = ""
    DATABASE_NAME: str = "yuva_dev"
    DATABASE_URL: str = "postgresql://yuva_test_admin@127.0.0.1:55432/yuva_dev"

    # JWT Authentication
    JWT_SECRET: str = "yuva-energy-super-secure-production-jwt-secret-key-2026-crop-intel"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*"
    ]

    # External Provider Defaults
    OPEN_METEO_BASE_URL: str = "https://api.open-meteo.com/v1"

settings = Settings()
