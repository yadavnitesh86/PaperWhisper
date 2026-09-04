from contextlib import asynccontextmanager
from fastapi import FastAPI

from document_rag.api.database import init_db
from document_rag.api.routes import auth, chat, documents

from document_rag.vector_store.factor.factor import get_checkpointer


@asynccontextmanager
async def lifespan(app: FastAPI):

    await init_db()

    async with get_checkpointer() as checkpointer:
        app.state.checkpointer = checkpointer

        yield


app = FastAPI(
    title="Document RAG API",
    lifespan=lifespan,
)

app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(chat.router)