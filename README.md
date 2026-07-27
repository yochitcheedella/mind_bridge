# MindBridge AI

> **"No Student Should Suffer in Silence."**

MindBridge AI is a Privacy-First AI-Assisted Anonymous Mental Health Platform designed specifically for educational institutions. It provides a safe, anonymous space for students to seek support, while providing psychologists with AI-driven risk prioritization and institutions with macro-level wellness analytics.

## Features
- **Anonymous Identity System**: Students communicate anonymously, protecting them from stigma while still receiving professional support.
- **AI Mental Health Assistant (LLM Powered)**: 24/7 conversational AI (backed by OpenAI) with memory context, emotion analysis, and personalized wellness suggestions.
- **Multilingual Voice Chat**: Features native dictation and text-to-speech support in English, Hindi, Telugu, and Tamil to maximize campus accessibility.
- **Multi-Factor Risk Engine & Burnout Predictor**: Aggregates chat sentiment, mood logs, and journal entries to accurately predict burnout probability and trigger alerts without false positives.
- **Clinical Dashboard**: An interface for psychologists to monitor high-risk students, conduct anonymous counseling sessions, and manage appointments.
- **Admin Wellness Analytics**: Aggregated, privacy-preserved dashboards for university administrators to monitor campus-wide burnout trends.

## Tech Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Web Speech API
- **Backend**: FastAPI, Python, SQLAlchemy, Uvicorn, SlowAPI (Rate Limiting)
- **AI Engine**: OpenAI `gpt-3.5-turbo` for conversational flow, emotion classification, and structured JSON extraction.
- **Database**: SQLite (Development) / PostgreSQL (Production)
- **Security**: Zero-Trust anonymity, BCrypt (Work Factor 13), JWT token rotation, strict CORS, and security headers.

## Getting Started

### Windows Quick Start
1. Clone the repository.
2. Run `install.bat` to automatically set up the Python virtual environment, install backend dependencies, and install Node.js frontend dependencies.
3. Run `start.bat` to launch both the FastAPI backend (Port 8000) and the Vite frontend dev server (Port 5173).

### Manual Setup
**Backend**
```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend**
```bash
npm install
npm run dev
```

## Architecture Details
MindBridge AI implements a robust Microservices-inspired architecture with End-to-End Encryption and a Zero-Trust security model to ensure maximum privacy for its users. For complete architectural and structural documentation, please reference:
- `project_proposal.md` - Business & Vision Overview
- `srs.md` - Software Requirements Specification
- `sad.md` - Software Architecture Document
- `pdr.md` - Project Design Report

---
*MindBridge AI - Developed for Hackathons & Educational Tech Incubation.*
