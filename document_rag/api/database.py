
from pathlib import Path

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from document_rag.config.config import load_config

config = load_config()
APP_DB_PATH = config["memory"]["APP_DB_PATH"]

Path(APP_DB_PATH).parent.mkdir(parents=True, exist_ok=True)


class Base(DeclarativeBase):
    pass


engine = create_async_engine(f"sqlite+aiosqlite:///{APP_DB_PATH}")
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def init_db() -> None:
    from document_rag.api import models  # noqa: F401 — registers the models below on Base

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
