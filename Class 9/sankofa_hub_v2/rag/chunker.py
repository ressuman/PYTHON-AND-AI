import re


def clean_text(text: str) -> str:
    text = re.sub(r"#{1,6}\s*", "", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[ \t]{2,}", " ", text)
    return text.strip()


def _split_sentences(text: str) -> list[str]:
    sentences = re.split(r'(?<=[.!?])\s+', text)
    return [s.strip() for s in sentences if s.strip()]


def chunk_text(
    text: str,
    source: str,
    section: str,
    chunk_size: int = 300,
    overlap: int = 50,
) -> list[dict]:
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks, current, word_count = [], [], 0

    for para in paragraphs:
        words = len(para.split())

        if word_count + words > chunk_size and current:
            chunk_body = "\n\n".join(current)
            context_prefix = f"[From: {source} | Section: {section}]\n"
            chunks.append({
                "text": context_prefix + chunk_body,
                "source": source,
                "section": section,
            })
            if overlap > 0:
                overlap_text = " ".join(current[-1:].pop().split()[-overlap:]) if current[-1:] else ""
                current = [overlap_text] if overlap_text else []
                word_count = len(overlap_text.split()) if overlap_text else 0
            else:
                current = []
                word_count = 0

        current.append(para)
        word_count += words

    if current:
        chunk_body = "\n\n".join(current)
        context_prefix = f"[From: {source} | Section: {section}]\n"
        chunks.append({
            "text": context_prefix + chunk_body,
            "source": source,
            "section": section,
        })
    return chunks
