import os

import chromadb
from chromadb.config import Settings

CHROMA_PATH = os.getenv("CHROMA_DB_PATH", "./chroma_db")


class VectorStore:
    def __init__(self):
        self.client = chromadb.PersistentClient(
            path=CHROMA_PATH,
            settings=Settings(anonymized_telemetry=False),
        )

    def get_or_create_collection(self, name: str):
        return self.client.get_or_create_collection(
            name=name,
            metadata={"hnsw:space": "cosine"},
        )

    def add_chunks(self, collection_name: str, chunks: list[dict]) -> None:
        col = self.get_or_create_collection(collection_name)
        col.add(
            ids=[c["chunk_id"] for c in chunks],
            documents=[c["text"] for c in chunks],
            embeddings=[c["embedding"] for c in chunks],
            metadatas=[c["metadata"] for c in chunks],
        )

    def query(
        self,
        collection_name: str,
        embedding: list[float],
        top_k: int = 10,
    ) -> list[dict]:
        col = self.get_or_create_collection(collection_name)
        results = col.query(
            query_embeddings=[embedding],
            n_results=top_k,
            include=["documents", "metadatas", "distances"],
        )
        output = []
        for doc, meta, dist in zip(
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0],
        ):
            score = 1 - (dist / 2)
            output.append({"text": doc, "metadata": meta, "score": score})
        return output


vector_store = VectorStore()
