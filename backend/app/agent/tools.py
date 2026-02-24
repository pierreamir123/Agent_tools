from __future__ import annotations

import asyncio
import math
from typing import Annotated

from langchain_core.tools import tool


from langchain_community.agent_toolkits import O365Toolkit
from app.agent.config import Settings


@tool
def calculator_tool(
    expression: Annotated[str, "Math expression using basic operators"],
):
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
    return simulated_results.get(
        query.lower(),
        f"Mock search result for '{query}': no direct hit, but related sources found.",
    )


def get_tools(settings: Settings | None = None):
    tools = [calculator_tool, web_search_tool]

    if settings and settings.o365_client_id and settings.o365_client_secret:
        try:
            toolkit = O365Toolkit()
            # Only include calendar-related tools as requested
            o365_tools = [
                t
                for t in toolkit.get_tools()
                if t.name in ["events_search", "create_calendar_event"]
            ]
            tools.extend(o365_tools)
        except Exception as e:
            print(f"Failed to initialize O365 toolkit: {e}")

    return tools
