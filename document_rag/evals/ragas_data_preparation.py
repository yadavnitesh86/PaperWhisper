import asyncio
import json
import uuid
from pathlib import Path

from ragas import SingleTurnSample

from document_rag.agent.retriever_tool import create_search_tool
from document_rag.agent.agent import get_agent
from document_rag.vector_store.factor.factor import get_checkpointer


RESULT_FILE = Path(
    "document_rag/evals/evaluation_results.jsonl"
)


with open(
    "document_rag/evals/ragas_test_dataset.json",
    "r",
    encoding="utf-8",
) as f:
    test_cases = json.load(f)


async def initialize_sample_dataset():

    # Initialize checkpointer once
    async with get_checkpointer() as checkpointer:

        # Initialize retrievers/tools once per user
        user_resources = {}

        for user_id in { "yadavnitesh86", "aman545ddfd",}:

            search_tool, compression_retriever = create_search_tool(
                user_id=user_id,
                collection_name="rag_document",
            )

            agent = get_agent(
                tools=[search_tool],
                checkpointer=checkpointer,
            )

            user_resources[user_id] = {
                "retriever": compression_retriever,
                "agent": agent,
            }

        # Process test cases
        for test_case in test_cases:

            user_id = test_case["user_id"]
            question = test_case["question"]
            ground_truth = test_case["ground_truth"]

            retriever = user_resources[user_id]["retriever"]
            agent = user_resources[user_id]["agent"]

            print(f"\nUser: {user_id}")
            print(f"Question: {question}")

            # -------------------------
            # Retrieve documents
            # -------------------------

            docs = await retriever.ainvoke(question)

            retrieved_contexts = [
                doc.page_content
                for doc in docs
            ]

            # -------------------------
            # Generate answer
            # -------------------------

            thread_id = f"eval-{uuid.uuid4()}"

            result = await agent.ainvoke(
                {
                    "messages": [
                        {
                            "role": "user",
                            "content": question,
                        }
                    ]
                },
                config={
                    "configurable": {
                        "thread_id": thread_id,
                    }
                },
            )

            answer = result["messages"][-1].content

            # -------------------------
            # Create evaluation sample
            # -------------------------

            sample = SingleTurnSample(
                user_input=question,
                response=answer,
                retrieved_contexts=retrieved_contexts,
                reference=ground_truth,
            )

            # -------------------------
            # Persist immediately
            # -------------------------

            record = {
                "user_id": user_id,
                "thread_id": thread_id,
                "user_input": question,
                "response": answer,
                "retrieved_contexts": retrieved_contexts,
                "reference": ground_truth,
            }

            with RESULT_FILE.open("a",encoding="utf-8",) as f:

                f.write(
                    json.dumps(
                        record,
                        ensure_ascii=False,
                    )
                    + "\n"
                )

            print("Saved evaluation result.")
            await asyncio.sleep(15)


async def main():
    await initialize_sample_dataset()


if __name__ == "__main__":
    asyncio.run(main())