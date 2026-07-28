import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Star, Clock, CheckCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { apiFetch, isLoggedIn } from '../utils/auth';

interface SleepLog {
  id: number;
  hours: number;
  quality: string;
  note: string | null;
  created_at: string;
}

export default function SleepTracker() {
  const navigate = useNavigate();
  const [hours, setHours] = useState(7);
  const [quality, setQuality] = useState('good');
  const [history, setHistory] = useState<SleepLog[]>([]);
  const [todayLogged, setTodayLogged] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!isLoggedIn()) {
        setLoading(false);
        return;
      }
      try {
        const [histRes, todayRes] = await Promise.all([
          apiFetch('/api/sleep/history'),
          apiFetch('/api/sleep/today')
        ]);
        
        if (histRes.ok) {
          const histData = await histRes.json();
          setHistory(histData);
        }
        
        if (todayRes.ok) {
          const todayData = await todayRes.json();
          if (todayData && todayData.hours !== undefined) {
            setTodayLogged(true);
            setHours(todayData.hours);
            setQuality(todayData.quality);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!isLoggedIn()) return;
    try {
      const res = await apiFetch('/api/sleep/log', {
        method: 'POST',
        body: JSON.stringify({ hours, quality, note: null })
      });
      if (res.ok) {
        setTodayLogged(true);
        const newLog = await res.json();
        setHistory(prev => [newLog, ...prev.filter(l => l.id !== newLog.id)]);
      }
    } catch (e) {
      console.error("Failed to save sleep log", e);
    }
  };

  const qualities = [
    { id: 'poor', label: 'Poor', icon: '😫', color: 'var(--color-error)' },
    { id: 'fair', label: 'Fair', icon: '🥱', color: 'var(--color-warning)' },
    { id: 'good', label: 'Good', icon: '🙂', color: 'var(--color-primary)' },
    { id: 'excellent', label: 'Excellent', icon: '🤩', color: 'var(--color-success)' },
  ];

  const s = {
    page: { minHeight: '100vh', background: 'var(--color-background)', color: 'var(--color-text)', paddingBottom: 100 },
    header: {
      position: 'sticky' as const, top: 0, zIndex: 10,
      background: 'rgba(18,18,30,0.85)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--color-border)', padding: '14px 20px',
    },
    headerRow: { maxWidth: 480, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 },
    backBtn: {
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--color-surface)', border: '1px solid var(--color-border)',
      borderRadius: 10, width: 36, height: 36, cursor: 'pointer',
      color: 'var(--color-text-muted)', flexShrink: 0,
    },
    main: { maxWidth: 480, margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column' as const, gap: 24 },
  };

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.headerRow}>
          <button style={s.backBtn} onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft size={18} />
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 17, fontWeight: 800, fontFamily: 'var(--font-heading)', margin: 0 }}>
              Sleep Insights
            </h1>
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0 }}>
              Track your rest to prevent burnout
            </p>
          </div>
        </div>
      </header>

      <main style={s.main}>
        {/* Logger */}
        <Card style={{ padding: '24px 20px', borderColor: todayLogged ? 'rgba(161,243,195,0.3)' : 'var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ padding: 10, background: 'rgba(161,243,195,0.1)', borderRadius: '50%', color: 'var(--color-primary)' }}>
              <Moon size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>How did you sleep?</h2>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>
                {todayLogged ? "You've logged your sleep for today." : "Log your sleep from last night."}
              </p>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Duration</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>
                {hours} <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)' }}>hrs</span>
              </span>
            </div>
            <input 
              type="range" 
              min="0" max="12" step="0.5" 
              value={hours} 
              onChange={e => setHours(parseFloat(e.target.value))}
              disabled={todayLogged}
              style={{ width: '100%', accentColor: 'var(--color-primary)', cursor: todayLogged ? 'default' : 'pointer' }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <span style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 12 }}>Quality</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {qualities.map(q => {
                const selected = quality === q.id;
                return (
                  <button 
                    key={q.id}
                    onClick={() => setQuality(q.id)}
                    disabled={todayLogged}
                    style={{
                      padding: '12px', borderRadius: 12,
                      background: selected ? 'var(--color-surface-bright)' : 'var(--color-surface)',
                      border: `1px solid ${selected ? q.color : 'var(--color-border)'}`,
                      color: selected ? q.color : 'var(--color-text)',
                      display: 'flex', alignItems: 'center', gap: 8,
                      cursor: todayLogged ? 'default' : 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{q.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{q.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {!todayLogged && (
            <button 
              onClick={handleSave}
              style={{
                width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                background: 'var(--color-primary)', color: 'var(--color-background)',
                fontWeight: 800, fontSize: 15, cursor: 'pointer'
              }}
            >
              Save Sleep Log
            </button>
          )}
          {todayLogged && (
            <div style={{
                width: '100%', padding: '12px', borderRadius: 12,
                background: 'rgba(161,243,195,0.1)', color: 'var(--color-primary)',
                fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}>
              <CheckCircle size={18} /> Logged Successfully
            </div>
          )}
        </Card>

        {/* History Chart */}
        {history.length > 0 && (
          <section>
             <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
               <Clock size={14} /> Recent Sleep Trends
             </h3>
             <Card style={{ padding: '20px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, paddingBottom: 24, overflowX: 'auto' }}>
                  {history.slice(0, 7).reverse().map((log, i) => {
                    const heightPct = Math.min((log.hours / 12) * 100, 100);
                    const q = qualities.find(x => x.id === log.quality);
                    const color = q ? q.color : 'var(--color-primary)';
                    
                    return (
                      <div key={log.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 32 }}>
                        <div style={{ 
                          width: '100%', height: `${heightPct}%`, minHeight: 4, 
                          background: color, borderRadius: '4px 4px 0 0', opacity: 0.8
                        }} />
                        <span style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 600 }}>
                          {log.hours}h
                        </span>
                      </div>
                    );
                  })}
                </div>
             </Card>
          </section>
        )}

      </main>
    </div>
  );
}
