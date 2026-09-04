import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, UploadFile

from document_rag.config.config import load_config
from document_rag.api.models import User
from document_rag.vector_store.qdant.qdant import ingest_user_documents
from document_rag.api.schemas import UploadResponse
from document_rag.api.users import current_active_user

router = APIRouter(prefix="/documents", tags=["documents"])

config = load_config()
UPLOAD_DIR = config["memory"]["UPLOAD_DIR"]
@router.post("/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile, current_user: User = Depends(current_active_user)):
    user_id = current_user.username
    filename = Path(file.filename or "upload").name  # strips any directory components
    document_dir = Path(UPLOAD_DIR) / user_id / str(uuid.uuid4())
    document_dir.mkdir(parents=True, exist_ok=True)

    destination = document_dir / filename
    destination.write_bytes(await file.read())

    result = ingest_user_documents(
        file_dir=str(document_dir),
        user_id=user_id,
        collection_name="rag_document",
    )

    return UploadResponse(
        filename=filename,
        ingested_chunks=result["ingested_chunks"],
        failed_files=result["failed_files"],
    )
