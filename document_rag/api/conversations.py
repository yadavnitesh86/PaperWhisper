import sqlite3

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from document_rag.api.models import Conversation


async def get_owned_conversation(db: AsyncSession, thread_id: str, username: str) -> Conversation:
    result = await db.execute(select(Conversation).where(Conversation.thread_id == thread_id))
    conversation = result.scalar_one_or_none()

    if conversation is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Conversation not found")
    if conversation.username != username:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not your conversation")

    return conversation


def delete_thread_checkpoints(checkpointer, thread_id: str) -> None:
    """
    Deleting the Conversation row (app.db) does NOT delete the
    matching LangGraph checkpoint state (memory.db) — separate SQLite
    files. This is the explicit second step.
    """
    if hasattr(checkpointer, "delete_thread"):
        checkpointer.delete_thread(thread_id)
        return

    conn = checkpointer.conn
    for table in ("checkpoints", "checkpoint_writes", "checkpoint_blobs"):
        try:
            conn.execute(f"DELETE FROM {table} WHERE thread_id = ?", (thread_id,))
        except sqlite3.OperationalError:
            pass
    conn.commit()
