from langchain_huggingface import HuggingFaceEndpointEmbeddings
from document_rag.config.config import load_config
from dotenv import load_dotenv
import logfire
import os 
from pathlib import Path
from langgraph.checkpoint.sqlite import SqliteSaver
from contextlib import contextmanager


load_dotenv()
config = load_config()
HF_TOKEN = os.getenv("HF_TOKEN")

def get_dense_ef():
    return HuggingFaceEndpointEmbeddings(
        model="sentence-transformers/all-MiniLM-L6-v2",
        provider="hf-inference",
    )
    return embeddings


def get_llm():
    provider = config["give_llm"]["provider"]
    model = config["give_llm"]["model"]
    base_url = config["give_llm"]["base_url"]

    if provider == "ChatGroq":
        from langchain_groq import ChatGroq

            
        return ChatGroq(model=model)

    elif provider == "anthropic":
        from langchain_anthropic import ChatAnthropic

            
        return ChatAnthropic(model=model)

    else:
        from langchain_openai import ChatOpenAI
        if base_url:
            print("using base url")
            return ChatOpenAI(model=model,api_key=os.getenv("OPENAI_API_KEY"),base_url=base_url)
        else:
            print("without using base url")
            return ChatOpenAI(model=model)


def get_checkpointer_db_path() -> str:
    db_path = config["memory"]["db_path"]
    Path(db_path).parent.mkdir(parents=True, exist_ok=True)
    return db_path

@contextmanager
def get_checkpointer():
    db_path = get_checkpointer_db_path()

    with SqliteSaver.from_conn_string(db_path) as checkpointer:
        yield checkpointer

if __name__ == "__main__":
    llm = get_llm()
    result = llm.invoke("hello")
    print(result)