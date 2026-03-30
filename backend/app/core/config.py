import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "IELTS & Aptis Preparation Platform"
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 200
    GEMINI_API_KEY: str
    GOOGLE_CLIENT_ID: str

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
