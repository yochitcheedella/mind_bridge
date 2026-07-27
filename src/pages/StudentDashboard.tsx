import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Book, MessageSquare, AlertTriangle, Wind, Moon, Calendar, TrendingUp, SmilePlus, Settings, ClipboardList } from 'lucide-react';
import { getAlias, apiFetch, isLoggedIn } from '../utils/auth';

const MOOD_CONFIG = [
  { score: 1, emoji: '😭', label: 'Very Low' },
  { score: 2, emoji: '😔', label: 'Low' },
  { score: 3, emoji: '😐', label: 'Neutral' },
  { score: 4, emoji: '🙂', label: 'Good' },
  { score: 5, emoji: '🤩', label: 'Excellent' },
];

const WELLNESS_EXERCISES = [
  { icon: Wind, title: '5-min Grounding', desc: 'Reduce anxiety quickly', path: '/wellness' },
  { icon: Moon, title: 'Deep Sleep Prep', desc: 'Guided breathing', path: '/wellness' },
];

export default function StudentDashboard() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [wellnessScore, setWellnessScore] = useState(72);
  const [moodSaved, setMoodSaved] = useState(false);
  const alias = getAlias();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoggedIn()) {
      // Don't force redirect — allow dev access without login
    }
    // Fetch today's mood if logged in
    if (isLoggedIn()) {
      apiFetch('/api/mood/today').then(r => r.json()).then(data => {
        if (data.score) {
          setSelectedMood(data.score);
          setWellnessScore(Math.round(data.score * 20));
        }
      }).catch(() => {});
    }
  }, []);

  const handleMoodSelect = async (score: number) => {
    setSelectedMood(score);
    setWellnessScore(Math.round(score * 20));
    if (isLoggedIn()) {
      try {
        await apiFetch('/api/mood/log', { method: 'POST', body: JSON.stringify({ score }) });
        setMoodSaved(true);
        setTimeout(() => setMoodSaved(false), 3000);
      } catch {}
    }
  };

  const firstName = alias.split(' ')[1] || alias;
  const scorePercent = wellnessScore;
  const scoreColor = scorePercent >= 70 ? '#a1f3c3' : scorePercent >= 40 ? '#f7d383' : '#ffb4ab';

  return (
    <div className="min-h-screen bg-background text-text pb-28">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-surface-dim/80 backdrop-blur-xl border-b border-border px-5 py-4">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div>
            <p className="text-xs text-text-muted font-medium">Welcome back,</p>
            <h1 className="text-xl font-heading font-bold text-text">{firstName}</h1>
            <p className="text-xs text-primary/80 font-mono mt-0.5">{alias}</p>
          </div>

          {/* Settings icon — top right, before the wellness ring */}
          <Link to="/settings" className="mr-2 p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface-bright transition-all" aria-label="Settings">
            <Settings size={18} />
          </Link>

          {/* Wellness Score Ring */}
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path className="text-surface-bright" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="currentColor" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke={scoreColor} strokeWidth="3"
                strokeDasharray={`${scorePercent}, 100`} strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.8s ease' }} />
            </svg>
            <div className="flex flex-col items-center">
              <span className="text-base font-bold font-heading" style={{ color: scoreColor }}>{scorePercent}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-5 pt-5 space-y-5 animate-fade-in">
        {/* Mood Check-in */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <SmilePlus size={13} /> Daily Check-in
            </h2>
            {moodSaved && <span className="text-xs text-success animate-fade-in">✓ Logged!</span>}
          </div>
          <Card className="flex justify-between p-2 gap-1">
            {MOOD_CONFIG.map(({ score, emoji, label }) => (
              <button key={score} onClick={() => handleMoodSelect(score)}
                className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-all duration-200
                  ${selectedMood === score
                    ? 'bg-surface-bright shadow-inner scale-105'
                    : 'hover:bg-surface hover:scale-105'
                  }`}>
                <span className="text-xl">{emoji}</span>
                <span className="text-[9px] text-text-muted leading-tight text-center hidden sm:block">{label}</span>
              </button>
            ))}
          </Card>
        </section>

        {/* Quick Actions Grid */}
        <section className="grid grid-cols-2 gap-3">
          <Link to="/journal">
            <Card className="flex flex-col items-start gap-3 p-4 hover:bg-surface-bright cursor-pointer transition-all hover:scale-[1.01] hover:border-primary/30 h-full">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <Book size={18} />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-sm">Journal</h3>
                <p className="text-xs text-text-muted mt-0.5">Write your thoughts</p>
              </div>
            </Card>
          </Link>

          <Link to="/chat">
            <Card className="flex flex-col items-start gap-3 p-4 hover:bg-surface-bright cursor-pointer transition-all hover:scale-[1.01] hover:border-primary/30 h-full border-primary/20">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <MessageSquare size={18} />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-sm">AI Guide</h3>
                <p className="text-xs text-text-muted mt-0.5">Need to talk?</p>
              </div>
            </Card>
          </Link>

          <Link to="/mood">
            <Card className="flex flex-col items-start gap-3 p-4 hover:bg-surface-bright cursor-pointer transition-all hover:scale-[1.01] hover:border-primary/30 h-full">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <TrendingUp size={18} />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-sm">Mood Tracker</h3>
                <p className="text-xs text-text-muted mt-0.5">30-day history</p>
              </div>
            </Card>
          </Link>

          <Link to="/appointments">
            <Card className="flex flex-col items-start gap-3 p-4 hover:bg-surface-bright cursor-pointer transition-all hover:scale-[1.01] hover:border-primary/30 h-full">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <Calendar size={18} />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-sm">Sessions</h3>
                <p className="text-xs text-text-muted mt-0.5">Book a counselor</p>
              </div>
            </Card>
          </Link>

          <Link to="/assessments" className="col-span-2">
            <Card className="flex items-center gap-3 p-4 hover:bg-surface-bright cursor-pointer transition-all hover:scale-[1.01] hover:border-primary/30 h-full">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <ClipboardList size={18} />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-sm">Self-Assessments</h3>
                <p className="text-xs text-text-muted mt-0.5">PHQ-9 Depression &amp; GAD-7 Anxiety screenings</p>
              </div>
            </Card>
          </Link>
        </section>


        {/* Emergency SOS */}
        <section>
          <Link to="/emergency">
            <Card className="bg-error/8 border-error/25 flex items-center justify-between p-4 cursor-pointer hover:bg-error/15 transition-all hover:border-error/40 group">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-error text-background rounded-full group-hover:scale-110 transition-transform">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-error text-sm">Emergency SOS</h3>
                  <p className="text-xs text-error/70 mt-0.5">Immediate Support • Available 24/7</p>
                </div>
              </div>
              <div className="w-2 h-2 rounded-full bg-error animate-pulse" />
            </Card>
          </Link>
        </section>

        {/* Breathe & Reset */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Breathe & Reset</h2>
            <Badge variant="default" className="text-[10px]">Recommended</Badge>
          </div>
          <div className="space-y-2">
            {WELLNESS_EXERCISES.map(({ icon: Icon, title, desc, path }) => (
              <Link to={path} key={title}>
                <Card className="flex items-center gap-4 p-3 hover:bg-surface-bright cursor-pointer transition-all hover:border-primary/20">
                  <div className="p-2 bg-surface text-text-muted rounded-lg">
                    <Icon size={18} />
                  </div>
                  <div>
                    <h3 className="font-heading font-medium text-sm">{title}</h3>
                    <p className="text-xs text-text-muted">{desc}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Stress Insights */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp size={12} /> Stress Insights
            </h2>
          </div>
          <Card className="p-4 space-y-3">
            {/* Mood trend */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <SmilePlus size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-text">Mood Score</p>
                  <p className="text-[10px] text-text-muted">Based on today's check-in</p>
                </div>
              </div>
              <span className="font-heading font-bold text-lg" style={{ color: scoreColor }}>
                {selectedMood ? `${selectedMood}/5` : '—'}
              </span>
            </div>
            <div className="border-t border-border" />
            {/* Quick links */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: '📔 Journal', sub: 'Write your thoughts', to: '/journal' },
                { label: '✅ Habits', sub: 'Build routines', to: '/habits' },
                { label: '😴 Sleep Log', sub: 'Track rest quality', to: '/mood' },
                { label: '🧠 Assess', sub: 'Screen your wellbeing', to: '/assessments' },
              ].map(({ label, sub, to }) => (
                <Link key={to + label} to={to}>
                  <div className="p-2.5 rounded-xl bg-surface hover:bg-surface-bright border border-border hover:border-primary/25 transition-all cursor-pointer">
                    <p className="text-xs font-semibold text-text">{label}</p>
                    <p className="text-[10px] text-text-muted mt-0.5">{sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </section>

      </main>
    </div>
  );
}
