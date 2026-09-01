import json
from langchain_core.tools import tool

from document_rag.vector_store.qdant.qdant import get_hybrid_user_retriever


def create_search_tool(user_id: str, collection_name: str):

    retriever = get_hybrid_user_retriever(
        user_id=user_id,
        collection_name=collection_name,
        k=5,
    )

    @tool
    def search_documents(query: str) -> str:
        """Search the current user's documents."""

        docs = retriever.invoke(query)

        if not docs:
            return "No relevant documents found."

        return "\n\n---\n\n".join(
            f"Content:\n{doc.page_content}\n"
            f"Metadata:\n{doc.metadata}"
            for doc in docs
        )

    return search_documents