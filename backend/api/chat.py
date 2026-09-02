# Chat API
from pydantic import BaseModel
from rag.LLM.llm import groq_llm
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from rag.retrieval.retriever import RAGRetriever
from rag.generation.generator import generate_output
from backend.api.document_state import document_state
from backend.api.rag_ingestion import (embedding_manager,vector_store)

# app route
router = APIRouter()

# Request model
class ChatRequest(BaseModel):
    query: str

# Initialize RAG components
rag_retriever = RAGRetriever(embedding_manager,vector_store)
llm = groq_llm

# root endpoint
@router.get('/')
def about():
    return {'message':'This is multilingual RAG based assistant'}

# Chat endpoint
@router.post("/chat")
async def chat(request: ChatRequest):

    # Validate query
    query = request.query.strip()

    if not query:
        raise HTTPException(status_code=400,detail="Query cannot be empty.")

    # Block Chat_input only while PDF processing is active
    if document_state.is_processing():

        raise HTTPException(
            status_code=409,
            detail=(
                "Document is currently being processed. "
                "Please wait until processing is complete."
            )
        )

    try:
        # Generate RAG response
        stream, sources = generate_output(query,rag_retriever,llm,top_k=5,score_threshold=0.30)

        def stream_text(stream):

            try:
                thinking = False

                for chunk in stream:

                    print("RAW CHUNK:", repr(chunk))

                    content = chunk.content

                    if not content:
                        continue

                    # Normal string content
                    if isinstance(content, str):

                        text = content

                        # Start of thinking
                        if "<think>" in text:
                            thinking = True

                            # Remove everything before/including <think>
                            text = text.split("<think>", 1)[1]

                        # End of thinking
                        if "</think>" in text:
                            thinking = False

                            # Keep only content after </think>
                            text = text.split("</think>", 1)[1]

                        # If currently thinking, don't send it
                        if thinking:
                            print("THINKING:", repr(text))
                            continue

                        if text:
                            print("SEND:", repr(text))
                            yield text

                    
                    # List content
                    elif isinstance(content, list):

                        for item in content:

                            if not isinstance(item, dict):
                                continue

                            text = item.get("text", "")

                            if not text:
                                continue

                            if "<think>" in text:
                                thinking = True
                                text = text.split("<think>", 1)[1]

                            if "</think>" in text:
                                thinking = False
                                text = text.split("</think>", 1)[1]

                            if thinking:
                                continue

                            if text:
                                print("SEND:", repr(text))
                                yield text

            except Exception as e:

                print("STREAM ERROR:", repr(e))

                yield f"\n[ERROR] {str(e)}"

        return StreamingResponse(
            stream_text(stream),
            media_type="text/plain; charset=utf-8",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
            }
        )
    except Exception as e:
        print("CHAT ERROR:",repr(e))
        raise HTTPException(status_code=500,detail=str(e))
    