# Supabase Embedding Vector Store Manager
import uuid
from rag.supabase_client import supabase

class VectorStoreManager:
    def __init__(self,collection_name="pdf_documents"):
        self.collection_name = collection_name
        self.table_name = "documents"
        self.supabase = supabase
        print("Initialized Supabase vector store",self.collection_name)

        print("Documents in store:",self.count())

    def count(self):

        response = (
            supabase
            .table(self.table_name)
            .select("id")
            .execute()
        )

        return len(response.data)

    # Add pdf funx
    def add_documents(self,documents,embeddings,source=None):
        if len(documents) != len(embeddings):
            raise ValueError("Number of document does not match"
                             "Number of embeddings")

        records = []
        for i, (docs,embedding) in enumerate(zip(documents,embeddings)):
            docs_id = f"doc_{uuid.uuid4()}"
            metadata = dict(docs.metadata)

            metadata["source"] = source
            metadata["doc_index"] = i
            metadata["content_length"] = len(docs.page_content)

            record = {
                "content": docs.page_content,
                "metadata": metadata,
                "embedding":( embedding.tolist()
                    if hasattr(embedding, "tolist")
                    else embedding
                )
            }
            records.append(record)

        print("Prepared records:",len(records))
        
        response = (supabase.table(self.table_name).insert(records).execute())

        print("Total documents added: ",len(records))
        print("Documents in store:",self.count())
        return response.data
