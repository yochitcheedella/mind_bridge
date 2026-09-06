import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Building2, Sparkles, Heart, Shield, Award, Clock, Calendar, 
  X, Check, MessageSquare, PhoneCall, ChevronRight, Info,
  Globe, UserCheck, Lock, AlertCircle, Sparkle, BookOpen
} from 'lucide-react';
import { apiFetch, getAlias } from '../utils/auth';
import { 
  OFFICIAL_COUNSELORS, 
  VISHNU_WELLNESS_CENTRE, 
  type CounselorData 
} from '../data/counselors';

interface Appointment {
  id: number;
  psychologist_id?: number;
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
  confirmed:   { label: 'Confirmed',   color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', icon: 'check_circle' },
  pending:     { label: 'Pending Confirmation', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30', icon: 'pending' },
  cancelled:   { label: 'Cancelled',   color: 'bg-rose-500/15 text-rose-400 border-rose-500/30',       icon: 'cancel' },
  rescheduled: { label: 'Rescheduled', color: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30', icon: 'update' },
  completed:   { label: 'Completed',   color: 'bg-blue-500/15 text-blue-400 border-blue-500/30',   icon: 'task_alt' },
};

export default function Appointments() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'team' | 'book' | 'mine'>('team');
  const [myAppts, setMyAppts] = useState<Appointment[]>([]);
  const [psychologists, setPsychologists] = useState<CounselorData[]>(OFFICIAL_COUNSELORS);
  const [backendIdMap, setBackendIdMap] = useState<Record<string, number>>({});
  const [selectedDoc, setSelectedDoc] = useState<string>('1'); 
  const [reqDate, setReqDate] = useState('');
  const [reqTime, setReqTime] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [loadingMine, setLoadingMine] = useState(true);
  const [bookedMsg, setBookedMsg] = useState('');
  const [activeModalCounselor, setActiveModalCounselor] = useState<CounselorData | null>(null);

  // Sync with Backend
  useEffect(() => {
    // Load psychologists and map backend IDs to official profiles
    apiFetch('/api/appointments/psychologists')
      .then(r => r.json())
      .then(backendDocs => {
        if (Array.isArray(backendDocs) && backendDocs.length > 0) {
          const idMap: Record<string, number> = {};
          
          // Map backend IDs to official profiles
          const merged = OFFICIAL_COUNSELORS.map(official => {
            const match = backendDocs.find((b: any) => 
              b.name.trim().toLowerCase() === official.name.trim().toLowerCase() ||
              official.name.trim().toLowerCase().includes(b.name.trim().toLowerCase())
            );
            if (match) {
              idMap[official.name] = match.id;
              return {
                ...official,
                id: match.id, // Use real backend DB id
              };
            }
            return official;
          });

          setPsychologists(merged);
          setBackendIdMap(idMap);
          if (merged.length > 0) {
            setSelectedDoc(merged[0].id.toString());
          }
        }
      })
      .catch(() => {
        // Fallback to local official data
        setPsychologists(OFFICIAL_COUNSELORS);
      });

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
    const interval = setInterval(loadAppointments, 4000);
    return () => clearInterval(interval);
  }, []);

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
        setBookedMsg(`Appointment request sent to ${docName}! They will review and confirm.`);
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

  // Helper to check if user has a confirmed appointment with a specific counselor
  const getConfirmedApptForCounselor = (counselor: CounselorData) => {
    return myAppts.find(a => 
      (a.psychologist_id === counselor.id || 
       a.psychologist_name.toLowerCase().includes(counselor.name.toLowerCase().split(' ')[0])) && 
      a.status === 'confirmed'
    );
  };

  const selectedCounselor = psychologists.find(p => p.id.toString() === selectedDoc);

  return (
    <div className="min-h-screen bg-[#080b13] pb-28 text-white">
      {/* ── Top Bar with Official Vishnu Wellness Centre Logo ── */}
      <header className="sticky top-0 z-20 bg-[#0c101d]/95 backdrop-blur-2xl border-b border-white/10 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <Link to="/student/home" className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-teal-500/40 shadow-sm p-0.5 bg-white shrink-0">
              <img 
                src={VISHNU_WELLNESS_CENTRE.logo_url} 
                alt="Vishnu Wellness Centre" 
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div>
              <h1 className="font-heading font-bold text-sm sm:text-base flex items-center gap-1.5 leading-tight text-white">
                <span>{VISHNU_WELLNESS_CENTRE.name}</span>
                <span className="text-[11px] font-mono text-teal-400 hidden sm:inline">• Official Care Team</span>
              </h1>
              <p className="font-mono text-[10px] text-white/50">{VISHNU_WELLNESS_CENTRE.institution} • Est. {VISHNU_WELLNESS_CENTRE.established}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-white/70">
            <Shield size={12} className="text-teal-400" />
            <span className="hidden sm:inline">Alias:</span>
            <span className="font-bold text-teal-300">{getAlias() || 'Student'}</span>
          </span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
        
        {/* ── Status Notification Banner ── */}
        {bookedMsg && (
          <div className="mb-6 flex items-center gap-3 bg-teal-500/15 border border-teal-500/30 rounded-2xl px-5 py-3.5 text-sm text-teal-200 animate-slide-up shadow-xl backdrop-blur-md">
            <Sparkles size={20} className="shrink-0 text-teal-400" />
            <span className="font-medium">{bookedMsg}</span>
          </div>
        )}

        {/* ── Official Institutional Showcase Banner (Page 8 from Brochure) ── */}
        <div className="p-6 sm:p-7 rounded-3xl border border-teal-500/30 relative overflow-hidden mb-8 shadow-2xl bg-gradient-to-r from-[#101524] via-[#13192d] to-teal-950/20 backdrop-blur-xl">
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-teal-300 font-semibold">
                <Building2 size={13} />
                <span>{VISHNU_WELLNESS_CENTRE.institution} • Established {VISHNU_WELLNESS_CENTRE.established}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-heading font-black text-white tracking-tight">
                Our Team of 7 Dedicated Wellness Counsellors
              </h2>
              <p className="text-sm text-white/70 leading-relaxed">
                Working around the clock to support the mental health, resilience, and personal growth of students across all Vishnu campuses. Safe, ethical, and 100% confidential.
              </p>
              
              {/* 5 Core Pillars from Page 8 */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-teal-200">
                {VISHNU_WELLNESS_CENTRE.pillars.map(pillar => (
                  <span key={pillar} className="px-2.5 py-0.5 rounded-lg bg-teal-500/10 border border-teal-500/20">
                    ♡ {pillar}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-row md:flex-col gap-2.5 w-full md:w-auto shrink-0">
              <button 
                onClick={() => setActiveTab('team')}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all text-center flex-1 md:flex-initial ${
                  activeTab === 'team'
                    ? 'bg-gradient-to-r from-indigo-600 to-teal-500 text-white shadow-lg shadow-indigo-500/25'
                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                }`}
              >
                Meet All 7 Counselors
              </button>
              <button 
                onClick={() => setActiveTab('book')}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all text-center flex-1 md:flex-initial ${
                  activeTab === 'book'
                    ? 'bg-gradient-to-r from-indigo-600 to-teal-500 text-white shadow-lg shadow-indigo-500/25'
                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                }`}
              >
                Book a Session
              </button>
            </div>
          </div>
        </div>

        {/* ── Main Navigation Tabs ── */}
        <div className="flex bg-[#0c101d] rounded-2xl p-1.5 mb-8 border border-white/10 shadow-xl overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => setActiveTab('team')}
            className={`flex-1 min-w-[140px] py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'team'
                ? 'bg-gradient-to-r from-indigo-600/30 to-teal-500/30 text-teal-300 border border-teal-500/40 shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">psychology</span>
            <span>Meet Counselors ({psychologists.length})</span>
          </button>

          <button 
            onClick={() => setActiveTab('book')}
            className={`flex-1 min-w-[140px] py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'book'
                ? 'bg-gradient-to-r from-indigo-600/30 to-teal-500/30 text-teal-300 border border-teal-500/40 shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">edit_calendar</span>
            <span>Book Appointment</span>
          </button>

          <button 
            onClick={() => setActiveTab('mine')}
            className={`flex-1 min-w-[140px] py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'mine'
                ? 'bg-gradient-to-r from-indigo-600/30 to-teal-500/30 text-teal-300 border border-teal-500/40 shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">event_available</span>
            <span>My Sessions ({myAppts.filter(a => a.status !== 'cancelled').length})</span>
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 1: MEET THE 7 COUNSELORS (Rich Detailed Cards from PDF)
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'team' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-heading font-bold text-white">Our Dedicated Wellness Counsellors</h3>
                <p className="text-xs text-white/60">Every counsellor specializes in creating empathetic, non-judgemental spaces for students.</p>
              </div>
              <span className="text-xs font-mono text-teal-300 self-start sm:self-auto bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
                100% Free Campus Care
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {psychologists.map((c) => {
                const confirmedAppt = getConfirmedApptForCounselor(c);
                return (
                  <div 
                    key={c.name} 
                    className="p-5 sm:p-6 rounded-3xl bg-[#101422]/90 border border-white/10 hover:border-teal-500/40 transition-all duration-300 flex flex-col justify-between group shadow-xl hover:shadow-2xl hover:-translate-y-1 backdrop-blur-xl relative overflow-hidden"
                  >
                    <div className="space-y-4">
                      {/* Top Row: Photo, Status, Name, Campus */}
                      <div className="flex items-start gap-4">
                        <div className="relative shrink-0">
                          <img 
                            src={c.avatar_url} 
                            alt={c.name} 
                            className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-500/30 shadow-md group-hover:scale-105 transition-transform bg-[#151a2a]"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }}
                          />
                          {/* Live Online Badge */}
                          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-[#101422]" />
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                              ● Available
                            </span>
                          </div>
                          <h4 className="font-heading font-bold text-base text-white tracking-tight leading-snug truncate">
                            {c.name}
                          </h4>
                          <p className="text-[11px] font-semibold text-teal-300 truncate mt-0.5">
                            {c.specialization}
                          </p>
                          <p className="text-[10px] font-mono text-white/60 truncate mt-1">
                            📍 {c.institution}
                          </p>
                        </div>
                      </div>

                      {/* Official Quote from PDF */}
                      {c.quote && (
                        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-teal-200/90 italic font-serif leading-relaxed line-clamp-3">
                          “{c.quote.replace('♡', '').trim()} ♡”
                        </div>
                      )}

                      {/* Core Pillars */}
                      {c.pillars && c.pillars.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {c.pillars.map((p, idx) => (
                            <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-teal-500/10 border border-teal-500/20 text-teal-300">
                              {p}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Experience & Languages Meta */}
                      <div className="space-y-1 pt-2 border-t border-white/5 text-xs text-white/70">
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <Award size={13} className="text-teal-400 shrink-0" />
                          <span>Experience: <strong className="text-white">{c.experience}</strong></span>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <Globe size={13} className="text-indigo-400 shrink-0" />
                          <span className="truncate">Languages: <strong className="text-white">{c.languages}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 mt-4 border-t border-white/10 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => setActiveModalCounselor(c)}
                          className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-colors text-center flex items-center justify-center gap-1 active:scale-95"
                        >
                          <BookOpen size={13} className="text-teal-400" />
                          <span>View Full Bio</span>
                        </button>

                        <button 
                          onClick={() => handleSelectCounselorForBooking(c.id)}
                          className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 text-center flex items-center justify-center gap-1 active:scale-95"
                        >
                          <Calendar size={13} />
                          <span>Book Session</span>
                        </button>
                      </div>

                      {/* Audio Call / Gated Indicator */}
                      {confirmedAppt ? (
                        <button
                          onClick={() => navigate(`/call/${confirmedAppt.id}`)}
                          className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 animate-pulse"
                        >
                          <PhoneCall size={14} />
                          <span>Join Active Audio Call</span>
                        </button>
                      ) : (
                        <div className="w-full py-2 px-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-white/40 flex items-center justify-center gap-1.5 font-mono">
                          <Lock size={12} />
                          <span>Audio call unlocks upon confirmed session</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 2: BOOK AN APPOINTMENT
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'book' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#101422]/90 border border-white/10 shadow-2xl space-y-6 backdrop-blur-xl">
              
              <div className="border-b border-white/10 pb-4">
                <h3 className="font-heading text-xl font-bold text-white flex items-center gap-2">
                  <Calendar size={20} className="text-teal-400" />
                  <span>Request a Confidential Counseling Session</span>
                </h3>
                <p className="text-xs text-white/60 mt-1">
                  Select your counselor from the 7 campus specialists, choose date and time. Your anonymous alias protects your privacy.
                </p>
              </div>

              {/* Step 1: Select Counselor */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-white/80 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center text-[11px] font-bold">1</span>
                  <span>Select Wellness Counsellor</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1 hide-scrollbar">
                  {psychologists.map((doc) => {
                    const isSelected = selectedDoc === doc.id.toString();
                    return (
                      <div 
                        key={doc.name}
                        onClick={() => setSelectedDoc(doc.id.toString())}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'bg-teal-500/15 border-teal-400 shadow-lg shadow-teal-500/15'
                            : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10'
                        }`}
                      >
                        <img 
                          src={doc.avatar_url} 
                          alt={doc.name} 
                          className="w-12 h-12 rounded-xl object-cover border border-teal-500/30 shrink-0 bg-[#151a2a]" 
                          onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }}
                        />
                        <div className="overflow-hidden flex-1">
                          <h4 className="font-heading font-bold text-sm text-white truncate">{doc.name}</h4>
                          <p className="text-[11px] text-teal-300 truncate">{doc.institution}</p>
                          <span className="text-[10px] font-mono text-white/50">{doc.experience}</span>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-teal-400 flex items-center justify-center text-[#080b13] shrink-0 font-bold">
                            <Check size={13} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Counselor Preview Card */}
              {selectedCounselor && (
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img 
                      src={selectedCounselor.avatar_url} 
                      alt={selectedCounselor.name} 
                      className="w-11 h-11 rounded-xl object-cover border border-teal-500/30 shrink-0 bg-[#151a2a]"
                    />
                    <div className="overflow-hidden">
                      <p className="text-xs text-white/50">Selected Specialist:</p>
                      <h4 className="font-heading font-bold text-sm text-white truncate">{selectedCounselor.name}</h4>
                      <p className="text-[11px] text-teal-300 truncate">{selectedCounselor.institution} • {selectedCounselor.experience}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveModalCounselor(selectedCounselor)}
                    className="text-xs font-semibold text-teal-400 hover:underline shrink-0"
                  >
                    View Bio →
                  </button>
                </div>
              )}

              {/* Step 2 & 3: Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/80 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center text-[11px] font-bold">2</span>
                    <span>Select Date</span>
                  </label>
                  <input 
                    type="date" 
                    value={reqDate} 
                    onChange={e => setReqDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    style={{ colorScheme: 'dark' }}
                    className="w-full bg-[#0a0d18] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-400 transition-all cursor-pointer" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/80 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center text-[11px] font-bold">3</span>
                    <span>Select Time</span>
                  </label>
                  <input 
                    type="time" 
                    value={reqTime} 
                    onChange={e => setReqTime(e.target.value)}
                    style={{ colorScheme: 'dark' }}
                    className="w-full bg-[#0a0d18] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-400 transition-all cursor-pointer" 
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button 
                onClick={handleRequestBooking} 
                disabled={!reqDate || !reqTime || isBooking}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-teal-500 to-teal-400 text-white font-extrabold text-sm sm:text-base hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-teal-500/20 flex items-center justify-center gap-2"
              >
                {isBooking ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <>
                    <Calendar size={18} />
                    <span>Send Appointment Request</span>
                  </>
                )}
              </button>

              <p className="font-mono text-[11px] text-white/50 text-center leading-relaxed">
                🔒 Protected under Zero-Knowledge Privacy. Real identity details are strictly encrypted.
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
              <div className="text-center py-12 text-white/50 text-sm">Loading your sessions...</div>
            ) : myAppts.length === 0 ? (
              <div className="text-center py-14 rounded-3xl text-white/60 border border-white/10 p-6 bg-[#101422]/90">
                <span className="material-symbols-outlined text-[44px] mx-auto mb-3 opacity-30 text-teal-400">event_busy</span>
                <h3 className="text-lg font-heading font-bold text-white mb-1">No counseling sessions yet</h3>
                <p className="text-xs text-white/50 max-w-sm mx-auto mb-5 leading-relaxed">
                  You haven't requested any counseling sessions yet. Our 7 dedicated campus counsellors are here to listen and help.
                </p>
                <button 
                  onClick={() => setActiveTab('team')} 
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-500 text-white font-bold text-xs hover:brightness-110 transition-all shadow-lg shadow-indigo-500/20"
                >
                  Meet Counselors & Book →
                </button>
              </div>
            ) : (
              myAppts.map(appt => {
                const dt = new Date(appt.slot_time);
                const statusCfg = STATUS_CONFIG[appt.status] || STATUS_CONFIG.pending;
                const isConfirmed = appt.status === 'confirmed';

                return (
                  <div key={appt.id} className="p-5 sm:p-6 rounded-3xl bg-[#101422]/90 border border-white/10 animate-slide-up group shadow-xl space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-teal-400 text-[24px]">psychology</span>
                        </div>
                        <div>
                          <h3 className="font-heading font-bold text-base text-white">{appt.psychologist_name}</h3>
                          <p className="text-xs text-white/60">{appt.specialization}</p>
                          <div className="flex items-center gap-2 mt-2 font-mono text-[11px] text-white/70">
                            <Calendar size={13} className="text-teal-400" />
                            <span>{dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                            <span>•</span>
                            <Clock size={13} className="text-teal-400" />
                            <span>{dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2.5 py-1 rounded-full border font-semibold flex items-center gap-1 shrink-0 ${statusCfg.color}`}>
                        <span className="material-symbols-outlined text-[12px]">{statusCfg.icon}</span> {statusCfg.label}
                      </span>
                    </div>

                    {/* Anonymous Student Identity Banner */}
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                      <div className="text-white/60 flex items-center gap-1.5">
                        <span>Your identity:</span>
                        <span className="font-semibold text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20 text-[11px]">
                          {appt.student_alias || getAlias() || 'Anonymous Student'}
                        </span>
                      </div>
                      <span className="text-[10px] text-white/40 font-mono">Encrypted 256-Bit</span>
                    </div>
                    
                    {appt.status !== 'cancelled' && (
                      <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                        <button 
                          onClick={() => handleCancel(appt.id)}
                          className="text-xs text-white/40 hover:text-rose-400 transition-colors flex items-center gap-1 font-medium"
                        >
                          <span className="material-symbols-outlined text-[15px]">cancel</span> 
                          <span>Cancel Session</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/student/messages?appointmentId=${appt.id}`)}
                            className="text-xs bg-white/5 hover:bg-white/10 text-white border border-white/10 px-3.5 py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-1.5 active:scale-95 flex-1 sm:flex-initial"
                          >
                            <MessageSquare size={14} className="text-teal-400" />
                            <span>Message</span>
                          </button>

                          {/* Gated Audio Call: ONLY accessible if confirmed */}
                          {isConfirmed ? (
                            <button
                              onClick={() => navigate(`/call/${appt.id}`)}
                              className="text-xs bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95 animate-pulse flex-1 sm:flex-initial"
                            >
                              <PhoneCall size={14} />
                              <span>Join Audio Call</span>
                            </button>
                          ) : (
                            <div className="text-[11px] font-mono text-amber-300/80 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl flex items-center gap-1.5">
                              <Lock size={12} />
                              <span>Audio call unlocks on confirmation</span>
                            </div>
                          )}
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
          COUNSELOR FULL BIO MODAL (Complete Content from Brochure)
      ══════════════════════════════════════════════════════════════════════ */}
      {activeModalCounselor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div 
            className="bg-[#101422] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-teal-500/30 p-6 sm:p-8 shadow-2xl relative animate-scale-in hide-scrollbar space-y-6"
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => setActiveModalCounselor(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>

            {/* Header: Photo, Name, Specialization, Campus */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              <img 
                src={activeModalCounselor.full_photo_url || activeModalCounselor.avatar_url} 
                alt={activeModalCounselor.name} 
                className="w-28 h-36 object-cover rounded-2xl border-2 border-teal-400 shadow-xl shrink-0 bg-[#151a2a]"
                onError={(e) => { (e.target as HTMLImageElement).src = activeModalCounselor.avatar_url; }}
              />
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-[10px] font-mono font-bold">
                  <span>{activeModalCounselor.institution}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-heading font-black text-white">{activeModalCounselor.name}</h3>
                <p className="text-xs sm:text-sm text-teal-300 font-semibold">{activeModalCounselor.specialization}</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold font-mono">
                    ● Available for Booking
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/70">
                    ⭐ {activeModalCounselor.experience} Experience
                  </span>
                </div>
              </div>
            </div>

            {/* Quote / Motto */}
            {activeModalCounselor.quote && (
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-sm text-teal-200/90 italic font-serif leading-relaxed text-center">
                “{activeModalCounselor.quote.replace('♡', '').trim()} ♡”
              </div>
            )}

            {/* Ways I Can Support You (Focus Areas) */}
            {activeModalCounselor.focus_areas && activeModalCounselor.focus_areas.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Sparkles size={14} className="text-teal-400" />
                  <span>Ways I Can Support You</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeModalCounselor.focus_areas.map((area, idx) => (
                    <span key={idx} className="text-xs px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-white/90">
                      {area.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* What I Wish Every Student Knew */}
            {activeModalCounselor.message_to_students && (
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                  <Heart size={14} />
                  <span>What I Wish Every Student Knew</span>
                </h4>
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                  {activeModalCounselor.message_to_students}
                </p>
              </div>
            )}

            {/* If Coming to Counselling Feels Scary */}
            {activeModalCounselor.if_scary && (
              <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/25 space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
                  <Shield size={14} />
                  <span>If Seeking Support Feels Scary</span>
                </h4>
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                  {activeModalCounselor.if_scary}
                </p>
              </div>
            )}

            {/* Fun Facts / Beyond the Counselling Room */}
            {activeModalCounselor.fun_facts && (
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white/80 flex items-center gap-1.5">
                  <Info size={14} className="text-amber-400" />
                  <span>A Few Things About Me</span>
                </h4>
                <p className="text-xs text-white/70 leading-relaxed">
                  {activeModalCounselor.fun_facts}
                </p>
              </div>
            )}

            {/* Action Footer */}
            <div className="pt-2 flex items-center gap-3">
              <button 
                onClick={() => setActiveModalCounselor(null)}
                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => handleSelectCounselorForBooking(activeModalCounselor.id)}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 text-white font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-indigo-500/20"
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
