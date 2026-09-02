# Retrieval Pipeline -> that retrive data from database using query embedding similarity
class RAGRetriever:
    def __init__(self, embedding_manager, vector_store):
        self.embedding_manager = embedding_manager
        self.vector_store = vector_store

    def retrieve(self, query,top_k=5, score_threshold=0.0):
    
        # query --> embeddings
        query_embedding = self.embedding_manager.generate_embedding([query])[0]

        # Supabase vector search
        response = (self.vector_store.supabase.rpc(
                "match_documents",
                {
                    "query_embedding":
                        query_embedding.tolist(),

                    "match_threshold":
                        score_threshold,

                    "match_count":
                        top_k
                }
            )
            .execute()
        )

        # Check response
        if not response.data:
            print("No relevant documents found!")
            return []
        print("RESULT COUNT:", len(response.data))

         # Convert results
        retrieved_docs = []

        for rank, doc in enumerate(response.data,start=1):
            similarity_score = doc["similarity"]
        
            distance = 1 - similarity_score
            retrieved_docs.append({
                "ids": str(doc["id"]),
                "document": doc["content"],
                "metadata": doc["metadata"],
                "distance": distance,
                "similarity_score":similarity_score,
                "rank": rank
            })

        return retrieved_docs
    