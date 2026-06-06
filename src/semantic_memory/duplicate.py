import numpy as np
from sklearn.metrics import cosine_similarity
from .utils import get_embedding


def is_duplicate(new_text: str, prior_texts: list[str], model=None, threshold: float = 0.9) -> bool:
    """Check if `new_text` is a duplicate of any text in `prior_texts`.

    Args:
        new_text: The freshly generated section.
        prior_texts: List of previous sections' raw text.
        model: Optional embedding model. If None, a simple wrapper using `get_embedding` is used.
        threshold: Cosine similarity threshold above which texts are considered duplicates.
    Returns:
        True if a duplicate is found, else False.
    """
    if not prior_texts:
        return False
    # Load a default embedding model if none provided
    if model is None:
        class _EmbeddingModel:
            def encode(self, texts):
                return [get_embedding(t) for t in texts]
        model = _EmbeddingModel()
    # Compute embeddings
    new_emb = model.encode([new_text])[0]
    prior_embs = model.encode(prior_texts)
    # Compute cosine similarities
    sims = cosine_similarity([new_emb], prior_embs)[0]
    return any(sim > threshold for sim in sims)
