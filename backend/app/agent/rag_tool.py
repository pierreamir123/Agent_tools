from __future__ import annotations

import logging
from typing import Annotated

from langchain_core.tools import tool
from langchain_openai import AzureOpenAIEmbeddings
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient

from app.agent.config import get_settings

logger = logging.getLogger("agent_api")

_retriever = None


def _get_retriever():
    """Lazily initialise and cache the Qdrant retriever."""
    global _retriever  # noqa: PLW0603
    if _retriever is not None:
        return _retriever

    settings = get_settings()

    embeddings = AzureOpenAIEmbeddings(
        azure_deployment=settings.azure_openai_embeddings_deployment,
        azure_endpoint=settings.azure_openai_endpoint,
        api_key=settings.azure_openai_api_key,
        api_version=settings.azure_openai_api_version,
    )

    client = QdrantClient(
        url=settings.qdrant_url,
        api_key=settings.qdrant_api_key,
    )

    vector_store = QdrantVectorStore(
        client=client,
        collection_name=settings.qdrant_collection_name,
        embedding=embeddings,
    )

    _retriever = vector_store.as_retriever(search_kwargs={"k": 4})
    logger.info(
        "Qdrant retriever initialised — collection=%s, url=%s",
        settings.qdrant_collection_name,
        settings.qdrant_url,
    )
    return _retriever


@tool
def rag_search_tool(
    query: Annotated[str, "Natural-language query to search the knowledge base"],
) -> str:
    """Search the Qdrant knowledge base for relevant documents.

    Use this tool when the user asks a question that may be answered by
    the stored documents or knowledge base.  Returns the most relevant
    document excerpts separated by horizontal rules.
    """
    retriever = _get_retriever()
    docs = retriever.invoke(query)

    if not docs:
        return "No relevant documents found for the given query."

    results = []
    for i, doc in enumerate(docs, 1):
        source = doc.metadata.get("source", "unknown")
        results.append(f"**[Result {i}]** (source: {source})\n{doc.page_content}")

    return "\n\n---\n\n".join(results)
