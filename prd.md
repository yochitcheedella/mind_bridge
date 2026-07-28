# Product Requirements Document (PRD)
**Project:** MindBridge AI
**Version:** 1.0.0

## 1. Executive Summary
MindBridge provides educational institutions with a 24/7 AI-powered mental health safety net. It bridges the gap between students suffering in silence and overworked university counseling centers by providing immediate AI triage, anonymous community support, and seamless escalation to human psychologists.

## 2. Target Audience
1. **Students:** Need safe, anonymous, instant mental health support and habit tracking.
2. **Psychologists:** Need automated triage, risk insights, and prioritized patient queues.
3. **University Admins:** Need high-level, anonymized dashboard analytics on campus wellbeing.
4. **Platform Owners (SaaS):** Need to manage university subscriptions and multi-tenant billing.

## 3. Core Features
- **AI Voice Therapist:** Real-time conversational AI utilizing browser Speech-to-Text.
- **Crisis Detection Engine:** Analyzes mood logs, journals, and chats to output a 0.0 - 1.0 Risk Score.
- **Encrypted Identity Vault:** Students are fully anonymous (e.g., "Blue Sparrow") until an emergency SOS is triggered.
- **Anonymous Community:** A Reddit-style peer support forum.
- **Telehealth Appointments:** QR check-in and video-consultation placeholders.
- **Gamified Wellness:** Habit trackers, sleep logs, and customized 3-day recovery plans.

## 4. Non-Functional Requirements
- **Performance:** API responses < 200ms.
- **Security:** GDPR and HIPAA compliant data handling (encryption at rest, zero-PII dashboards).
- **Availability:** 99.9% uptime deployed on Kubernetes.
- **Platform:** PWA installable on iOS, Android, and Desktop.
