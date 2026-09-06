import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Building2, Sparkles, Heart, Shield, Award, Clock, Calendar, 
  X, Check, MessageSquare, PhoneCall, ChevronRight, Info
} from 'lucide-react';
import { apiFetch, getAlias } from '../utils/auth';

interface CounselorProfile {
  id: number;
  name: string;
  specialization: string;
  institution?: string;
  experience?: string;
  avatar_url?: string;
  full_photo_url?: string;
  quote?: string;
  pillars?: string;
  focus_areas?: string;
  message_to_students?: string;
  fun_facts?: string;
}

interface Appointment {
  id: number;
  psychologist_name: string;
  specialization: string;
  slot_time: string;
  status: string;
  notes: string | null;
  student_alias?: string;
  meeting_link?: string;
  check_in_code?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  confirmed:   { label: 'Confirmed',   color: 'bg-[#a1f3c3]/15 text-[#a1f3c3] border-[#a1f3c3]/25', icon: 'check_circle' },
  pending:     { label: 'Pending',     color: 'bg-warning/15 text-warning border-warning/25', icon: 'pending' },
  cancelled:   { label: 'Cancelled',   color: 'bg-error/15 text-error border-error/25',       icon: 'cancel' },
  rescheduled: { label: 'Rescheduled', color: 'bg-amber-500/15 text-amber-300 border-amber-500/25', icon: 'update' },
  completed:   { label: 'Completed',   color: 'bg-blue-500/15 text-blue-400 border-blue-500/25',   icon: 'task_alt' },
};

