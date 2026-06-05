import os
import json
import shutil
import tempfile
import unittest
from pathlib import Path

from src.semantic_memory.summarizer import summarize
from src.semantic_memory.store import SemanticStore
from src.semantic_memory.retrieval import get_relevant
from src.semantic_memory.duplicate import is_duplicate

class TestSemanticMemory(unittest.TestCase):
    def setUp(self):
        # Create a temporary directory for store persistence
        self.tmp_dir = tempfile.mkdtemp()
        self.store_path = Path(self.tmp_dir) / "semantic_memory.json"
        self.store = SemanticStore(str(self.store_path))

    def tearDown(self):
        shutil.rmtree(self.tmp_dir)

    def test_summarizer_extracts_fields(self):
        text = "John Doe is a senior data scientist with 5 years of experience in machine learning and leadership."
        metadata = {"section": "Experience", "tone": "concise"}
        summary = summarize(text, metadata)
        self.assertIn("section", summary)
        self.assertIn("keywords", summary)
        self.assertIn("tone", summary)
        self.assertIn("embedding", summary)
        self.assertGreater(len(summary["keywords"]), 0)

    def test_store_add_and_retrieve(self):
        # Add two summaries
        s1 = summarize("Experience with Python and ML.", {"section": "Exp1"})
        s2 = summarize("Leadership in AI projects.", {"section": "Exp2"})
        self.store.add(s1)
        self.store.add(s2)
        # Retrieve similar to a query containing "machine learning"
        results = retrieve_relevant(["machine", "learning"], self.store, k=2)
        self.assertEqual(len(results), 2)
        # Ensure returned objects contain original metadata
        self.assertTrue(any(r["section"] == "Exp1" for r in results) or any(r["section"] == "Exp2" for r in results))

    def test_duplicate_detection(self):
        existing = ["John is a data scientist.", "He leads ML projects."]
        new_similar = "John is a data scientist and leads machine learning projects."
        self.assertTrue(is_duplicate(new_similar, existing, threshold=0.8))
        new_different = "The sky is blue."
        self.assertFalse(is_duplicate(new_different, existing, threshold=0.8))

if __name__ == "__main__":
    unittest.main()
