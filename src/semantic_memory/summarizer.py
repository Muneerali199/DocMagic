# summarizer.py
"""Semantic summarizer for generated sections.
Generates a concise JSON summary containing section name, extracted keywords, tone, and embedding.
"""
import json
from typing import Dict, List, Any

from .utils import get_embedding, extract_keywords

def summarize(section_text: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
    """Create a summary dict for a generated section.

    Args:
        section_text: The raw text generated for the section.
        metadata: Dictionary that may contain keys like 'section' and 'tone'.

    Returns:
        A dictionary with keys: section, keywords, tone, embedding, and optional raw_text.
    """
    section_name = metadata.get("section", "Unnamed")
    tone = metadata.get("tone", "neutral")
    # Simple keyword extraction – split into words, lower, filter stopwords, take top 5 unique.
    keywords = extract_keywords(section_text)
    embedding = get_embedding(section_text)
    summary = {
        "section": section_name,
        "keywords": keywords,
        "tone": tone,
        "embedding": embedding.tolist() if hasattr(embedding, "tolist") else embedding,
        "raw_text": section_text,
    }
    return summary
