import uuid
from datetime import datetime

from fastapi_users.db import SQLAlchemyBaseUserTableUUID
from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from document_rag.api.database import Base


class User(SQLAlchemyBaseUserTableUUID, Base):
    """
    SQLAlchemyBaseUserTableUUID already gives us, for free:
      id (UUID, primary key), email, hashed_password,
      is_active, is_superuser, is_verified

    `email` stays on the table only because FastAPI Users hardcodes it
    as a required column on every user model — this project never
    shows it to anyone or uses it for anything (see users.py).
    `username` is the field this project actually cares about: it's
    what gets checked at login, and it's what becomes the RAG
    user_id everywhere else in the app.
    """

    __tablename__ = "users"

    username: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)


class Conversation(Base):
    __tablename__ = "conversations"

    thread_id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username: Mapped[str] = mapped_column(ForeignKey("users.username"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String, default="New Chat")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
