from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from document_rag.api.conversations import delete_thread_checkpoints, get_owned_conversation
from document_rag.api.database import get_db
from document_rag.api.dependencies import get_checkpointer
from document_rag.api.models import Conversation, User
from document_rag.agent.agent import get_agent
from document_rag.agent.retriever_tool import create_search_tool
from document_rag.api.schemas import ChatRequest, ChatResponse, ConversationResponse, NewChatResponse
from document_rag.api.users import current_active_user

router = APIRouter(tags=["chat"])


@router.post("/chats", response_model=NewChatResponse)
async def create_chat(
    current_user: User = Depends(current_active_user),
    db: AsyncSession = Depends(get_db),
):
    conversation = Conversation(username=current_user.username, title="New Chat")
    db.add(conversation)
    await db.commit()
    await db.refresh(conversation)
    return NewChatResponse(thread_id=conversation.thread_id, title=conversation.title)


@router.get("/chats", response_model=list[ConversationResponse])
async def list_chats(
    current_user: User = Depends(current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Conversation)
        .where(Conversation.username == current_user.username)
        .order_by(Conversation.updated_at.desc())
    )
    return result.scalars().all()


@router.get("/chats/{thread_id}", response_model=ConversationResponse)
async def get_chat(
    thread_id: str,
    current_user: User = Depends(current_active_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_owned_conversation(db, thread_id, current_user.username)


@router.delete("/chats/{thread_id}", status_code=204)
async def delete_chat(
    thread_id: str,
    current_user: User = Depends(current_active_user),
    db: AsyncSession = Depends(get_db),
    checkpointer=Depends(get_checkpointer),
):
    conversation = await get_owned_conversation(db, thread_id, current_user.username)
    await db.delete(conversation)
    await db.commit()
    delete_thread_checkpoints(checkpointer, thread_id)


@router.post("/chat/{thread_id}", response_model=ChatResponse)
async def send_message(
    thread_id: str,
    payload: ChatRequest,
    current_user: User = Depends(current_active_user),
    db: AsyncSession = Depends(get_db),
    checkpointer=Depends(get_checkpointer),
):
    conversation = await get_owned_conversation(db, thread_id, current_user.username)
    user_id = current_user.username  # <-- the RAG identity, straight from the token, never from the request

    search_tool = create_search_tool(user_id=user_id, collection_name="rag_document")
    agent = get_agent(tools=[search_tool], checkpointer=checkpointer)

    
    result = await agent.ainvoke(
        {"messages": [{"role": "user", "content": payload.message}]},
        config={"configurable": {"thread_id": thread_id}},
    )

    conversation.updated_at = datetime.utcnow()
    await db.commit()

    answer = result["messages"][-1].content
    return ChatResponse(thread_id=thread_id, answer=answer)
