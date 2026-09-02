# To convert documents into chunks
from langchain_text_splitters import RecursiveCharacterTextSplitter

def split_doc(document, chunk_size=500, chunk_overlap=300):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap
    )
    chunked_document = text_splitter.split_documents(document)

    return chunked_document