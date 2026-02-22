import os
import uuid
import httpx
import aiofiles
import asyncio
from pathlib import Path

YARNGPT_URL = "https://yarngpt.ai/api/v1/tts"
AUDIO_DIR = Path("audio")  
AUDIO_DIR.mkdir(exist_ok=True)

async def text_to_speech(text: str, voice: str = "Idera") -> str:
    api_key = os.getenv("YARNGPT_API_KEY")
    domain = os.getenv("DOMAIN", "http://localhost:8000")

    if not api_key:
        print("⚠️ YARNGPT_API_KEY not set – using placeholder audio URL")
        return "https://example.com/audio.mp3"

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "text": text,
        "voice": voice,
        "response_format": "mp3"
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        audio_data = None
        for attempt in range(3):
            try:
                resp = await client.post(YARNGPT_URL, json=payload, headers=headers)
                resp.raise_for_status()
                audio_data = resp.content
                break
            except Exception as e:
                print(f"YarnGPT attempt {attempt + 1} failed: {e}")
                if attempt == 2:
                    print("⚠️ YarnGPT failed after 3 retries – returning placeholder")
                    return "https://example.com/audio.mp3"
                await asyncio.sleep(1)

    filename = f"{uuid.uuid4()}.mp3"
    file_path = AUDIO_DIR / filename

    async with aiofiles.open(file_path, 'wb') as f:
        await f.write(audio_data)

    audio_url = f"{domain.rstrip('/')}/audio/{filename}"
    return audio_url