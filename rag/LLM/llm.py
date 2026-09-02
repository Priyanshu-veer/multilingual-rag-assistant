# Groq LLM
import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq

load_dotenv()
API_KEY = os.getenv("API_KEY")

groq_llm = ChatGroq(
    groq_api_key=API_KEY,
    model="qwen/qwen3.6-27b",
    temperature=0.7,
    reasoning_effort="none",
    max_tokens=2048
)
