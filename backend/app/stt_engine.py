import os
import time
import httpx
from typing import Tuple, Optional

SARVAM_API_KEY = os.getenv("SARVAM_API_KEY", "")

class STTEngine:
    """
    Speech-to-Text Orchestrator:
    Supports Sarvam AI (saaras-v3) and Native WebSpeech fallback.
    """

    @classmethod
    async def transcribe_audio_bytes(
        cls, 
        audio_bytes: bytes, 
        provider: str = "sarvam", 
        language_code: str = "hi-IN",
        sarvam_key: Optional[str] = None,
        content_type: str = "audio/webm"
    ) -> Tuple[str, float, str]:
        """
        Transcribes audio bytes using requested provider.
        Returns (transcription_text, duration_ms, provider_used).
        """
        start_time = time.perf_counter()
        api_key = sarvam_key or os.getenv("SARVAM_API_KEY", "")

        if provider == "sarvam" and api_key:
            try:
                async with httpx.AsyncClient(timeout=15.0) as client:
                    mime = content_type if content_type else "audio/webm"
                    ext = "webm" if "webm" in mime else ("mp4" if "mp4" in mime else "wav")
                    filename = f"recording.{ext}"
                    
                    files = {"file": (filename, audio_bytes, mime)}
                    data = {"model": "saaras:v3"} 
                    if language_code and language_code not in ["auto", "unknown", ""]:
                        data["language_code"] = language_code
                    else:
                        data["language_code"] = "unknown"
                    
                    headers = {"api-subscription-key": api_key}
                    
                    response = await client.post("https://api.sarvam.ai/speech-to-text", files=files, data=data, headers=headers)
                    if response.status_code == 200:
                        res_json = response.json()
                        text = res_json.get("transcript", "").strip()
                        elapsed = (time.perf_counter() - start_time) * 1000.0
                        return text, float(elapsed), "sarvam_saaras_v3"
                    else:
                        print(f"Sarvam Error ({response.status_code}): {response.text}")
            except Exception as e:
                print(f"Sarvam API Exception: {e}")
                pass

        elapsed = (time.perf_counter() - start_time) * 1000.0
        return "", float(elapsed), "sarvam_saaras_v3" if provider == "sarvam" else "webspeech_native_fallback"
