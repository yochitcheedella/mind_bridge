import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, RotateCcw, ChevronRight } from 'lucide-react';
import { Card } from '../components/ui/Card';

// ─── PHQ-9 ──────────────────────────────────────────────────────────────────
const PHQ9 = {
  id: 'phq9' as const,
  name: 'PHQ-9',
  title: 'Depression Screening',
  subtitle: 'Patient Health Questionnaire — 9 items',
  emoji: '🧠',
  color: '#5E6BFF',
  intro: 'Over the last 2 weeks, how often have you been bothered by any of the following problems?',
  options: ['Not at all (0)', 'Several days (1)', 'More than half the days (2)', 'Nearly every day (3)'],
  questions: [
    'Little interest or pleasure in doing things',
    'Feeling down, depressed, or hopeless',
    'Trouble falling or staying asleep, or sleeping too much',
    'Feeling tired or having little energy',
    'Poor appetite or overeating',
    'Feeling bad about yourself — or that you are a failure or have let yourself or your family down',
    'Trouble concentrating on things, such as reading the newspaper or watching television',
    'Moving or speaking so slowly that other people could have noticed, or being so restless that you have been moving around a lot more than usual',
    'Thoughts that you would be better off dead, or thoughts of hurting yourself in some way',
  ],
  interpret: (score: number) => {
    if (score <= 4)  return { label: 'Minimal',             color: '#a1f3c3', advice: 'Your score suggests minimal depression symptoms. Keep maintaining healthy routines.' };
    if (score <= 9)  return { label: 'Mild',                color: '#f7d383', advice: 'Mild symptoms detected. Consider speaking with a counselor for self-care strategies.' };
    if (score <= 14) return { label: 'Moderate',            color: '#ffb86c', advice: 'Moderate symptoms. Speaking with a mental health professional is recommended.' };
    if (score <= 19) return { label: 'Moderately Severe',   color: '#ff7f7f', advice: 'Moderately severe symptoms. Please consider booking a counseling session soon.' };
    return            { label: 'Severe',                    color: '#ffb4ab', advice: 'Severe symptoms detected. Please reach out to a counselor or use the Emergency SOS.' };
  },
};

// ─── GAD-7 ──────────────────────────────────────────────────────────────────
const GAD7 = {
  id: 'gad7' as const,
  name: 'GAD-7',
  title: 'Anxiety Screening',
  subtitle: 'Generalised Anxiety Disorder — 7 items',
  emoji: '💭',
  color: '#a1f3c3',
  intro: 'Over the last 2 weeks, how often have you been bothered by the following problems?',
  options: ['Not at all (0)', 'Several days (1)', 'More than half the days (2)', 'Nearly every day (3)'],
  questions: [
    'Feeling nervous, anxious, or on edge',
    'Not being able to stop or control worrying',
    'Worrying too much about different things',
    'Trouble relaxing',
    'Being so restless that it is hard to sit still',
    'Becoming easily annoyed or irritable',
    'Feeling afraid as if something awful might happen',
  ],
  interpret: (score: number) => {
    if (score <= 4)  return { label: 'Minimal',  color: '#a1f3c3', advice: 'Your score suggests minimal anxiety. Great job managing your stress.' };
    if (score <= 9)  return { label: 'Mild',     color: '#f7d383', advice: 'Mild anxiety present. Breathing exercises and journaling can help significantly.' };
    if (score <= 14) return { label: 'Moderate', color: '#ffb86c', advice: 'Moderate anxiety detected. A counseling session could provide helpful tools.' };
    return            { label: 'Severe',         color: '#ffb4ab', advice: 'Severe anxiety detected. Please speak with a counselor or use Emergency SOS.' };
  },
};

const ASSESSMENTS = [PHQ9, GAD7] as const;
type AssessmentId = 'phq9' | 'gad7';

const STORAGE_KEY = 'mindbridge_assessments';

