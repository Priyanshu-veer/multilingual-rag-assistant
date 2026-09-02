# Upload API
import os
import hashlib
import tempfile
import threading

from dotenv import load_dotenv
from supabase import create_client

from backend.api.rag_ingestion import ingest_pdf
from backend.api.document_state import document_state
from fastapi import APIRouter, UploadFile, File, HTTPException

# Load API from .env
load_dotenv()

# Supabase URL & Screet KEY
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Chat route
router = APIRouter()

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Home route
@router.get("/home")
def home():
    return {"message": "Multilingual Assistant"}

# Status route
@router.get("/status")
def get_document_status():

    return document_state.get_state()
    
# Upload route
@router.post("/upload")
async def upload(file: UploadFile = File(...)):

    # file Duplicate funx in database
    def file_exists(filename: str) -> bool:
        try:
            files = supabase.storage.from_("pdf's").list("documents")

            return any(
                item.get("name") == filename
                for item in files
            )

        except Exception as e:
            print("[DOCUMENT] Duplicate check error:", e)
        return False

    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    if document_state.is_processing():
        raise HTTPException(
            status_code=409,
            detail="Another document is currently being processed.",
        )

    file_bytes = await file.read()
    if not file_bytes:

        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty."
        )

    # Generate deterministic ID
    digest = hashlib.sha256(file_bytes).hexdigest()

    extension = os.path.splitext(file.filename)[1].lower()

    storage_filename = f"{digest}{extension}"

    storage_path = f"documents/{storage_filename}"

    # Check duplicate
    try:

        existing = supabase.storage.from_("pdf's").list(
            "documents"
        )

        duplicate = any(
            item.get("name") == storage_filename
            for item in existing
        )

        if duplicate:

            document_state.duplicate(
                filename=file.filename
            )

            return {
                "status": "duplicate",
                "filename": file.filename
            }

    except Exception as e:

        print("Duplicate check failed:", e)

    document_state.start(filename=file.filename)

    # PROGRESS CALLBACK
    def send_progress(stage, message):
        print(f"[DOCUMENT] {stage}: {message}")

        if stage == "completed":
            document_state.complete()
        elif stage == "duplicate":
            document_state.duplicate(filename=file.filename)
        elif stage == "error":
            document_state.error(message)
        else:
            document_state.update(stage, message)

    # File Processing
    def process_file():
        temp_path = None
        try:
            send_progress("uploading", "Uploading PDF...")

            supabase.storage.from_("pdf's").upload(
                storage_path, file_bytes, {"content-type": "application/pdf"}
            )

            with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as temp_file:
                temp_file.write(file_bytes)
                temp_path = temp_file.name

            # 3. RAG INGESTION
            ingest_pdf(temp_path, progress=send_progress)

            # 4. CLEANUP
            if temp_path and os.path.exists(temp_path):
                os.remove(temp_path)
                temp_path = None


        except Exception as e:
            error_message = str(e)
            print("[DOCUMENT] Processing error:",error_message)

            if "Duplicate" in error_message:
                send_progress("duplicate", f"⚠️File already available: {file.filename}")
            else:
                send_progress("error", error_message)

            if (temp_path and os.path.exists(temp_path)):
                os.remove(temp_path)

    # START BACKGROUND THREAD
    thread = threading.Thread(target=process_file, daemon=True)
    thread.start()

    # RETURN IMMEDIATELY
    return {"status": "started", "filename":file.filename}