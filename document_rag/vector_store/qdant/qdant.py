
import os
import logging
from dotenv import load_dotenv

import logfire
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Filter,
    FieldCondition,
    MatchValue,
    PayloadSchemaType,
)
from langchain_qdrant import QdrantVectorStore, RetrievalMode, FastEmbedSparse

from document_rag.vector_store.factor.factor import get_dense_ef
from document_rag.vector_store.ingestion.loader import document_to_doc
from document_rag.vector_store.ingestion.chunker import doc_to_chunks

load_dotenv()

QDRANT_URL ="https://5b794885-5a61-4251-a00f-c33dbbf2f481.sa-east-1-0.aws.cloud.qdrant.io"# os.getenv("QDRANT_URL")
QDRANT_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIiwic3ViamVjdCI6ImFwaS1rZXk6NmU2NjkxOGItMTExNS00N2Q4LWFmMjItNDYwMzdlMDkwYzk2In0.uAtmvqP6IqVR5hKh03k0izlc09fCFjOJAjV4eGr10DQ"
# os.getenv("QDRANT_API_KEY")

# Config (move to pydantic-settings later if you want these env-driven)
DEFAULT_BATCH_SIZE = 100
DEFAULT_TOP_K = 15
SPARSE_MODEL_NAME = "Qdrant/bm25"

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# One shared client for the whole module instead of one per function
# ---------------------------------------------------------------------------
_client: QdrantClient | None = None


def get_client() -> QdrantClient:
    global _client
    if _client is None:
        _client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
    return _client


def _sparse_embedding() -> FastEmbedSparse:
    return FastEmbedSparse(model_name=SPARSE_MODEL_NAME)


# ---------------------------------------------------------------------------
# Collection existence check — only checks, never creates
# ---------------------------------------------------------------------------
@logfire.instrument()
def hybrid_collection_exists(collection_name: str) -> bool:
    client = get_client()

    collections = client.get_collections().collections

    return any(
        collection.name == collection_name
        for collection in collections
    )


@logfire.instrument()
def load_existing_hybrid_store(
    collection_name: str,
) -> QdrantVectorStore:

    logfire.info(
        "Using existing hybrid collection: {name}",
        name=collection_name,
    )

    return QdrantVectorStore(
        client=get_client(),
        collection_name=collection_name,
        embedding=get_dense_ef(),
        sparse_embedding=_sparse_embedding(),
        retrieval_mode=RetrievalMode.HYBRID,
    )


def get_or_load_hybrid_store(collection_name: str) -> QdrantVectorStore | None:
    """Single entry point for 'give me the store for this collection'.

    Returns the loaded store if the collection exists, or None if it doesn't
    (meaning ingestion needs to run first). This is what actually calls
    load_existing_hybrid_store, instead of it sitting unused.
    """
    if hybrid_collection_exists(collection_name):
        return load_existing_hybrid_store(collection_name)
    return None


# ---------------------------------------------------------------------------
# user_id payload index — created once, at collection-creation time
# ---------------------------------------------------------------------------
def ensure_user_id_index(collection_name: str) -> None:
    """Creates a keyword index for 'user_id' if it doesn't already exist.

    This MUST run before (or immediately after) the collection is created,
    or filtering by user_id in the retriever will silently return empty
    results instead of erroring.
    """
    client = get_client()
    try:
        client.create_payload_index(
        collection_name=collection_name,
        field_name="metadata.user_id",
        field_schema=PayloadSchemaType.KEYWORD,
        )
        logfire.info("Index created/verified for 'user_id' in {s}", s=collection_name)
    except Exception as e:
        if "already exists" in str(e).lower():
            logfire.info("Index for 'user_id' already exists in {s}", s=collection_name)
        else:
            raise


# ---------------------------------------------------------------------------
# Ingestion — returns a result dict, handles missing-metadata + failure cases
# ---------------------------------------------------------------------------
@logfire.instrument()
def ingest_user_documents(file_dir: str, user_id: str, collection_name: str) -> dict:
    """Parses and ingests all files in file_dir for a given user.

    Returns: {"ingested_chunks": int, "failed_files": list, "vector_store": ... | None}
    Deduplication is handled by Qdrant upsert on point ID.
    """
    failed_files: list[str] = []

    try:
        docs = document_to_doc(file_dir, user_id)  # PDF/DOCX/etc parsing happens here
    except Exception as e:
        logfire.error("Ingestion aborted — document_to_doc failed: {e}", e=e)
        return {"ingested_chunks": 0, "failed_files": [file_dir], "vector_store": None}

    chunks = doc_to_chunks(docs)  # chunking happens here

    if not chunks:
        logfire.warn("No chunks generated for user {uid}", uid=user_id)
        return {"ingested_chunks": 0, "failed_files": failed_files, "vector_store": None}

  

    # Ensure the collection is filterable before upserting new data.
    
    vector_store = QdrantVectorStore.from_documents(
        documents=chunks,
        embedding=get_dense_ef(),
        sparse_embedding=_sparse_embedding(),
        retrieval_mode=RetrievalMode.HYBRID,
        url=QDRANT_URL,
        api_key=QDRANT_API_KEY,
        collection_name=collection_name,
        batch_size=DEFAULT_BATCH_SIZE,
    )
    ensure_user_id_index(collection_name)

    logfire.info(
        "Ingested {count} chunks for user {uid}",
        count=len(chunks), uid=user_id,
    )

    return {
        "ingested_chunks": len(chunks),
        "failed_files": failed_files,
        "vector_store": vector_store,
    }


# ---------------------------------------------------------------------------
# Retrieval — now uses get_or_load_hybrid_store and fails clearly if the
# collection doesn't exist, instead of assuming it's already there
# ---------------------------------------------------------------------------
def get_hybrid_user_retriever(user_id: str, collection_name: str, k: int = DEFAULT_TOP_K):
    """Hybrid retriever scoped to a single user via a Qdrant payload filter."""
    store = get_or_load_hybrid_store(collection_name)
    if store is None:
        raise ValueError(
            f"Collection '{collection_name}' does not exist yet — "
            f"run ingest_user_documents() before querying it."
        )

    ensure_user_id_index(collection_name)
    user_filter = Filter(
    must=[
        FieldCondition(
            key="metadata.user_id",
            match=MatchValue(value=user_id)
        )
    ]
)

    return store.as_retriever(
        search_kwargs={
            "k": k,
            "filter": user_filter,
        }
    )


if __name__ == "__main__":
    USER_ID = "yadavnitesh86"
    COLLECTION_NAME = "rag_document"

    client = get_client()

    points, _ = client.scroll(
        collection_name="rag_document",
        limit=5,
        with_payload=True,
        with_vectors=False,
    )

    for point in points:
        print("=" * 60)
        print("ID:", point.id)
        print("PAYLOAD:")
        print(point.payload)

    retriever = get_hybrid_user_retriever(
        user_id=USER_ID,
        collection_name=COLLECTION_NAME,
        k=5,
    )

    print("Retriever created!")

    results = retriever.invoke(
        "what is matplotlib"
    )

    print("Results:", len(results))

    for i, doc in enumerate(results, 1):
        print(f"\n--- Result {i} ---")
        print(doc.page_content[:500])
        print("Metadata:", doc.metadata)
    
