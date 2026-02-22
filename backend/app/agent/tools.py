from __future__ import annotations

import asyncio
import math
from typing import Annotated

from langchain_core.tools import tool


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


def get_tools():
    return [calculator_tool, web_search_tool]
