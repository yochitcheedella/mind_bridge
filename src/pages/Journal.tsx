import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { BookOpen, PenLine, Tag, Trash2, CheckCircle2, Clock, ArrowLeft, Heart } from 'lucide-react';
import { apiFetch } from '../utils/auth';

interface JournalEntry { id: number; content: string; mood_tag: string | null; created_at: string; }

const MOOD_TAGS = [
  { id: 'academic',       label: '📚 Academic',      color: 'bg-primary/20 text-primary border-primary/30' },
  { id: 'relationships',  label: '💛 Relationships',  color: 'bg-warning/20 text-warning border-warning/30' },
  { id: 'family',         label: '🏠 Family',         color: 'bg-success/20 text-success border-success/30' },
  { id: 'finance',        label: '💰 Finance',        color: 'bg-text-muted/20 text-text-muted border-text-muted/30' },
  { id: 'health',         label: '❤️ Health',         color: 'bg-error/20 text-error border-error/30' },
  { id: 'career',         label: '🎯 Career',         color: 'bg-purple-400/20 text-purple-300 border-purple-400/30' },
];

const tagConfig = (id: string | null) => MOOD_TAGS.find(t => t.id === id);

export default function Journal() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'journal' | 'gratitude'>('journal');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [content, setContent] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [filterTag, setFilterTag] = useState<string | null>(null);

  // Gratitude state
  const [gratitude1, setGratitude1] = useState('');
  const [gratitude2, setGratitude2] = useState('');
  const [gratitude3, setGratitude3] = useState('');
  const [gratSaving, setGratSaving] = useState(false);
  const [gratSaved, setGratSaved] = useState(false);
  const gratEntries = entries.filter(e => e.mood_tag === 'gratitude');

  useEffect(() => {
    apiFetch('/api/journal/entries')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setEntries(data); })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      const res = await apiFetch('/api/journal/entry', {
        method: 'POST',
        body: JSON.stringify({ content: content.trim(), mood_tag: selectedTag }),
      });
      if (res.ok) {
        const newEntry = await res.json();
        setEntries(prev => [newEntry, ...prev]);
        setContent('');
        setSelectedTag(null);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleGratitudeSave = async () => {
    const lines = [gratitude1, gratitude2, gratitude3].filter(l => l.trim());
    if (lines.length === 0) return;
    setGratSaving(true);
    try {
      const res = await apiFetch('/api/journal/entry', {
        method: 'POST',
        body: JSON.stringify({
          content: lines.map((l, i) => `${i + 1}. ${l.trim()}`).join('\n'),
          mood_tag: 'gratitude',
        }),
      });
      if (res.ok) {
        const newEntry = await res.json();
        setEntries(prev => [newEntry, ...prev]);
        setGratitude1(''); setGratitude2(''); setGratitude3('');
        setGratSaved(true);
        setTimeout(() => setGratSaved(false), 3000);
      }
    } finally { setGratSaving(false); }
  };

  const filtered = filterTag ? entries.filter(e => e.mood_tag === filterTag && e.mood_tag !== 'gratitude') : entries.filter(e => e.mood_tag !== 'gratitude');

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-surface-dim/80 backdrop-blur-xl border-b border-border px-5 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} aria-label="Go back"
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-surface border border-border text-text-muted hover:text-text hover:bg-surface-bright transition-all shrink-0">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-heading font-bold text-lg flex items-center gap-2">
              <BookOpen size={18} className="text-primary" /> My Journal
            </h1>
            <p className="text-xs text-text-muted mt-0.5">{entries.length} private entries • End-to-end encrypted</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 py-6 space-y-6 animate-fade-in">
        {/* Tab switcher */}
        <div className="flex bg-surface-bright rounded-xl p-1 gap-1">
          <button onClick={() => setActiveTab('journal')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5
              ${activeTab === 'journal' ? 'bg-surface-dim text-primary shadow-sm' : 'text-text-muted hover:text-text'}`}>
            <BookOpen size={15} /> Journal
          </button>
          <button onClick={() => setActiveTab('gratitude')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5
              ${activeTab === 'gratitude' ? 'bg-surface-dim text-primary shadow-sm' : 'text-text-muted hover:text-text'}`}>
            <Heart size={15} /> Gratitude
          </button>
        </div>

        {/* Gratitude tab */}
        {activeTab === 'gratitude' && (
          <>
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Heart size={18} className="text-primary" />
                <h2 className="font-heading font-semibold">3 Gratitudes for Today</h2>
              </div>
              <p className="text-xs text-text-muted mb-4">Name three things you're grateful for right now — big or small.</p>
              <div className="space-y-3 mb-4">
                {[{id: '1', val: gratitude1, set: setGratitude1}, {id: '2', val: gratitude2, set: setGratitude2}, {id: '3', val: gratitude3, set: setGratitude3}].map(({id, val, set}) => (
                  <div key={id} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0">{id}</span>
                    <input
                      value={val}
                      onChange={e => set(e.target.value)}
                      placeholder={`I'm grateful for…`}
                      className="flex-1 bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-text placeholder-text-muted focus:outline-none focus:border-primary/50 transition-all"
                    />
                  </div>
                ))}
              </div>
              <button onClick={handleGratitudeSave} disabled={gratSaving || (!gratitude1.trim() && !gratitude2.trim() && !gratitude3.trim())}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2
                  ${gratSaved ? 'bg-success/20 text-success border border-success/30'
                    : (!gratitude1.trim() && !gratitude2.trim() && !gratitude3.trim()) ? 'bg-surface border border-border text-text-muted cursor-not-allowed'
                    : 'bg-primary hover:bg-primary-hover text-white shadow-md shadow-primary/20'}`}>
                {gratSaved ? <><CheckCircle2 size={16} /> Saved!</>
                  : gratSaving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                  : <><Heart size={16} /> Save Gratitudes</>}
              </button>
            </Card>

            {gratEntries.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">Past Gratitudes</h2>
                <div className="space-y-3">
                  {gratEntries.slice(0, 5).map(entry => (
                    <Card key={entry.id} className="p-4">
                      <div className="flex items-center gap-1.5 text-xs text-text-muted mb-2">
                        <Clock size={11} />
                        {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <p className="text-sm text-text leading-relaxed whitespace-pre-line">{entry.content}</p>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* Journal tab */}
        {activeTab === 'journal' && <>
        {/* New Entry */}
        <Card className="p-5">
          <h2 className="font-heading font-semibold mb-3 flex items-center gap-2">
            <PenLine size={16} className="text-primary" /> New Entry
          </h2>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="What's on your mind today? Write freely — this is your private space..."
            rows={4}
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text placeholder-text-muted focus:outline-none focus:border-primary/50 focus:bg-surface-bright resize-none transition-all mb-4"
          />

          {/* Mood Tags */}
          <div className="mb-4">
            <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Tag size={11} /> Tag this entry (optional)
            </p>
            <div className="flex flex-wrap gap-2">
              {MOOD_TAGS.map(tag => (
                <button key={tag.id} onClick={() => setSelectedTag(selectedTag === tag.id ? null : tag.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all
                    ${selectedTag === tag.id ? tag.color + ' scale-105' : 'bg-surface border-border text-text-muted hover:border-primary/30'}`}>
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleSave} disabled={saving || !content.trim()}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2
              ${saved ? 'bg-success/20 text-success border border-success/30'
                : !content.trim() ? 'bg-surface border border-border text-text-muted cursor-not-allowed'
                : 'bg-primary hover:bg-primary-hover text-white shadow-md shadow-primary/20'}`}>
            {saved ? <><CheckCircle2 size={16} /> Saved!</>
              : saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
              : <><PenLine size={16} /> Save Entry</>}
          </button>
        </Card>

        {/* Filter Tabs */}
        {entries.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button onClick={() => setFilterTag(null)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium whitespace-nowrap transition-all
                ${!filterTag ? 'bg-primary/15 text-primary border-primary/30' : 'bg-surface border-border text-text-muted hover:border-primary/30'}`}>
              All ({entries.length})
            </button>
            {MOOD_TAGS.filter(t => entries.some(e => e.mood_tag === t.id)).map(tag => (
              <button key={tag.id} onClick={() => setFilterTag(filterTag === tag.id ? null : tag.id)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium whitespace-nowrap transition-all
                  ${filterTag === tag.id ? tag.color : 'bg-surface border-border text-text-muted hover:border-primary/30'}`}>
                {tag.label} ({entries.filter(e => e.mood_tag === tag.id).length})
              </button>
            ))}
          </div>
        )}

        {/* Entries List */}
        {loading ? (
          <div className="flex items-center justify-center h-20 text-text-muted text-sm">Loading entries...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            <BookOpen size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">No entries yet</p>
            <p className="text-xs mt-1 opacity-60">Start writing — this space is entirely yours.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(entry => {
              const tag = tagConfig(entry.mood_tag);
              const date = new Date(entry.created_at);
              const preview = entry.content.length > 120 ? entry.content.slice(0, 120) + '…' : entry.content;
              return (
                <Card key={entry.id} className="p-4 hover:bg-surface-bright/50 transition-colors cursor-default group animate-slide-up">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {tag && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${tag.color}`}>
                          {tag.label}
                        </span>
                      )}
                      <div className="flex items-center gap-1 text-xs text-text-muted">
                        <Clock size={11} />
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {' '}·{' '}
                        {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-text leading-relaxed">{preview}</p>
                </Card>
              );
            })}
          </div>
        )}
        </>}
      </main>
    </div>
  );
}
