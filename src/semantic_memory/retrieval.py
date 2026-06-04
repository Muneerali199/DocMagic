import numpy as np
from .store import SemanticStore
from typing import List


def get_relevant(keywords: List[str], store: SemanticStore = None, k: int = 3) -> List[dict]:
    """Retrieve top‑k relevant summaries based on keyword embeddings.

    Args:
        keywords: List of keyword strings representing current context.
        store: Optional SemanticStore instance. If None, the singleton instance is used.
        k: Number of relevant items to return.
    Returns:
        List of summary dicts sorted by similarity.
    """
    if not keywords:
        return []
    # Obtain embedding for the query keywords using the store's embed_text method.
    if store is None:
        store = SemanticStore.get_instance()
    query_vec = store.embed_text(' '.join(keywords))
    # Use the store's query method to retrieve similar summaries.
    results = store.query(query_vec, k)
    return results
