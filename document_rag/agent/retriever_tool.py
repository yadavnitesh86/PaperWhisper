from langchain_core.tools import tool
from langchain_community.document_compressors import FlashrankRerank
from langchain_classic.retrievers import ContextualCompressionRetriever
from document_rag.vector_store.qdant.qdant import get_hybrid_user_retriever
def create_search_tool(user_id: str, collection_name: str):

    # 1. User-scoped hybrid retriever
    retriever = get_hybrid_user_retriever(
        user_id=user_id,
        collection_name=collection_name,
    )

    # 2. Reranker
    reranker = FlashrankRerank(
        model="ms-marco-MiniLM-L-12-v2",
        top_n=5,
    )

    # 3. Combine retriever + reranker
    compression_retriever = ContextualCompressionRetriever(
        base_compressor=reranker,
        base_retriever=retriever,
    )

    # 4. Tool used by your agent
    @tool
    def search_documents(query: str) -> str:
        """Search the current user's documents."""

        docs = compression_retriever.invoke(query)
        print(f"Reranked documents returned: {len(docs)}")

        if not docs:
            return "No relevant documents found."

        return "\n\n---\n\n".join(
            f"Content:\n{doc.page_content}\n"
            f"Metadata:\n{doc.metadata}"
            for doc in docs
        )

    return search_documents