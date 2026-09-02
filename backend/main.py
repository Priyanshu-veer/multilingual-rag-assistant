# main file
from fastapi import FastAPI
from backend.api.chat import router as chat_router
from fastapi.middleware.cors import CORSMiddleware
from backend.api.upload import router as upload_router


app = FastAPI(title="Multilingual RAG Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# upload API
app.include_router(upload_router)

# chat API
app.include_router(chat_router)
