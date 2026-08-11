import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "IELTS & Aptis Preparation Platform"
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    GEMINI_API_KEY: str
    GOOGLE_CLIENT_ID: str

    ENVIRONMENT: str = "development"
    BASE_URL: str = "http://localhost:8000"

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production" or self.BASE_URL.startswith("https://")

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