export default function Appointments() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'team' | 'book' | 'mine'>('team');
  const [myAppts, setMyAppts] = useState<Appointment[]>([]);
  const [psychologists, setPsychologists] = useState<CounselorProfile[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<string>('1'); 
  const [reqDate, setReqDate] = useState('');
  const [reqTime, setReqTime] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [loadingMine, setLoadingMine] = useState(true);
  const [bookedMsg, setBookedMsg] = useState('');
  const [activeModalCounselor, setActiveModalCounselor] = useState<CounselorProfile | null>(null);

  // Sync with Backend
  useEffect(() => {
    // Load psychologists
    apiFetch('/api/appointments/psychologists')
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d)) {
          setPsychologists(d);
          if (d.length > 0 && !selectedDoc) {
            setSelectedDoc(d[0].id.toString());
          }
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
  }, [selectedDoc]);

  const handleSelectCounselorForBooking = (counselorId: number) => {
    setSelectedDoc(counselorId.toString());
    setActiveTab('book');
    setActiveModalCounselor(null);
  };

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
        setBookedMsg(`Request sent to ${docName}! They will review and confirm shortly.`);
        setActiveTab('mine');
        setReqDate('');
        setReqTime('');
        setTimeout(() => setBookedMsg(''), 7000);
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

  const selectedCounselor = psychologists.find(p => p.id.toString() === selectedDoc);

  return (
    <div className="min-h-screen bg-canvas-global pb-24 text-on-surface">
      {/* ── Institutional Top Bar ── */}
      <header className="sticky top-0 z-20 bg-surface-dim/90 backdrop-blur-xl border-b border-border-internal px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <Link to="/student/home" className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-bright transition-colors">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <img 
              src="/logo.png" 
              alt="Vishnu Wellness Centre" 
              className="w-8 h-8 rounded-full object-cover border border-secondary/40 shadow-sm"
              style={{ borderRadius: '9999px' }}
            />
            <div>
              <h1 className="font-heading font-bold text-sm sm:text-base flex items-center gap-1.5 leading-tight">
                <span>Vishnu Wellness Centre</span>
                <span className="text-[11px] font-mono text-secondary-fixed hidden sm:inline">• Counseling</span>
              </h1>
              <p className="font-mono text-[10px] text-on-surface-variant">100% Anonymous & Confidential • Sri Vishnu Educational Society</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container border border-border-structural text-[11px] font-mono text-on-surface-variant">
            <Shield size={12} className="text-secondary-fixed" />
            <span className="hidden sm:inline">Alias:</span>
            <span className="font-bold text-primary">{getAlias() || 'Student'}</span>
          </span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
        
        {/* ── Status Notification Banner ── */}
        {bookedMsg && (
          <div className="mb-6 flex items-center gap-3 bg-secondary/15 border border-secondary/30 rounded-2xl px-5 py-3.5 text-sm text-secondary-fixed animate-slide-up shadow-xl backdrop-blur-md">
            <Sparkles size={20} className="shrink-0 text-secondary-fixed" />
            <span className="font-medium">{bookedMsg}</span>
          </div>
        )}

        {/* ── Institutional Hero Showcase Banner ── */}
        <div className="glass-panel p-5 sm:p-7 rounded-3xl border border-border-internal relative overflow-hidden mb-8 shadow-2xl">
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-secondary-fixed font-semibold">
                <Building2 size={13} />
                <span>Established 2017 • Sri Vishnu Educational Society</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-heading font-black text-white tracking-tight">
                Our Team of 7 Dedicated Wellness Counsellors
              </h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Working around the clock to support the mental health, resilience, and personal growth of students across all Vishnu campuses. Safe, ethical, and completely confidential.
              </p>
              <div className="flex flex-wrap gap-2 pt-2 text-[11px] font-mono text-on-surface-variant">
                <span className="px-2.5 py-0.5 rounded-md bg-surface-container border border-border-internal">♡ Compassion</span>
                <span className="px-2.5 py-0.5 rounded-md bg-surface-container border border-border-internal">🔒 Confidentiality</span>
                <span className="px-2.5 py-0.5 rounded-md bg-surface-container border border-border-internal">🤝 Empathy</span>
                <span className="px-2.5 py-0.5 rounded-md bg-surface-container border border-border-internal">⚖️ Integrity</span>
                <span className="px-2.5 py-0.5 rounded-md bg-surface-container border border-border-internal">🌱 Well-Being</span>
              </div>
            </div>

            <div className="flex flex-row md:flex-col gap-2.5 w-full md:w-auto shrink-0">
              <button 
                onClick={() => setActiveTab('team')}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all text-center flex-1 md:flex-initial ${
                  activeTab === 'team'
                    ? 'bg-secondary-fixed text-[#07070a] shadow-lg shadow-secondary/20'
                    : 'bg-surface-container hover:bg-surface-bright text-white border border-border-structural'
                }`}
              >
                Meet Our Counselors
              </button>
              <button 
                onClick={() => setActiveTab('book')}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all text-center flex-1 md:flex-initial ${
                  activeTab === 'book'
                    ? 'bg-interactive-primary text-white shadow-lg shadow-interactive-primary/25'
                    : 'bg-surface-container hover:bg-surface-bright text-white border border-border-structural'
                }`}
              >
                Book a Session
              </button>
            </div>
          </div>
        </div>

        {/* ── Main Navigation Tabs ── */}
        <div className="flex bg-[#0a0c12] rounded-2xl p-1.5 mb-8 border border-border-internal shadow-xl overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => setActiveTab('team')}
            className={`flex-1 min-w-[140px] py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'team'
                ? 'bg-surface-container-high text-secondary-fixed border border-secondary/30 shadow-md'
                : 'text-on-surface-variant hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">diversity_3</span>
            <span>Meet Counselors ({psychologists.length})</span>
          </button>

          <button 
            onClick={() => setActiveTab('book')}
            className={`flex-1 min-w-[140px] py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'book'
                ? 'bg-surface-container-high text-interactive-primary border border-interactive-primary/30 shadow-md'
                : 'text-on-surface-variant hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">edit_calendar</span>
            <span>Book Appointment</span>
          </button>

          <button 
            onClick={() => setActiveTab('mine')}
            className={`flex-1 min-w-[140px] py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'mine'
                ? 'bg-surface-container-high text-white border border-border-structural shadow-md'
                : 'text-on-surface-variant hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">event_available</span>
            <span>My Sessions ({myAppts.filter(a => a.status !== 'cancelled').length})</span>
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 1: MEET THE COUNSELORS ROSTER
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'team' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-internal pb-4">
              <div>
                <h3 className="text-lg font-heading font-bold text-white">Our Clinical & Wellness Team</h3>
                <p className="text-xs text-on-surface-variant">Each counsellor specializes in supporting students through empathetic, non-judgemental spaces.</p>
              </div>
              <span className="text-xs font-mono text-secondary-fixed self-start sm:self-auto bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">
                100% Free Campus Service
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {psychologists.map((c) => (
                <div 
                  key={c.id} 
                  className="glass-panel rounded-2xl border border-border-internal hover:border-secondary/40 transition-all duration-300 p-5 flex flex-col justify-between group shadow-xl hover:shadow-2xl hover:-translate-y-1"
                >
                  <div className="space-y-4">
                    {/* Top Row: Avatar & Badges */}
                    <div className="flex items-start gap-3.5">
                      <div className="relative shrink-0">
                        <img 
                          src={c.avatar_url || '/logo.png'} 
                          alt={c.name} 
                          style={{ borderRadius: '9999px' }}
                          className="w-16 h-16 object-cover border-2 border-secondary/40 shadow-md group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#0d0f17] rounded-full" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h4 className="font-heading font-bold text-base text-white tracking-tight leading-snug truncate">
                          {c.name}
                        </h4>
                        <p className="text-[11px] font-semibold text-secondary-fixed truncate mt-0.5">
                          {c.specialization.split('·')[0]}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/70 truncate max-w-full">
                            📍 {c.institution}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quote Box */}
                    {c.quote && (
                      <div className="p-3 rounded-xl bg-surface-container-high/60 border border-border-internal text-xs text-on-surface-variant italic font-serif leading-relaxed line-clamp-3">
                        “{c.quote.replace('♡', '')}”
                      </div>
                    )}

                    {/* Experience & Pillars */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-on-surface-variant font-mono text-[11px]">
                        <Award size={13} className="text-secondary-fixed shrink-0" />
                        <span>Experience: <strong className="text-white">{c.experience || 'Certified'}</strong></span>
                      </div>
                      {c.pillars && (
                        <div className="flex flex-wrap gap-1">
                          {c.pillars.split('•').map((p, idx) => (
                            <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-surface border border-border-internal text-secondary-fixed/90 font-mono">
                              {p.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 mt-4 border-t border-border-internal flex items-center gap-2">
                    <button 
                      onClick={() => setActiveModalCounselor(c)}
                      className="flex-1 py-2 px-3 rounded-xl bg-surface hover:bg-surface-bright text-xs font-semibold text-on-surface-variant hover:text-white border border-border-structural transition-colors text-center"
                    >
                      View Full Bio
                    </button>
                    <button 
                      onClick={() => handleSelectCounselorForBooking(c.id)}
                      className="flex-1 py-2 px-3 rounded-xl bg-interactive-primary/90 hover:bg-interactive-primary text-white text-xs font-bold transition-all shadow-md shadow-interactive-primary/20 text-center flex items-center justify-center gap-1"
                    >
                      <span>Book Session</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 2: BOOK AN APPOINTMENT
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'book' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-border-internal shadow-2xl space-y-6">
              
              <div className="border-b border-border-internal pb-4">
                <h3 className="font-heading text-xl font-bold text-white flex items-center gap-2">
                  <Calendar size={20} className="text-secondary-fixed" />
                  <span>Request a Confidential Counseling Session</span>
                </h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  Choose your preferred counselor, date, and time. Your anonymous alias protects your identity.
                </p>
              </div>

              {/* Step 1: Select Counselor */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-interactive-primary/20 text-interactive-primary flex items-center justify-center text-[11px] font-bold">1</span>
                  <span>Select Wellness Counsellor</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1 hide-scrollbar">
                  {psychologists.map((doc) => {
                    const isSelected = selectedDoc === doc.id.toString();
                    return (
                      <div 
                        key={doc.id}
                        onClick={() => setSelectedDoc(doc.id.toString())}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'bg-interactive-primary/15 border-interactive-primary shadow-lg shadow-interactive-primary/15'
                            : 'bg-surface hover:bg-surface-bright border-border-internal'
                        }`}
                      >
                        <img 
                          src={doc.avatar_url || '/logo.png'} 
                          alt={doc.name} 
                          style={{ borderRadius: '9999px' }}
                          className="w-12 h-12 object-cover border border-secondary/40 shrink-0" 
                        />
                        <div className="overflow-hidden flex-1">
                          <h4 className="font-heading font-bold text-sm text-white truncate">{doc.name}</h4>
                          <p className="text-[11px] text-secondary-fixed truncate">{doc.institution}</p>
                          <span className="text-[10px] font-mono text-on-surface-variant">{doc.experience || 'Certified'}</span>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-interactive-primary flex items-center justify-center text-white shrink-0">
                            <Check size={12} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Counselor Preview Card */}
              {selectedCounselor && (
                <div className="p-4 rounded-2xl bg-surface-container/70 border border-border-internal flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img 
                      src={selectedCounselor.avatar_url || '/logo.png'} 
                      alt={selectedCounselor.name} 
                      style={{ borderRadius: '9999px' }}
                      className="w-11 h-11 object-cover border border-secondary/40 shrink-0"
                    />
                    <div className="overflow-hidden">
                      <p className="text-xs text-on-surface-variant">Selected Counsellor:</p>
                      <h4 className="font-heading font-bold text-sm text-white truncate">{selectedCounselor.name}</h4>
                      <p className="text-[11px] text-secondary-fixed truncate">{selectedCounselor.institution} • {selectedCounselor.experience}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveModalCounselor(selectedCounselor)}
                    className="text-xs font-semibold text-secondary-fixed hover:underline shrink-0"
                  >
                    View Bio →
                  </button>
                </div>
              )}

              {/* Step 2 & 3: Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-interactive-primary/20 text-interactive-primary flex items-center justify-center text-[11px] font-bold">2</span>
                    <span>Select Date</span>
                  </label>
                  <input 
                    type="date" 
                    value={reqDate} 
                    onChange={e => setReqDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    style={{ colorScheme: 'dark' }}
                    className="w-full bg-surface border border-border-internal rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-interactive-primary transition-all cursor-pointer" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-interactive-primary/20 text-interactive-primary flex items-center justify-center text-[11px] font-bold">3</span>
                    <span>Select Time</span>
                  </label>
                  <input 
                    type="time" 
                    value={reqTime} 
                    onChange={e => setReqTime(e.target.value)}
                    style={{ colorScheme: 'dark' }}
                    className="w-full bg-surface border border-border-internal rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-interactive-primary transition-all cursor-pointer" 
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button 
                onClick={handleRequestBooking} 
                disabled={!reqDate || !reqTime || isBooking}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-interactive-primary to-secondary text-[#07070a] font-extrabold text-sm sm:text-base hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-interactive-primary/20 flex items-center justify-center gap-2"
              >
                {isBooking ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#07070a]/30 border-t-[#07070a] rounded-full animate-spin" />
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <>
                    <Calendar size={18} />
                    <span>Send Appointment Request</span>
                  </>
                )}
              </button>

              <p className="font-mono text-[11px] text-on-surface-variant text-center leading-relaxed">
                🔒 Protected under the Student Anonymity Charter. Real identity details are strictly encrypted and invisible to counsellors.
              </p>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 3: MY SESSIONS
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'mine' && (
          <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">
            {loadingMine ? (
              <div className="text-center py-12 text-on-surface-variant text-sm">Loading your sessions...</div>
            ) : myAppts.length === 0 ? (
              <div className="glass-panel text-center py-14 rounded-3xl text-on-surface-variant border border-border-internal p-6">
                <span className="material-symbols-outlined text-[44px] mx-auto mb-3 opacity-30 text-secondary-fixed">event_busy</span>
                <h3 className="text-lg font-heading font-bold text-white mb-1">No counseling sessions yet</h3>
                <p className="text-xs text-on-surface-variant max-w-sm mx-auto mb-5 leading-relaxed">
                  You haven't requested any counseling sessions yet. Our 7 dedicated campus counsellors are here to listen and help.
                </p>
                <button 
                  onClick={() => setActiveTab('team')} 
                  className="px-6 py-2.5 rounded-xl bg-interactive-primary text-white font-bold text-xs hover:brightness-110 transition-all shadow-lg"
                >
                  Meet Our Counselors & Book →
                </button>
              </div>
            ) : (
              myAppts.map(appt => {
                const dt = new Date(appt.slot_time);
                const statusCfg = STATUS_CONFIG[appt.status] || STATUS_CONFIG.pending;
                return (
                  <div key={appt.id} className="glass-panel p-5 rounded-2xl border border-border-internal animate-slide-up group shadow-xl">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-surface-container-high border border-border-internal flex items-center justify-center shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-secondary-fixed text-[24px]">psychology</span>
                        </div>
                        <div>
                          <h3 className="font-heading font-bold text-base text-white">{appt.psychologist_name}</h3>
                          <p className="text-xs text-on-surface-variant">{appt.specialization}</p>
                          <div className="flex items-center gap-2 mt-2 font-mono text-[11px] text-on-surface-variant">
                            <Calendar size={13} className="text-secondary-fixed" />
                            <span>{dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                            <span>•</span>
                            <Clock size={13} className="text-secondary-fixed" />
                            <span>{dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2.5 py-1 rounded-full border font-semibold flex items-center gap-1 shrink-0 ${statusCfg.color}`}>
                        <span className="material-symbols-outlined text-[12px]">{statusCfg.icon}</span> {statusCfg.label}
                      </span>
                    </div>

                    {/* Anonymous Student Identity Banner */}
                    <div className="mt-4 pt-3 border-t border-border-internal/60 flex items-center justify-between text-xs">
                      <div className="text-on-surface-variant flex items-center gap-1.5">
                        <span>Your identity:</span>
                        <span className="font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                          {appt.student_alias || getAlias() || 'Anonymous Student'}
                        </span>
                      </div>
                      <span className="text-[10px] text-on-surface-variant/80 font-mono">Encrypted Session</span>
                    </div>
                    
                    {appt.status !== 'cancelled' && (
                      <div className="mt-4 pt-3 border-t border-border-internal flex justify-between items-center gap-2">
                        <button 
                          onClick={() => handleCancel(appt.id)}
                          className="text-xs text-on-surface-variant hover:text-error transition-colors flex items-center gap-1 font-medium"
                        >
                          <span className="material-symbols-outlined text-[15px]">cancel</span> 
                          <span>Cancel Request</span>
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/student/messages?appointmentId=${appt.id}`)}
                            className="text-xs bg-surface hover:bg-surface-bright text-white border border-border-structural px-3.5 py-2 rounded-xl font-semibold transition-all flex items-center gap-1.5 active:scale-95"
                          >
                            <MessageSquare size={14} className="text-secondary-fixed" />
                            <span>Message</span>
                          </button>
                          <button
                            onClick={() => navigate(`/call/${appt.id}`)}
                            className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-xl font-bold hover:bg-emerald-500/30 transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/15 active:scale-95 animate-pulse"
                          >
                            <PhoneCall size={14} />
                            <span>Join Audio Call</span>
                          </button>
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

      {/* ══════════════════════════════════════════════════════════════════════
          COUNSELOR FULL BIO & PHILOSOPHY MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {activeModalCounselor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div 
            className="glass-panel w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border-internal p-6 sm:p-8 shadow-2xl relative animate-scale-in hide-scrollbar space-y-6"
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => setActiveModalCounselor(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>

            {/* Header Profile */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              <img 
                src={activeModalCounselor.avatar_url || '/logo.png'} 
                alt={activeModalCounselor.name} 
                style={{ borderRadius: '9999px' }}
                className="w-24 h-24 object-cover border-2 border-secondary-fixed shadow-xl shrink-0"
              />
              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-heading font-black text-white">{activeModalCounselor.name}</h3>
                <p className="text-xs sm:text-sm text-secondary-fixed font-semibold">{activeModalCounselor.specialization}</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/70">
                    📍 {activeModalCounselor.institution}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-secondary/15 border border-secondary/30 text-secondary-fixed font-bold font-mono">
                    ⭐ {activeModalCounselor.experience}
                  </span>
                </div>
              </div>
            </div>

            {/* Quote */}
            {activeModalCounselor.quote && (
              <div className="p-4 rounded-2xl bg-surface-container border border-border-internal text-sm text-secondary-fixed/90 italic font-serif leading-relaxed text-center">
                “{activeModalCounselor.quote.replace('♡', '')}”
              </div>
            )}

            {/* Support Areas */}
            {activeModalCounselor.focus_areas && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Sparkles size={14} className="text-secondary-fixed" />
                  <span>Ways I Can Support You</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeModalCounselor.focus_areas.split(';').map((area, idx) => (
                    <span key={idx} className="text-xs px-3 py-1 rounded-xl bg-surface-container-high border border-border-internal text-on-surface">
                      {area.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Message to Students */}
            {activeModalCounselor.message_to_students && (
              <div className="p-4 rounded-2xl bg-interactive-primary/10 border border-interactive-primary/25 space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-interactive-primary flex items-center gap-1.5">
                  <Heart size={14} />
                  <span>What I Want Every Student To Know</span>
                </h4>
                <p className="text-xs sm:text-sm text-on-surface leading-relaxed">
                  {activeModalCounselor.message_to_students}
                </p>
              </div>
            )}

            {/* Fun Facts */}
            {activeModalCounselor.fun_facts && (
              <div className="p-4 rounded-2xl bg-surface-container border border-border-internal space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-secondary-fixed flex items-center gap-1.5">
                  <Info size={14} />
                  <span>A Few Things About Me</span>
                </h4>
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  {activeModalCounselor.fun_facts}
                </p>
              </div>
            )}

            {/* Action Footer */}
            <div className="pt-2 flex items-center gap-3">
              <button 
                onClick={() => setActiveModalCounselor(null)}
                className="flex-1 py-3 rounded-xl bg-surface hover:bg-surface-bright text-xs font-bold text-on-surface transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => handleSelectCounselorForBooking(activeModalCounselor.id)}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-interactive-primary to-secondary text-[#07070a] font-extrabold text-xs sm:text-sm hover:brightness-110 transition-all shadow-lg"
              >
                Book Session with {activeModalCounselor.name.split(' ')[0]} →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
