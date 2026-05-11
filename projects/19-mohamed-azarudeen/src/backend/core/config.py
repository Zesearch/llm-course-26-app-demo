from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    APP_NAME: str = "AI Data Visualization Agent"
    VERSION: str = "2.0.0"
    DEBUG: bool = False

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    # E2B
    E2B_API_KEY: str = ""

    # Anthropic / Ollama
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    DEFAULT_MODEL: str = "llama3.1:8b"

    # Limits
    MAX_FILE_SIZE_MB: int = 50
    MAX_ROWS_PREVIEW: int = 200
    SANDBOX_TIMEOUT_SECONDS: int = 60

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
