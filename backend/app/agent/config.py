from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    aws_access_key_id: str = Field(validation_alias="AWS_ACCESS_KEY_ID")
    aws_secret_access_key: str = Field(validation_alias="AWS_SECRET_ACCESS_KEY")
    aws_region: str = Field(validation_alias="AWS_REGION")
    aws_session_token: str | None = Field(
        default=None, validation_alias="AWS_SESSION_TOKEN"
    )
    bedrock_model_id: str = Field(validation_alias="BEDROCK_MODEL_ID")
    temperature: float = Field(default=0.2, validation_alias="AGENT_TEMPERATURE")
    cors_origin: str = Field(
        default="http://localhost:5173", validation_alias="CORS_ORIGIN"
    )

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
