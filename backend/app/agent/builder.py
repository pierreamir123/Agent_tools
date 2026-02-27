import boto3
from langchain.agents import create_agent
from langchain_aws import ChatBedrock

from app.agent.config import Settings
from app.agent.tools import get_tools


def build_system_prompt() -> str:
    return (
        "You are a production AI agent. Follow these rules:\n"
        "1) You decide when to use the knowledge base: call the bm25_retrieval_tool when the user asks about the project, the company (e.g. FlairsTech), or any documented topic. If the question is general or does not need the knowledge base, answer without calling it.\n"
        "2) Always reason step-by-step internally, but present concise conclusions.\n"
        "3) Call the calculator_tool for arithmetic. Call web_search_tool only for live/web-like queries when the knowledge base is not enough.\n"
        "4) Cite tool usage in plain language.\n"
        "5) If uncertain, state assumptions.\n"
        "6) Return markdown-friendly responses."
    )


def build_agent(settings: Settings):
    bedrock_client = boto3.client(
        service_name="bedrock-runtime",
        region_name=settings.aws_region,
        aws_access_key_id=settings.aws_access_key_id,
        aws_secret_access_key=settings.aws_secret_access_key,
        aws_session_token=settings.aws_session_token,
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
    )
