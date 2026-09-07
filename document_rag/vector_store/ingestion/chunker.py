from document_rag.config.config import load_config
from langchain_text_splitters import RecursiveCharacterTextSplitter
import logfire
from document_rag.vector_store.ingestion.loader import document_to_doc

config = load_config()

text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=config["chunks"]["chunk_size"],
        chunk_overlap=config["chunks"]["chunk_overlap"],
        length_function=len,
        separators=["\n\n", "\n", " ", ""]
    )
@logfire.instrument()
def doc_to_chunks(docs):
    logfire.info("Starting doc_to chunks loading")
    with logfire.span("Splitting documents into chunks"):
        try:
            chunks = text_splitter.split_documents(docs)
            logfire.info("Loaded {num} of chunks  ",num=len(chunks))
            return chunks
        except Exception as e:
            logfire.error("Failed to chunks the doc Exception : {name}: ",name=str(e))
            raise 


