"""
Sarvam AI LLM Client
Uses the OpenAI-compatible endpoint:
  base_url = https://api.sarvam.ai/v1
  model    = sarvam-m
"""

import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")
SARVAM_BASE_URL = "https://api.sarvam.ai/v1"
MODEL = "sarvam-m"

# ─── Therapy System Prompt ──────────────────────────────────────────────────
THERAPY_SYSTEM_PROMPT = """You are Maitri, a compassionate AI mental health support companion built for Indian users.

Your role:
- Provide empathetic, non-judgmental emotional support
- Use evidence-based techniques from CBT (Cognitive Behavioral Therapy) and DBT (Dialectical Behavior Therapy)
- Speak naturally in the user's language — Hindi, English, or Hinglish — match their style
- Keep responses warm, concise (2-4 sentences), and grounded

Your boundaries (strictly follow these):
- You are NOT a licensed therapist or doctor
- You do NOT diagnose any condition
- You do NOT prescribe medication or medical advice
- If the user needs clinical help, always encourage them to consult a professional

Cultural context:
- Be sensitive to Indian family dynamics, social pressures, and cultural stigma around mental health
- Use culturally relevant examples and analogies
- Avoid assumptions based on Western cultural norms

Crisis protocol:
- If the user expresses suicidal thoughts, self-harm intent, or is in immediate danger:
  1. Respond with deep empathy and stay calm
  2. Tell them they are not alone
  3. Share the iCall helpline: 9152987821
  4. Encourage them to reach out to someone they trust immediately

Always remember: You are a supportive companion, not a replacement for professional care."""


def get_sarvam_client() -> OpenAI:
    """Returns an OpenAI-compatible client pointed at Sarvam AI."""
    return OpenAI(
        api_key=SARVAM_API_KEY,
        base_url=SARVAM_BASE_URL,
    )


def chat_with_maitri(
    messages: list[dict],
    language: str = "en-IN",
) -> str:
    """
    Send a conversation to Sarvam AI and get Maitri's response.

    Args:
        messages: List of {"role": "user"/"assistant", "content": "..."} dicts
        language: BCP-47 language code e.g. "hi-IN", "en-IN"

    Returns:
        AI response string
    """
    client = get_sarvam_client()

    # Add language hint to system prompt if Hindi
    system_prompt = THERAPY_SYSTEM_PROMPT
    if language == "hi-IN":
        system_prompt += "\n\nIMPORTANT: The user prefers Hindi. Respond primarily in Hindi (Devanagari script), but naturally mix English where it feels natural."

    full_messages = [
        {"role": "system", "content": system_prompt},
        *messages
    ]

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=full_messages,
            temperature=0.7,
            max_tokens=300,
        )
        return response.choices[0].message.content

    except Exception as e:
        print(f"Sarvam AI error: {e}")
        return "I'm here with you. I'm having a small technical difficulty right now — please try again in a moment."


def test_connection() -> bool:
    """Quick test to verify your API key works."""
    try:
        result = chat_with_maitri([
            {"role": "user", "content": "Hello, are you there?"}
        ])
        print(f"✅ Sarvam AI connected! Response: {result[:80]}...")
        return True
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False


if __name__ == "__main__":
    test_connection()