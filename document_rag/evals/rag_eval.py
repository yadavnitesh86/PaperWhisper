import json
from pathlib import Path
from openai import OpenAI
from ragas import EvaluationDataset, SingleTurnSample, evaluate
from ragas.metrics._context_precision import LLMContextPrecisionWithReference
from ragas.metrics._context_recall import LLMContextRecall
from ragas.metrics._faithfulness import Faithfulness
from ragas.llms import llm_factory
from document_rag.vector_store.factor.factor import   get_dense_ef
from document_rag.config.config import load_config
import os
from dotenv import load_dotenv
from ragas.run_config import RunConfig

RESULT_FILE = Path(
    "document_rag/evals/evaluation_results.jsonl"
)
load_dotenv()

config = load_config()
samples = []

with RESULT_FILE.open("r", encoding="utf-8") as f:
    for line in f:
        record = json.loads(line)

        sample = SingleTurnSample(
            user_input=record["user_input"],
            response=record["response"],
            retrieved_contexts=record["retrieved_contexts"],
            reference=record["reference"],
        )

        samples.append(sample)


dataset = EvaluationDataset(samples=samples)
client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=config["rag_llm"]["base_url"],
    
    default_headers={
        "User-Agent": "claude-cli/2.0.0 (external, cli)"
    }
)

run_config = RunConfig(
    max_workers=1,
    max_retries=10,
    max_wait=60,
)

evaluator_llm = llm_factory(
   config["rag_llm"]["model"],
    client=client,
    max_tokens=15000,
)
regas_embeddings = get_dense_ef()


if __name__ == "__main__":

    results = evaluate(
        dataset=dataset,
        metrics=[LLMContextRecall(),
        Faithfulness(),
        LLMContextPrecisionWithReference()
        ],
        llm=evaluator_llm,
        # run_config=run_config,
    )
    print("\n=== Individual Results ===")
    print(results.to_pandas())

    print("\n=== Average Scores ===")
    print(results.to_pandas().mean(numeric_only=True))
