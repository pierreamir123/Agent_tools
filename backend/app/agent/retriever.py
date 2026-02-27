"""BM25 retriever and document store for the agent."""

from __future__ import annotations

import os
from pathlib import Path
from functools import lru_cache

from langchain_core.documents import Document
from langchain_community.retrievers import BM25Retriever

# Default in-memory corpus: the agent can search over these documents.
# Add more Document(...) entries here, or use a folder (see below).
DEFAULT_DOCUMENTS = [
    Document(
        page_content="This project is an AI agent with tools. It uses LangChain and AWS Bedrock for the model."
    ),
    Document(
        page_content="The agent supports a calculator tool for arithmetic and a web search tool. BM25 retrieval is available for document search."
    ),
    Document(
        page_content="BM25 is a ranking function that scores documents by relevance to a search query. It works well for keyword-style search without an external search engine."
    ),
    Document(
        page_content="To add more documents for BM25 search, extend DEFAULT_DOCUMENTS in this file or set BM25_DOCS_DIR to a folder path containing .txt or .md files."
    ),
    Document(
        page_content="The backend exposes a streaming chat API at POST /api/chat. The frontend connects to it for the chat interface."
    ),
    # --- FlairsTech company docs (searchable via BM25) ---
    Document(
        page_content="FlairsTech is a global AI-powered Managed Services Provider (MSP) headquartered in Montreal, Canada. The company has over 1,300 employees across five offices in North America, Europe, and Africa. Offices are located in Egypt, Canada (Montreal), and Poland. FlairsTech serves over 2,500 organizations worldwide and maintains a network of over 100 partners. The company is known for 24/7 availability, multilingual services (English, French, Polish, Italian, German, Arabic), and GDPR compliance. 95% of clients return with new projects."
    ),
    Document(
        page_content="FlairsTech services include: Technical Support with AI-powered quality monitoring; Application Maintenance with zero-downtime AI-powered software maintenance; Customer Experience and round-the-clock customer service and sales support; IT Help Desk for software and hardware support; Project Management Office (PMO) with expert guidance and cutting-edge tools; Accounting and financial streamlining; Sales Support and lead conversion; Portals and Intranet solutions; Full Cycle Software Development and scalable platforms development. Engagement models are project-based or resource-based with a three-phase approach: Assess, Deliver, and Optimize."
    ),
    Document(
        page_content="FlairsTech product AIMY QA: AIMY QA (AI MY Quality Assurance) is FlairsTech's AI-powered quality monitoring tool, announced by CEO Rami Fahim. It analyzes interactions across phone calls, email, chats, and tickets to provide data-driven insights for contact center and technical support teams, improving operational efficiency while maintaining data security. FlairsTech was announced as official awards partner for the TechBehemoths 2023 Awards. Website: flairstech.com."
    ),
]


def load_documents_from_directory(directory: str | Path) -> list[Document]:
    """Load .txt and .md files from a directory into LangChain Documents."""
    path = Path(directory).resolve()
    if not path.is_dir():
        return []
    docs: list[Document] = []
    for ext in ("*.txt", "*.md"):
        for file_path in path.glob(ext):
            try:
                text = file_path.read_text(encoding="utf-8", errors="replace").strip()
                if text:
                    docs.append(
                        Document(
                            page_content=text,
                            metadata={"source": str(file_path.name)},
                        )
                    )
            except OSError:
                continue
    return docs


def get_documents(docs_dir: str | None = None) -> list[Document]:
    """Return documents for BM25: DEFAULT_DOCUMENTS plus any loaded from docs_dir."""
    result = list(DEFAULT_DOCUMENTS)
    if docs_dir:
        result.extend(load_documents_from_directory(docs_dir))
    return result


@lru_cache(maxsize=8)
def _cached_bm25_retriever(k: int, docs_dir: str | None) -> BM25Retriever:
    documents = get_documents(docs_dir)
    return BM25Retriever.from_documents(documents, k=k)


def get_bm25_retriever(k: int = 4, docs_dir: str | None = None) -> BM25Retriever:
    """Return a cached BM25 retriever. Uses BM25_DOCS_DIR env if docs_dir is not passed."""
    if docs_dir is None:
        docs_dir = os.environ.get("BM25_DOCS_DIR", "").strip() or None
    return _cached_bm25_retriever(k, docs_dir)
