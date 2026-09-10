import uuid

import pytest

from document_rag.agent.agent import get_agent
from document_rag.agent.retriever_tool import create_search_tool
from document_rag.vector_store.factor.factor import get_checkpointer


@pytest.mark.asyncio
async def test_rag_agent_can_use_retriever():
    user_id = "yadavnitesh86"

    
    thread_id = str(uuid.uuid4())

    
    search_tool = create_search_tool(
        user_id=user_id,
        collection_name="rag_document",
    )

   
    async with get_checkpointer() as checkpointer:

        # Create the real LangGraph agent.
        agent = get_agent(
            tools=[search_tool],
            checkpointer=checkpointer,
        )

        # Giving  the agent an explicit instruction to use the retriever.
        result = await agent.ainvoke(
            {
                "messages": [
                    {
                        "role": "user",
                        "content": (
                            "Use the retriever tool to search for information. "
                            "If the retriever tool executes successfully, "
                            "reply with exactly: Yes"
                            "Do not output anything else."
                        ),
                    }
                ]
            },
            config={
                "configurable": {
                    "thread_id": thread_id,
                }
            },
        )

    
    final_message = result["messages"][-1]

    
    response = final_message.content

    assert response.strip() == "Yes"