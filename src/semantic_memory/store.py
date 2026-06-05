import os
import json
import numpy as np
import faiss
from typing import List, Dict, Any
from .utils import get_embedding

# Paths for persisted FAISS index and summaries JSON
INDEX_PATH = os.path.join(os.path.dirname(__file__), "faiss.index")
JSON_PATH = os.path.join(os.path.dirname(__file__), "semantic_memory.json")

class SemanticStore:
    """Singleton class managing a FAISS vector store for semantic memory.

    Stores summary dictionaries with an ``embedding`` field (list or numpy array).
    Provides methods to add new summaries, query similar ones, and generate embeddings.
    """Singleton semantic store that persists summaries and a FAISS index.

    The constructor can be given a custom base directory for persistence – useful for tests.
    """
    _instance = None

    @classmethod
    def get_instance(cls, base_dir: str = None, dim: int = 384):
        """Return a shared instance, optionally seeded with a custom base directory.

        If ``base_dir`` is provided, the store will use ``base_dir/faiss.index`` and ``base_dir/semantic_memory.json``.
        """
    """A lightweight in‑memory store with optional persistence.

    Parameters
    ----------
    storage_dir: str | None
        Directory where ``semantic_memory.json`` and ``faiss.index`` are stored.
        If ``None`` defaults to the module directory.
    dim: int
        Dimensionality of embeddings (default matches MiniLM‑L6‑v2).
    """

    def __init__(self, storage_dir: str = None, dim: int = 384):
        self.dim = dim
        base_dir = storage_dir if storage_dir is not None else os.path.dirname(__file__)
        os.makedirs(base_dir, exist_ok=True)
        self.index_path = os.path.join(base_dir, "faiss.index")
        self.json_path = os.path.join(base_dir, "semantic_memory.json")
        # Load or create FAISS index
        if os.path.exists(self.index_path):
            self.index = faiss.read_index(self.index_path)
        else:
            self.index = faiss.IndexFlatIP(dim)
        # Load persisted summaries
        if os.path.exists(self.json_path):
            with open(self.json_path, "r", encoding="utf-8") as f:
                self.summaries: List[Dict[str, Any]] = json.load(f)
        else:
            self.summaries = []
        self.next_id = len(self.summaries)
        self._normalize_index()

    def _normalize_index(self):
        if getattr(self.index, "ntotal", 0) > 0:
            xb = self.index.reconstruct_n(0, self.index.ntotal)
            faiss.normalize_L2(xb)
            self.index.reset()
            self.index.add(xb)

    def add(self, summary: Dict[str, Any]):
        """Add a summary dict (must contain ``embedding``) and persist it.
        Returns the assigned integer id.
        """
        emb = np.array(summary["embedding"], dtype="float32")
        faiss.normalize_L2(emb.reshape(1, -1))
        self.index.add(emb.reshape(1, -1))
        summary["id"] = self.next_id
        self.summaries.append(summary)
        self.next_id += 1
        self._persist()
        return summary["id"]

    def _persist(self):
        with open(self.json_path, "w", encoding="utf-8") as f:
            json.dump(self.summaries, f, ensure_ascii=False, indent=2)
        faiss.write_index(self.index, self.index_path)

    def embed_text(self, text: str) -> List[float]:
        """Generate a deterministic pseudo‑embedding for *text*.
        Returns a list suitable for JSON storage.
        """
        return _pseudo_embed(text, self.dim)

    def query(self, embedding: List[float], k: int = 5) -> List[Dict[str, Any]]:
        """Return top‑k most similar stored summaries for the given embedding.
        """
        emb = np.array(embedding, dtype="float32").reshape(1, -1)
        faiss.normalize_L2(emb)
        if getattr(self.index, "ntotal", 0) == 0:
            return []
        distances, indices = self.index.search(emb, k)
        results = []
        for idx in indices[0]:
            if idx < len(self.summaries):
                results.append(self.summaries[idx])
        return results
