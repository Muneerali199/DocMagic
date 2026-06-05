import json
import math
from pathlib import Path


def load_json(path: str | Path):
    """Load JSON data from a file and return the parsed object.

    Args:
        path: File path to a JSON file.
    Returns:
        Parsed Python object (usually dict or list).
    """
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(data, path: str | Path, *, indent: int = 2):
    """Save a Python object as JSON to the given path.

    Args:
        data: Serializable Python object.
        path: Destination file path.
        indent: Indentation level for pretty printing.
    """
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=indent)


def simple_token_count(text: str) -> int:
    """Very naive token count: split on whitespace.
    In production replace with a proper tokenizer (e.g., tiktoken).
    """
    return len(text.split())


def cosine_similarity(vec1, vec2) -> float:
    """Compute cosine similarity between two equal‑length iterables of numbers.
    Returns 0.0 if either vector has zero magnitude.
    """
    if len(vec1) != len(vec2):
        raise ValueError("Vectors must be of same length")
    dot = sum(a * b for a, b in zip(vec1, vec2))
    norm1 = math.sqrt(sum(a * a for a in vec1))
    norm2 = math.sqrt(sum(b * b for b in vec2))
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return dot / (norm1 * norm2)

# Helper functions for semantic memory

def get_embedding(text: str):
    """Generate an embedding vector for the given text using a SentenceTransformer.
    The model is lazily loaded and cached.
    """
    from sentence_transformers import SentenceTransformer
    model_name = "all-MiniLM-L6-v2"
    if not hasattr(get_embedding, "_model"):
        get_embedding._model = SentenceTransformer(model_name)
    embedding = get_embedding._model.encode([text])[0]
    return embedding

_STOP_WORDS = {
    "the", "and", "or", "a", "an", "of", "to", "in", "for", "with", "on",
    "by", "at", "from", "is", "are", "was", "were", "be", "been", "being",
}

def extract_keywords(text: str, max_keywords: int = 5) -> list[str]:
    """Extract a few salient keywords from the text.
    Naive implementation: split, lower, filter stop‑words, return most frequent.
    """
    words = [w.strip(".,!?:;()[]{}\"'").lower() for w in text.split()]
    filtered = [w for w in words if w and w not in _STOP_WORDS]
    freq = {}
    for w in filtered:
        freq[w] = freq.get(w, 0) + 1
    sorted_words = sorted(freq.items(), key=lambda kv: (-kv[1], kv[0]))
    return [w for w, _ in sorted_words[:max_keywords]]
