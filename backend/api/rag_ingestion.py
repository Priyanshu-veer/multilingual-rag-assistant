# RAG Ingestion pipeline
from rag.ingestion.chunks import split_doc
from rag.ingestion.load_document import load_pdf
from rag.embeddings.services import EmbeddingManager
from database.vector_store import VectorStoreManager

print("[RAG] Creating EmbeddingManager...")
embedding_manager = EmbeddingManager()

print("[RAG] Creating VectorStoreManager...")
vector_store = VectorStoreManager()

def report_progress(stage, message):
    print(f"[{stage}] {message}")


def ingest_pdf(file_path, progress=None):
    
    # Document progress
    if progress is None:
        progress = report_progress

    # 1. Load PDF
    progress("loading", "Loading PDF...")
    documents = load_pdf(file_path)

    # 2. Split into chunks
    progress("chunking", "Splitting document into chunks...")
    chunks = split_doc(documents)

    # 3. Generate embeddings — reuse the global model, don't reload it
    progress("embedding", "Generating embeddings...")
    text = [chunk.page_content for chunk in chunks]
    embeddings_vector = embedding_manager.generate_embedding(text)

    # 4. Store in Supabase — reuse the global client too
    progress("storing", "Storing vectors in Supabase...")
    vector_store.add_documents(chunks, embeddings_vector)

    progress("completed", "File processed successfully.")

    return "Vector store generated successfully"
