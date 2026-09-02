# Multilingual RAG Assistant

A production-style multilingual RAG (Retrieval-Augmented Generation) assistant — upload a PDF and ask questions in English, Hindi, or other languages, and get answers back in the same language.

---

## ✨ Features

- 📄 **PDF Upload & Processing** — Upload documents through a clean UI with real-time processing status (loading → chunking → embedding → storing).
- 🌐 **Multilingual Query & Response** — Ask questions in your own language; the assistant detects and responds in the same language using [BAAI/bge-m3](https://huggingface.co/BAAI/bge-m3) multilingual embeddings.
- 🔒 **Chat Gating** — Chat input stays disabled until document processing completes, managed via a `document_state` mechanism.
- ⚡ **Fast Generation** — Uses Groq LLM for low-latency response generation, with a stream handler that strips internal "think" tags from output.
- 🗂️ **Duplicate Detection** — Re-uploading an already-processed document returns a warning instead of reprocessing it.
- 🐳 **Dockerized** — Fully containerized for easy setup and deployment.

---

## 🏗️ Architecture

        PDF Upload → Loading → Chunking → Embedding (bge-m3) → Vector Store (Supabase pgvector)
        │
        User Query → Embedding (bge-m3) → Similarity Search ─────────┘
        │
        Retrieved Chunks
        │
        Groq LLM (Generation) → Streamed Response


---

## 🛠️ Tech Stack

**Backend**
- Python, FastAPI, LangChain
- BAAI/bge-m3 (multilingual embeddings)
- Groq LLM (response generation)
- Supabase Storage (PDF storage)
- Supabase pgvector (vector database)

**Frontend**
- TypeScript (TSX/TS), React
- Vite
- HTML5 / CSS3

**Infra**
- Docker

---

## 📁 Project Structure

        backend/
        ├── api/
        │ ├── chat.py # Chat endpoint
        │ ├── document_state.py # Tracks upload/processing state
        │ ├── rag_ingestion.py # Full ingestion pipeline (load → chunk → embed → store)
        │ └── upload.py # PDF upload endpoint
        ├── database/
        │ └── vector_store.py # Supabase pgvector integration
        ├── rag/
        │ ├── embeddings/services.py
        │ ├── generation/generator.py
        │ ├── ingestion/
        │ │ ├── chunks.py
        │ │ └── load_document.py
        │ ├── LLM/llm.py
        │ ├── retrieval/retriever.py
        │ └── supabase_client.py
        └── main.py

        frontend/
        ├── public/
        ├── src/
        │ ├── components/
        │ ├── api.ts
        │ ├── App.tsx
        │ ├── index.css
        │ ├── main.tsx
        │ ├── types.ts
        │ └── vite-env.d.ts
        ├── index.html
        ├── package.json
        ├── tsconfig.json
        └── vite.config.ts


---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js & npm
- Supabase account (Storage + pgvector enabled)
- Groq API key

### Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file with:

        SUPABASE_URL=your_supabase_url
        SUPABASE_KEY=your_supabase_key
        GROQ_API_KEY=your_groq_api_key


Run the backend:
```bash
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Run with Docker
```bash
docker compose up --build
```

---

## 💬 How It Works

1. **Upload a PDF** — The document is stored in Supabase Storage, then processed in the background: loaded, chunked, embedded, and stored as vectors in Supabase pgvector.
2. **Chat input unlocks** once processing completes (tracked via `document_state`).
3. **Ask a question** in any supported language — the query is embedded with bge-m3 and matched against stored vectors.
4. **Groq LLM generates a response** in the same language as the query, streamed back to the UI.

---

## 📌 Roadmap / Possible Improvements
- [ ] Add retrieval evaluation (precision/recall on sample queries)
- [ ] Support multi-document sessions
- [ ] Add authentication for multi-user document isolation
