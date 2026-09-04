from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class UploadResponse(BaseModel):
    filename: str
    ingested_chunks: int
    failed_files: list[str]


class NewChatResponse(BaseModel):
    thread_id: str
    title: str


class ConversationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    thread_id: str
    title: str
    created_at: datetime
    updated_at: datetime


class ChatRequest(BaseModel):
    message: str = Field(min_length=1)


class ChatResponse(BaseModel):
    thread_id: str
    answer: str
