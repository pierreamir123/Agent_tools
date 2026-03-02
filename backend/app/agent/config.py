from functools import lru_cache
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    aws_access_key_id: str = Field(validation_alias="AWS_ACCESS_KEY_ID")
    aws_secret_access_key: str = Field(validation_alias="AWS_SECRET_ACCESS_KEY")
    aws_region: str = Field(validation_alias="AWS_REGION")
    aws_session_token: Optional[str] = Field(
        default=None, validation_alias="AWS_SESSION_TOKEN"
    )
    bedrock_model_id: str = Field(validation_alias="BEDROCK_MODEL_ID")
    temperature: float = Field(default=0.2, validation_alias="AGENT_TEMPERATURE")
    cors_origin: str = Field(
        default="http://localhost:5173", validation_alias="CORS_ORIGIN"
    )

    # Qdrant
    qdrant_url: str = Field(
        default="http://localhost:6333", validation_alias="QDRANT_URL"
    )
    qdrant_api_key: Optional[str] = Field(
        default=None, validation_alias="QDRANT_API_KEY"
    )
    qdrant_collection_name: str = Field(
        default="documents", validation_alias="QDRANT_COLLECTION_NAME"
    )

    # Azure OpenAI Embeddings
    azure_openai_api_key: str = Field(validation_alias="AZURE_OPENAI_API_KEY")
    azure_openai_endpoint: str = Field(validation_alias="AZURE_OPENAI_ENDPOINT")
    azure_openai_api_version: str = Field(
        default="2024-02-01", validation_alias="AZURE_OPENAI_API_VERSION"
    )
    azure_openai_embeddings_deployment: str = Field(
        default="text-embedding-3-small",
        validation_alias="AZURE_OPENAI_EMBEDDINGS_DEPLOYMENT",
    )

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
