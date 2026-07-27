from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
import json
import asyncio

from app.core.database import get_db
from app.core.security import decode_token
from app.models.chat import ChatMessage
from app.models.user import Student
from app.core.ai_service import analyze_message_with_history

router = APIRouter(prefix="/api/chat", tags=["chat"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[int, WebSocket] = {}

    async def connect(self, student_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[student_id] = websocket

    def disconnect(self, student_id: int):
        if student_id in self.active_connections:
            del self.active_connections[student_id]

    async def send_personal(self, message: str, student_id: int):
        if student_id in self.active_connections:
            await self.active_connections[student_id].send_text(message)

manager = ConnectionManager()


@router.get("/history")
def get_chat_history(token: str = Query(...), db: Session = Depends(get_db)):
    """Retrieve the user's past chat messages."""
    payload = decode_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    student_id = int(payload["sub"])
    messages = db.query(ChatMessage).filter(ChatMessage.student_id == student_id).order_by(ChatMessage.timestamp.asc()).all()
    
    return [
        {
            "id": str(msg.id),
            "sender": msg.sender,
            "text": msg.text,
            "sentiment_score": msg.sentiment_score,
            "timestamp": msg.timestamp.isoformat()
        } for msg in messages
    ]


@router.websocket("/ws")
async def chat_endpoint(websocket: WebSocket, token: str = Query(...), db: Session = Depends(get_db)):
    # Authenticate token
    payload = decode_token(token)
    if not payload or "sub" not in payload:
        await websocket.close(code=1008) # Policy Violation
        return

    student_id = int(payload["sub"])
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        await websocket.close(code=1008)
        return

    await manager.connect(student_id, websocket)
    try:
        # Load history for AI context (last 10 messages for memory, to avoid context bloat)
        db_history = db.query(ChatMessage).filter(ChatMessage.student_id == student_id).order_by(ChatMessage.timestamp.desc()).limit(10).all()
        db_history.reverse()
        
        ai_history = []
        for msg in db_history:
            role = "user" if msg.sender == "user" else "assistant"
            ai_history.append({"role": role, "content": msg.text})

        # Send greeting if history is empty
        if len(db_history) == 0:
            greeting_msg = ChatMessage(
                student_id=student_id,
                sender="ai",
                text="Hi there. I'm your MindBridge Guide. This is a safe, completely anonymous space. How are you feeling right now?",
                sentiment_score=0.0
            )
            db.add(greeting_msg)
            db.commit()
            db.refresh(greeting_msg)
            
            await manager.send_personal(
                json.dumps({
                    "id": str(greeting_msg.id),
                    "sender": "ai",
                    "text": greeting_msg.text,
                    "risk_level": "green",
                    "risk_score": 0.0,
                }),
                student_id,
            )
            ai_history.append({"role": "assistant", "content": greeting_msg.text})

        while True:
            raw_message = await websocket.receive_text()
            try:
                msg_data = json.loads(raw_message)
                user_message = msg_data.get("text", "")
                language = msg_data.get("language", "en-IN")
            except:
                user_message = raw_message
                language = "en-IN"

            # Save user message
            db_user_msg = ChatMessage(
                student_id=student_id,
                sender="user",
                text=user_message,
            )
            db.add(db_user_msg)
            db.commit()

            # Run AI analysis
            analysis = await analyze_message_with_history(user_message, history=ai_history, student_language=language)

            # Update ai_history for current session
            ai_history.append({"role": "user", "content": user_message})
            ai_history.append({"role": "assistant", "content": analysis.response_text})
            
            # Keep history manageable
            if len(ai_history) > 12:
                ai_history = ai_history[-12:]

            # Save AI response
            db_ai_msg = ChatMessage(
                student_id=student_id,
                sender="ai",
                text=analysis.response_text,
                sentiment_score=analysis.risk_score # re-using sentiment_score column for risk_score temporarily
            )
            db.add(db_ai_msg)
            
            # Update holistic risk score using the new engine
            from app.services.risk_engine import calculate_multi_factor_risk
            risk_data = calculate_multi_factor_risk(db, student_id)
            if risk_data:
                db.refresh(student) # Get updated burnout and risk

            if analysis.requires_alert:
                from app.models.alert import RiskAlert
                from app.services.notifications import send_push_notification
                
                # Ensure no active alert already exists to prevent spam
                existing_alert = db.query(RiskAlert).filter(RiskAlert.student_id == student_id, RiskAlert.status == "active").first()
                if not existing_alert:
                    new_alert = RiskAlert(
                        student_id=student_id,
                        risk_level="critical",
                        triggered_by="ai_chat",
                        status="active"
                    )
                    db.add(new_alert)
                    db.commit()
                    
                    mock_psychologist_fcm_token = "placeholder-psychologist-fcm-token"
                    send_push_notification(
                        title="AI RISK ALERT",
                        body=f"Critical risk detected in chat for student {student.alias}.",
                        fcm_token=mock_psychologist_fcm_token,
                        data={"alert_id": str(new_alert.id), "student_id": str(student.id)}
                    )

            db.commit()

            await manager.send_personal(
                json.dumps({
                    "id": str(db_ai_msg.id),
                    "sender": "ai",
                    "text": analysis.response_text,
                    "risk_level": analysis.risk_classification,
                    "risk_score": analysis.risk_score,
                    "sentiment_score": analysis.sentiment_score,
                    "detected_emotions": analysis.emotion_analysis,
                }),
                student_id,
            )

    except WebSocketDisconnect:
        manager.disconnect(student_id)
