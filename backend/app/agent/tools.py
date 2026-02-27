from __future__ import annotations

import asyncio
import math
from typing import Annotated

from langchain_core.tools import tool

from app.agent.retriever import get_bm25_retriever


@tool
def calculator_tool(expression: Annotated[str, "Math expression using basic operators"]):
    """Safely evaluate arithmetic expressions for quick calculations."""

    allowed_names = {
        "abs": abs,
        "round": round,
        "sqrt": math.sqrt,
        "pow": pow,
    }
    code = compile(expression, "<calculator>", "eval")
    for name in code.co_names:
        if name not in allowed_names:
            raise ValueError(f"Unsupported token in expression: {name}")

    result = eval(code, {"__builtins__": {}}, allowed_names)
    return str(result)


@tool
async def web_search_tool(query: Annotated[str, "Web search query"]):
    """Mock web search tool that simulates retrieval from indexed documents."""

    await asyncio.sleep(0.2)
    simulated_results = {
        "latest ai news": "AI news: model context protocols and multi-agent orchestration are trending.",
        "weather": "Weather lookup unavailable in mock mode; integrate a weather API for production.",
    }
    return simulated_results.get(query.lower(), f"Mock search result for '{query}': no direct hit, but related sources found.")


@tool
async def bm25_retrieval_tool(
    query: Annotated[str, "Search query to find relevant documents using BM25 keyword ranking"]
):
    """Search the indexed documents using BM25. Use this when you need to find information from the project knowledge base or documented content."""

    retriever = get_bm25_retriever(k=4)
    # BM25Retriever.invoke is sync; run in thread to avoid blocking
    docs = await asyncio.to_thread(retriever.invoke, query)
    if not docs:
        return "No matching documents found."
    return "\n\n---\n\n".join(doc.page_content for doc in docs)


def get_tools():
    return [calculator_tool, web_search_tool, bm25_retrieval_tool]