interface AssessmentResult {
  id: string;
  assessmentId: AssessmentId;
  score: number;
  label: string;
  date: string;
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--color-background)', color: 'var(--color-text)', paddingBottom: 100 },
  header: {
    position: 'sticky' as const, top: 0, zIndex: 10,
    background: 'rgba(18,18,30,0.85)', backdropFilter: 'blur(20px)',
    borderBottom: '1px solid var(--color-border)', padding: '14px 20px',
  },
  headerRow: { maxWidth: 480, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 },
  backBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
    borderRadius: 10, width: 36, height: 36, cursor: 'pointer',
    color: 'var(--color-text-muted)', flexShrink: 0 as const,
  },
  main: { maxWidth: 480, margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column' as const, gap: 24 },
};

export default function Assessments() {
  const navigate = useNavigate();
  const [active, setActive] = useState<AssessmentId | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<{ score: number; label: string; color: string; advice: string } | null>(null);
  const [history, setHistory] = useState<AssessmentResult[]>([]);

  useEffect(() => {
    try { setHistory(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')); } catch {}
  }, []);

  const assessment = active ? ASSESSMENTS.find(a => a.id === active)! : null;
  const totalQ = assessment?.questions.length ?? 0;
  const answered = Object.keys(answers).length;
  const canSubmit = answered === totalQ;

  const handleSubmit = () => {
    if (!assessment || !canSubmit) return;
    const score = Object.values(answers).reduce((a, b) => a + b, 0);
    const interp = assessment.interpret(score);
    setResult({ score, ...interp });
    const entry: AssessmentResult = { id: `${Date.now()}`, assessmentId: active!, score, label: interp.label, date: new Date().toISOString() };
    const updated = [entry, ...history].slice(0, 20);
    setHistory(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleReset = () => { setActive(null); setAnswers({}); setResult(null); };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerRow}>
          <button style={styles.backBtn}
            onClick={() => (active && !result) ? handleReset() : navigate(-1)} aria-label="Back">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontSize: 17, fontWeight: 800, fontFamily: 'var(--font-heading)', margin: 0 }}>
              {assessment ? `${assessment.name} — ${assessment.title}` : 'Self-Assessments'}
            </h1>
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0 }}>
              {assessment ? `${answered}/${totalQ} answered` : 'Validated mental health screenings'}
            </p>
          </div>
        </div>
      </header>

      <main style={styles.main}>

        {/* ── Assessment selector ── */}
        {!active && <>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.65, margin: 0 }}>
            These are standard, clinically validated questionnaires used by mental health professionals. Your responses are private and stored only on this device.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ASSESSMENTS.map(a => (
              <Card key={a.id} style={{ padding: '18px 20px', cursor: 'pointer', transition: 'all 0.2s' }}
                onClick={() => { setActive(a.id); setAnswers({}); setResult(null); }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                    background: `${a.color}20`, border: `1px solid ${a.color}50`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                  }}>{a.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: 15, margin: 0, marginBottom: 2, color: a.color }}>{a.name}</p>
                    <p style={{ fontSize: 13, margin: 0, fontWeight: 600 }}>{a.title}</p>
                    <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0 }}>{a.subtitle}</p>
                  </div>
                  <ChevronRight size={18} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                </div>
              </Card>
            ))}
          </div>

          {history.length > 0 && (
            <section>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--color-text-muted)', marginBottom: 12 }}>
                Past Results
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {history.slice(0, 6).map(r => {
                  const a = ASSESSMENTS.find(x => x.id === r.assessmentId)!;
                  const interp = a.interpret(r.score);
                  return (
                    <Card key={r.id} style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 20 }}>{a.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>
                          {a.name} — <span style={{ color: interp.color }}>{r.label}</span>
                        </p>
                        <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0 }}>
                          Score: {r.score} · {new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}
        </>}

        {/* ── Result screen ── */}
        {active && result && assessment && (
          <Card style={{ padding: '40px 24px', textAlign: 'center' as const, borderColor: `${result.color}40` }}>
            <p style={{ fontSize: 44, marginBottom: 8 }}>
              {result.score >= 20 ? '🚨' : result.score >= 15 ? '⚠️' : result.score >= 10 ? '🟡' : '✅'}
            </p>
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 8 }}>
              {assessment.name} Score
            </p>
            <p style={{ fontSize: 52, fontWeight: 900, fontFamily: 'var(--font-heading)', color: result.color, marginBottom: 4, lineHeight: 1 }}>
              {result.score}
            </p>
            <p style={{ fontSize: 18, fontWeight: 700, color: result.color, marginBottom: 20 }}>{result.label}</p>
            <Card style={{ padding: '14px 16px', background: `${result.color}10`, borderColor: `${result.color}30`, marginBottom: 24, textAlign: 'left' as const }}>
              <p style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--color-text)', margin: 0 }}>{result.advice}</p>
            </Card>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' as const }}>
              <button onClick={handleReset} style={{
                padding: '10px 24px', borderRadius: 12, background: result.color, color: '#0a0a14',
                fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <RotateCcw size={14} /> Try Another
              </button>
              {result.score >= 10 && (
                <button onClick={() => navigate('/appointments')} style={{
                  padding: '10px 24px', borderRadius: 12, background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)', color: 'var(--color-text)',
                  fontWeight: 600, fontSize: 13, cursor: 'pointer',
                }}>
                  Book a Session
                </button>
              )}
            </div>
          </Card>
        )}

        {/* ── Question list ── */}
        {active && !result && assessment && <>
          <Card style={{ padding: '14px 16px', background: `${assessment.color}08`, borderColor: `${assessment.color}30` }}>
            <p style={{ fontSize: 13, color: 'var(--color-text)', lineHeight: 1.6, margin: 0 }}>{assessment.intro}</p>
          </Card>

          {/* Progress bar */}
          <div style={{ height: 4, borderRadius: 2, background: 'var(--color-surface-bright)' }}>
            <div style={{
              height: '100%', borderRadius: 2, background: assessment.color,
              width: `${(answered / totalQ) * 100}%`, transition: 'width 0.4s ease',
            }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {assessment.questions.map((q, qIdx) => (
              <div key={qIdx}>
                <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, lineHeight: 1.5 }}>
                  <span style={{ color: assessment.color, fontWeight: 800, marginRight: 6 }}>{qIdx + 1}.</span>{q}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {assessment.options.map((opt, oIdx) => {
                    const sel = answers[qIdx] === oIdx;
                    return (
                      <button key={oIdx} onClick={() => setAnswers(prev => ({ ...prev, [qIdx]: oIdx }))}
                        style={{
                          padding: '10px 14px', borderRadius: 10, textAlign: 'left' as const, cursor: 'pointer',
                          border: `1px solid ${sel ? assessment.color : 'var(--color-border)'}`,
                          background: sel ? `${assessment.color}18` : 'var(--color-surface)',
                          color: sel ? assessment.color : 'var(--color-text)',
                          fontWeight: sel ? 700 : 400, fontSize: 13, transition: 'all 0.15s',
                          display: 'flex', alignItems: 'center', gap: 10,
                        }}>
                        <div style={{
                          width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                          border: `2px solid ${sel ? assessment.color : 'var(--color-text-muted)'}`,
                          background: sel ? assessment.color : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s',
                        }}>
                          {sel && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-background)' }} />}
                        </div>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <button onClick={handleSubmit} disabled={!canSubmit}
            style={{
              width: '100%', padding: '14px', borderRadius: 14, fontWeight: 700, fontSize: 14,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              background: canSubmit ? assessment.color : 'var(--color-surface)',
              color: canSubmit ? '#0a0a14' : 'var(--color-text-muted)',
              border: `1px solid ${canSubmit ? 'transparent' : 'var(--color-border)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.2s',
            }}>
            <CheckCircle2 size={16} /> View My Score ({answered}/{totalQ})
          </button>
        </>}

      </main>
    </div>
  );
}
