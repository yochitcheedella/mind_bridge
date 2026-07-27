import os
import json
from openai import AsyncOpenAI
import logging

logger = logging.getLogger(__name__)

# Initialize client if key exists
api_key = os.getenv("OPENAI_API_KEY")
client = AsyncOpenAI(api_key=api_key) if api_key else None

async def generate_chat_response(messages: list, student_language: str = "English") -> dict:
    """
    Calls OpenAI to get a response, emotion analysis, and risk score.
    messages format: [{"role": "user"/"assistant", "content": "text"}, ...]
    """
    if not client:
        logger.warning("OPENAI_API_KEY not set. Using mock LLM response.")
        return _mock_llm_response(messages[-1]["content"])

    system_prompt = f"""
You are MindBridge AI, an empathetic and highly professional student wellness assistant.
Your goal is to converse naturally with the student. Be supportive, concise, and non-judgmental.

Respond to the student in {student_language}.

You MUST return your response as a JSON object with the following exact keys:
{{
    "response_text": "Your natural conversational reply in {student_language}",
    "detected_emotions": ["emotion1", "emotion2"],
    "risk_score": <integer from 0 to 100>,
    "wellness_suggestions": ["suggestion1", "suggestion2"]
}}

Risk Score Guide:
0-20: Positive, happy, safe.
21-40: Mild stress, tired, normal academic pressure.
41-60: High stress, overwhelmed, anxious, poor sleep.
61-80: Hopelessness, severe anxiety, extreme burnout. (Triggers alert)
81-100: Active crisis, self-harm mentions, severe depression. (Triggers immediate SOS)

CRITICAL: Output ONLY valid JSON.
"""
    try:
        completion = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "system", "content": system_prompt}] + messages,
            response_format={ "type": "json_object" },
            temperature=0.7,
            max_tokens=500,
        )
        response_content = completion.choices[0].message.content
        return json.loads(response_content)
    except Exception as e:
        logger.error(f"LLM API Error: {e}")
        return _mock_llm_response(messages[-1]["content"])


def _mock_llm_response(last_message: str) -> dict:
    """Fallback if OpenAI is unavailable."""
    text_lower = last_message.lower()
    
    # Keyword based fallback
    if any(w in text_lower for w in ["suicide", "kill", "end it", "die"]):
        return {
            "response_text": "I'm so sorry you're feeling this way. Please know that there is immediate help available. You are not alone.",
            "detected_emotions": ["crisis", "despair"],
            "risk_score": 90,
            "wellness_suggestions": ["Contact Emergency SOS"]
        }
    elif any(w in text_lower for w in ["stress", "anxious", "overwhelmed", "exam", "fail"]):
        return {
            "response_text": "Exams and academics can be incredibly stressful. It's okay to feel overwhelmed. Let's take a deep breath.",
            "detected_emotions": ["stressed", "anxious"],
            "risk_score": 50,
            "wellness_suggestions": ["5-min Grounding", "Take a short walk"]
        }
    
    return {
        "response_text": "I hear you. Tell me more about how you're feeling.",
        "detected_emotions": ["neutral"],
        "risk_score": 10,
        "wellness_suggestions": ["Journaling"]
    }
