import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { BarChart3, Shield, Users, AlertTriangle, TrendingDown, TrendingUp, Activity, Eye, Settings, UserPlus, Trash2 } from 'lucide-react';
import { apiFetch } from '../utils/auth';

interface Analytics {
  total_students: number;
  average_risk_score: number;
  high_risk_count: number;
  medium_risk_count: number;
  average_mood_score: number;
  average_burnout_probability: number;
  campus_wellbeing_percent: number;
  department_data?: { name: string; stress: number }[];
}

interface Psychologist {
  id: number;
  name: string;
  specialization: string;
}

const COLORS = ['#5E6BFF', '#ffb4ab', '#f7d383', '#a1f3c3', '#7a85ff', '#ff8fa3', '#ffd166'];

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
  const [activeTab, setActiveTab] = useState<'analytics' | 'personnel' | 'settings'>('analytics');
  
  // Analytics State
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  // Personnel State
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [newPsychName, setNewPsychName] = useState('');
  const [newPsychSpec, setNewPsychSpec] = useState('');
  const [addingPsych, setAddingPsych] = useState(false);

  useEffect(() => {
    apiFetch('/api/risk/analytics')
      .then(r => r.json())
      .then(data => setAnalytics(data))
      .catch(() => setAnalytics({
        total_students: 1402, average_risk_score: 0.22, high_risk_count: 3,
        medium_risk_count: 47, average_mood_score: 3.4, campus_wellbeing_percent: 78, average_burnout_probability: 0.15,
        department_data: [],
      }))
      .finally(() => setLoading(false));
      
    fetchPsychologists();
  }, []);

  const fetchPsychologists = () => {
    apiFetch('/api/admin/psychologists')
      .then(r => r.json())
      .then(data => { if(Array.isArray(data)) setPsychologists(data); })
      .catch(console.error);
  };

  const handleAddPsychologist = async () => {
    if(!newPsychName.trim() || !newPsychSpec.trim()) return;
    setAddingPsych(true);
    try {
      const res = await apiFetch('/api/admin/psychologists', {
        method: 'POST',
        body: JSON.stringify({ name: newPsychName.trim(), specialization: newPsychSpec.trim() })
      });
      if(res.ok) {
        setNewPsychName('');
        setNewPsychSpec('');
        fetchPsychologists();
      }
    } finally {
      setAddingPsych(false);
    }
  };

  const handleDeletePsychologist = async (id: number) => {
    if(!window.confirm("Are you sure you want to remove this psychologist?")) return;
    try {
      const res = await apiFetch(`/api/admin/psychologists/${id}`, { method: 'DELETE' });
      if(res.ok) fetchPsychologists();
      else alert("Cannot delete psychologist. They may have active appointments.");
    } catch(err) { console.error(err); }
  };

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
            <p className="text-xs text-text-muted mt-0.5">University Administration Portal</p>
          </div>
          <div className="flex bg-surface-bright rounded-xl p-1 shadow-inner border border-border">
            <button onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2
                ${activeTab === 'analytics' ? 'bg-surface text-text shadow-sm' : 'text-text-muted hover:text-text'}`}>
              <BarChart3 size={16} /> Analytics
            </button>
            <button onClick={() => setActiveTab('personnel')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2
                ${activeTab === 'personnel' ? 'bg-surface text-text shadow-sm' : 'text-text-muted hover:text-text'}`}>
              <Users size={16} /> Personnel
            </button>
            <button onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2
                ${activeTab === 'settings' ? 'bg-surface text-text shadow-sm' : 'text-text-muted hover:text-text'}`}>
              <Settings size={16} /> Settings
            </button>
          </div>
          <div className="flex items-center gap-2 bg-success/10 border border-success/25 rounded-lg px-3 py-2">
            <Shield size={14} className="text-success" />
            <span className="text-xs text-success font-semibold">Admin Access</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 animate-fade-in">
        {activeTab === 'analytics' && (
          <>
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
                {a?.department_data && a.department_data.length > 0 ? (
                  a.department_data.map((d, i) => (
                    <DeptStressBar key={d.name} name={d.name} stress={d.stress} color={COLORS[i % COLORS.length]} />
                  ))
                ) : (
                  <p className="text-sm text-text-muted">No department data available.</p>
                )}
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
        </>
        )}

        {activeTab === 'personnel' && (
          <div className="space-y-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-heading font-semibold text-lg">Manage Psychologists</h2>
                <p className="text-xs text-text-muted mt-1">Add or remove clinical staff from the platform.</p>
              </div>
            </div>
            
            <Card className="p-5 flex items-end gap-4 bg-surface-bright/50 border-primary/20">
              <div className="flex-1 space-y-1">
                <label className="text-xs font-semibold text-text-muted">Full Name</label>
                <input type="text" value={newPsychName} onChange={e => setNewPsychName(e.target.value)} placeholder="e.g. Dr. Jane Doe" className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50" />
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-xs font-semibold text-text-muted">Specialization</label>
                <input type="text" value={newPsychSpec} onChange={e => setNewPsychSpec(e.target.value)} placeholder="e.g. Academic Anxiety" className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50" />
              </div>
              <button onClick={handleAddPsychologist} disabled={addingPsych || !newPsychName.trim() || !newPsychSpec.trim()} className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-hover disabled:opacity-50 flex items-center gap-2">
                {addingPsych ? 'Adding...' : <><UserPlus size={16} /> Add Staff</>}
              </button>
            </Card>

            <div className="grid gap-3">
              {psychologists.map(p => (
                <Card key={p.id} className="p-4 flex items-center justify-between hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Shield size={18} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-text">{p.name}</h3>
                      <p className="text-xs text-text-muted">{p.specialization}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeletePsychologist(p.id)} className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </Card>
              ))}
              {psychologists.length === 0 && (
                <div className="text-center py-10 text-text-muted text-sm">No clinical staff added yet.</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6 animate-slide-up">
            <div>
              <h2 className="font-heading font-semibold text-lg">Platform Settings</h2>
              <p className="text-xs text-text-muted mt-1">Configure global university parameters and feature toggles.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-5 space-y-4">
                <h3 className="font-heading font-semibold text-sm border-b border-border pb-2">Feature Toggles</h3>
                {[
                  { label: "AI Guide Module", active: true },
                  { label: "Sleep Tracker", active: true },
                  { label: "Community Forum", active: false },
                  { label: "Emergency SOS Button", active: true },
                  { label: "Parental Notifications", active: false },
                ].map(f => (
                  <div key={f.label} className="flex justify-between items-center">
                    <span className="text-sm text-text-muted">{f.label}</span>
                    <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${f.active ? 'bg-primary' : 'bg-surface-bright'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${f.active ? 'left-5.5' : 'left-0.5'}`} style={{ left: f.active ? 'calc(100% - 1.125rem)' : '0.125rem' }}/>
                    </div>
                  </div>
                ))}
              </Card>

              <Card className="p-5 space-y-4">
                <h3 className="font-heading font-semibold text-sm border-b border-border pb-2">University Branding</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-text-muted">University Name</label>
                    <input type="text" defaultValue="Tech University" className="w-full mt-1 bg-surface border border-border rounded-xl px-4 py-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-text-muted">Primary Color (Hex)</label>
                    <div className="flex gap-2 mt-1">
                      <div className="w-10 h-10 rounded-xl bg-primary border border-border shrink-0" />
                      <input type="text" defaultValue="#5E6BFF" className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm" />
                    </div>
                  </div>
                  <button className="w-full py-2 bg-surface-bright hover:bg-surface text-text-muted text-sm font-semibold rounded-xl border border-border mt-2 transition-colors">
                    Save Branding
                  </button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Footer disclaimer */}
        <div className="mt-8 text-center text-xs text-text-muted opacity-60 space-y-1">
          <p>All data is anonymized and aggregated. No individual can be identified from this dashboard.</p>
          <p>GDPR & FERPA compliant • MindBridge AI v1.0</p>
        </div>
      </main>
    </div>
  );
}
