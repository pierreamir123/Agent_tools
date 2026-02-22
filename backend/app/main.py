from __future__ import annotations

import json
import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse

from app.agent.builder import build_agent
from app.agent.config import Settings, get_settings
from app.schemas.chat import ChatRequest

logger = logging.getLogger("agent_api")


@asynccontextmanager
async def lifespan(_: FastAPI):

    logging.basicConfig(level=logging.INFO)
    yield


app = FastAPI(title="AI Agent Backend", lifespan=lifespan)


@app.middleware("http")
async def catch_exceptions(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Unhandled server error", exc_info=exc)
        return JSONResponse(
            status_code=500, content={"detail": "Internal server error"}
        )


settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_agent(config: Settings = Depends(get_settings)):
    return build_agent(config)


async def stream_agent_events(agent, payload: ChatRequest) -> AsyncGenerator[str, None]:
    input_payload = {
        "messages": [
            {"role": message.role, "content": message.content}
            for message in payload.messages
        ]
    }

    async for event in agent.astream_events(input_payload, version="v2"):
        event_name = event.get("event")
        data = event.get("data", {})
        run_id = event.get("run_id")

        if event_name == "on_chat_model_stream":
            chunk = data.get("chunk")
            if chunk and chunk.content:
                # Optimized: yield the entire content chunk at once if it's a string
                # or as-is if it's already a single token.
                content = chunk.content
                if isinstance(content, list):
                    # Handle cases where content might be a list of blocks
                    for block in content:
                        if isinstance(block, dict) and "text" in block:
                            yield f"data: {json.dumps({'type': 'token', 'token': block['text']})}\n\n"
                else:
                    yield f"data: {json.dumps({'type': 'token', 'token': str(content)})}\n\n"

        if event_name == "on_tool_start":
            yield f"data: {json.dumps({'type': 'tool', 'step': {'id': run_id, 'toolName': event.get('name', 'tool'), 'input': str(data.get('input', {})), 'status': 'started'}})}\n\n"

        if event_name == "on_tool_end":
            yield f"data: {json.dumps({'type': 'tool', 'step': {'id': run_id, 'toolName': event.get('name', 'tool'), 'input': '', 'output': str(data.get('output', '')), 'status': 'completed'}})}\n\n"

    yield f"data: {json.dumps({'type': 'done'})}\n\n"


@app.post("/api/chat")
async def chat(payload: ChatRequest, agent=Depends(get_agent)):
    async def event_generator() -> AsyncGenerator[str, None]:
        try:
            async for event in stream_agent_events(agent, payload):
                yield event
        except Exception as exc:  # noqa: BLE001
            logger.exception("Streaming error", exc_info=exc)
            yield f"data: {json.dumps({'type': 'error', 'error': str(exc)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@app.get("/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="localhost", port=8000)
