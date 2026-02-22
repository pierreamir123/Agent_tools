# Production AI Agent Application

This repository contains a production-ready full-stack AI Agent app with a React + TypeScript frontend and a FastAPI + LangChain backend using AWS Bedrock.

## Folder Structure

```text
.
├── backend/
│   ├── app/
│   │   ├── agent/
│   │   │   ├── builder.py
│   │   │   ├── config.py
│   │   │   └── tools.py
│   │   ├── schemas/
│   │   │   └── chat.py
│   │   └── main.py
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── chat/
│   │   │   └── ui/
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   └── utils.ts
│   │   ├── main.tsx
│   │   └── styles.css
│   ├── .env.example
│   ├── package.json
│   └── tailwind.config.ts
└── .env.example
```

## Frontend Architecture

- **Framework**: React + Vite + TypeScript.
- **UI**: TailwindCSS + shadcn-style components.
- **assistant-ui inspired shell**: chat-first layout, streaming transcript, tool-step lane, and composer area.
- **Streaming**: `lib/api.ts` uses `fetch` + `ReadableStream` to parse SSE payload chunks from `POST /api/chat`.
- **Features**:
  - Streaming response tokens
  - Markdown rendering (`react-markdown`)
  - Tool execution status cards
  - Loading indicator and error UI
  - In-memory chat history persistence
  - Clear conversation action

## Backend Architecture

- **Framework**: FastAPI (Python 3.11+)
- **Agent model**: LangChain `create_agent()` (modern architecture, no legacy executor)
- **LLM provider**: AWS Bedrock via `ChatBedrock`
- **Tools**:
  - `calculator_tool`
  - `web_search_tool` (mock retrieval)
- **Streaming**:
  - Async generator on server side
  - `StreamingResponse` emitting SSE events (`token`, `tool`, `done`, `error`)
- **Safety/ops**:
  - App-wide exception middleware
  - CORS configured from environment
  - Dependency-injected agent creation via FastAPI dependency function

## Environment Variables

### Backend
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `BEDROCK_MODEL_ID`
- `AGENT_TEMPERATURE`
- `CORS_ORIGIN`

### Frontend
- `VITE_API_BASE_URL`

Use `.env.example` files as templates.

## Setup Instructions

### 1) Backend setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

### 2) Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
```

## Run Instructions

### Run backend

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Run frontend

```bash
cd frontend
npm run dev -- --host 0.0.0.0 --port 5173
```

Open `http://localhost:5173`.

## API Contract

### `POST /api/chat`

Request body:

```json
{
  "messages": [
    { "role": "user", "content": "What is 21*2?" }
  ]
}
```

SSE stream events (`data: ...`):
- `{"type":"token","token":"..."}`
- `{"type":"tool","step":{...}}`
- `{"type":"done"}`
- `{"type":"error","error":"..."}`

## Production Deployment Recommendations

1. **Backend**
   - Run with multiple workers (Gunicorn + Uvicorn workers) behind Nginx/ALB.
   - Store secrets in AWS Secrets Manager or SSM Parameter Store (not `.env`).
   - Enable CloudWatch structured logging and distributed tracing.
   - Add request rate limiting and auth (JWT/API key).

2. **Frontend**
   - Build static assets and host on S3 + CloudFront, or Vercel/Netlify.
   - Set `VITE_API_BASE_URL` to the HTTPS API gateway/domain.
   - Use CSP headers and error telemetry (Sentry).

3. **Agent quality**
   - Add observability via LangSmith traces.
   - Add guardrails for tool input validation and output sanitization.
   - Add caching layer for deterministic tool responses.

4. **Scalability**
   - Externalize chat history to Redis/PostgreSQL.
   - Queue long-running tool calls with Celery/SQS workers.
   - Add canary release and health-check-driven rolling deploys.
