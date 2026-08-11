import os
import re
from pathlib import Path

from rag.chunker import chunk_text, clean_text
from rag.retrieval import embed
from rag.vector_store import vector_store

KNOWLEDGE_BASE_PATH = Path(__file__).parent.parent / "knowledge_base"


def ingest_domain(domain: str) -> int:
    domain_path = KNOWLEDGE_BASE_PATH / domain
    if not domain_path.exists():
        print(f"  Path not found: {domain_path}")
        return 0

    collection_name = f"{domain}_kb"
    try:
        vector_store.client.delete_collection(collection_name)
        print(f"  Cleared existing collection: {collection_name}")
    except Exception:
        pass

    all_chunks = []
    global_index = 0
    for md_file in sorted(domain_path.glob("*.md")):
        raw = md_file.read_text(encoding="utf-8")
        sections = re.split(r"\n(?=## )", raw)
        source_name = md_file.stem.replace("_", " ").title()
        for section_text in sections:
            section_title = re.match(r"##\s*(.+)", section_text)
            section = section_title.group(1).strip() if section_title else "General"
            cleaned = clean_text(section_text)
            if len(cleaned.split()) < 20:
                continue
            chunks = chunk_text(cleaned, source=source_name, section=section)
            for chunk in chunks:
                chunk_id = f"{domain}_{md_file.stem}_{global_index:04d}"
                global_index += 1
                embedding = embed(chunk["text"])
                all_chunks.append({
                    "chunk_id": chunk_id,
                    "text": chunk["text"],
                    "embedding": embedding,
                    "metadata": {
                        "chunk_id": chunk_id,
                        "source": chunk["source"],
                        "section": chunk["section"],
                        "domain": domain,
                        "file": md_file.name,
                    },
                })
        print(f"  Processed: {md_file.name}")

    if all_chunks:
        vector_store.add_chunks(collection_name, all_chunks)
        print(f"  Indexed {len(all_chunks)} chunks into '{collection_name}'")
    return len(all_chunks)


if __name__ == "__main__":
    print("=== Sankofa Hub RAG Ingestion Pipeline ===")
    for domain in ["tourism", "language"]:
        print(f"\nIngesting domain: {domain.upper()}")
        count = ingest_domain(domain)
        print(f"  Total chunks: {count}")
    print("\nIngestion complete. ChromaDB is ready.")
