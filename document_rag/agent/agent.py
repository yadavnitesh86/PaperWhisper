from typing import Any


import asyncio
from langchain.agents import create_agent
from document_rag.vector_store.factor.factor import get_llm
from langchain.agents.middleware import SummarizationMiddleware
from langchain.agents.middleware import ToolCallLimitMiddleware


system_prompt = """You are a document QA agent. Use the search_documents tool as your only source of factual information.

Always search the documents before answering.

Answer only from retrieved content.

If the answer isn't found, say you couldn't find it in the documents.

Never guess or use outside knowledge.

Use returned metadata such as source/page when relevant.
"""


def get_agent(tools, checkpointer):

    llm = get_llm()

    return create_agent(
        model=llm,
        tools=tools,
        system_prompt=system_prompt,
        checkpointer=checkpointer,
        middleware=[SummarizationMiddleware[Any, None](model=llm,trigger=("tokens", 12000),keep=("messages", 10),),
        ToolCallLimitMiddleware(thread_limit=10, run_limit=5)]
    )


