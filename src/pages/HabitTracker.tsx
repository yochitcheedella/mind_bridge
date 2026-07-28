import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Circle, Plus, Flame, Trophy, Trash2, X } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { apiFetch, isLoggedIn } from '../utils/auth';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Habit {
  id: string;
  name: string;
  emoji: string;
  category: string;
  streak: number;
  completions: string[]; // ISO date strings
}

// ─── Pre-set habits ──────────────────────────────────────────────────────────
const PRESET_HABITS = [
  { id: 'sleep7', name: 'Sleep 7+ hours', emoji: '😴', category: 'Sleep' },
  { id: 'exercise', name: 'Exercise / Move', emoji: '🏃', category: 'Health' },
  { id: 'no-phone-bed', name: 'No phone before bed', emoji: '📵', category: 'Sleep' },
  { id: 'gratitude', name: 'Write 3 gratitudes', emoji: '🙏', category: 'Mindfulness' },
  { id: 'hydrate', name: 'Drink 8 glasses water', emoji: '💧', category: 'Health' },
  { id: 'meditate', name: 'Meditate 5 min', emoji: '🧘', category: 'Mindfulness' },
  { id: 'journal', name: 'Journal entry', emoji: '📔', category: 'Mindfulness' },
  { id: 'no-caffeine', name: 'Limit caffeine', emoji: '☕', category: 'Health' },
];

const STORAGE_KEY = 'mindbridge_habits';
const today = () => new Date().toISOString().slice(0, 10);
const last7 = (): string[] => Array.from({ length: 7 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d.toISOString().slice(0, 10);
});

