from __future__ import annotations

"""Simple vector store for long-term memory."""

from pathlib import Path
from datetime import datetime
import json
from typing import List, Dict, Any

try:
    from sentence_transformers import SentenceTransformer
except Exception:  # pragma: no cover - optional dependency
    SentenceTransformer = None

# Attempt to import faiss; fall back to pure python
try:
    import faiss  # type: ignore
    import numpy as np  # used when faiss is available
except Exception:  # pragma: no cover - optional dependency
    faiss = None

STORE_PATH = Path(__file__).with_name("vector_store.json")
MODEL_NAME = "all-MiniLM-L6-v2"


class VectorStore:
    """Very small wrapper around an embedding store."""

    def __init__(self, path: Path = STORE_PATH) -> None:
        self.path = path
        self.data: List[Dict[str, Any]] = []
        self.index = None
        self._model = None
        self.load()

    # ------------------------------------------------------------------
    def load(self) -> None:
        if self.path.exists():
            self.data = json.loads(self.path.read_text())
        else:
            self.data = []
        if faiss and self.data:
            dim = len(self.data[0]["embedding"])
            self.index = faiss.IndexFlatL2(dim)
            for item in self.data:
                self.index.add(np.array([item["embedding"]], dtype="float32"))

    # ------------------------------------------------------------------
    def save(self) -> None:
        self.path.write_text(json.dumps(self.data, indent=2))

    # ------------------------------------------------------------------
    def _ensure_model(self) -> None:
        if self._model is None:
            if SentenceTransformer:
                self._model = SentenceTransformer(MODEL_NAME)
            else:
                self._model = None

    # ------------------------------------------------------------------
    def embed(self, text: str) -> List[float]:
        self._ensure_model()
        if self._model:
            vector = self._model.encode(text).tolist()
        else:
            # Fallback embedding: simple ordinal values
            vector = [float(ord(c) % 256) for c in text][:64]
        return vector

    # ------------------------------------------------------------------
    def add(self, text: str, metadata: Dict[str, Any]) -> None:
        embedding = self.embed(text)
        record = {
            "text": text,
            "embedding": embedding,
            "metadata": metadata,
        }
        self.data.append(record)
        if faiss:
            import numpy as np

            if self.index is None:
                dim = len(embedding)
                self.index = faiss.IndexFlatL2(dim)
            self.index.add(np.array([embedding], dtype="float32"))
        self.save()

    # ------------------------------------------------------------------
    def query(self, text: str, top_k: int = 3) -> List[Dict[str, Any]]:
        if not self.data:
            return []
        embedding = self.embed(text)
        if faiss and self.index is not None:
            import numpy as np

            D, I = self.index.search(np.array([embedding], dtype="float32"), top_k)
            results = [self.data[i] for i in I[0] if i < len(self.data)]
            return results
        else:
            # naive similarity using L2 distance
            import math

            scored = []
            for item in self.data:
                e = item["embedding"]
                dist = math.sqrt(sum((a - b) ** 2 for a, b in zip(e, embedding)))
                scored.append((dist, item))
            scored.sort(key=lambda x: x[0])
            return [item for _, item in scored[:top_k]]


_STORE: VectorStore | None = None


def get_vector_store() -> VectorStore:
    global _STORE
    if _STORE is None:
        _STORE = VectorStore()
    return _STORE
