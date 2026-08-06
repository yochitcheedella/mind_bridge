import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch, getAlias } from '../utils/auth';

interface Slot {
  psychologist_id: number;
  psychologist_name: string;
  specialization: string;
  slot_time: string;
}

interface Appointment {
  id: number;
  psychologist_name: string;
  specialization: string;
  slot_time: string;
  status: string;
  notes: string | null;
  meeting_link?: string;
  check_in_code?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  confirmed: { label: 'Confirmed', color: 'bg-[#a1f3c3]/15 text-[#a1f3c3] border-[#a1f3c3]/25', icon: 'check_circle' },
  pending:   { label: 'Pending',   color: 'bg-warning/15 text-warning border-warning/25', icon: 'pending' },
  cancelled: { label: 'Cancelled', color: 'bg-error/15 text-error border-error/25',       icon: 'cancel' },
};

export default function Appointments() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'book' | 'mine'>('book');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [myAppts, setMyAppts] = useState<Appointment[]>([]);
  const [selectedDoc, setSelectedDoc] = useState('1'); 
  const [reqDate, setReqDate] = useState('');
  const [reqTime, setReqTime] = useState('');
  const [psychologists, setPsychologists] = useState<any[]>([]);
  const [isBooking, setIsBooking] = useState(false);
  const [loadingMine, setLoadingMine] = useState(true);
  const [bookedMsg, setBookedMsg] = useState('');

  // Sync with Backend
  useEffect(() => {
    // Load psychologists
    apiFetch('/api/appointments/psychologists')
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d)) {
          setPsychologists(d);
          if (d.length > 0) setSelectedDoc(d[0].id.toString());
        }
      })
      .catch(() => {});

    const loadAppointments = () => {
      apiFetch('/api/appointments/mine')
        .then(r => r.json())
        .then(parsed => {
          if (!Array.isArray(parsed)) return;
          
          setMyAppts(prev => {
            parsed.forEach((newAppt: any) => {
              const oldAppt = prev.find(p => p.id === newAppt.id);
              if (oldAppt && oldAppt.status === 'pending' && newAppt.status === 'rescheduled') {
                const dt = new Date(newAppt.slot_time);
                setBookedMsg(`Update: ${newAppt.psychologist_name} rescheduled to ${dt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} on ${dt.toLocaleDateString()}`);
                setTimeout(() => setBookedMsg(''), 8000);
              } else if (oldAppt && oldAppt.status === 'pending' && newAppt.status === 'confirmed') {
                setBookedMsg(`Update: ${newAppt.psychologist_name} confirmed your session!`);
                setTimeout(() => setBookedMsg(''), 6000);
              }
            });
            return parsed;
          });
        })
        .finally(() => setLoadingMine(false));
    };

    loadAppointments();
    const interval = setInterval(loadAppointments, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleRequestBooking = async () => {
    setIsBooking(true);
    try {
      const dt = new Date(`${reqDate}T${reqTime}`);
      const res = await apiFetch('/api/appointments/book', {
        method: 'POST',
        body: JSON.stringify({ psychologist_id: parseInt(selectedDoc), slot_time: dt.toISOString() })
      });
      if (res.ok) {
        const docName = psychologists.find(p => p.id.toString() === selectedDoc)?.name || 'Counselor';
        setBookedMsg(`Request sent! Waiting for ${docName} to review.`);
        setActiveTab('mine');
        setReqDate('');
        setReqTime('');
        setTimeout(() => setBookedMsg(''), 6000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsBooking(false);
    }
  };

  const handleCancel = async (id: number) => {
    await apiFetch(`/api/appointments/cancel/${id}`, { method: 'DELETE' }).catch(() => null);
    setMyAppts(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
  };

  return (
    <div className="min-h-screen bg-canvas-global pb-24 text-on-surface">
      <header className="sticky top-0 z-10 bg-surface-dim/80 backdrop-blur-xl border-b border-border-internal px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/student/home" className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-bright transition-colors">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </Link>
          <div>
            <h1 className="font-h4 font-bold text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">event</span>
              Counseling Sessions
            </h1>
            <p className="font-mono-data text-[10px] text-on-surface-variant mt-0.5">Anonymous ID mode</p>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-5 animate-fade-in">
        {bookedMsg && (
          <div className="mb-4 flex items-center gap-2 bg-primary/10 border border-primary/25 rounded-xl px-4 py-3 text-sm text-primary animate-slide-up shadow-lg">
            <span className="material-symbols-outlined text-[18px] shrink-0">info</span>
            <span className="leading-tight">{bookedMsg}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-[#070708] rounded-xl p-1 mb-6 border border-border-internal overflow-hidden">
          {(['book', 'mine'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all
                ${activeTab === tab ? 'bg-panel-high text-primary shadow-[0_2px_8px_rgba(0,0,0,0.5)] border border-border-structural inner-glow-top' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface border border-transparent'}`}>
              {tab === 'book' ? 'Book a Session' : `My Sessions (${myAppts.filter(a => a.status !== 'cancelled').length})`}
            </button>
          ))}
        </div>

        {activeTab === 'book' ? (
          <div className="glass-panel p-5 rounded-xl border border-border-internal space-y-5 animate-slide-up">
            <h2 className="font-h4 text-h4 font-bold mb-2">Request an Appointment</h2>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">psychology</span> 1. Choose Counselor
              </label>
              <select value={selectedDoc} onChange={e => setSelectedDoc(e.target.value)}
                style={{ colorScheme: 'dark' }}
                className="w-full bg-surface border border-border-internal rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-interactive-primary transition-all appearance-none cursor-pointer">
                {psychologists.map(doc => <option key={doc.id} value={doc.id} style={{ background: '#12121E', color: '#fff' }}>{doc.name} - {doc.specialization}</option>)}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">calendar_today</span> 2. Select Date
              </label>
              <input type="date" value={reqDate} onChange={e => setReqDate(e.target.value)}
                style={{ colorScheme: 'dark' }}
                className="w-full bg-surface border border-border-internal rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-interactive-primary transition-all cursor-pointer" />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">schedule</span> 3. Select Time
              </label>
              <input type="time" value={reqTime} onChange={e => setReqTime(e.target.value)}
                style={{ colorScheme: 'dark' }}
                className="w-full bg-surface border border-border-internal rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-interactive-primary transition-all cursor-pointer" />
            </div>
            
            <button onClick={handleRequestBooking} disabled={!reqDate || !reqTime || isBooking}
              className="w-full py-3.5 rounded-xl bg-interactive-primary text-on-primary font-bold text-sm hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed mt-2 shadow-lg shadow-interactive-primary/20">
              {isBooking ? 'Sending Request...' : 'Send Appointment Request'}
            </button>
            <p className="font-mono-data text-[10px] text-on-surface-variant text-center mt-3">The psychologist will review your request and either confirm or propose a new time.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {loadingMine ? (
              <div className="text-center py-10 text-on-surface-variant text-sm">Loading your sessions...</div>
            ) : myAppts.length === 0 ? (
              <div className="glass-panel text-center py-12 rounded-xl text-on-surface-variant border border-border-internal">
                <span className="material-symbols-outlined text-[32px] mx-auto mb-3 opacity-40">event_busy</span>
                <p className="text-sm font-medium">No sessions yet</p>
                <p className="text-xs mt-1 opacity-60">Book your first anonymous counseling session.</p>
                <button onClick={() => setActiveTab('book')} className="mt-4 text-interactive-primary text-sm hover:brightness-110 font-bold transition-colors">
                  Browse available slots →
                </button>
              </div>
            ) : (
              myAppts.map(appt => {
                const dt = new Date(appt.slot_time);
                const statusCfg = STATUS_CONFIG[appt.status] || STATUS_CONFIG.pending;
                const isFuture = dt > new Date();
                return (
                  <div key={appt.id} className="glass-panel p-4 rounded-xl border border-border-internal animate-slide-up group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-container-high border border-border-internal flex items-center justify-center shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">person</span>
                        </div>
                        <div>
                          <h3 className="font-body-md font-bold text-on-surface">{appt.psychologist_name}</h3>
                          <p className="text-label-sm text-on-surface-variant">{appt.specialization}</p>
                          <div className="flex items-center gap-1.5 mt-2 font-mono-data text-[10px] text-on-surface-variant uppercase">
                            <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                            {dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            <span>•</span>
                            <span className="material-symbols-outlined text-[12px]">schedule</span>
                            {dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-1 rounded-full border font-semibold flex items-center gap-1 shrink-0 ${statusCfg.color}`}>
                        <span className="material-symbols-outlined text-[12px]">{statusCfg.icon}</span> {statusCfg.label}
                      </span>
                    </div>
                    
                    {appt.status === 'confirmed' && isFuture && (
                      <div className="mt-4 pt-3 border-t border-border-internal flex justify-between items-center">
                        <button onClick={() => handleCancel(appt.id)}
                          className="font-label-sm text-label-sm text-on-surface-variant hover:text-error transition-colors flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">cancel</span> Cancel
                        </button>
                        <div className="flex items-center gap-2">
                          {appt.meeting_link ? (
                            <button className="text-xs bg-interactive-primary/20 text-primary px-3 py-1.5 rounded-lg font-bold hover:bg-interactive-primary/30 transition-all flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[14px]">videocam</span> Join Video
                            </button>
                          ) : appt.check_in_code ? (
                            <button className="text-xs bg-surface-container-low border border-border-internal text-on-surface px-3 py-1.5 rounded-lg font-bold hover:bg-surface-container transition-all flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[14px]">qr_code</span> QR Check-in
                            </button>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
