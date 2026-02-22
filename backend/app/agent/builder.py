import boto3
from langchain.agents import create_agent
from langchain_aws import ChatBedrock

from .config import Settings
from .tools import get_tools


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
    bedrock_client = boto3.client(
        service_name="bedrock-runtime",
        region_name=settings.aws_region,
        aws_access_key_id=settings.aws_access_key_id,
        aws_secret_access_key=settings.aws_secret_access_key,
    )

    llm = ChatBedrock(
        client=bedrock_client,
        model_id=settings.bedrock_model_id,
        model_kwargs={"temperature": settings.temperature},
    )

    return create_agent(
        model=llm,
        tools=get_tools(),
        system_prompt=build_system_prompt(),
        response_format={"type": "text"},
    )
