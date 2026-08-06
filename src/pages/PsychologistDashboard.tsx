import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Shield, AlertTriangle, Clock, ChevronRight, Activity, Filter, CheckCircle2, X, Send, Brain, ShieldAlert, FileText, TrendingUp, Bell, Plus, Calendar } from 'lucide-react';
import { apiFetch, API_URL } from '../utils/auth';
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
interface ActiveAlert { id: number; risk_level: string; triggered_by: string; created_at: string; student_alias: string; risk_score: number; department: string; year: number; }

export default function PsychologistDashboard() {
  const location = useLocation();
  const [queue, setQueue] = useState<RiskStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<string | null>(
    location.state && (location.state as any).selectedAlias ? (location.state as any).selectedAlias : null
  );
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

  // Appointments & SOS view state
  const [view, setView] = useState<'queue' | 'appointments' | 'sos'>('queue');
  const [activeAlerts, setActiveAlerts] = useState<ActiveAlert[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [rescheduleId, setRescheduleId] = useState<number | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  // Real-time alerts state
  const [criticalAlert, setCriticalAlert] = useState<{ alert_id?: number, student_id: string, risk_reason: string } | null>(null);
  
  // Escalation state
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [escalateConfirmText, setEscalateConfirmText] = useState('');
  const [escalating, setEscalating] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchQueue = () => {
    fetch(`${API_URL}/api/risk/queue`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setQueue(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const fetchAppointments = () => {
    apiFetch('/api/appointments/all')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setAppointments(data); })
      .catch(() => {});
  };

  const fetchAlerts = () => {
    fetch(`${API_URL}/api/risk/alerts`)
      .then(r => r.json())
      .then(data => { if (data && Array.isArray(data.alerts)) setActiveAlerts(data.alerts); })
      .catch(() => {});
  };

  const handleResolveAlert = async (alertId: number) => {
    try {
      await fetch(`${API_URL}/api/risk/alerts/${alertId}/resolve`, { method: 'POST' });
      fetchAlerts();
      fetchQueue();
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchQueue();
    fetchAppointments();
    fetchAlerts();
    const qInterval = setInterval(() => {
      fetchQueue();
      fetchAlerts();
    }, 10000); // refresh queue and alerts every 10s
    const aInterval = setInterval(() => {
      if (view === 'appointments') fetchAppointments();
    }, 2000); // check local appointments every 2s
    
    // Connect to real-time clinical alerts
    const wsUrl = API_URL.replace('https://', 'wss://').replace('http://', 'ws://');
    const ws = new WebSocket(`${wsUrl}/api/risk/ws/alerts`);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'CRITICAL_ALERT') {
          setCriticalAlert({ student_id: data.student_id, risk_reason: data.risk_reason });
          fetchQueue();
          fetchAlerts();
        } else if (data.type === 'EMERGENCY_SOS') {
          setCriticalAlert({ alert_id: data.alert_id, student_id: data.student_alias, risk_reason: data.message });
          fetchQueue();
          fetchAlerts();
        }
      } catch (e) {
        console.error(e);
      }
    };
    
    return () => {
      clearInterval(qInterval);
      clearInterval(aInterval);
      ws.close();
    };
  }, []);

  useEffect(() => {
    if (selectedCase) {
      fetch(`${API_URL}/api/psychologist/student/${selectedCase}`)
        .then(r => r.json())
        .then(data => setCaseDetails(data))
        .catch(console.error);
      // Load case notes
      fetch(`${API_URL}/api/psychologist/student/${selectedCase}/notes`)
        .then(r => r.json()).then(data => { if (Array.isArray(data)) setNotes(data); }).catch(() => {});
      // Load follow-ups
      fetch(`${API_URL}/api/psychologist/student/${selectedCase}/followup`)
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
      const res = await fetch(`${API_URL}/api/psychologist/student/${selectedCase}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: counselorMessage })
      });
      if (res.ok) {
        setCounselorMessage('');
        // Refresh details to show the new message
        const data = await (await fetch(`${API_URL}/api/psychologist/student/${selectedCase}`)).json();
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
      await fetch(`${API_URL}/api/psychologist/student/${selectedCase}/resolve`, { method: 'POST' });
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
      const res = await fetch(`${API_URL}/api/psychologist/student/${selectedCase}/notes`, {
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
      const res = await fetch(`${API_URL}/api/psychologist/student/${selectedCase}/followup`, {
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
    await fetch(`${API_URL}/api/psychologist/student/${selectedCase}/followup/${id}/complete`, { method: 'POST' });
    setFollowUps(prev => prev.map(f => f.id === id ? { ...f, completed: true } : f));
  };

  const handleUpdateApptStatus = async (id: number, status: string, newTime?: string) => {
    try {
      const res = await apiFetch(`/api/appointments/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, new_time: newTime })
      });
      if (res.ok) {
        fetchAppointments();
        if (status === 'rescheduled') {
          setRescheduleId(null);
          setRescheduleDate('');
          setRescheduleTime('');
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-canvas-global text-on-surface font-body-md antialiased min-h-screen flex selection:bg-interactive-primary selection:text-white">
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel max-w-md w-full m-4 p-6 border-2 border-error">
            <div className="flex items-center gap-3 text-error mb-4">
              <ShieldAlert size={32} className="animate-pulse" />
              <h2 className="font-h4 font-bold text-xl uppercase tracking-wider">Critical Risk Detected</h2>
            </div>
            <p className="text-sm text-on-surface mb-2">
              The AI Guide has just flagged a critical risk for student <strong>{criticalAlert.student_id}</strong>.
            </p>
            <p className="text-xs font-mono-data bg-error-container/20 text-error p-3 rounded-lg mb-6 border border-error/30">
              Reason: {criticalAlert.risk_reason}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setCriticalAlert(null)}
                className="flex-1 py-2.5 rounded-lg border border-border-structural text-sm font-semibold hover:bg-surface-container transition-colors"
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
                Investigate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SideNavBar from Stitch (Desktop only) */}
      <nav className="h-screen w-64 fixed left-0 top-0 bg-panel-low border-r border-border-structural hidden md:flex flex-col py-6 px-4 z-40">
        <div className="mb-8 flex items-center gap-3 px-2 mt-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-interactive-primary to-secondary flex items-center justify-center shrink-0 shadow-md shadow-interactive-primary/30">
            <span className="material-symbols-outlined text-white text-[20px]">psychology</span>
          </div>
          <div>
            <h1 className="font-heading text-lg font-black text-white leading-tight">MindBridge AI</h1>
            <p className="text-xs text-on-surface-variant font-mono uppercase tracking-wider">Clinical Portal</p>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <button onClick={() => { setView('queue'); setSelectedCase(null); }} className={`w-full flex items-center gap-3 ${view === 'queue' && !selectedCase ? 'bg-surface-container-high text-secondary-fixed font-bold border border-interactive-primary/30 shadow-sm' : 'text-on-surface-variant hover:bg-surface-container font-medium'} rounded-xl px-4 py-3 transition-all group`}>
            <span className="material-symbols-outlined text-[20px]" style={view === 'queue' && !selectedCase ? {fontVariationSettings: "'FILL' 1"} : {}}>dashboard</span>
            <span className="text-sm">Clinical Dashboard</span>
          </button>
          <button onClick={() => { setView('appointments'); setSelectedCase(null); }} className={`w-full flex items-center gap-3 ${view === 'appointments' && !selectedCase ? 'bg-surface-container-high text-secondary-fixed font-bold border border-interactive-primary/30 shadow-sm' : 'text-on-surface-variant hover:bg-surface-container font-medium'} rounded-xl px-4 py-3 transition-all group`}>
            <span className="material-symbols-outlined text-[20px]" style={view === 'appointments' && !selectedCase ? {fontVariationSettings: "'FILL' 1"} : {}}>event</span>
            <span className="text-sm">Appointments</span>
          </button>
        </div>
        <div className="mt-auto pt-6 border-t border-border-internal space-y-2">
          <button
            onClick={() => { setView('sos'); setSelectedCase(null); }}
            className={`w-full ${view === 'sos' && !selectedCase ? 'bg-rose-600 text-white font-black border-2 border-rose-400 shadow-lg shadow-rose-600/40' : 'bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25'} rounded-xl px-4 py-3 flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider transition-all relative`}
          >
            <span className="material-symbols-outlined text-[18px]">emergency</span>
            <span>Emergency SOS Hub</span>
            {activeAlerts.length > 0 && (
              <span className="ml-auto bg-white text-rose-700 font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow animate-pulse">
                {activeAlerts.length}
              </span>
            )}
          </button>
        </div>
      </nav>

      <div className="ml-0 md:ml-64 flex-1 flex flex-col min-h-screen relative">
        {/* TopAppBar */}
        <header className="docked full-width top-0 sticky z-30 bg-background/90 backdrop-blur-xl border-b border-border-internal flex justify-between items-center py-3 px-4 sm:px-6 min-h-16 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-interactive-primary to-secondary flex md:hidden items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-white text-[18px]">psychology</span>
            </div>
            <h2 className="text-base sm:text-lg font-heading font-black text-white tracking-tight">Clinical Portal</h2>
            <div className="hidden sm:block h-4 w-px bg-border-structural"></div>
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            {activeAlerts.length > 0 || queue.some(q => q.risk_score >= 0.8) ? (
              <div className="hidden sm:flex items-center gap-2 bg-error-container/20 px-3 py-1.5 rounded-full border border-error/40 shadow-sm shadow-error/20">
                <div className="w-2 h-2 rounded-full bg-error animate-pulse"></div>
                <span className="text-[11px] font-mono font-extrabold text-error uppercase tracking-wider">Crisis Mode Active</span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 bg-emerald-500/15 px-3 py-1.5 rounded-full border border-emerald-500/30">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-[11px] font-mono font-extrabold text-emerald-400 uppercase tracking-wider">System Normal</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-on-surface-variant">
              <button className="p-2.5 hover:bg-surface-container rounded-xl transition-colors relative border border-transparent hover:border-border-structural">
                <span className="material-symbols-outlined">notifications</span>
                {queue.length > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-background animate-pulse"></span>}
              </button>
              <button className="p-2.5 hover:bg-surface-container rounded-xl transition-colors border border-transparent hover:border-border-structural">
                <span className="material-symbols-outlined">account_circle</span>
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Tabs (Shown only on screens < md) */}
        <div className="flex md:hidden bg-surface-container-low border-b border-border-structural p-2 gap-1.5 sticky top-16 z-20 shadow-md backdrop-blur-lg">
          <button onClick={() => { setView('queue'); setSelectedCase(null); }} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-heading font-bold transition-all ${view === 'queue' && !selectedCase ? 'bg-gradient-to-r from-interactive-primary/30 to-secondary/30 text-secondary-fixed border border-interactive-primary/40 shadow-sm' : 'text-on-surface-variant hover:text-white'}`}>
            <span className="material-symbols-outlined text-[18px]" style={view === 'queue' && !selectedCase ? {fontVariationSettings: "'FILL' 1"} : {}}>dashboard</span>
            <span>Queue</span>
          </button>
          <button onClick={() => { setView('appointments'); setSelectedCase(null); }} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-heading font-bold transition-all ${view === 'appointments' && !selectedCase ? 'bg-gradient-to-r from-interactive-primary/30 to-secondary/30 text-secondary-fixed border border-interactive-primary/40 shadow-sm' : 'text-on-surface-variant hover:text-white'}`}>
            <span className="material-symbols-outlined text-[18px]" style={view === 'appointments' && !selectedCase ? {fontVariationSettings: "'FILL' 1"} : {}}>event</span>
            <span>Schedule</span>
          </button>
          <button onClick={() => { setView('sos'); setSelectedCase(null); }} className={`flex-1 ${view === 'sos' && !selectedCase ? 'bg-rose-600 text-white border-2 border-rose-400' : 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30'} rounded-xl py-2.5 px-2 flex items-center justify-center gap-1 text-xs font-heading font-extrabold shadow-sm relative`}>
            <span className="material-symbols-outlined text-[18px]">emergency</span>
            <span>SOS</span>
            {activeAlerts.length > 0 && (
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            )}
          </button>
        </div>

        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto space-y-6">
          {view === 'queue' && !selectedCase && (
            <>
              {/* Metrics */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
                <div className="glass-panel rounded-xl p-lg shimmer-edge flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-md">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Active Students</span>
                    <span className="material-symbols-outlined text-interactive-primary text-[20px]">groups</span>
                  </div>
                  <div>
                    <div className="font-h2 text-h2 text-on-surface">1,248</div>
                    <div className="flex items-center gap-xs mt-1 text-secondary font-medium">
                      <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                      <span className="font-mono text-xs">2.4% vs last week</span>
                    </div>
                  </div>
                </div>
                <div className="glass-panel rounded-xl p-lg shimmer-edge flex flex-col justify-between border-error/20 bg-error-container/5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-error/5 to-transparent pointer-events-none"></div>
                  <div className="flex justify-between items-start mb-md relative z-10">
                    <span className="font-label-sm text-label-sm text-error uppercase tracking-wider">High-Risk Alerts</span>
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-error/20">
                      <span className="material-symbols-outlined text-error text-[16px]">warning</span>
                    </div>
                  </div>
                  <div className="relative z-10">
                    <div className="font-h2 text-h2 text-error">{queue.filter(q => q.risk_score >= 0.8).length}</div>
                    <div className="flex items-center gap-xs mt-1 text-on-surface-variant">
                      <span className="font-mono text-xs text-error font-semibold">+{activeAlerts.length || 2} acute priority</span>
                    </div>
                  </div>
                </div>
                <div className="glass-panel rounded-xl p-lg shimmer-edge flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-md">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Avg. Resolution Time</span>
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">timer</span>
                  </div>
                  <div>
                    <div className="font-h2 text-h2 text-on-surface">42<span className="text-h4 text-on-surface-variant ml-1">m</span></div>
                    <div className="flex items-center gap-xs mt-1 text-secondary font-medium">
                      <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                      <span className="font-mono text-xs">5.1% faster ({queue.length} in queue)</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Queue */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter items-start">
                <div className="lg:col-span-2 glass-panel rounded-xl flex flex-col h-[500px]">
                  <div className="p-md border-b border-border-internal flex justify-between items-center bg-panel-high/50 rounded-t-xl">
                    <h3 className="font-h4 text-h4 font-medium flex items-center gap-sm">
                      <span className="w-2 h-2 rounded-full bg-error"></span>
                      Urgent Risk Queue
                    </h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-0">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border-internal bg-surface-container-low/50">
                          <th className="py-3 px-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">ID</th>
                          <th className="py-3 px-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Indicator / Dept</th>
                          <th className="py-3 px-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider w-1/3">Risk Score</th>
                          <th className="py-3 px-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="font-body-md text-body-md text-on-surface divide-y divide-border-internal/50">
                        {queue.map(student => {
                          const isCritical = student.risk_score >= 0.8;
                          const riskColor = isCritical ? 'bg-error' : student.risk_score >= 0.5 ? 'bg-tertiary-fixed-dim' : 'bg-primary-fixed-dim';
                          const riskText = isCritical ? 'text-error' : student.risk_score >= 0.5 ? 'text-tertiary-fixed-dim' : 'text-primary-fixed-dim';
                          
                          return (
                            <tr key={student.anonymous_id} className="hover:bg-surface-container-low transition-colors group">
                              <td className="py-3 px-md font-mono-data text-on-surface">{student.anonymous_id}</td>
                              <td className="py-3 px-md text-sm">
                                <div className="flex flex-col gap-1 items-start">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                                    isCritical 
                                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' 
                                      : student.risk_score >= 0.5 
                                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' 
                                      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  }`}>
                                    <span className="w-1.5 h-1.5 rounded-full fill-current bg-current animate-pulse"></span>
                                    {isCritical ? 'Ideation NLP Flag' : student.risk_score >= 0.5 ? 'Depressive Marker' : 'Routine Check-in'}
                                  </span>
                                  <span className="text-xs text-on-surface-variant font-medium">{student.department} (Y{student.year})</span>
                                </div>
                              </td>
                              <td className="py-3 px-md">
                                <div className="flex items-center gap-sm">
                                  <span className={`font-mono-data w-8 ${riskText}`}>{student.risk_score.toFixed(2)}</span>
                                  <div className="flex-1 h-1.5 bg-surface-bright rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${riskColor}`} style={{ width: `${student.risk_score * 100}%` }}></div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-md text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {student.risk_score >= 0.8 && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedCase(student.anonymous_id);
                                        setEscalateModalOpen(true);
                                      }}
                                      className="bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/40 px-3 py-1.5 rounded text-xs font-heading font-extrabold flex items-center gap-1 transition-colors shadow-sm animate-pulse"
                                      title="Emergency Identity Reveal Authorized (Score ≥ 0.8)"
                                    >
                                      <span className="material-symbols-outlined text-[15px]">emergency</span>
                                      Reveal Identity
                                    </button>
                                  )}
                                  <button onClick={() => setSelectedCase(student.anonymous_id)} className="bg-surface-container border border-border-structural text-on-surface hover:bg-surface-container-high px-3 py-1.5 rounded transition-colors text-sm font-medium flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[16px]">chat</span>
                                    View Case
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                        {queue.length === 0 && (
                          <tr><td colSpan={4} className="py-8 text-center text-on-surface-variant">Queue is clear</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="glass-panel rounded-xl flex flex-col h-[500px]">
                  <div className="p-md border-b border-border-internal flex justify-between items-center bg-panel-high/50 rounded-t-xl">
                    <h3 className="font-h4 text-h4 font-medium flex items-center gap-sm">
                      <span className="material-symbols-outlined text-secondary text-[20px]">videocam</span>
                      Upcoming Sessions
                    </h3>
                  </div>
                  <div className="flex-1 p-md space-y-md overflow-y-auto">
                    {appointments.filter(a => a.status === 'confirmed').length === 0 && (
                      <p className="text-on-surface-variant text-sm text-center py-6">No upcoming sessions.</p>
                    )}
                    {appointments.filter(a => a.status === 'confirmed').map(appt => {
                       const dt = new Date(appt.slot_time);
                       return (
                          <div key={appt.id} className="bg-panel-low border border-border-internal rounded-lg p-md relative overflow-hidden group hover:border-interactive-primary/50 transition-colors">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-interactive-primary rounded-l-lg"></div>
                            <div className="flex justify-between items-start mb-2 pl-2">
                              <div>
                                <div className="font-mono-data text-label-sm text-on-surface-variant mb-1">{appt.anonymous_id}</div>
                                <div className="font-body-md font-medium text-on-surface">Session</div>
                              </div>
                              <div className="bg-surface-container px-2 py-1 rounded text-xs font-mono-data text-interactive-primary border border-border-structural flex items-center gap-1">
                                {dt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </div>
                            </div>
                            <div className="mt-4 pl-2 flex gap-2">
                              <button className="flex-1 bg-interactive-primary hover:bg-primary-fixed-dim text-white py-1.5 rounded text-sm font-medium transition-colors">
                                Join Telehealth
                              </button>
                            </div>
                          </div>
                       )
                    })}
                  </div>
                </div>
              </section>
            </>
          )}

          {/* Appointments View */}
          {view === 'appointments' && !selectedCase && (
            <div className="glass-panel p-lg rounded-xl">
              <h2 className="font-h4 mb-6">Manage Appointments</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
                {appointments.map(appt => {
                  const dt = new Date(appt.slot_time);
                  const isFuture = dt > new Date();
                  return (
                    <div key={appt.id} className="bg-surface-container border border-border-internal rounded-lg p-md">
                      <div className="flex justify-between mb-4">
                        <span className="font-mono-data text-primary">{appt.anonymous_id}</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-surface-bright">{appt.status.toUpperCase()}</span>
                      </div>
                      <div className="text-sm text-on-surface-variant space-y-1 mb-4">
                        <p>{dt.toLocaleDateString()}</p>
                        <p>{dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {appt.status === 'pending' && isFuture && (
                          <div className="flex gap-2">
                            <button onClick={() => handleUpdateApptStatus(appt.id, 'confirmed')} className="flex-1 py-1.5 bg-success/20 text-success text-xs rounded hover:bg-success/30">Approve</button>
                            <button onClick={() => setRescheduleId(appt.id === rescheduleId ? null : appt.id)} className="flex-1 py-1.5 bg-warning/20 text-warning text-xs rounded hover:bg-warning/30">Reschedule</button>
                          </div>
                        )}
                        {appt.status !== 'cancelled' && isFuture && (
                          <button onClick={() => handleUpdateApptStatus(appt.id, 'cancelled')} className="w-full py-1.5 bg-error/20 text-error text-xs rounded hover:bg-error/30">Cancel</button>
                        )}
                        {appt.status === 'confirmed' && !isFuture && (
                          <button onClick={() => handleUpdateApptStatus(appt.id, 'completed')} className="w-full py-1.5 bg-interactive-primary text-white text-xs rounded hover:bg-primary-hover">Mark Complete</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Emergency SOS Hub View */}
          {view === 'sos' && !selectedCase && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-950/60 via-surface-container-high to-red-950/50 border-2 border-rose-500/50 shadow-xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/50 animate-bounce">
                      <span className="material-symbols-outlined text-2xl">emergency</span>
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-heading font-black text-white tracking-tight flex items-center gap-2">
                        Emergency SOS & Identity Triage Hub
                      </h2>
                      <p className="text-xs sm:text-sm text-rose-200/80 max-w-2xl leading-relaxed">
                        Live monitored feed of student-triggered crisis alarms and critical AI risk overflows. 
                        Authorized clinicians can initiate audited anonymity deconstruction (<code className="text-white font-mono bg-rose-950/80 px-1.5 py-0.5 rounded">SRS Section 16</code>) to save lives.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-rose-900/40 border border-rose-500/50 px-4 py-2 rounded-xl text-center">
                    <div className="text-2xl font-mono font-black text-white">{activeAlerts.length + queue.filter(q => q.risk_score >= 0.8 && !activeAlerts.some(a => a.student_alias === q.anonymous_id)).length}</div>
                    <div className="text-[10px] uppercase font-bold text-rose-300 text-left">Active<br/>Crises</div>
                  </div>
                </div>
              </div>

              {activeAlerts.length === 0 && queue.filter(q => q.risk_score >= 0.8).length === 0 ? (
                <div className="p-12 rounded-2xl glass-panel text-center border-emerald-500/30 bg-emerald-950/10 space-y-3 shadow-lg">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40 shadow-inner">
                    <span className="material-symbols-outlined text-3xl">verified_user</span>
                  </div>
                  <h3 className="text-lg font-heading font-black text-white">All Clear on Campus Support</h3>
                  <p className="text-sm text-on-surface-variant max-w-md mx-auto">
                    There are no active emergency SOS broadcasts or severe critical risk scores requiring intervention right now.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeAlerts.map(alert => (
                    <div key={alert.id} className="p-6 rounded-2xl bg-gradient-to-br from-panel-low via-surface-container to-red-950/30 border border-rose-500/60 shadow-xl flex flex-col justify-between hover:border-rose-400 transition-all relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600/10 rounded-full blur-2xl pointer-events-none group-hover:bg-rose-600/20 transition-all"></div>
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-600/30 text-rose-300 text-[11px] font-mono font-black uppercase border border-rose-500/40 tracking-wider">
                            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
                            {alert.triggered_by === 'user_sos' ? '🚨 STUDENT SOS ALARM' : '⚡ CRITICAL AI FLAG'}
                          </span>
                          <span className="text-xs font-mono text-on-surface-variant">
                            {alert.created_at ? new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                          </span>
                        </div>

                        <div className="space-y-2 mb-6">
                          <div className="flex items-baseline justify-between">
                            <h4 className="text-lg font-heading font-black text-white">{alert.student_alias}</h4>
                            <span className="text-sm font-mono font-extrabold text-rose-400">Risk: {(alert.risk_score * 100).toFixed(0)}%</span>
                          </div>
                          <p className="text-xs text-on-surface-variant">
                            Department of <span className="text-on-surface font-semibold">{alert.department}</span> (Year {alert.year})
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 pt-4 border-t border-border-internal/60">
                        <button
                          onClick={() => { setSelectedCase(alert.student_alias); setEscalateModalOpen(true); }}
                          className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-heading font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all active:scale-95"
                        >
                          <span className="material-symbols-outlined text-[18px]">lock_open</span>
                          Emergency Reveal Identity
                        </button>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedCase(alert.student_alias)}
                            className="flex-1 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-semibold text-xs transition-colors border border-border-structural"
                          >
                            Open Clinical Case
                          </button>
                          <button
                            onClick={() => handleResolveAlert(alert.id)}
                            className="px-3 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-bold transition-colors border border-emerald-500/30"
                            title="Dismiss or mark resolved"
                          >
                            ✓ Resolve
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Show Critical Queue Students that haven't explicitly created an Alert object yet */}
                  {queue.filter(q => q.risk_score >= 0.8 && !activeAlerts.some(a => a.student_alias === q.anonymous_id)).map(student => (
                    <div key={student.anonymous_id} className="p-6 rounded-2xl bg-gradient-to-br from-panel-low via-surface-container to-amber-950/20 border border-amber-500/40 shadow-xl flex flex-col justify-between hover:border-amber-400/60 transition-all relative">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-600/20 text-amber-300 text-[11px] font-mono font-black uppercase border border-amber-500/40">
                            ⚡ HIGH-RISK THRESHOLD
                          </span>
                        </div>
                        <div className="space-y-2 mb-6">
                          <div className="flex items-baseline justify-between">
                            <h4 className="text-lg font-heading font-black text-white">{student.anonymous_id}</h4>
                            <span className="text-sm font-mono font-extrabold text-amber-400">Risk: {(student.risk_score * 100).toFixed(0)}%</span>
                          </div>
                          <p className="text-xs text-on-surface-variant">
                            Department of <span className="text-on-surface font-semibold">{student.department}</span> (Year {student.year})
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 pt-4 border-t border-border-internal/60">
                        <button
                          onClick={() => { setSelectedCase(student.anonymous_id); setEscalateModalOpen(true); }}
                          className="w-full py-3 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-heading font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 transition-all"
                        >
                          <span className="material-symbols-outlined text-[18px]">lock_open</span>
                          Reveal Identity (Emergency)
                        </button>
                        <button
                          onClick={() => setSelectedCase(student.anonymous_id)}
                          className="w-full py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-semibold text-xs transition-colors border border-border-structural"
                        >
                          Open Clinical Case & Chat
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Case Details View */}
          {selectedCase && caseDetails && (
            <div className="glass-panel flex flex-col rounded-xl overflow-hidden h-[calc(100vh-140px)]">
              <div className="bg-panel-high border-b border-border-internal p-4 flex items-center justify-between">
                <div>
                  <h2 className="font-h4 font-bold flex items-center gap-2">
                    <button onClick={() => setSelectedCase(null)} className="hover:bg-surface-container p-1 rounded-full"><span className="material-symbols-outlined text-[20px]">arrow_back</span></button>
                    {selectedCase}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  {caseDetails.student.risk_score >= 0.8 && !decryptedIdentity && (
                    <button 
                      onClick={() => setEscalateModalOpen(true)} 
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-heading font-extrabold text-xs rounded transition-all shadow-md shadow-rose-600/30 flex items-center gap-1 animate-pulse"
                    >
                      <span className="material-symbols-outlined text-[16px]">emergency</span>
                      🚨 Reveal Identity
                    </button>
                  )}
                  <button onClick={handleResolve} className="px-3 py-1.5 bg-success/20 text-success hover:bg-success/30 text-sm rounded transition-colors flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span> Resolve
                  </button>
                </div>
              </div>

              {/* Persistent Emergency & Identity Audit Bar */}
              {(caseDetails.student.risk_score >= 0.8 || decryptedIdentity) && (
                <div className={`px-6 py-3 ${decryptedIdentity ? 'bg-gradient-to-r from-amber-950/80 via-surface-container to-red-950/80 border-b-2 border-amber-500' : 'bg-rose-950/60 border-b border-rose-500/50'} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-inner`}>
                  {decryptedIdentity ? (
                    <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-400 text-[22px]">gpp_maybe</span>
                        <div>
                          <span className="text-xs font-mono font-black uppercase tracking-wider text-amber-300">🔓 AUDITING COMPLIANCE (SRS SEC 16): IDENTITY DECONSTRUCTED</span>
                          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-white mt-0.5">
                            <span>Legal Name: <strong className="font-mono text-amber-200 text-sm">{decryptedIdentity.name}</strong></span>
                            <span>Phone: <strong className="font-mono text-amber-200 text-sm">{decryptedIdentity.phone}</strong></span>
                            <span>Email: <strong className="font-mono text-amber-200 text-sm">{decryptedIdentity.email}</strong></span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded border border-amber-500/30">Immutable DB Record Created</span>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-rose-200 text-xs">
                        <span className="material-symbols-outlined text-rose-500 text-[20px] animate-pulse">warning</span>
                        <span><strong>Critical Crisis Case (Score: {(caseDetails.student.risk_score * 100).toFixed(0)}%).</strong> Student life safety protocol permits breaking anonymity under strict database audit logging.</span>
                      </div>
                      <button 
                        onClick={() => setEscalateModalOpen(true)}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider rounded shadow-md shrink-0"
                      >
                        Break Anonymity & Reveal
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Tabs */}
              <div className="flex border-b border-border-internal bg-panel-low">
                {([['chat', 'Chat', 'chat'], ['notes', 'Notes', 'edit_document'], ['timeline', 'Timeline', 'trending_up'], ['followup', 'Follow-up', 'event']] as const).map(([key, label, icon]) => (
                  <button key={key} onClick={() => setCaseTab(key as typeof caseTab)}
                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-all ${caseTab === key ? 'border-primary text-primary bg-surface-container' : 'border-transparent text-on-surface-variant hover:bg-surface-container'}`}>
                    <span className="material-symbols-outlined text-[18px]">{icon}</span> {label}
                  </button>
                ))}
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-md flex flex-col">
                {caseTab === 'chat' && (
                  <div className="flex-1 flex flex-col">
                    <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                      {caseDetails.chat_history.map(msg => (
                        <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                          {msg.sender !== 'user' && (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.sender === 'counselor' ? 'bg-orange-400/20 text-orange-400' : 'bg-primary-container text-on-primary-container'}`}>
                              <span className="material-symbols-outlined text-[16px]">{msg.sender === 'counselor' ? 'psychology' : 'smart_toy'}</span>
                            </div>
                          )}
                          <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${msg.sender === 'user' ? 'bg-surface-container-high rounded-tr-none' : msg.sender === 'counselor' ? 'bg-orange-400/20 rounded-tl-none border border-orange-400/30' : 'bg-primary-container/20 rounded-tl-none border border-primary-container/30'}`}>
                             {msg.sender !== 'user' && <p className="text-[10px] uppercase font-bold mb-1 opacity-70">{msg.sender === 'counselor' ? 'You' : 'AI Guide'}</p>}
                             <p className="text-sm">{msg.text}</p>
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>
                    <div className="mt-auto bg-surface-container p-2 rounded-lg flex items-center gap-2 border border-border-internal">
                      <input 
                        type="text" 
                        value={counselorMessage} 
                        onChange={e => setCounselorMessage(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Send message to student as Counselor..."
                        className="flex-1 bg-transparent border-none text-sm px-2 focus:outline-none"
                      />
                      <button onClick={handleSendMessage} className="bg-primary hover:bg-primary-hover text-white p-2 rounded-md">
                        <span className="material-symbols-outlined text-[18px]">send</span>
                      </button>
                    </div>
                  </div>
                )}
                {caseTab === 'notes' && (
                  <div className="space-y-4">
                    <textarea value={newNote} onChange={e=>setNewNote(e.target.value)} rows={4} className="w-full bg-surface-container border border-border-internal rounded-lg p-3 text-sm focus:outline-none" placeholder="Clinical notes..."></textarea>
                    <button onClick={handleSaveNote} className="w-full bg-primary py-2 rounded-lg text-sm text-white">Save Note</button>
                    <div className="space-y-2">
                      {notes.map(n => (
                        <div key={n.id} className="bg-surface-container-low p-3 rounded-lg border border-border-internal">
                           <p className="text-xs text-on-surface-variant mb-1">{new Date(n.created_at).toLocaleString()}</p>
                           <p className="text-sm whitespace-pre-wrap">{n.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {caseTab === 'timeline' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-surface-container p-4 rounded-lg text-center"><p className="text-h3 text-error">{caseDetails.student.risk_score.toFixed(1)}</p><p className="text-xs text-on-surface-variant uppercase">Risk Score</p></div>
                      <div className="bg-surface-container p-4 rounded-lg text-center"><p className="text-h3">{caseDetails.mood_logs.length}</p><p className="text-xs text-on-surface-variant uppercase">Mood Logs</p></div>
                      <div className="bg-surface-container p-4 rounded-lg text-center"><p className="text-h3">{caseDetails.chat_history.length}</p><p className="text-xs text-on-surface-variant uppercase">Chat Msgs</p></div>
                    </div>
                    {caseDetails.student.risk_score >= 0.8 && !decryptedIdentity && (
                        <button 
                          onClick={() => setEscalateModalOpen(true)}
                          className="w-full mt-4 py-3 bg-rose-600 text-white text-sm font-heading font-black uppercase tracking-wider rounded-xl hover:bg-rose-500 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30"
                        >
                          <span className="material-symbols-outlined">lock_open</span>
                          🚨 Emergency Identity Reveal & Security Escalation
                        </button>
                      )}
                      
                      {decryptedIdentity && (
                        <div className="mt-4 p-4 bg-error-container/20 border border-error/40 rounded-lg space-y-2">
                          <p className="text-sm font-bold text-error uppercase tracking-wider mb-2">Decrypted Identity</p>
                          <div className="flex justify-between text-sm"><span className="text-error/70">Name</span><span className="font-semibold text-on-surface">{decryptedIdentity.name}</span></div>
                          <div className="flex justify-between text-sm"><span className="text-error/70">Phone</span><span className="font-semibold text-on-surface">{decryptedIdentity.phone}</span></div>
                          <div className="flex justify-between text-sm"><span className="text-error/70">Email</span><span className="font-semibold text-on-surface">{decryptedIdentity.email}</span></div>
                        </div>
                      )}
                  </div>
                )}
                {caseTab === 'followup' && (
                   <div className="space-y-4">
                      <div className="bg-surface-container p-4 rounded-lg space-y-3">
                        <input type="date" value={followupDate} onChange={e=>setFollowupDate(e.target.value)} className="w-full bg-surface-container-high p-2 rounded text-sm focus:outline-none" style={{ colorScheme: 'dark' }} />
                        <input type="text" value={followupReason} onChange={e=>setFollowupReason(e.target.value)} placeholder="Reason" className="w-full bg-surface-container-high p-2 rounded text-sm focus:outline-none"/>
                        <button onClick={handleSaveFollowup} className="w-full bg-primary py-2 rounded text-sm text-white hover:bg-primary-hover">Schedule</button>
                      </div>
                      {followUps.map(f => (
                         <div key={f.id} className="flex justify-between items-center bg-surface-container p-3 rounded-lg border border-border-internal">
                            <div><p className="text-sm font-medium">{f.due_date}</p><p className="text-xs text-on-surface-variant">{f.reason}</p></div>
                            {!f.completed && <button onClick={()=>handleCompleteFollowup(f.id)} className="bg-success/20 text-success px-3 py-1 rounded text-xs font-semibold hover:bg-success/30">Mark Done</button>}
                         </div>
                      ))}
                   </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
