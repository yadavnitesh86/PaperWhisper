from contextlib import asynccontextmanager

from fastapi import FastAPI
from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver

from document_rag.api.database import init_db
from document_rag.api.routes import auth, chat, documents
from document_rag.vector_store.factor.factor import get_checkpointer_db_path


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()

    db_path = get_checkpointer_db_path()

    async with AsyncSqliteSaver.from_conn_string(db_path) as checkpointer:
        app.state.checkpointer = checkpointer
        yield


app = FastAPI(title="Document RAG API", lifespan=lifespan)

app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(chat.router)

# Deliberately NOT mounting fastapi_users.get_users_router(...) here —
# that router exposes PATCH /users/me, which would let username
# change. Leaving it out is what keeps username immutable.
