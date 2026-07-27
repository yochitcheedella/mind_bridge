import os
import json
import random
from typing import List, Dict, Optional
from dataclasses import dataclass, field
import asyncio

# Attempt to import openai, but degrade gracefully if API key isn't provided
try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

@dataclass
class AIAnalysis:
    response_text: str
    emotion_analysis: List[str]
    risk_classification: str     # "green" | "yellow" | "orange" | "red" | "critical"
    requires_alert: bool
    sentiment_score: float = 0.0 # Kept for backwards compatibility if needed
    risk_score: float = 0.0      # Kept for backwards compatibility

def _mock_llm_analysis(history: List[Dict[str, str]], user_message: str) -> AIAnalysis:
    """
    Advanced simulation of an LLM evaluating context.
    Looks at history to generate continuity.
    """
    text_lower = user_message.lower()
    
    # Context-aware logic mock
    if any(p in text_lower for p in ["kill myself", "end my life", "want to die"]):
        # Verification layer: if it's the first time they say this, ask a grounding question.
        # If they confirm, escalate.
        recent_ai_msgs = [m['content'] for m in history if m['role'] == 'assistant']
        if any("safe place" in msg or "someone nearby" in msg for msg in recent_ai_msgs[-2:]):
            # Escalate
            return AIAnalysis(
                response_text="I am alerting our on-call campus psychologist right now. Please stay with me. Help is being arranged.",
                emotion_analysis=["Severe Distress", "Suicidal Ideation"],
                risk_classification="critical",
                requires_alert=True,
                risk_score=0.95
            )
        else:
            return AIAnalysis(
                response_text="I'm deeply concerned about what you just shared. Are you in a safe place right now? Please tell me.",
                emotion_analysis=["Despair", "Hopelessness"],
                risk_classification="red", # Elevated, but verifying before critical alert
                requires_alert=False,
                risk_score=0.75
            )

    # Memory Check Mock
    if "exam" in text_lower or "test" in text_lower:
        return AIAnalysis(
            response_text="I hear that exams are causing a lot of pressure. Remember earlier we talked about taking things one step at a time? How is your study plan going?",
            emotion_analysis=["Academic Stress", "Anxiety"],
            risk_classification="yellow",
            requires_alert=False,
            risk_score=0.3
        )
    
    if "better" in text_lower or "good" in text_lower:
        return AIAnalysis(
            response_text="I'm really glad to hear you're feeling a bit better today! That's wonderful progress.",
            emotion_analysis=["Relief", "Hope"],
            risk_classification="green",
            requires_alert=False,
            risk_score=0.05
        )

    # Default fallback
    return AIAnalysis(
        response_text="I'm here for you. Tell me more about how you're feeling right now.",
        emotion_analysis=["Neutral", "Seeking Support"],
        risk_classification="green",
        requires_alert=False,
        risk_score=0.1
    )


async def analyze_message_with_history(user_message: str, history: List[Dict[str, str]] = None, student_language: str = "en-IN") -> AIAnalysis:
    """
    Analyzes a student message using an LLM, taking conversational memory into account.
    Returns structured AIAnalysis data.
    """
    if history is None:
        history = []

    api_key = os.getenv("OPENAI_API_KEY")

    if OPENAI_AVAILABLE and api_key:
        client = openai.AsyncOpenAI(api_key=api_key)
        
        system_prompt = f"""
        You are the MindBridge AI Guide, a deeply empathetic, non-judgmental mental health companion for college students.
        You maintain continuity with past messages.
        
        RESPOND IN THIS LANGUAGE/LOCALE: {student_language} (E.g. en-IN, hi-IN, te-IN, ta-IN). If non-English, use the native script.
        
        CRITICAL RULES:
        1. If the user indicates immediate self-harm, suicide, or violence, classify risk as "critical" and set requires_alert to true.
        2. If the user mentions self-harm but it's ambiguous, ask a verification question before escalating to critical.
        3. Respond naturally and empathetically.
        
        Output valid JSON exactly matching this schema:
        {{
            "response": "string",
            "emotion_analysis": ["string", "string"],
            "risk_classification": "green|yellow|orange|red|critical",
            "requires_alert": boolean
        }}
        """

        messages = [{"role": "system", "content": system_prompt}]
        
        # Append last 6 turns of history for memory context
        for msg in history[-6:]:
            messages.append({"role": msg["role"], "content": msg["content"]})
            
        messages.append({"role": "user", "content": user_message})

        try:
            response = await client.chat.completions.create(
                model="gpt-4o",
                messages=messages,
                response_format={"type": "json_object"},
                temperature=0.7,
                max_tokens=250
            )
            
            data = json.loads(response.choices[0].message.content)
            
            # Map LLM output to dataclass
            risk_map = {"green": 0.1, "yellow": 0.3, "orange": 0.5, "red": 0.75, "critical": 0.95}
            risk_level = data.get("risk_classification", "green")
            
            return AIAnalysis(
                response_text=data.get("response", "I'm here for you."),
                emotion_analysis=data.get("emotion_analysis", ["Neutral"]),
                risk_classification=risk_level,
                requires_alert=data.get("requires_alert", False),
                risk_score=risk_map.get(risk_level, 0.1),
                sentiment_score=0.0 # Deprecated in favor of emotion_analysis
            )
        except Exception as e:
            # Fallback to mock on API error
            return _mock_llm_analysis(history, user_message)

    else:
        # No API key, use the advanced mock
        await asyncio.sleep(1.0) # Simulate network delay
        return _mock_llm_analysis(history, user_message)
