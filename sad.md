# Software Architecture Document (SAD)
**Project:** MindBridge AI
**Version:** 1.0.0

## 1. Introduction
MindBridge is an enterprise AI mental health platform designed for universities to offer anonymous, scalable, and continuous support to students.

## 2. Architectural Overview
MindBridge employs a robust Client-Server architecture separated into a frontend Progressive Web App (PWA) and a Python backend.

### 2.1 Frontend
- **Framework:** React 18, Vite, TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Context / Hooks
- **Key Modules:** AI Chat (Web Speech API), Student Dashboard, Psychologist Dashboard, Super Admin SaaS.
- **Routing:** React Router v6

### 2.2 Backend
- **Framework:** FastAPI (Python 3.10+)
- **Database:** PostgreSQL (with SQLite fallback for local dev) via SQLAlchemy ORM.
- **AI Integration:** OpenAI API (GPT-4) for context-aware counseling, risk detection, and journal reflection.
- **Authentication:** JWT tokens + PBKDF2 Password Hashing.

### 2.3 DevOps & Infrastructure
- **Containerization:** Docker & Docker Compose
- **Orchestration:** Kubernetes (StatefulSets for Postgres, Deployments for APIs).
- **Monitoring:** Prometheus Metrics exposed via `/metrics`.
- **Ingress:** NGINX Ingress controller.

## 3. Security & Data Flow
All PII (Personally Identifiable Information) such as name, email, and phone number are encrypted at rest using AES-128 via the `Fernet` specification.
Students communicate with the AI and Community anonymously via generated animal-themed aliases. 
Identities are only decrypted in severe crisis scenarios (SOS trigger) by authorized clinical admins, with all decrypt actions recorded in the `AuditLog` table.
