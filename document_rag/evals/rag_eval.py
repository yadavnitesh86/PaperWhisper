import json
from pathlib import Path

from ragas import EvaluationDataset, SingleTurnSample

RESULT_FILE = Path(
    "document_rag/evals/evaluation_results.jsonl"
)


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

print(f"Loaded {len(samples)} samples")