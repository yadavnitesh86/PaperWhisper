from langchain.agents import create_agent

from document_rag.vector_store.factor.factor import get_llm

system_prompt = """ You are a document QA agent. Use the search_documents tool as your only source of factual information.

Always search the documents before answering.
Answer only from retrieved content.
If the answer isn't found, say you couldn't find it in the documents.
Never guess or use outside knowledge.
Use returned metadata such as source/page when relevant. """

def get_agent(tools,checkpointer):
    llm = get_llm()
    return create_agent(model = llm,
        tools=tools,
        system_prompt=system_prompt,
        checkpointer=checkpointer
    )

if __name__ == "__main__":
    print("reached main\n")

    USER_ID = "yadavnitesh86"
    COLLECTION_NAME = "rag_document"

    from document_rag.agent.retriever_tool import create_search_tool
    from document_rag.vector_store.factor.factor import get_checkpointer

    print("reached till tool")

    tool = create_search_tool(
        user_id=USER_ID,
        collection_name=COLLECTION_NAME,
    )

    tools = [tool]

    print("reached till agent\n")

    with get_checkpointer() as checkpointer:

        agent = get_agent(
            tools=tools,
            checkpointer=checkpointer,
        )

        result = agent.invoke(
            {
                "messages": [
                    {
                        "role": "user",
                        "content": "Search my documents",
                    }
                ]
            },
            config={
                "configurable": {
                    "thread_id": "test-123",
                }
            },
        )

        print(result["messages"][-1].content)

    print("success\n")
