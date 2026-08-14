# import os

# from sentence_transformers import SentenceTransformer

# from rag.vector_store import get_vector_store

# EMBED_MODEL_NAME = os.getenv("EMBED_MODEL", "all-MiniLM-L6-v2")
# SCORE_FLOOR = float(os.getenv("RAG_SCORE_FLOOR", "0.45"))
# TOP_K_RETRIEVE = int(os.getenv("RAG_TOP_K", "5"))

# _model = None


# def get_embedding_model():
#     global _model
#     if _model is None:
#         _model = SentenceTransformer(EMBED_MODEL_NAME)
#     return _model


# def embed(text: str) -> list[float]:
#     model = get_embedding_model()
#     return model.encode(text, normalize_embeddings=True).tolist()


# def retrieve_context(query: str, domain: str) -> str:
#     if domain not in {"tourism", "language"}:
#         return ""

#     collection_name = f"{domain}_kb"
#     query_embedding = embed(query)
#     # results = vector_store.query(
#     #     collection_name, query_embedding, top_k=TOP_K_RETRIEVE
#     # )

#     results = get_vector_store().query(
#     collection_name, query_embedding, top_k=TOP_K_RETRIEVE
# )

#     relevant = [r for r in results if r["score"] >= SCORE_FLOOR]
#     if not relevant:
#         return ""

#     lines = ["=== KNOWLEDGE BASE CONTEXT ==="]
#     for i, r in enumerate(relevant[:3], 1):
#         src = r["metadata"].get("source", "Unknown source")
#         sec = r["metadata"].get("section", "")
#         lines.append(
#             f"\n[Source {i}: {src}{' — ' + sec if sec else ''}]"
#         )
#         lines.append(r["text"])
#     lines.append("\n=== END KNOWLEDGE BASE CONTEXT ===")
#     lines.append(
#         "Answer the user's question using the above context where relevant."
#     )
#     lines.append(
#         "If the context does not contain the answer, use your general knowledge"
#     )
#     lines.append(
#         "but note that the information is not from the official knowledge base."
#     )
#     return "\n".join(lines)


import os
from chromadb.utils.embedding_functions import ONNXMiniLM_L6_V2
from rag.vector_store import get_vector_store

SCORE_FLOOR = float(os.getenv("RAG_SCORE_FLOOR", "0.45"))
TOP_K_RETRIEVE = int(os.getenv("RAG_TOP_K", "5"))

_embed_fn = None

def get_embed_fn():
    global _embed_fn
    if _embed_fn is None:
        _embed_fn = ONNXMiniLM_L6_V2()
    return _embed_fn

def embed(text: str) -> list[float]:
    fn = get_embed_fn()
    return fn([text])[0]

def retrieve_context(query: str, domain: str) -> str:
    if domain not in {"tourism", "language"}:
        return ""

    collection_name = f"{domain}_kb"
    query_embedding = embed(query)
    results = get_vector_store().query(
        collection_name, query_embedding, top_k=TOP_K_RETRIEVE
    )

    relevant = [r for r in results if r["score"] >= SCORE_FLOOR]
    if not relevant:
        return ""

    lines = ["=== KNOWLEDGE BASE CONTEXT ==="]
    for i, r in enumerate(relevant[:3], 1):
        src = r["metadata"].get("source", "Unknown source")
        sec = r["metadata"].get("section", "")
        lines.append(
            f"\n[Source {i}: {src}{' — ' + sec if sec else ''}]"
        )
        lines.append(r["text"])
    lines.append("\n=== END KNOWLEDGE BASE CONTEXT ===")
    lines.append("Answer the user's question using the above context where relevant.")
    lines.append("If the context does not contain the answer, use your general knowledge")
    lines.append("but note that the information is not from the official knowledge base.")
    return "\n".join(lines)