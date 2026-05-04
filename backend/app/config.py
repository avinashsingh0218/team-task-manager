from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """
    Loads all configuration from the .env file.
    Pydantic automatically reads these values — no manual os.getenv() needed.
    """
    APP_NAME: str = "Team Task Manager"
    DEBUG: bool = True

    # Database connection URL
    DATABASE_URL: str

    # JWT settings
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    class Config:
        env_file = ".env"  # tell pydantic where to find the .env file

# Create a single settings instance to import across the app
settings = Settings()