function loadHabits(): Habit[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}
function saveHabits(h: Habit[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(h));
}
function calcStreak(completions: string[]): number {
  let streak = 0;
  const d = new Date();
  while (true) {
    const key = d.toISOString().slice(0, 10);
    if (!completions.includes(key)) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s: any = {
  page: { minHeight: '100vh', background: 'var(--color-background)', color: 'var(--color-text)', paddingBottom: 100 },
  header: {
    position: 'sticky', top: 0, zIndex: 10,
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
  main: { maxWidth: 480, margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 24 },
  sectionLabel: {
    fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
    textTransform: 'uppercase' as const, color: 'var(--color-text-muted)',
    display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12,
  },
  weekDot: (done: boolean): React.CSSProperties => ({
    width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: done ? 'var(--color-primary)' : 'var(--color-surface-bright)',
    fontSize: 10, color: done ? 'var(--color-background)' : 'var(--color-text-muted)',
    fontWeight: 700, transition: 'all 0.2s',
  }),
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function HabitTracker() {
  const navigate = useNavigate();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmoji, setCustomEmoji] = useState('⭐');
  const todayKey = today();
  const days7 = last7();
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  useEffect(() => {
    async function fetchHabits() {
      if (!isLoggedIn()) {
        setHabits(loadHabits());
        setLoaded(true);
        return;
      }
      try {
        const res = await apiFetch('/api/habits');
        if (res.ok) {
          const data = await res.json();
          setHabits(data);
        } else {
          setHabits(loadHabits());
        }
      } catch (e) {
        setHabits(loadHabits());
      }
      setLoaded(true);
    }
    fetchHabits();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveHabits(habits);
    if (isLoggedIn()) {
      apiFetch('/api/habits', {
        method: 'POST',
        body: JSON.stringify(habits)
      }).catch(console.error);
    }
  }, [habits, loaded]);

  function toggleToday(id: string) {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      const done = h.completions.includes(todayKey);
      const completions = done
        ? h.completions.filter(d => d !== todayKey)
        : [...h.completions, todayKey];
      return { ...h, completions, streak: calcStreak(completions) };
    }));
  }

  function addPreset(preset: typeof PRESET_HABITS[0]) {
    if (habits.some(h => h.id === preset.id)) return;
    const newH: Habit = { ...preset, streak: 0, completions: [] };
    setHabits(prev => [...prev, newH]);
  }

  function addCustom() {
    if (!customName.trim()) return;
    const newH: Habit = {
      id: `custom_${Date.now()}`,
      name: customName.trim(),
      emoji: customEmoji,
      category: 'Custom',
      streak: 0,
      completions: [],
    };
    setHabits(prev => [...prev, newH]);
    setCustomName('');
    setCustomEmoji('⭐');
    setShowAdd(false);
  }

  function removeHabit(id: string) {
    setHabits(prev => prev.filter(h => h.id !== id));
  }

  const totalDoneToday = habits.filter(h => h.completions.includes(todayKey)).length;
  const totalHabits = habits.length;
  const completionPct = totalHabits > 0 ? Math.round((totalDoneToday / totalHabits) * 100) : 0;
  const longestStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);

  return (
    <div style={s.page}>
      {/* Header */}
      <header style={s.header}>
        <div style={s.headerRow}>
          <button style={s.backBtn} onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft size={18} />
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 17, fontWeight: 800, fontFamily: 'var(--font-heading)', margin: 0 }}>
              Habit Tracker
            </h1>
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0 }}>
              Build daily wellness routines
            </p>
          </div>
          <button
            onClick={() => setShowAdd(s => !s)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 10,
              background: 'var(--color-primary)', border: 'none',
              color: 'var(--color-background)', fontWeight: 700, fontSize: 13, cursor: 'pointer',
            }}
          >
            <Plus size={16} /> Add
          </button>
        </div>
      </header>

      <main style={s.main}>

        {/* Stats banner */}
        {totalHabits > 0 && (
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10,
          }}>
            {[
              { label: "Today's Progress", value: `${completionPct}%`, icon: '✅' },
              { label: 'Done Today', value: `${totalDoneToday}/${totalHabits}`, icon: '🎯' },
              { label: 'Best Streak', value: `${longestStreak}d`, icon: '🔥' },
            ].map(({ label, value, icon }) => (
              <Card key={label} style={{ padding: '12px 10px', textAlign: 'center' as const }}>
                <p style={{ fontSize: 18 }}>{icon}</p>
                <p style={{ fontSize: 17, fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>{value}</p>
                <p style={{ fontSize: 9, color: 'var(--color-text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginTop: 2 }}>{label}</p>
              </Card>
            ))}
          </div>
        )}

        {/* Add habit panel */}
        {showAdd && (
          <Card style={{ padding: '18px 16px', borderColor: 'rgba(161,243,195,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <p style={{ fontWeight: 700, fontSize: 14 }}>Add a Habit</p>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            {/* Presets */}
            <p style={s.sectionLabel}>Quick Add</p>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8, marginBottom: 18 }}>
              {PRESET_HABITS.map(p => {
                const already = habits.some(h => h.id === p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => addPreset(p)}
                    disabled={already}
                    style={{
                      padding: '6px 12px', borderRadius: 20, border: '1px solid',
                      borderColor: already ? 'var(--color-border)' : 'var(--color-primary)',
                      background: already ? 'var(--color-surface-bright)' : 'rgba(161,243,195,0.1)',
                      color: already ? 'var(--color-text-muted)' : 'var(--color-primary)',
                      fontSize: 12, fontWeight: 600, cursor: already ? 'default' : 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {p.emoji} {p.name}
                  </button>
                );
              })}
            </div>

            {/* Custom habit */}
            <p style={s.sectionLabel}>Custom Habit</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={customEmoji}
                onChange={e => setCustomEmoji(e.target.value)}
                style={{
                  width: 44, textAlign: 'center' as const, fontSize: 20,
                  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                  borderRadius: 10, padding: '8px 4px', color: 'var(--color-text)',
                }}
                maxLength={2}
              />
              <input
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                placeholder="Habit name…"
                onKeyDown={e => e.key === 'Enter' && addCustom()}
                style={{
                  flex: 1, background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                  borderRadius: 10, padding: '8px 12px', color: 'var(--color-text)',
                  fontSize: 13, outline: 'none',
                }}
              />
              <button
                onClick={addCustom}
                style={{
                  padding: '8px 16px', borderRadius: 10, border: 'none',
                  background: 'var(--color-primary)', color: 'var(--color-background)',
                  fontWeight: 700, fontSize: 13, cursor: 'pointer',
                }}
              >
                Add
              </button>
            </div>
          </Card>
        )}

        {/* Habit list */}
        {habits.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--color-text-muted)' }}>
            <Trophy size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <p style={{ fontWeight: 600, marginBottom: 6 }}>No habits yet</p>
            <p style={{ fontSize: 12, opacity: 0.7 }}>Tap "+ Add" to build your first daily routine.</p>
          </div>
        ) : (
          <section>
            <p style={s.sectionLabel}><Flame size={12} /> Today's Habits</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {habits.map(habit => {
                const doneToday = habit.completions.includes(todayKey);
                return (
                  <Card key={habit.id} style={{
                    padding: '14px 16px',
                    borderColor: doneToday ? 'rgba(161,243,195,0.35)' : 'var(--color-border)',
                    background: doneToday ? 'rgba(161,243,195,0.05)' : 'var(--color-surface)',
                    transition: 'all 0.2s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {/* Check button */}
                      <button
                        onClick={() => toggleToday(habit.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}
                        aria-label={doneToday ? 'Mark incomplete' : 'Mark complete'}
                      >
                        {doneToday
                          ? <CheckCircle2 size={26} color="var(--color-primary)" />
                          : <Circle size={26} color="var(--color-text-muted)" />
                        }
                      </button>

                      {/* Emoji + name */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 20 }}>{habit.emoji}</span>
                          <span style={{
                            fontWeight: 600, fontSize: 14,
                            color: doneToday ? 'var(--color-primary)' : 'var(--color-text)',
                            textDecoration: doneToday ? 'line-through' : 'none',
                            opacity: doneToday ? 0.8 : 1,
                          }}>
                            {habit.name}
                          </span>
                        </div>

                        {/* 7-day dots */}
                        <div style={{ display: 'flex', gap: 4, marginTop: 8, alignItems: 'center' }}>
                          {days7.map((day, i) => (
                            <div key={day} title={day} style={s.weekDot(habit.completions.includes(day))}>
                              {dayLabels[i]}
                            </div>
                          ))}
                          {habit.streak > 0 && (
                            <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--color-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Flame size={11} /> {habit.streak}d
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => removeHabit(habit.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4, flexShrink: 0 }}
                        aria-label="Remove habit"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Motivation card */}
        {totalDoneToday === totalHabits && totalHabits > 0 && (
          <Card style={{ padding: '20px 18px', background: 'rgba(161,243,195,0.08)', borderColor: 'rgba(161,243,195,0.3)', textAlign: 'center' as const }}>
            <p style={{ fontSize: 28, marginBottom: 8 }}>🎉</p>
            <p style={{ fontWeight: 800, fontSize: 15, color: 'var(--color-primary)', marginBottom: 4 }}>All habits complete!</p>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>You've nailed every habit today. Keep it up!</p>
          </Card>
        )}

      </main>
    </div>
  );
}
