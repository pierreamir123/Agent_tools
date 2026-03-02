import boto3
from langchain.agents import create_agent
from langchain_aws import ChatBedrock

from app.agent.config import Settings
from app.agent.tools import get_tools


def build_system_prompt() -> str:
    return (
        "You are a production AI agent with access to a knowledge base. Follow these rules:\n"
        "1) Always reason step-by-step internally, but present concise conclusions.\n"
        "2) KNOWLEDGE BASE — When the user asks a question that could be answered by stored "
        "documents, ALWAYS call rag_search_tool first. Base your answer on the retrieved "
        "documents. Quote or paraphrase the relevant excerpts and mention the source when "
        "available. Do NOT fabricate or rely on prior knowledge when the knowledge base has "
        "been queried — prefer the retrieved content.\n"
        "3) MATH — Call calculator_tool for arithmetic expressions.\n"
        "4) WEB — Call web_search_tool for information that is neither in the knowledge base "
        "nor computable.\n"
        "5) If a tool returns no results, say so and fall back to your best general knowledge, "
        "clearly stating you are doing so.\n"
        "6) Cite tool usage in plain language.\n"
        "7) If uncertain, state assumptions.\n"
        "8) Return markdown-friendly responses."
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
