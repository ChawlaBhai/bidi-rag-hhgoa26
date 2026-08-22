import re
from typing import List, Dict, Any

class ChunkingStrategy:
    """
    Comprehensive Chunking Engine implementing 5 distinct chunking strategies
    for MSMARCO-XI Indic Multilingual Dataset.
    """

    @staticmethod
    def canonical_passage(passages: List[Dict[Any, Any]]) -> List[Dict[str, Any]]:
        """Strategy A: Canonical MSMARCO Passage baseline (as-is)."""
        chunks = []
        for p in passages:
            chunks.append({
                "chunk_id": f"{p['id']}_canon",
                "parent_id": p['id'],
                "text": p["passage"],
                "strategy": "canonical_passage",
                "metadata": {
                    "lang": p.get("lang", "en"),
                    "title": p.get("title", ""),
                    "category": p.get("category", ""), "answers": p.get("answers", [])
                }
            })
        return chunks

    @staticmethod
    def parent_child(passages: List[Dict[Any, Any]], parent_size: int = 350, child_size: int = 90) -> List[Dict[str, Any]]:
        """Strategy B: Parent-Child Hierarchical Chunking (Production Winner)."""
        chunks = []
        for p in passages:
            text = p["passage"]
            words = text.split()
            
            # Parent chunk covers the entire passage or large block
            parent_text = text
            
            # Child chunks split into sharp ~90 token units
            step = child_size - 20  # 20 word overlap
            for i in range(0, len(words), max(1, step)):
                child_words = words[i:i + child_size]
                if not child_words:
                    continue
                child_text = " ".join(child_words)
                chunks.append({
                    "chunk_id": f"{p['id']}_pc_child_{i}",
                    "parent_id": p['id'],
                    "text": child_text,
                    "parent_context": parent_text,
                    "strategy": "parent_child_hierarchy",
                    "metadata": {
                        "lang": p.get("lang", "en"),
                        "title": p.get("title", ""),
                        "category": p.get("category", ""), "answers": p.get("answers", []),
                        "child_start_word": i,
                        "child_length_words": len(child_words)
                    }
                })
        return chunks

    @staticmethod
    def semantic_boundaries(passages: List[Dict[Any, Any]]) -> List[Dict[str, Any]]:
        """Strategy C: Sentence-level Semantic Boundary Splitting."""
        chunks = []
        sentence_regex = re.compile(r'(?<=[.!?।॥])\s+')
        
        for p in passages:
            text = p["passage"]
            sentences = sentence_regex.split(text)
            sentences = [s.strip() for s in sentences if s.strip()]
            
            if not sentences:
                sentences = [text]
                
            # Group 2 consecutive sentences per chunk to maintain semantic cohesion
            for idx in range(0, len(sentences), 2):
                group = sentences[idx:idx + 2]
                chunk_text = " ".join(group)
                chunks.append({
                    "chunk_id": f"{p['id']}_sem_{idx}",
                    "parent_id": p['id'],
                    "text": chunk_text,
                    "strategy": "semantic_boundaries",
                    "metadata": {
                        "lang": p.get("lang", "en"),
                        "title": p.get("title", ""),
                        "sentence_count": len(group), "answers": p.get("answers", [])
                    }
                })
        return chunks

    @staticmethod
    def metadata_aware(passages: List[Dict[Any, Any]]) -> List[Dict[str, Any]]:
        """Strategy D: Metadata-Aware Structural Chunking."""
        chunks = []
        for p in passages:
            lang_prefix = f"[{p.get('lang_name', 'Indic')} | Category: {p.get('category', 'General')}]"
            title_prefix = f"Title: {p.get('title', 'Document')}"
            
            rich_chunk_text = f"{lang_prefix}\n{title_prefix}\nContent: {p['passage']}"
            
            chunks.append({
                "chunk_id": f"{p['id']}_meta",
                "parent_id": p['id'],
                "text": rich_chunk_text,
                "strategy": "metadata_aware",
                "metadata": {
                    "lang": p.get("lang", "en"),
                    "title": p.get("title", ""),
                    "category": p.get("category", ""), "answers": p.get("answers", [])
                }
            })
        return chunks

    @staticmethod
    def dynamic_overlap(passages: List[Dict[Any, Any]], window_words: int = 40, overlap_pct: int = 25) -> List[Dict[str, Any]]:
        """Strategy E: Dynamic Overlap Fixed Windowing."""
        chunks = []
        overlap_words = max(1, int(window_words * (overlap_pct / 100.0)))
        step = window_words - overlap_words

        for p in passages:
            words = p["passage"].split()
            if len(words) <= window_words:
                chunks.append({
                    "chunk_id": f"{p['id']}_dyn_0",
                    "parent_id": p['id'],
                    "text": p["passage"],
                    "strategy": "dynamic_overlap",
                    "metadata": {"lang": p.get("lang", "en"), "overlap_pct": overlap_pct, "answers": p.get("answers", [])}
                })
                continue
                
            chunk_index = 0
            for i in range(0, len(words), max(1, step)):
                slice_words = words[i:i + window_words]
                if not slice_words:
                    continue
                chunks.append({
                    "chunk_id": f"{p['id']}_dyn_{chunk_index}",
                    "parent_id": p['id'],
                    "text": " ".join(slice_words),
                    "strategy": "dynamic_overlap",
                    "metadata": {"lang": p.get("lang", "en"), "overlap_pct": overlap_pct, "answers": p.get("answers", [])}
                })
                chunk_index += 1
        return chunks

    @classmethod
    def process_all_strategies(cls, passages: List[Dict[Any, Any]]) -> Dict[str, List[Dict[str, Any]]]:
        """Returns indexed chunks for all 5 strategies."""
        return {
            "parent_child": cls.parent_child(passages),
            "semantic_boundaries": cls.semantic_boundaries(passages),
            "metadata_aware": cls.metadata_aware(passages),
            "dynamic_overlap": cls.dynamic_overlap(passages),
            "canonical_passage": cls.canonical_passage(passages)
        }
