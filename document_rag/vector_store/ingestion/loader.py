from pathlib import Path
import logfire
import os
from langchain_community.document_loaders import (
    TextLoader,
    PyPDFLoader,
    Docx2txtLoader,
)
from dotenv import load_dotenv

load_dotenv()
logfire.configure(token=os.getenv("LOGFIRE_TOKEN"))

@logfire.instrument()
def document_to_doc(path: str, user_id: str):
    """Load raw documents from directory. Chunking should be done separately."""
    
    logfire.info("Starting document loading", path=path, user_id=user_id)
    
    path_obj = Path(path)
    
    if not path_obj.exists() or not path_obj.is_dir():
        logfire.error("Path invalid: {path}", path=path)
        return []

    docs = []
    
    #  Loads PDFs 
    pdf_files = list(path_obj.glob("**/*.pdf"))
    if pdf_files:
        logfire.info("Loading {count} PDF files...", count=len(pdf_files))
        for pdf in pdf_files:
            with logfire.span("Loading PDF", file=pdf.name):
                try:
                    loader = PyPDFLoader(str(pdf))
                    batch = loader.load()  # Returns Documents, NOT chunks
                    for doc in batch:
                        doc.metadata["user_id"] = user_id
                    docs.extend(batch)
                except Exception as e:
                    logfire.error("Failed PDF {name}: {error}", name=pdf.name, error=str(e))

    #  Loads DOCX 
    docx_files = list(path_obj.glob("**/*.docx"))
    if docx_files:
        logfire.info("Loading {count} DOCX files...", count=len(docx_files))
        for docx in docx_files:
            with logfire.span("Loading DOCX", file=docx.name):
                try:
                    loader = Docx2txtLoader(str(docx))
                    batch = loader.load()
                    for doc in batch:
                        doc.metadata["user_id"] = user_id
                    docs.extend(batch)
                except Exception as e:
                    logfire.error("Failed DOCX {name}: {error}", name=docx.name, error=str(e))

    # Loads TXT/MD 
    text_files = list(path_obj.glob("**/*.txt")) + list(path_obj.glob("**/*.md"))
    if text_files:
        logfire.info("Loading {count} Text/MD files...", count=len(text_files))
        for txt in text_files:
            with logfire.span("Loading Text", file=txt.name):
                try:
                    loader = TextLoader(str(txt), encoding="utf-8")
                    batch = loader.load()
                    for doc in batch:
                        doc.metadata["user_id"] = user_id
                    docs.extend(batch)
                except Exception as e:
                    logfire.error("Failed Text {name}: {error}", name=txt.name, error=str(e))

    logfire.info("Successfully loaded {total} documents.", total=len(docs))
    return docs

