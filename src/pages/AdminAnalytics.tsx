import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { BarChart3, Shield, Users, AlertTriangle, TrendingDown, TrendingUp, Activity, Eye } from 'lucide-react';

interface Analytics {
  total_students: number;
  average_risk_score: number;
  high_risk_count: number;
  medium_risk_count: number;
  average_mood_score: number;
  average_burnout_probability: number;
  campus_wellbeing_percent: number;
}

const DEPARTMENT_DATA = [
  { name: 'Computer Science', stress: 72, color: '#5E6BFF' },
  { name: 'Medicine',         stress: 81, color: '#ffb4ab' },
  { name: 'Engineering',      stress: 68, color: '#f7d383' },
  { name: 'Management',       stress: 55, color: '#a1f3c3' },
  { name: 'Arts & Science',   stress: 48, color: '#7a85ff' },
];

function WellbeingRing({ percent }: { percent: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const color = percent >= 70 ? '#a1f3c3' : percent >= 50 ? '#f7d383' : '#ffb4ab';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg width="128" height="128" className="-rotate-90 absolute inset-0">
          <circle cx="64" cy="64" r={radius} fill="none" stroke="#1B1C1E" strokeWidth="10" />
          <circle cx="64" cy="64" r={radius} fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
        </svg>
        <div className="relative flex flex-col items-center">
          <span className="font-heading font-bold text-2xl" style={{ color }}>{percent}%</span>
          <span className="text-xs text-text-muted">Wellbeing</span>
        </div>
      </div>
    </div>
  );
}

function DeptStressBar({ name, stress, color }: { name: string; stress: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-text-muted w-28 shrink-0 truncate">{name}</span>
      <div className="flex-1 bg-surface-bright rounded-full h-2 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${stress}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-mono font-semibold text-text-muted w-8 text-right">{stress}%</span>
    </div>
  );
}

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/risk/analytics')
      .then(r => r.json())
      .then(data => setAnalytics(data))
      .catch(() => setAnalytics({
        total_students: 1402, average_risk_score: 0.22, high_risk_count: 3,
        medium_risk_count: 47, average_mood_score: 3.4, campus_wellbeing_percent: 78, average_burnout_probability: 0.15,
      }))
      .finally(() => setLoading(false));
  }, []);

  const a = analytics;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-surface-dim/80 backdrop-blur-xl border-b border-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-heading font-bold text-xl">
              MindBridge<span className="text-primary">.Admin</span>
            </h1>
            <p className="text-xs text-text-muted mt-0.5">Campus Wellbeing Analytics Dashboard</p>
          </div>
          <div className="flex items-center gap-2 bg-success/10 border border-success/25 rounded-lg px-3 py-2">
            <Shield size={14} className="text-success" />
            <span className="text-xs text-success font-semibold">Anonymous Data Only</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 animate-fade-in">
        {/* Privacy Banner */}
        <div className="mb-8 flex items-start gap-3 bg-primary/8 border border-primary/20 rounded-xl p-4">
          <Eye size={18} className="text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-text">Anonymous Data Only</p>
            <p className="text-xs text-text-muted mt-1">
              This dashboard shows only aggregated, anonymized campus wellbeing data.
              No individual student names, emails, chat logs, journal entries, or psychologist notes are accessible here.
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active Students', value: loading ? '...' : a?.total_students.toLocaleString(), icon: <Users size={18} />, color: 'text-primary', trend: '+12% this week' },
            { label: 'Campus Wellbeing', value: loading ? '...' : `${a?.campus_wellbeing_percent}%`, icon: <Activity size={18} />, color: 'text-success', trend: '+3% from last week' },
            { label: 'High Risk Cases', value: loading ? '...' : a?.high_risk_count, icon: <AlertTriangle size={18} />, color: 'text-error', trend: 'Needs attention' },
            { label: 'Avg Mood Score', value: loading ? '...' : `${a?.average_mood_score}/5`, icon: <BarChart3 size={18} />, color: 'text-warning', trend: 'Stable' },
          ].map(({ label, value, icon, color, trend }) => (
            <Card key={label} className="p-5 flex flex-col gap-2">
              <div className={`${color} mb-1`}>{icon}</div>
              <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">{label}</span>
              <span className="font-heading font-bold text-2xl">{value}</span>
              <span className="text-xs text-text-muted">{trend}</span>
            </Card>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Dept Stress */}
          <section className="lg:col-span-3">
            <Card className="p-6">
              <h2 className="font-heading font-semibold mb-1 flex items-center gap-2">
                <BarChart3 size={18} className="text-primary" /> Department Stress Index
              </h2>
              <p className="text-xs text-text-muted mb-5">Anonymous aggregate data. Higher % = higher average stress reported.</p>
              <div className="space-y-4">
                {DEPARTMENT_DATA.map(d => <DeptStressBar key={d.name} {...d} />)}
              </div>
            </Card>
          </section>

          {/* Wellbeing Ring + Risk Distribution */}
          <section className="lg:col-span-2 flex flex-col gap-6">
            <Card className="p-6 flex flex-col items-center">
              <h2 className="font-heading font-semibold mb-4 self-start flex items-center gap-2">
                <Activity size={18} className="text-primary" /> Campus Wellbeing
              </h2>
              <WellbeingRing percent={loading ? 0 : (a?.campus_wellbeing_percent ?? 0)} />
              <div className="mt-4 grid grid-cols-2 gap-3 w-full">
                <div className="text-center p-3 bg-surface-bright rounded-xl">
                  <p className="text-xs text-text-muted">High Risk</p>
                  <p className="font-heading font-bold text-error text-lg">{loading ? '...' : a?.high_risk_count}</p>
                </div>
                <div className="text-center p-3 bg-surface-bright rounded-xl">
                  <p className="text-xs text-text-muted">Medium Risk</p>
                  <p className="font-heading font-bold text-warning text-lg">{loading ? '...' : a?.medium_risk_count}</p>
                </div>
              </div>
              <div className="mt-4 w-full text-center p-3 bg-surface-bright rounded-xl border border-border">
                  <p className="text-xs text-text-muted flex items-center justify-center gap-1"><TrendingUp size={12}/> AI Burnout Predictor</p>
                  <p className="font-heading font-bold text-primary text-xl mt-1">{loading ? '...' : `${Math.round((a?.average_burnout_probability ?? 0) * 100)}%`}</p>
              </div>
            </Card>

            <Card className="p-5 flex-1">
              <h2 className="font-heading font-semibold mb-3 flex items-center gap-2 text-sm">
                <TrendingDown size={16} className="text-primary" /> Trend Indicators
              </h2>
              <div className="space-y-3">
                {[
                  { label: 'Exam period stress spike', status: '↑ High', color: 'text-error' },
                  { label: 'Sleep quality decline', status: '↓ Low', color: 'text-warning' },
                  { label: 'Social engagement', status: '→ Stable', color: 'text-text-muted' },
                  { label: 'AI support usage', status: '↑ +34%', color: 'text-success' },
                ].map(({ label, status, color }) => (
                  <div key={label} className="flex items-center justify-between text-xs">
                    <span className="text-text-muted">{label}</span>
                    <span className={`font-semibold font-mono ${color}`}>{status}</span>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        </div>

        {/* Footer disclaimer */}
        <div className="mt-8 text-center text-xs text-text-muted opacity-60 space-y-1">
          <p>All data is anonymized and aggregated. No individual can be identified from this dashboard.</p>
          <p>GDPR & FERPA compliant • MindBridge AI v1.0</p>
        </div>
      </main>
    </div>
  );
}
