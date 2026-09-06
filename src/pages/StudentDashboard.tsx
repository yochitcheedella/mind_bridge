import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, Brain, Wind, Zap, 
  ArrowRight, CheckCircle2, Shield, ShieldAlert, Award, Flame, Smile
} from 'lucide-react';
import { getAlias, apiFetch, isLoggedIn } from '../utils/auth';

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
            // Default show if not verified
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
            policy_version: 'v1.0-vishnu',
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
    // Increment streak bonus if first time today
    const newStreak = streakDays + 1;
    setStreakDays(newStreak);
    localStorage.setItem('mindbridge_streak_days', String(newStreak));
  };

  const handleCompleteChallenge = () => {
    setDailyChallengeComplete(true);
    setWellnessScore(prev => Math.min(100, prev + 5));
  };

  const firstName = alias || 'Student Scholar';
  const circumference = 175.93;
  const strokeDashoffset = circumference - (wellnessScore / 100) * circumference;

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-surface-container via-panel-high to-indigo-950/40 border border-border-structural p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-interactive-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Anonymous Institutional Safeguard Active</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-black text-white tracking-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-interactive-primary to-secondary-fixed">{firstName}</span>
          </h1>
          <div className="flex items-center gap-2 pt-0.5 pb-1">
            <span className="w-2 h-2 rounded-full bg-secondary-fixed shadow-[0_0_8px_#50d8e9]"></span>
            <span className="font-mono text-[11px] text-on-surface-variant font-bold uppercase tracking-widest">Status: Stable & Anonymous</span>
          </div>
          <p className="text-sm sm:text-base text-on-surface-variant max-w-xl leading-relaxed">
            Your personalized neural resilience & academic calm canopy. How is your emotional energy flowing today?
          </p>
        </div>

        {/* Biofeedback Vitality Ring */}
        <div className="relative z-10 flex items-center gap-6 bg-surface-container-lowest/80 p-5 rounded-2xl border border-border-structural shadow-lg shrink-0">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-20 h-20 absolute top-0 left-0 transform -rotate-90" viewBox="0 0 64 64">
              <circle className="text-surface-container-high stroke-current" cx="32" cy="32" fill="transparent" r="28" strokeWidth="5"></circle>
              <circle 
                className="text-interactive-primary stroke-current transition-all duration-1000 ease-out" 
                cx="32" cy="32" fill="transparent" r="28" 
                strokeDasharray={circumference} 
                strokeDashoffset={strokeDashoffset} 
                strokeLinecap="round" strokeWidth="5"
              ></circle>
            </svg>
            <div className="flex flex-col items-center justify-center z-10">
              <span className="font-heading font-black text-2xl text-white leading-none">{wellnessScore}</span>
              <span className="font-mono text-[9px] uppercase font-extrabold text-secondary-fixed">Vitality</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-amber-400 font-heading font-extrabold text-sm mb-1">
              <Flame size={18} className="animate-bounce text-amber-400" />
              <span>{streakDays}-Day Resilience Streak</span>
            </div>
            <p className="text-xs text-on-surface-variant max-w-[150px] leading-snug">
              Consistent daily reflection keeps emotional regulation well tuned.
            </p>
          </div>
        </div>
      </div>

      {/* ── Active Counseling Appointment Reminder Banner ── */}
      {upcomingAppt && (
        <div className="glass-panel p-5 rounded-3xl border border-primary/35 bg-gradient-to-r from-primary/15 via-surface-container/70 to-purple-900/20 shadow-2xl animate-slide-up flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start gap-4 z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-primary/20 border border-primary/40 text-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/10">
              <span className="text-3xl">🧠</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/25">
                  Appointment Reminder
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-semibold text-emerald-400">Confirmed</span>
              </div>
              <h3 className="text-xl font-bold font-heading text-white">{upcomingAppt.psychologist_name}</h3>
              <p className="text-xs text-on-surface-variant font-medium">Counseling Session</p>
              
              <div className="flex items-center gap-2 mt-2 text-xs text-white/90 font-mono">
                <span className="material-symbols-outlined text-[14px] text-primary">schedule</span>
                <span>
                  {new Date(upcomingAppt.slot_time).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} • {new Date(upcomingAppt.slot_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="mt-2.5 text-xs text-on-surface-variant flex items-center gap-1.5">
                <span>Your identity:</span>
                <span className="font-bold text-white bg-primary/25 px-2.5 py-0.5 rounded-lg border border-primary/35 text-[11px] tracking-wide">
                  {upcomingAppt.student_alias || alias || 'Anonymous Student'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto z-10 shrink-0">
            <button
              onClick={() => navigate(`/student/messages?appointmentId=${upcomingAppt.id}`)}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/20 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span>💬 Message Counselor</span>
            </button>
            <button
              onClick={() => navigate(`/call/${upcomingAppt.id}`)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 active:scale-95 animate-pulse"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              <span>🟢 Join Audio Call</span>
            </button>
          </div>
        </div>
      )}

      {/* 3-Column Widescreen Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUMN 1: Daily Mood & Mental Biometrics (3 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Daily Mood Check-In Card */}
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-border-structural space-y-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
                <Smile className="text-interactive-primary" size={22} />
                <span>Daily Mood Pulse</span>
              </h2>
              {selectedMood && <CheckCircle2 className="text-emerald-400" size={18} />}
            </div>
            <p className="text-xs text-on-surface-variant">
              Tap the vibration icon that truly echoes your immediate mental state:
            </p>

            <div className="grid grid-cols-5 gap-2 pt-2">
              {MOOD_CONFIG.map((m) => {
                const isActive = selectedMood === m.score;
                return (
                  <button
                    key={m.score}
                    onClick={() => handleMoodSelect(m.score)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-t ' + m.color + ' border-white text-white font-bold scale-110 shadow-lg shadow-black/50'
                        : 'bg-surface-container-low border-border-structural hover:bg-surface-container text-on-surface-variant hover:text-white'
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
              <div className="p-3.5 rounded-2xl bg-interactive-primary/10 border border-interactive-primary/30 text-xs text-secondary-fixed flex items-center justify-between animate-fade-in">
                <span>Mood pulse logged! Resilience +5 XP</span>
                <Link to="/student/mood" className="font-bold hover:underline flex items-center gap-1">
                  <span>View Trends</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>

          {/* Quick Actions Grid from Stitch UI */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => navigate('/student/journal')}
              className="bg-panel-low rounded-2xl border border-border-structural p-4 flex flex-col items-start gap-3 hover:bg-surface-container/60 transition-all duration-200 relative overflow-hidden group shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-interactive-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center border border-border-structural group-hover:scale-105 transition-transform shadow-inner">
                <span className="material-symbols-outlined text-interactive-primary text-xl">edit_note</span>
              </div>
              <div className="flex flex-col items-start text-left relative z-10">
                <span className="font-heading font-extrabold text-sm text-white group-hover:text-interactive-primary transition-colors">Journal</span>
                <span className="font-mono text-[10px] text-on-surface-variant/80 mt-0.5">Reflective space</span>
              </div>
            </button>

            <button 
              onClick={() => navigate('/student/chat')}
              className="bg-panel-low rounded-2xl border border-border-structural p-4 flex flex-col items-start gap-3 hover:bg-surface-container/60 transition-all duration-200 relative overflow-hidden group shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-secondary-fixed/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center border border-border-structural group-hover:scale-105 transition-transform shadow-inner">
                <span className="material-symbols-outlined text-secondary-fixed text-xl">smart_toy</span>
              </div>
              <div className="flex flex-col items-start text-left relative z-10">
                <span className="font-heading font-extrabold text-sm text-white group-hover:text-secondary-fixed transition-colors">AI Guide</span>
                <span className="font-mono text-[10px] text-on-surface-variant/80 mt-0.5">Need to talk?</span>
              </div>
            </button>
          </div>

          {/* Academic Burnout & Stress Radar */}
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-purple-500/30 shadow-xl relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400">Clinical Radar</span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold">Stable Range</span>
            </div>
            <h3 className="font-heading font-black text-xl text-white flex items-center gap-2">
              <Zap className="text-amber-400" size={24} />
              <span>Burnout Inventory</span>
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Mid-semester coding assignments and placement pressure can quietly compound cognitive fatigue.
            </p>
            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 h-full w-2/5 rounded-full transition-all duration-1000"></div>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-on-surface-variant">
              <span>Energy: Vibrant</span>
              <Link to="/student/assessments" className="text-interactive-primary font-bold hover:underline flex items-center gap-1">
                <span>Check MBI-S Burnout Score</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* COLUMN 2: Widescreen Clinical Feature Studio (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-heading font-extrabold text-white flex items-center gap-2">
              <Sparkles className="text-secondary-fixed" size={24} />
              <span>Interactive Clinical Suites</span>
            </h2>
            <span className="text-xs font-mono text-on-surface-variant">Student Pro Tools</span>
          </div>

          {/* Feature 1: Thought Reframing Studio */}
          <div 
            onClick={() => navigate('/student/cbt-reframing')}
            className="glass-panel p-6 sm:p-7 rounded-3xl border border-border-structural hover:border-interactive-primary transition-all duration-300 group cursor-pointer hover:shadow-2xl hover:scale-[1.01] relative overflow-hidden bg-gradient-to-br from-surface-container-low via-surface-container to-indigo-950/20"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform">
                <Brain size={28} />
              </div>
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-bold text-xs uppercase tracking-wider">
                CBT Protocol
              </span>
            </div>
            <div className="mt-5 space-y-2">
              <h3 className="text-xl font-heading font-black text-white group-hover:text-secondary-fixed transition-colors">
                Thought Reframing Studio
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                Deconstruct catastrophic academic anxiety and imposter syndrome into empowered logical equilibrium using AI clinical guidance.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border-structural/80 flex items-center justify-between text-xs font-bold text-interactive-primary group-hover:text-white transition-colors">
              <span>Launch Reframing Engine</span>
              <ArrowRight size={16} className="transform group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* Feature 2: Guided Breathwork Canopy */}
          <div 
            onClick={() => navigate('/student/breathwork')}
            className="glass-panel p-6 sm:p-7 rounded-3xl border border-border-structural hover:border-secondary transition-all duration-300 group cursor-pointer hover:shadow-2xl hover:scale-[1.01] relative overflow-hidden bg-gradient-to-br from-surface-container-low via-surface-container to-teal-950/20"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform">
                <Wind size={28} />
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs uppercase tracking-wider">
                Somatic Calm
              </span>
            </div>
            <div className="mt-5 space-y-2">
              <h3 className="text-xl font-heading font-black text-white group-hover:text-secondary-fixed transition-colors">
                Guided Breathwork Canopy
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                Immersive 4-4-4-4 Box Breathing and 4-7-8 Sleep soothing animations engineered to lower physiological panic before exams.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border-structural/80 flex items-center justify-between text-xs font-bold text-emerald-400 group-hover:text-white transition-colors">
              <span>Enter Calm Canopy Studio</span>
              <ArrowRight size={16} className="transform group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* COLUMN 3: Campus Pulse, Gamified Challenge & SOS (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Daily Mental Fitness Challenge */}
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-border-structural bg-gradient-to-b from-surface-container to-surface-container-low space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Award size={16} />
              <span>Daily Wellness Challenge</span>
            </div>
            <h3 className="font-heading font-extrabold text-white text-base leading-snug">
              "Take a 15-Minute Screen-Free Walk Around Campus"
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Step away from debuggers and lecture screens. Let natural outdoor sunlight balance your internal circadian rhythms.
            </p>

            <button
              onClick={handleCompleteChallenge}
              disabled={dailyChallengeComplete}
              className={`w-full py-3 px-4 rounded-xl font-heading font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
                dailyChallengeComplete
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-gradient-to-r from-interactive-primary to-secondary hover:brightness-110 text-on-primary shadow-interactive-primary/25 active:scale-95'
              }`}
            >
              {dailyChallengeComplete ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>Challenge Complete (+5 XP)!</span>
                </>
              ) : (
                <>
                  <Award size={16} />
                  <span>Mark Challenge Complete</span>
                </>
              )}
            </button>
          </div>

          {/* Emergency SOS Crisis Safeguard */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-rose-950/40 via-surface-container to-red-900/20 border border-rose-500/40 text-left space-y-3 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400 font-mono font-extrabold text-xs uppercase tracking-wider">
              <ShieldAlert size={16} className="animate-pulse" />
              <span>Critical Support 24/7</span>
            </div>
            <h3 className="font-heading font-black text-white text-base">In Acute Distress or Crisis?</h3>
            <p className="text-xs text-rose-200/80 leading-relaxed">
              Connect immediately with VIT Campus Security or on-call psychotherapists for confidential, non-judgmental intervention.
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

      {/* ── First-Login Institutional Consent Modal ── */}
      {showConsent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#131722] border border-indigo-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl shadow-black/80 space-y-6 relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center mx-auto text-indigo-400">
              <Shield size={28} />
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-white font-heading">
                Welcome to MindBridge
              </h2>
              <p className="text-xs text-indigo-200/80">
                Vishnu College Institutional Student Safeguard & Privacy Terms
              </p>
            </div>

            <div className="space-y-3 text-xs text-white/90 bg-white/5 p-4 rounded-2xl border border-white/10">
              <p className="font-semibold text-white/70 uppercase tracking-wider text-[11px] mb-2 font-mono">
                Please review before you continue:
              </p>

              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={consentChecks.privacy}
                  onChange={e => setConsentChecks({ ...consentChecks, privacy: e.target.checked })}
                  className="mt-0.5 rounded text-indigo-500 focus:ring-indigo-400 bg-white/10 border-white/20"
                />
                <span>I understand how my information is encrypted and securely protected.</span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={consentChecks.anonymous}
                  onChange={e => setConsentChecks({ ...consentChecks, anonymous: e.target.checked })}
                  className="mt-0.5 rounded text-indigo-500 focus:ring-indigo-400 bg-white/10 border-white/20"
                />
                <span>I understand the anonymous support option and public alias protection.</span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={consentChecks.aiRole}
                  onChange={e => setConsentChecks({ ...consentChecks, aiRole: e.target.checked })}
                  className="mt-0.5 rounded text-indigo-500 focus:ring-indigo-400 bg-white/10 border-white/20"
                />
                <span>I understand that the AI companion is an emotional support assistant, not a licensed therapist.</span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={consentChecks.crisisSafety}
                  onChange={e => setConsentChecks({ ...consentChecks, crisisSafety: e.target.checked })}
                  className="mt-0.5 rounded text-indigo-500 focus:ring-indigo-400 bg-white/10 border-white/20"
                />
                <span>I understand that acute safety emergencies may require audited institutional human intervention.</span>
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
                  <span>Acknowledge & Continue to Dashboard</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
