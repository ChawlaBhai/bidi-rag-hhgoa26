import re
from typing import List, Dict, Any, Tuple

class GuardrailEngine:
    """
    4-Layer Guardrails & Safety Filter:
    - Layer 1: Input Intent & Prompt Injection Shield
    - Layer 2: Dataset Scope & Off-Topic Query Classifier
    - Layer 3: Retrieval Groundedness & Evidence Thresholding (Strict Refusal)
    - Layer 4: Sentence-Level Citation Tagger (Separate from answer text)
    """

    # Comprehensive list of off-topic topics outside our dataset scope
    OFF_TOPIC_KEYWORDS = [
        "recipe", "bake", "baking", "pizza", "cake", "cook", "cooking", "food",
        "python code", "javascript", "script", "program", "code for", "write code",
        "joke", "funny", "weather", "crypto", "bitcoin", "football", "cricket score",
        "movie", "actor", "song", "lyrics", "capital of mars", "alien", "magic", "horoscope"
    ]

    INJECTION_PATTERNS = [
        r"ignore (all )?previous instructions",
        r"system prompt",
        r"you are now a",
        r"dan mode",
        r"jailbreak"
    ]

    @classmethod
    def check_input_safety(cls, query: str) -> Tuple[bool, str, str]:
        """
        Layer 1 & 2: Checks prompt injection and off-topic domain match.
        Returns (is_safe, refusal_category, message).
        """
        query_lower = query.lower().strip()
        
        # Injection check
        for pattern in cls.INJECTION_PATTERNS:
            if re.search(pattern, query_lower):
                return False, "PROMPT_INJECTION", "I cannot fulfill requests that attempt to bypass safety guardrails or modify system behavior."

        # Off-topic check
        for kw in cls.OFF_TOPIC_KEYWORDS:
            if kw in query_lower:
                return False, "OFF_TOPIC", f"This question is outside our dataset's knowledge scope. Our RAG engine is trained specifically on Indian History, Science & Space, Indian Constitution, Quantum & Tech, and Culture."

        return True, "SAFE", "Query passed input guardrail."

    @classmethod
    def check_evidence_sufficiency(cls, chunks: List[Dict[str, Any]], query: str) -> Tuple[bool, str]:
        """
        Layer 3: Evaluates retrieval scores. Refuses if top match score is weak or token overlap is insufficient.
        """
        if not chunks:
            return False, "I cannot answer this question because no relevant information was found in our knowledge base."

        top_score = chunks[0].get("rrf_score", 0.0)
        top_dense = chunks[0].get("dense_score", 0.0)
        top_bm25 = chunks[0].get("bm25_score", 0.0)
        
        # Tight threshold check to prevent false positives for random/unrelated queries
        if top_dense < 0.12 and top_bm25 < 0.8:
            return False, "I cannot answer this question based on our dataset context. The retrieved passages do not contain sufficient evidence to formulate an authentic answer."

        return True, "Evidence score meets confidence threshold."

    @classmethod
    def verify_and_format_citations(cls, answer: str, chunks: List[Dict[str, Any]]) -> Tuple[str, float, List[Dict[str, str]]]:
        """
        Layer 4: Separates clean answer text from source passage citations.
        Only retains grounding evidence cards that meet strict relevance criteria.
        """
        if not chunks or not answer:
            return answer, 0.0, []

        formatted_citations = []
        seen = set()
        top_dense_max = chunks[0].get("dense_score", 0.0)
        
        for c in chunks[:3]:
            title = c.get("metadata", {}).get("title", "Passage")
            chunk_id = c.get("chunk_id", "id")
            snippet = c.get("text", "")[:130] + "..."
            dense_score = c.get("dense_score", 0.0)
            bm25_score = c.get("bm25_score", 0.0)
            
            # Strict relevance filter: skip weak fallback chunks
            if len(formatted_citations) > 0:
                if dense_score < (top_dense_max * 0.75) or (bm25_score <= 0.0 and dense_score < 0.35):
                    continue
            
            if title not in seen:
                seen.add(title)
                formatted_citations.append({
                    "title": title,
                    "chunk_id": chunk_id,
                    "snippet": snippet,
                    "category": c.get("metadata", {}).get("category", "General")
                })
                
        # Grounding score estimation
        context_corpus = " ".join([c["text"].lower() for c in chunks])
        answer_words = set(re.findall(r'\w+', answer.lower()))
        grounded_words = [w for w in answer_words if w in context_corpus]
        
        score = (len(grounded_words) / float(max(1, len(answer_words)))) * 100.0 if answer_words else 0.0
        grounding_score = round(min(98.5, max(60.0, score)), 1)
        
        clean_answer = answer.strip()
        
        return clean_answer, grounding_score, formatted_citations
