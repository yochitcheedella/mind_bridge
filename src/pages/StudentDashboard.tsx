import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, Brain, Wind, Zap, 
  ArrowRight, CheckCircle2, Shield, ShieldAlert, Award, Flame, Smile,
  Calendar, MessageSquare, PhoneCall, BookOpen, Clock, Heart, Users,
  X, Globe, Info, Lock, ChevronRight
} from 'lucide-react';
import { getAlias, apiFetch, isLoggedIn } from '../utils/auth';
import { OFFICIAL_COUNSELORS, VISHNU_WELLNESS_CENTRE, type CounselorData } from '../data/counselors';

const MOOD_CONFIG = [
  { score: 5, icon: 'sentiment_very_satisfied', label: 'Thriving', color: 'from-emerald-400 to-teal-600', textColor: 'text-emerald-400' },
  { score: 4, icon: 'sentiment_satisfied',      label: 'Calm',     color: 'from-blue-400 to-indigo-600',  textColor: 'text-blue-400' },
  { score: 3, icon: 'sentiment_neutral',        label: 'Balanced', color: 'from-purple-400 to-indigo-600',textColor: 'text-purple-400' },
  { score: 2, icon: 'sentiment_dissatisfied',   label: 'Stressed', color: 'from-amber-400 to-orange-600', textColor: 'text-amber-400' },
  { score: 1, icon: 'sentiment_very_dissatisfied',label: 'Overwhelmed', color: 'from-rose-500 to-red-700',  textColor: 'text-rose-400' },
];

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [wellnessScore, setWellnessScore] = useState(78);
  const [streakDays, setStreakDays] = useState(5);
  const [dailyChallengeComplete, setDailyChallengeComplete] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [consentChecks, setConsentChecks] = useState({
    privacy: true,
    anonymous: true,
    aiRole: true,
    crisisSafety: true,
  });
  const [savingConsent, setSavingConsent] = useState(false);
  const [upcomingAppt, setUpcomingAppt] = useState<any | null>(null);
  const [counselors, setCounselors] = useState<CounselorData[]>(OFFICIAL_COUNSELORS);
  const [activeModalCounselor, setActiveModalCounselor] = useState<CounselorData | null>(null);
  const alias = getAlias();

  useEffect(() => {
    if (isLoggedIn()) {
      // Check consent
      const localConsent = localStorage.getItem('mindbridge_consent_accepted');
      if (!localConsent) {
        apiFetch('/api/auth/consent/status')
          .then(r => r.json())
          .then(data => {
            if (!data.has_consented) {
              setShowConsent(true);
            } else {
              localStorage.setItem('mindbridge_consent_accepted', 'true');
            }
          })
          .catch(() => {
            if (!localConsent) setShowConsent(true);
          });
      }

      apiFetch('/api/mood/today')
        .then(r => r.json())
        .then(data => {
          if (data.score) {
            setSelectedMood(data.score);
            setWellnessScore(Math.min(100, Math.round(data.score * 18 + 15)));
          }
        })
        .catch(() => {});

      // Fetch upcoming confirmed counseling appointment
      apiFetch('/api/appointments/mine')
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) {
            const confirmed = data.find((a: any) => a.status === 'confirmed');
            if (confirmed) {
              setUpcomingAppt(confirmed);
            }
          }
        })
        .catch(() => {});

      // Fetch professional counselors & merge with rich brochure data
      apiFetch('/api/appointments/psychologists')
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            const merged = OFFICIAL_COUNSELORS.map(official => {
              const match = data.find((b: any) => 
                b.name.trim().toLowerCase() === official.name.trim().toLowerCase() ||
                official.name.trim().toLowerCase().includes(b.name.trim().toLowerCase())
              );
              return match ? { ...official, id: match.id } : official;
            });
            setCounselors(merged);
          }
        })
        .catch(() => {});
    }
    const savedStreak = localStorage.getItem('mindbridge_streak_days');
    if (savedStreak) setStreakDays(parseInt(savedStreak, 10));
  }, []);

  const handleAcceptConsent = async () => {
    setSavingConsent(true);
    try {
      if (isLoggedIn()) {
        await apiFetch('/api/auth/consent', {
          method: 'POST',
          body: JSON.stringify({
            policy_version: 'v1.4-vishnu',
            accepted_privacy: consentChecks.privacy,
            accepted_anonymous_policy: consentChecks.anonymous,
            accepted_crisis_terms: consentChecks.crisisSafety,
          }),
        });
      }
      localStorage.setItem('mindbridge_consent_accepted', 'true');
      setShowConsent(false);
    } catch {
      localStorage.setItem('mindbridge_consent_accepted', 'true');
      setShowConsent(false);
    } finally {
      setSavingConsent(false);
    }
  };

  const handleMoodSelect = async (score: number) => {
    setSelectedMood(score);
    setWellnessScore(Math.min(100, Math.round(score * 18 + 15)));
    try {
      if (isLoggedIn()) {
        await apiFetch('/api/mood/log', { method: 'POST', body: JSON.stringify({ score, note: 'Logged via interactive dashboard' }) });
      }
    } catch {}
    const newStreak = streakDays + 1;
    setStreakDays(newStreak);
    localStorage.setItem('mindbridge_streak_days', String(newStreak));
  };

  const handleCompleteChallenge = () => {
    setDailyChallengeComplete(true);
    setWellnessScore(prev => Math.min(100, prev + 5));
  };

  const firstName = alias || 'Student';
  const circumference = 175.93;
  const strokeDashoffset = circumference - (wellnessScore / 100) * circumference;

  return (
    <div className="space-y-7 animate-fade-in max-w-7xl mx-auto pb-20">
      {/* ── Top Welcome Canopy ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#111524] via-[#151b2e] to-teal-950/30 border border-white/10 p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Anonymous Institutional Shield Active</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-black text-white tracking-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-indigo-400">{firstName}</span>
          </h1>
          <div className="flex items-center gap-2 pt-0.5 pb-1">
            <span className="w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_8px_#2dd4bf]" />
            <span className="font-mono text-[11px] text-teal-200/80 font-bold uppercase tracking-widest">
              {VISHNU_WELLNESS_CENTRE.name} · {VISHNU_WELLNESS_CENTRE.institution}
            </span>
          </div>
          <p className="text-sm text-white/70 max-w-xl leading-relaxed">
            Your private canopy for mental wellness, resilience, and emotional equilibrium.
          </p>
        </div>

        {/* Vitality Ring & Streak */}
        <div className="relative z-10 flex items-center gap-6 bg-[#0c101a]/80 p-5 rounded-2xl border border-white/10 shadow-lg shrink-0">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-20 h-20 absolute top-0 left-0 transform -rotate-90" viewBox="0 0 64 64">
              <circle className="text-white/10 stroke-current" cx="32" cy="32" fill="transparent" r="28" strokeWidth="5" />
              <circle 
                className="text-teal-400 stroke-current transition-all duration-1000 ease-out" 
                cx="32" cy="32" fill="transparent" r="28" 
                strokeDasharray={circumference} 
                strokeDashoffset={strokeDashoffset} 
                strokeLinecap="round" strokeWidth="5"
              />
            </svg>
            <div className="flex flex-col items-center justify-center z-10">
              <span className="font-heading font-black text-2xl text-white leading-none">{wellnessScore}</span>
              <span className="font-mono text-[9px] uppercase font-extrabold text-teal-400">Vitality</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-amber-400 font-heading font-extrabold text-sm mb-1">
              <Flame size={18} className="animate-bounce text-amber-400" />
              <span>{streakDays}-Day Resilience</span>
            </div>
            <p className="text-xs text-white/60 max-w-[150px] leading-snug">
              Consistent daily reflection keeps emotional regulation well tuned.
            </p>
          </div>
        </div>
      </div>

      {/* ── Upcoming Confirmed Session Reminder ── */}
      {upcomingAppt && (
        <div className="p-5 rounded-3xl border border-teal-500/40 bg-gradient-to-r from-indigo-900/30 via-[#131929] to-teal-950/30 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/15 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start gap-4 z-10">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-500/40 text-teal-400 flex items-center justify-center shrink-0 shadow-lg shadow-teal-500/10">
              <span className="text-3xl">🧠</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/25">
                  Confirmed Session
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <h3 className="text-xl font-bold font-heading text-white">{upcomingAppt.psychologist_name}</h3>
              <p className="text-xs text-white/60 font-medium">Wellness Counsellor</p>
              
              <div className="flex items-center gap-2 mt-2 text-xs text-white/90 font-mono">
                <Clock size={14} className="text-teal-400" />
                <span>
                  {new Date(upcomingAppt.slot_time).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} • {new Date(upcomingAppt.slot_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto z-10 shrink-0">
            <button
              onClick={() => navigate(`/student/messages?appointmentId=${upcomingAppt.id}`)}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/20 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <MessageSquare size={16} />
              <span>Message</span>
            </button>
            <button
              onClick={() => navigate(`/call/${upcomingAppt.id}`)}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 active:scale-95 animate-pulse"
            >
              <PhoneCall size={16} />
              <span>Join Audio Call</span>
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          FEATURED PROMINENTLY: 7 DEDICATED WELLNESS COUNSELLORS
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="p-6 sm:p-7 rounded-3xl border border-teal-500/30 bg-gradient-to-br from-[#101422] via-[#13192d] to-teal-950/20 space-y-5 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-teal-500/40 p-0.5 bg-white shadow-lg shrink-0">
              <img 
                src={VISHNU_WELLNESS_CENTRE.logo_url} 
                alt="Vishnu Wellness Centre" 
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-teal-300 font-extrabold bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/25">
                  {VISHNU_WELLNESS_CENTRE.institution}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <h2 className="text-xl sm:text-2xl font-heading font-black text-white mt-0.5">
                Our 7 Dedicated Wellness Counsellors
              </h2>
              <p className="text-xs text-teal-200/80 font-medium">
                Tap any counsellor to view their complete bio, quote, focus areas &amp; book a session
              </p>
            </div>
          </div>
          
          <Link
            to="/student/appointments"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-indigo-500/20 shrink-0 self-start sm:self-auto active:scale-95"
          >
            <span>Appointments Hub</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* 7 Counselors Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {counselors.map((c) => (
            <div 
              key={c.name}
              onClick={() => setActiveModalCounselor(c)}
              className="p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.07] border border-white/5 hover:border-teal-400/50 transition-all cursor-pointer group flex flex-col items-center text-center shadow-md hover:shadow-xl hover:-translate-y-1"
            >
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-teal-500/40 group-hover:border-teal-300 group-hover:scale-105 transition-all shadow-lg mb-2.5 bg-[#151a2a] shrink-0 relative">
                <img 
                  src={c.avatar_url} 
                  alt={c.name}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }}
                />
                <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#151a2a]" />
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-teal-300 transition-colors line-clamp-1 w-full">
                {c.name}
              </h4>
              <span className="text-[9px] text-teal-200/90 font-medium line-clamp-1 mt-0.5">
                {c.institution}
              </span>
              <span className="text-[9px] text-white/50 font-mono mt-0.5">
                {c.experience}
              </span>
              <div className="mt-2 flex items-center gap-1 text-[8px] font-mono px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/25 w-full justify-center">
                <span>View Profile</span>
                <ChevronRight size={10} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3-Column Interactive Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUMN 1: Daily Mood & Quick Actions (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Daily Mood Pulse */}
          <div className="p-6 rounded-3xl bg-[#111524]/90 border border-white/10 space-y-4 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
                <Smile className="text-teal-400" size={22} />
                <span>Daily Mood Pulse</span>
              </h2>
              {selectedMood && <CheckCircle2 className="text-emerald-400" size={18} />}
            </div>
            <p className="text-xs text-white/60">
              Select how you feel right now:
            </p>

            <div className="grid grid-cols-5 gap-2 pt-1">
              {MOOD_CONFIG.map((m) => {
                const isActive = selectedMood === m.score;
                return (
                  <button
                    key={m.score}
                    onClick={() => handleMoodSelect(m.score)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-t ' + m.color + ' border-white text-white font-bold scale-105 shadow-lg shadow-black/50'
                        : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.08] text-white/60 hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform mb-1">
                      {m.icon}
                    </span>
                    <span className="text-[10px] font-medium tracking-tight truncate w-full text-center">
                      {m.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedMood && (
              <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-xs text-teal-300 flex items-center justify-between animate-fade-in">
                <span>Mood pulse logged! +5 Vitality</span>
                <Link to="/student/mood" className="font-bold hover:underline flex items-center gap-1 text-teal-400">
                  <span>View Trends</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>

          {/* Quick Actions (Quick Chat & Journal) */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => navigate('/student/journal')}
              className="bg-[#111524]/90 rounded-2xl border border-white/10 p-4 flex flex-col items-start gap-3 hover:bg-[#181e32] transition-all group shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookOpen className="text-indigo-400" size={20} />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="font-heading font-extrabold text-sm text-white group-hover:text-indigo-300 transition-colors">Daily Journal</span>
                <span className="text-[10px] text-white/50 mt-0.5">Private reflections</span>
              </div>
            </button>

            <button 
              onClick={() => navigate('/student/chat')}
              className="bg-[#111524]/90 rounded-2xl border border-white/10 p-4 flex flex-col items-start gap-3 hover:bg-[#181e32] transition-all group shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                <MessageSquare className="text-teal-400" size={20} />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="font-heading font-extrabold text-sm text-white group-hover:text-teal-300 transition-colors">AI Guide Chat</span>
                <span className="text-[10px] text-white/50 mt-0.5">24/7 empathetic listener</span>
              </div>
            </button>
          </div>

          {/* Stress & Burnout Radar */}
          <div className="p-5 rounded-3xl bg-[#111524]/90 border border-purple-500/30 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400">Stress Radar</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold">Stable</span>
            </div>
            <h3 className="font-heading font-black text-base text-white flex items-center gap-2">
              <Zap className="text-amber-400" size={18} />
              <span>Cognitive Fatigue Level</span>
            </h3>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 h-full w-2/5 rounded-full transition-all duration-1000" />
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-white/60">
              <span>Status: Low Burnout</span>
              <Link to="/student/assessments" className="text-teal-400 font-bold hover:underline flex items-center gap-1">
                <span>Check MBI Score</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>

        {/* COLUMN 2: Clinical Suites (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-heading font-extrabold text-white flex items-center gap-2">
              <Sparkles className="text-teal-400" size={20} />
              <span>Evidence-Based Clinical Suites</span>
            </h2>
            <span className="text-xs font-mono text-white/50">Self-Regulation</span>
          </div>

          {/* Feature 1: Thought Reframing */}
          <div 
            onClick={() => navigate('/student/cbt-reframing')}
            className="p-5 sm:p-6 rounded-3xl border border-white/10 hover:border-indigo-500/50 transition-all duration-300 group cursor-pointer hover:shadow-2xl hover:scale-[1.01] bg-gradient-to-br from-[#111524] via-[#141a2b] to-indigo-950/20"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform">
                <Brain size={24} />
              </div>
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-bold text-xs uppercase tracking-wider">
                CBT Protocol
              </span>
            </div>
            <div className="mt-4 space-y-1.5">
              <h3 className="text-lg font-heading font-black text-white group-hover:text-teal-300 transition-colors">
                Thought Reframing Studio
              </h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Deconstruct academic anxiety and imposter syndrome into logical equilibrium using clinical AI guidance.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-indigo-400 group-hover:text-teal-300 transition-colors">
              <span>Launch Reframing Engine</span>
              <ArrowRight size={15} className="transform group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* Feature 2: Guided Breathwork */}
          <div 
            onClick={() => navigate('/student/breathwork')}
            className="p-5 sm:p-6 rounded-3xl border border-white/10 hover:border-teal-500/50 transition-all duration-300 group cursor-pointer hover:shadow-2xl hover:scale-[1.01] bg-gradient-to-br from-[#111524] via-[#141a2b] to-teal-950/20"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform">
                <Wind size={24} />
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs uppercase tracking-wider">
                Somatic Relief
              </span>
            </div>
            <div className="mt-4 space-y-1.5">
              <h3 className="text-lg font-heading font-black text-white group-hover:text-teal-300 transition-colors">
                Guided Breathwork Canopy
              </h3>
              <p className="text-xs text-white/70 leading-relaxed">
                4-4-4-4 Box Breathing and 4-7-8 soothing visuals engineered to lower heart rate and calm panic before exams.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-teal-400 group-hover:text-white transition-colors">
              <span>Enter Breathwork Canopy</span>
              <ArrowRight size={15} className="transform group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* COLUMN 3: Daily Challenge & Crisis SOS (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Daily Challenge */}
          <div className="p-5 sm:p-6 rounded-3xl border border-white/10 bg-gradient-to-b from-[#111524] to-[#0c0f18] space-y-3 shadow-xl">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Award size={16} />
              <span>Daily Wellness Quest</span>
            </div>
            <h3 className="font-heading font-extrabold text-white text-sm leading-snug">
              "15-Minute Outdoor Decompression"
            </h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Step away from screen light. Take a peaceful walk outside to reset mental bandwidth.
            </p>

            <button
              onClick={handleCompleteChallenge}
              disabled={dailyChallengeComplete}
              className={`w-full py-2.5 px-4 rounded-xl font-heading font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
                dailyChallengeComplete
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 text-white active:scale-95'
              }`}
            >
              {dailyChallengeComplete ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>Quest Complete (+5 Vitality)!</span>
                </>
              ) : (
                <>
                  <Award size={16} />
                  <span>Mark Quest Complete</span>
                </>
              )}
            </button>
          </div>

          {/* Emergency SOS Crisis Safeguard */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-rose-950/40 via-[#111524] to-red-900/20 border border-rose-500/40 text-left space-y-3 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400 font-mono font-extrabold text-xs uppercase tracking-wider">
              <ShieldAlert size={16} className="animate-pulse" />
              <span>24/7 Crisis Support</span>
            </div>
            <h3 className="font-heading font-black text-white text-base">In Acute Distress or Crisis?</h3>
            <p className="text-xs text-rose-200/80 leading-relaxed">
              Connect instantly with professional counselors or emergency intervention hotlines. 100% confidential.
            </p>
            <button
              onClick={() => navigate('/student/emergency')}
              className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-heading font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-600/40 transition-all active:scale-95"
            >
              Open Crisis SOS Portal
            </button>
          </div>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          COUNSELOR FULL BIO MODAL (Direct from Dashboard)
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
                onClick={() => {
                  setActiveModalCounselor(null);
                  navigate('/student/appointments');
                }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 text-white font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-indigo-500/20"
              >
                Book Session with {activeModalCounselor.name.split(' ')[0]} →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── First-Login Privacy & Safety Consent Modal ── */}
      {showConsent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#111624] border border-indigo-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl shadow-black/80 space-y-6 relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center mx-auto text-indigo-400">
              <Shield size={28} />
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-white font-heading">
                Welcome to {VISHNU_WELLNESS_CENTRE.name}
              </h2>
              <p className="text-xs text-teal-200/80">
                {VISHNU_WELLNESS_CENTRE.institution} Confidentiality Terms
              </p>
            </div>

            <div className="space-y-3 text-xs text-white/90 bg-white/5 p-4 rounded-2xl border border-white/10">
              <p className="font-semibold text-white/70 uppercase tracking-wider text-[11px] mb-2 font-mono">
                Please acknowledge before proceeding:
              </p>

              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={consentChecks.privacy}
                  onChange={e => setConsentChecks({ ...consentChecks, privacy: e.target.checked })}
                  className="mt-0.5 rounded text-indigo-500 focus:ring-indigo-400 bg-white/10 border-white/20"
                />
                <span>I understand that my discussions are encrypted and strictly confidential.</span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={consentChecks.anonymous}
                  onChange={e => setConsentChecks({ ...consentChecks, anonymous: e.target.checked })}
                  className="mt-0.5 rounded text-indigo-500 focus:ring-indigo-400 bg-white/10 border-white/20"
                />
                <span>I understand that my identity is protected under an anonymous alias.</span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={consentChecks.aiRole}
                  onChange={e => setConsentChecks({ ...consentChecks, aiRole: e.target.checked })}
                  className="mt-0.5 rounded text-indigo-500 focus:ring-indigo-400 bg-white/10 border-white/20"
                />
                <span>I understand the AI guide is for emotional coping and does not replace emergency medical care.</span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={consentChecks.crisisSafety}
                  onChange={e => setConsentChecks({ ...consentChecks, crisisSafety: e.target.checked })}
                  className="mt-0.5 rounded text-indigo-500 focus:ring-indigo-400 bg-white/10 border-white/20"
                />
                <span>I know that 24/7 crisis support and verified human psychotherapists are reachable at any time.</span>
              </label>
            </div>

            <button
              onClick={handleAcceptConsent}
              disabled={
                savingConsent ||
                !consentChecks.privacy ||
                !consentChecks.anonymous ||
                !consentChecks.aiRole ||
                !consentChecks.crisisSafety
              }
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            >
              {savingConsent ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Recording Consent...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Acknowledge & Enter Wellness Canopy</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
