from __future__ import annotations

from langchain.agents import create_agent
from langchain_aws import ChatBedrock

from app.agent.config import Settings
from app.agent.tools import get_tools


def build_system_prompt() -> str:
    return (
        "You are a production AI agent. Follow these rules:\n"
        "1) Always reason step-by-step internally, but present concise conclusions.\n"
        "2) Call tools when arithmetic or fresh external-like info is needed.\n"
        "3) Cite tool usage in plain language.\n"
        "4) If uncertain, state assumptions.\n"
        "5) Return markdown-friendly responses."
    )


def build_agent(settings: Settings):
    llm = ChatBedrock(
        model_id=settings.bedrock_model_id,
        region_name=settings.aws_region,
        model_kwargs={"temperature": settings.temperature},
        credentials_profile_name=None,
        aws_access_key_id=settings.aws_access_key_id,
        aws_secret_access_key=settings.aws_secret_access_key,
    )

    return create_agent(
        model=llm,
        tools=get_tools(),
        system_prompt=build_system_prompt(),
        response_format={"type": "text"},
    )
