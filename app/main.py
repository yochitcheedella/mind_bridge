from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import asyncio
import json
from dotenv import load_dotenv

load_dotenv()

from app.core.database import engine
from app.models.base import Base
import app.models  # registers all models with Base

# API Routers
from app.api.auth import router as auth_router
from app.api.mood import router as mood_router
from app.api.journal import router as journal_router
from app.api.appointments import router as appointments_router
from app.api.risk import router as risk_router
from app.api.chat import router as chat_router
from app.api.psychologist import router as psychologist_router
from app.api.emergency import router as emergency_router
from app.api.community import router as community_router
from app.api.sleep import router as sleep_router
from app.api.storage import router as storage_router

# ── Create all tables ──────────────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MindBridge AI Clinical API",
    description="Privacy-first AI mental health platform for educational institutions.",
    version="1.0.0",
)

# ── Rate Limiter ───────────────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS ───────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# ── Security Headers ───────────────────────────────────────────────────────────
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response

# ── Register API Routers ───────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(mood_router)
app.include_router(journal_router)
app.include_router(appointments_router)
app.include_router(risk_router)
app.include_router(chat_router)
app.include_router(psychologist_router)
app.include_router(emergency_router)
app.include_router(community_router)
app.include_router(sleep_router)
app.include_router(storage_router)

# ── Health Check ───────────────────────────────────────────────────────────────
@app.get("/api/health", tags=["system"])
async def health_check():
    return {"status": "ok", "service": "MindBridge API is active."}

# ── Legacy mock analytics (psychologist dashboard fallback) ────────────────────
@app.get("/api/analytics/pulse", tags=["analytics"])
async def get_clinical_pulse():
    """Quick clinical pulse endpoint — real data sourced from /api/risk/analytics."""
    return {
        "active_students": 1402,
        "high_risk_alerts": 3,
        "avg_resolution_mins": 14,
        "sentiment_trend": "-12%",
    }


