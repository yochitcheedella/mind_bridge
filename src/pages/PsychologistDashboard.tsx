import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Shield, AlertTriangle, Clock, ChevronRight, Activity, Filter, CheckCircle2, X, Send, Brain, ShieldAlert, FileText, TrendingUp, Bell, Plus, Calendar } from 'lucide-react';
import { apiFetch } from '../utils/auth';
import { IdentityRequestModal } from '../components/clinical/IdentityRequestModal';

interface RiskStudent {
  anonymous_id: string;
  risk_score: number;
  department: string;
  year: number;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'counselor';
  text: string;
  timestamp: string;
}

interface CaseDetails {
  student: {
    anonymous_id: string;
    department: string;
    year: number;
    risk_score: number;
  };
  mood_logs: any[];
  chat_history: ChatMessage[];
}

interface CaseNote { id: number; content: string; created_at: string; }
interface FollowUpItem { id: number; due_date: string; reason: string | null; completed: boolean; }
interface DecryptedIdentity { name: string; phone: string; email: string; }

export default function PsychologistDashboard() {
  const [queue, setQueue] = useState<RiskStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [caseDetails, setCaseDetails] = useState<CaseDetails | null>(null);
  const [counselorMessage, setCounselorMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [caseTab, setCaseTab] = useState<'chat' | 'notes' | 'timeline' | 'followup'>('chat');
  
  const [decryptedIdentity, setDecryptedIdentity] = useState<DecryptedIdentity | null>(null);
  const [decrypting, setDecrypting] = useState(false);

  // Case Notes state
  const [notes, setNotes] = useState<CaseNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Follow-up state
  const [followUps, setFollowUps] = useState<FollowUpItem[]>([]);
  const [followupDate, setFollowupDate] = useState('');
  const [followupReason, setFollowupReason] = useState('');
  const [savingFollowup, setSavingFollowup] = useState(false);

  // Appointments state
  const [view, setView] = useState<'queue' | 'appointments'>('queue');
  const [appointments, setAppointments] = useState<any[]>([]);

  // Real-time alerts state
  const [criticalAlert, setCriticalAlert] = useState<{ alert_id?: number, student_id: string, risk_reason: string } | null>(null);
  
  // Escalation state
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [escalateConfirmText, setEscalateConfirmText] = useState('');
  const [escalating, setEscalating] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchQueue = () => {
    fetch('http://localhost:8000/api/risk/queue')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setQueue(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const fetchAppointments = () => {
    fetch('http://localhost:8000/api/appointments/all')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setAppointments(data); })
      .catch(() => {});
  };

  useEffect(() => {
    fetchQueue();
    fetchAppointments();
    const interval = setInterval(() => {
      fetchQueue();
      if (view === 'appointments') fetchAppointments();
    }, 10000); // refresh queue every 10s
    
    // Connect to real-time clinical alerts
    const ws = new WebSocket('ws://localhost:8000/api/risk/ws/alerts');
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'CRITICAL_ALERT') {
          setCriticalAlert({ student_id: data.student_id, risk_reason: data.risk_reason });
          fetchQueue();
        } else if (data.type === 'EMERGENCY_SOS') {
          setCriticalAlert({ alert_id: data.alert_id, student_id: data.student_alias, risk_reason: data.message });
          fetchQueue();
        }
      } catch (e) {
        console.error(e);
      }
    };
    
    return () => {
      clearInterval(interval);
      ws.close();
    };
  }, []);

  useEffect(() => {
    if (selectedCase) {
      fetch(`http://localhost:8000/api/psychologist/student/${selectedCase}`)
        .then(r => r.json())
        .then(data => setCaseDetails(data))
        .catch(console.error);
      // Load case notes
      fetch(`http://localhost:8000/api/psychologist/student/${selectedCase}/notes`)
        .then(r => r.json()).then(data => { if (Array.isArray(data)) setNotes(data); }).catch(() => {});
      // Load follow-ups
      fetch(`http://localhost:8000/api/psychologist/student/${selectedCase}/followup`)
        .then(r => r.json()).then(data => { if (Array.isArray(data)) setFollowUps(data); }).catch(() => {});
      setCaseTab('chat');
    } else {
      setCaseDetails(null);
      setNotes([]);
      setFollowUps([]);
      setDecryptedIdentity(null);
    }
  }, [selectedCase]);

  useEffect(() => {
    if (caseDetails) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [caseDetails]);

  const handleSendMessage = async () => {
    if (!counselorMessage.trim() || !selectedCase) return;
    setSending(true);
    try {
      const res = await fetch(`http://localhost:8000/api/psychologist/student/${selectedCase}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: counselorMessage })
      });
      if (res.ok) {
        setCounselorMessage('');
        // Refresh details to show the new message
        const data = await (await fetch(`http://localhost:8000/api/psychologist/student/${selectedCase}`)).json();
        setCaseDetails(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedCase) return;
    try {
      await fetch(`http://localhost:8000/api/psychologist/student/${selectedCase}/resolve`, { method: 'POST' });
      setSelectedCase(null);
      fetchQueue();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveNote = async () => {
    if (!newNote.trim() || !selectedCase) return;
    setSavingNote(true);
    try {
      const res = await fetch(`http://localhost:8000/api/psychologist/student/${selectedCase}/notes`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote.trim() }),
      });
      if (res.ok) {
        const saved = await res.json();
        setNotes(prev => [saved, ...prev]);
        setNewNote('');
      }
    } finally { setSavingNote(false); }
  };

  const handleSaveFollowup = async () => {
    if (!followupDate || !selectedCase) return;
    setSavingFollowup(true);
    try {
      const res = await fetch(`http://localhost:8000/api/psychologist/student/${selectedCase}/followup`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ due_date: followupDate, reason: followupReason || null }),
      });
      if (res.ok) {
        const saved = await res.json();
        setFollowUps(prev => [saved, ...prev]);
        setFollowupDate(''); setFollowupReason('');
      }
    } finally { setSavingFollowup(false); }
  };

  const handleCompleteFollowup = async (id: number) => {
    if (!selectedCase) return;
    await fetch(`http://localhost:8000/api/psychologist/student/${selectedCase}/followup/${id}/complete`, { method: 'POST' });
    setFollowUps(prev => prev.map(f => f.id === id ? { ...f, completed: true } : f));
  };

  const handleEscalate = async () => {
    if (!selectedCase) return;
    if (escalateConfirmText !== 'ESCALATE') {
      alert('You must type ESCALATE to confirm.');
      return;
    }
    
    setEscalating(true);
    try {
      // In a real app, this would use actual psychologist tokens.
      // If we don't have a specific alert_id, we can fallback to decrypt identity endpoint, but for this workflow we assume the new escalate endpoint is called.
      // We will just use the decrypt endpoint for simplicity if no alert_id is bound, or call a specific escalate if we had it.
      // Since we just built `/api/emergency/{alert_id}/escalate`, we need the alert_id. 
      // If we don't have one in context, we can just use the standard decrypt identity endpoint we had, or we can fetch active alerts. 
      // To keep it simple, we'll use the new decrypt-identity endpoint which works by student alias.
      
      const res = await fetch(`http://localhost:8000/api/emergency/decrypt-identity/${selectedCase}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-emergency-auth': 'super-secret-committee-token'
        },
        body: JSON.stringify({ reason: 'Campus Security Escalation via Dashboard' })
      });
      
      if (res.ok) {
        const data = await res.json();
        setDecryptedIdentity(data.identity);
        setEscalateModalOpen(false);
      } else {
        const err = await res.json();
        alert(`Failed to escalate: ${err.detail || 'Unauthorized'}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error escalating to Campus Security.");
    } finally {
      setEscalating(false);
    }
  };


  const handleUpdateApptStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/appointments/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchAppointments();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <IdentityRequestModal 
        isOpen={escalateModalOpen}
        onClose={() => setEscalateModalOpen(false)}
        anonymousId={selectedCase || ''}
        onSuccess={(data) => {
          setDecryptedIdentity({ name: data.real_name, phone: data.real_phone, email: data.real_email });
        }}
      />

      {/* Critical Alert Overlay */}
      {criticalAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <Card className="max-w-md w-full m-4 p-6 border-2 border-error bg-surface shadow-2xl">
            <div className="flex items-center gap-3 text-error mb-4">
              <ShieldAlert size={32} className="animate-pulse" />
              <h2 className="font-heading font-bold text-xl uppercase tracking-wider">Critical Risk Detected</h2>
            </div>
            <p className="text-sm text-text mb-2">
              The AI Guide has just flagged a critical risk for student <strong>{criticalAlert.student_id}</strong>.
            </p>
            <p className="text-xs font-mono bg-error/10 text-error p-3 rounded-lg mb-6 border border-error/20">
              Reason: {criticalAlert.risk_reason}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setCriticalAlert(null)}
                className="flex-1 py-2.5 rounded-lg border border-border text-sm font-semibold hover:bg-surface-bright transition-colors"
              >
                Dismiss
              </button>
              <button 
                onClick={() => {
                  setSelectedCase(criticalAlert.student_id);
                  setCriticalAlert(null);
                }}
                className="flex-1 py-2.5 rounded-lg bg-error text-white text-sm font-bold hover:bg-error/90 transition-colors shadow-lg shadow-error/20"
              >
                Investigate Immediately
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-10 bg-surface-dim/80 backdrop-blur-xl border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-heading font-bold text-xl flex items-center gap-2">
              <Shield size={20} className="text-primary" /> MindBridge Clinical
            </h1>
            <p className="text-xs text-text-muted mt-0.5">Real-time Risk Triage Queue</p>
          </div>
          
          <div className="flex bg-surface-bright rounded-xl p-1 shadow-inner border border-border">
            <button onClick={() => { setView('queue'); fetchQueue(); }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2
                ${view === 'queue' ? 'bg-surface text-text shadow-sm' : 'text-text-muted hover:text-text'}`}>
              <ShieldAlert size={16} /> Triage Queue
            </button>
            <button onClick={() => { setView('appointments'); fetchAppointments(); }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2
                ${view === 'appointments' ? 'bg-surface text-text shadow-sm' : 'text-text-muted hover:text-text'}`}>
              <Calendar size={16} /> Appointments
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-text-muted bg-surface-bright px-3 py-1.5 rounded-lg border border-border">
              <Activity size={14} className="text-primary" />
              Live Monitoring
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex gap-6 animate-fade-in relative">
        {view === 'appointments' ? (
          <div className="w-full">
            <h2 className="font-heading font-semibold text-lg flex items-center gap-2 mb-6">
              Calendar & Appointments <Badge variant="default" className="bg-primary/20 text-primary">{appointments.length}</Badge>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {appointments.length === 0 ? (
                <div className="col-span-full text-center py-20 text-text-muted">No appointments scheduled.</div>
              ) : (
                appointments.map(appt => {
                  const dt = new Date(appt.slot_time);
                  const isFuture = dt > new Date();
                  return (
                    <Card key={appt.id} className={`p-5 flex flex-col justify-between ${appt.status === 'cancelled' ? 'opacity-50' : ''}`}>
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-heading font-bold text-sm tracking-wide">{appt.anonymous_id}</h3>
                          <Badge variant="default" className={`text-[10px] ${appt.status === 'confirmed' ? 'bg-success/20 text-success' : appt.status === 'cancelled' ? 'bg-error/20 text-error' : 'bg-warning/20 text-warning'}`}>
                            {appt.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="space-y-1.5 text-xs text-text-muted mb-4">
                          <p className="flex items-center gap-2"><Calendar size={12} /> {dt.toLocaleDateString()}</p>
                          <p className="flex items-center gap-2"><Clock size={12} /> {dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          <p className="flex items-center gap-2"><Shield size={12} /> {appt.psychologist_name}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                        {appt.status === 'pending' && isFuture && (
                          <button onClick={() => handleUpdateApptStatus(appt.id, 'confirmed')} className="flex-1 py-1.5 bg-success/15 text-success rounded-lg text-xs font-semibold hover:bg-success/25 transition">Approve</button>
                        )}
                        {appt.status !== 'cancelled' && isFuture && (
                          <button onClick={() => handleUpdateApptStatus(appt.id, 'cancelled')} className="flex-1 py-1.5 bg-error/15 text-error rounded-lg text-xs font-semibold hover:bg-error/25 transition">Cancel</button>
                        )}
                        {appt.status === 'confirmed' && !isFuture && (
                          <button onClick={() => handleUpdateApptStatus(appt.id, 'completed')} className="flex-1 py-1.5 bg-primary/15 text-primary rounded-lg text-xs font-semibold hover:bg-primary/25 transition">Mark Complete</button>
                        )}
                      </div>
                    </Card>
                  )
                })
              )}
            </div>
          </div>
        ) : (
          <>
        {/* Left: Queue */}
        <div className={`flex-1 transition-all ${selectedCase ? 'hidden lg:block lg:w-1/3 flex-none' : 'w-full'}`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading font-semibold text-lg flex items-center gap-2">
              Priority Queue <Badge variant="default" className="bg-primary/20 text-primary">{queue.length}</Badge>
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-20 text-text-muted text-sm">Loading triage queue...</div>
          ) : queue.length === 0 ? (
            <Card className="text-center py-20 bg-success/5 border-success/20">
              <CheckCircle2 size={32} className="mx-auto mb-3 text-success/60" />
              <p className="text-sm font-medium text-success">Queue is clear</p>
              <p className="text-xs mt-1 text-success/70">No students are currently flagged for elevated risk.</p>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {queue.map(student => {
                const isCritical = student.risk_score >= 0.8;
                const isHigh = student.risk_score >= 0.6 && !isCritical;
                
                return (
                  <Card 
                    key={student.anonymous_id} 
                    onClick={() => setSelectedCase(student.anonymous_id)}
                    className={`p-4 transition-all cursor-pointer ${selectedCase === student.anonymous_id ? 'ring-2 ring-primary border-primary' : 'hover:scale-[1.01]'} ${isCritical ? 'border-error/40 bg-error/5' : isHigh ? 'border-orange-400/30' : 'hover:border-primary/30'}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-heading font-bold text-base text-text tracking-wide">{student.anonymous_id}</h3>
                          {isCritical && <span className="w-2 h-2 rounded-full bg-error animate-pulse" />}
                        </div>
                        <p className="text-[10px] text-text-muted mb-3">{student.department} • Year {student.year}</p>
                        
                        <div className="flex items-center gap-3">
                          <div className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${
                            isCritical ? 'bg-error/15 text-error border-error/30' : 
                            isHigh ? 'bg-orange-400/15 text-orange-300 border-orange-400/30' : 
                            'bg-warning/15 text-warning border-warning/30'
                          }`}>
                            Risk Score: {student.risk_score.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-text-muted mt-2" />
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Case Details */}
        {selectedCase && (
          <div className="flex-1 flex flex-col bg-surface-dim border border-border rounded-2xl overflow-hidden h-[calc(100vh-140px)] sticky top-28 shadow-2xl animate-slide-up lg:animate-fade-in">
            {/* Case Header */}
            <div className="bg-surface border-b border-border p-4 flex items-center justify-between">
              <div>
                <h2 className="font-heading font-bold text-lg">{selectedCase}</h2>
                <p className="text-xs text-text-muted">Case Review & Live Intervention</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleResolve}
                  className="px-3 py-1.5 bg-success/15 hover:bg-success/25 text-success text-xs font-semibold rounded-lg transition-colors border border-success/30 flex items-center gap-1.5"
                >
                  <CheckCircle2 size={14} /> Resolve Case
                </button>
                <button onClick={() => setSelectedCase(null)} className="p-1.5 hover:bg-surface-bright rounded-lg text-text-muted transition-colors lg:hidden">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border bg-surface">
              {([['chat', 'Chat', Send], ['notes', 'Notes', FileText], ['timeline', 'Timeline', TrendingUp], ['followup', 'Follow-up', Bell]] as const).map(([key, label, Icon]) => (
                <button key={key} onClick={() => setCaseTab(key as typeof caseTab)}
                  className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all
                    ${caseTab === key ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text'}`}>
                  <Icon size={13} /> {label}
                </button>
              ))}
            </div>

            {/* Case Body */}
            {caseDetails ? (
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

                {/* ── Chat tab ── */}
                {caseTab === 'chat' && <>
                  <div className="text-center">
                    <span className="text-[10px] text-text-muted bg-surface px-3 py-1 rounded-full uppercase tracking-widest font-semibold border border-border">
                      AI Chat History
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col gap-4 mb-4">
                    {caseDetails.chat_history.map(msg => (
                      <div key={msg.id} className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                        {msg.sender !== 'user' && (
                          <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-1 ${msg.sender === 'counselor' ? 'bg-orange-400/20 shadow-[0_0_10px_rgba(251,146,60,0.3)]' : 'bg-primary/20'}`}>
                            {msg.sender === 'counselor' ? <ShieldAlert size={12} className="text-orange-400" /> : <Brain size={12} className="text-primary" />}
                          </div>
                        )}
                        <div className="max-w-[75%]">
                          <div className={`px-3 py-2 text-sm leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-surface-bright border border-border rounded-2xl rounded-tr-none text-text-muted'
                              : msg.sender === 'counselor'
                                ? 'bg-gradient-to-br from-orange-400/20 to-orange-500/10 border border-orange-400/30 rounded-2xl rounded-tl-none text-text'
                                : 'bg-primary/10 border border-primary/20 rounded-2xl rounded-tl-none text-text'
                          }`}>
                            {msg.sender === 'counselor' && <p className="text-[10px] font-bold text-orange-400 mb-0.5 uppercase tracking-wider">You (Counselor)</p>}
                            {msg.sender === 'ai' && <p className="text-[10px] font-bold text-primary mb-0.5 uppercase tracking-wider">AI Guide</p>}
                            <p>{msg.text}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                </>}

                {/* ── Notes tab ── */}
                {caseTab === 'notes' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <textarea
                        value={newNote}
                        onChange={e => setNewNote(e.target.value)}
                        rows={4}
                        placeholder="Write a private clinical note…"
                        className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text placeholder-text-muted focus:outline-none focus:border-primary/50 resize-none transition-all"
                      />
                      <button onClick={handleSaveNote} disabled={!newNote.trim() || savingNote}
                        className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary-hover transition-all disabled:opacity-40">
                        {savingNote ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Plus size={14} /> Save Note</>}
                      </button>
                    </div>
                    {notes.length === 0
                      ? <p className="text-xs text-text-muted text-center py-8">No notes yet. Add your first clinical note above.</p>
                      : notes.map(n => (
                        <Card key={n.id} className="p-3">
                          <p className="text-[10px] text-text-muted mb-1.5 flex items-center gap-1"><Clock size={10} />{new Date(n.created_at).toLocaleString()}</p>
                          <p className="text-sm text-text whitespace-pre-wrap leading-relaxed">{n.content}</p>
                        </Card>
                      ))
                    }
                  </div>
                )}

                {/* ── Timeline tab ── */}
                {caseTab === 'timeline' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <Card className="p-3 text-center">
                        <p className="text-xl font-heading font-bold text-primary">{caseDetails.student.risk_score.toFixed(1)}</p>
                        <p className="text-[10px] text-text-muted uppercase tracking-wider mt-1">Risk Score</p>
                      </Card>
                      <Card className="p-3 text-center">
                        <p className="text-xl font-heading font-bold text-primary">{caseDetails.mood_logs.length}</p>
                        <p className="text-[10px] text-text-muted uppercase tracking-wider mt-1">Mood Logs</p>
                      </Card>
                      <Card className="p-3 text-center">
                        <p className="text-xl font-heading font-bold text-primary">{caseDetails.chat_history.length}</p>
                        <p className="text-[10px] text-text-muted uppercase tracking-wider mt-1">Chat Msgs</p>
                      </Card>
                    </div>
                    {/* Mood trend bars */}
                    {caseDetails.mood_logs.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5"><TrendingUp size={12} /> Mood History</p>
                        <div className="flex items-end gap-1.5 h-20">
                          {caseDetails.mood_logs.slice(0, 10).reverse().map((log: any, i: number) => {
                            const h = Math.round((log.score / 5) * 100);
                            const col = log.score >= 4 ? '#a1f3c3' : log.score >= 3 ? '#f7d383' : '#ffb4ab';
                            return (
                              <div key={i} title={`Score: ${log.score}/5`}
                                style={{ flex: 1, height: `${h}%`, background: col, borderRadius: 4, transition: 'height 0.4s ease', minHeight: 4 }} />
                            );
                          })}
                        </div>
                        <div className="flex justify-between text-[10px] text-text-muted mt-1">
                          <span>Oldest</span><span>Most Recent</span>
                        </div>
                      </div>
                    )}
                    {/* Student info */}
                    <Card className="p-3 space-y-2">
                      <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Case Info</p>
                      {[['Department', caseDetails.student.department || '—'], ['Year', caseDetails.student.year ? `Year ${caseDetails.student.year}` : '—'], ['Alias', caseDetails.student.anonymous_id]].map(([k, v]) => (
                        <div key={k} className="flex justify-between text-sm">
                          <span className="text-text-muted">{k}</span>
                          <span className="text-text font-medium font-mono text-xs">{v}</span>
                        </div>
                      ))}
                      
                      {caseDetails.student.risk_score >= 0.8 && !decryptedIdentity && (
                        <button 
                          onClick={() => setEscalateModalOpen(true)}
                          className="w-full mt-4 py-2 bg-error/15 text-error text-xs font-bold rounded-lg border border-error/30 hover:bg-error/25 transition-colors flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(255,0,0,0.1)]"
                        >
                          <ShieldAlert size={14} /> 
                          Escalate to Campus Security
                        </button>
                      )}
                      
                      {decryptedIdentity && (
                        <div className="mt-4 p-3 bg-error/10 border border-error/40 rounded-lg space-y-2 animate-fade-in">
                          <p className="text-xs font-bold text-error uppercase tracking-wider mb-1 flex items-center gap-1"><ShieldAlert size={12}/> Decrypted Identity</p>
                          <div className="flex justify-between text-sm"><span className="text-error/70">Name</span><span className="font-semibold text-text">{decryptedIdentity.name}</span></div>
                          <div className="flex justify-between text-sm"><span className="text-error/70">Phone</span><span className="font-semibold text-text">{decryptedIdentity.phone}</span></div>
                          <div className="flex justify-between text-sm"><span className="text-error/70">Email</span><span className="font-semibold text-text">{decryptedIdentity.email}</span></div>
                        </div>
                      )}
                    </Card>
                  </div>
                )}

                {/* ── Follow-up tab ── */}
                {caseTab === 'followup' && (
                  <div className="space-y-4">
                    <Card className="p-4 space-y-3">
                      <p className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5"><Calendar size={12} /> Schedule Follow-up</p>
                      <input type="date" value={followupDate} onChange={e => setFollowupDate(e.target.value)}
                        className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-text focus:outline-none focus:border-primary/50 transition-all" />
                      <input type="text" value={followupReason} onChange={e => setFollowupReason(e.target.value)}
                        placeholder="Reason (optional)…"
                        className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-text placeholder-text-muted focus:outline-none focus:border-primary/50 transition-all" />
                      <button onClick={handleSaveFollowup} disabled={!followupDate || savingFollowup}
                        className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary-hover transition-all disabled:opacity-40">
                        {savingFollowup ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Bell size={14} /> Set Reminder</>}
                      </button>
                    </Card>
                    {followUps.length === 0
                      ? <p className="text-xs text-text-muted text-center py-6">No follow-ups scheduled.</p>
                      : followUps.map(f => (
                        <Card key={f.id} className={`p-3 flex items-center gap-3 ${f.completed ? 'opacity-50' : ''}`}>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-text">{f.due_date}</p>
                            {f.reason && <p className="text-xs text-text-muted mt-0.5">{f.reason}</p>}
                          </div>
                          {f.completed
                            ? <CheckCircle2 size={18} className="text-success flex-shrink-0" />
                            : <button onClick={() => handleCompleteFollowup(f.id)}
                                className="text-xs px-2.5 py-1 rounded-lg bg-success/15 text-success border border-success/30 font-semibold hover:bg-success/25 transition-all">
                                Done
                              </button>
                          }
                        </Card>
                      ))
                    }
                  </div>
                )}

              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
                Loading case details...
              </div>
            )}

            {/* Input */}
            <div className="p-3 bg-surface border-t border-border">
              <div className="flex items-center gap-2 bg-surface-bright border border-border rounded-xl p-1 pr-1 focus-within:border-primary/50 transition-colors shadow-inner">
                <input
                  type="text"
                  placeholder="Send an anonymous message as Counselor..."
                  className="flex-1 bg-transparent border-none focus:outline-none text-sm px-3 py-2 text-text placeholder-text-muted"
                  value={counselorMessage}
                  onChange={e => setCounselorMessage(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSendMessage(); }}
                  disabled={sending}
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!counselorMessage.trim() || sending}
                  className="p-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {sending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={16} />}
                </button>
              </div>
              <p className="text-[10px] text-text-muted text-center mt-2 flex items-center justify-center gap-1">
                <Shield size={10} className="text-primary" /> Messages appear instantly in the student's AI chat window.
              </p>
            </div>
          </div>
        )}
          </>
        )}
      </main>
    </div>
  );
}
