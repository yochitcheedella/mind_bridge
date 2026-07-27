import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, User, GraduationCap, Hash, LogOut, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getAlias, getAuth, clearAuth, apiFetch, isLoggedIn } from '../utils/auth';

const DEPARTMENTS = [
  'General', 'Computer Science', 'Engineering', 'Medicine', 'Business',
  'Arts & Humanities', 'Law', 'Education', 'Social Sciences', 'Natural Sciences',
];

const YEARS = [1, 2, 3, 4, 5, 6];

// ─── Inline style tokens ───────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
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
    borderRadius: 10, width: 36, height: 36, cursor: 'pointer', color: 'var(--color-text-muted)', flexShrink: 0,
  },
  main: { maxWidth: 480, margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 24 },
  sectionLabel: {
    fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
    textTransform: 'uppercase' as const, color: 'var(--color-text-muted)',
    display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12,
  },

  // Alias banner
  aliasBanner: {
    padding: '22px 20px',
    background: 'linear-gradient(135deg, rgba(161,243,195,0.1) 0%, rgba(180,161,243,0.08) 100%)',
    border: '1px solid rgba(161,243,195,0.25)',
    borderRadius: 18, textAlign: 'center' as const,
  },
  aliasLabel: { fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 8, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' as const },
  aliasValue: { fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--color-primary)', marginBottom: 8 },
  aliasNote: { fontSize: 11, color: 'var(--color-text-muted)', lineHeight: 1.6 },

  // Form fields
  field: { display: 'flex', flexDirection: 'column' as const, gap: 8 },
  label: { fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)' },
  select: {
    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
    borderRadius: 12, padding: '12px 14px', color: 'var(--color-text)',
    fontSize: 14, width: '100%', outline: 'none', cursor: 'pointer',
    appearance: 'none' as const,
  },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },

  // Status
  toast: (success: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '12px 16px', borderRadius: 12,
    background: success ? 'rgba(161,243,195,0.1)' : 'rgba(255,180,171,0.1)',
    border: `1px solid ${success ? 'rgba(161,243,195,0.4)' : 'rgba(255,107,107,0.4)'}`,
    color: success ? 'var(--color-success)' : 'var(--color-error)',
    fontSize: 13, fontWeight: 600,
  }),

  // Logout button
  logoutCard: {
    padding: '16px 18px', cursor: 'pointer',
    borderColor: 'rgba(255,107,107,0.25)',
    background: 'rgba(255,107,107,0.04)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
};

export default function ProfileSettings() {
  const navigate = useNavigate();
  const alias = getAlias();
  const auth = getAuth();
  const loggedIn = isLoggedIn();

  const [department, setDepartment] = useState('General');
  const [year, setYear] = useState(1);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  // Fetch current profile
  useEffect(() => {
    if (!loggedIn) return;
    apiFetch('/api/auth/profile')
      .then(r => r.json())
      .then(data => {
        if (data.department) setDepartment(data.department);
        if (data.year) setYear(data.year);
      })
      .catch(() => {}); // graceful — backend might not be running
  }, []);

  async function handleSave() {
    if (!loggedIn) {
      setStatus({ ok: false, msg: 'You must be logged in to save settings.' });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const res = await apiFetch('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ department, year }),
      });
      if (res.ok) {
        setStatus({ ok: true, msg: 'Profile updated successfully!' });
      } else {
        const err = await res.json();
        setStatus({ ok: false, msg: err.detail ?? 'Update failed. Please try again.' });
      }
    } catch {
      setStatus({ ok: false, msg: 'Could not reach the server. Please check your connection.' });
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    clearAuth();
    navigate('/login');
  }

  return (
    <div style={s.page}>
      {/* Header */}
      <header style={s.header}>
        <div style={s.headerRow}>
          <button style={s.backBtn} onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontSize: 17, fontWeight: 800, fontFamily: 'var(--font-heading)', margin: 0 }}>
              Profile &amp; Settings
            </h1>
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0 }}>Manage your account</p>
          </div>
        </div>
      </header>

      <main style={s.main}>

        {/* ── Anonymous Identity ── */}
        <section>
          <p style={s.sectionLabel}><Shield size={12} /> Your Anonymous Identity</p>
          <div style={s.aliasBanner}>
            <p style={s.aliasLabel}>Your Secure Alias</p>
            <p style={s.aliasValue}>{alias}</p>
            <p style={s.aliasNote}>
              This alias permanently replaces your real name across the platform.
              Counselors and peers only ever see this name — your identity stays private.
            </p>
          </div>
        </section>

        {/* ── Demographic Settings ── */}
        <section>
          <p style={s.sectionLabel}><User size={12} /> Demographic Details</p>
          <Card style={{ padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0 }}>
              Your demographic info helps us tailor support recommendations. It is
              never linked to your identity and is only used in aggregate analytics.
            </p>

            <div style={s.row}>
              {/* Department */}
              <div style={s.field}>
                <label style={s.label}><GraduationCap size={12} style={{ display: 'inline', marginRight: 5 }} />Department</label>
                <select
                  style={s.select}
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                >
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              {/* Year */}
              <div style={s.field}>
                <label style={s.label}><Hash size={12} style={{ display: 'inline', marginRight: 5 }} />Year</label>
                <select
                  style={s.select}
                  value={year}
                  onChange={e => setYear(Number(e.target.value))}
                >
                  {YEARS.map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
            </div>

            {/* Status toast */}
            {status && (
              <div style={s.toast(status.ok)}>
                {status.ok
                  ? <CheckCircle size={16} />
                  : <AlertCircle size={16} />
                }
                {status.msg}
              </div>
            )}

            <Button
              onClick={handleSave}
              disabled={loading}
              style={{ alignSelf: 'flex-end' }}
            >
              {loading ? 'Saving…' : 'Save Changes'}
            </Button>
          </Card>
        </section>

        {/* ── Account Info ── */}
        {auth && (
          <section>
            <p style={s.sectionLabel}><Shield size={12} /> Account</p>
            <Card style={{ padding: '14px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 2 }}>Student ID</p>
                  <p style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-heading)' }}>#{auth.student_id}</p>
                </div>
                <div style={{
                  padding: '6px 12px', borderRadius: 8,
                  background: 'rgba(161,243,195,0.1)', border: '1px solid rgba(161,243,195,0.3)',
                  fontSize: 11, color: 'var(--color-success)', fontWeight: 700,
                }}>
                  Active
                </div>
              </div>
            </Card>
          </section>
        )}

        {/* ── Privacy Notice ── */}
        <Card style={{ padding: '16px 18px', borderColor: 'rgba(161,243,195,0.15)', background: 'rgba(161,243,195,0.04)' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <Shield size={16} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Privacy Protected</p>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.65 }}>
                MindBridge is built on a zero-identity architecture. Your email is never
                stored in plain text. Conversations and journals are end-to-end pseudonymised
                using your alias token.
              </p>
            </div>
          </div>
        </Card>

        {/* ── Logout ── */}
        <section>
          <Card style={s.logoutCard} onClick={handleLogout}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <LogOut size={18} color="var(--color-error)" />
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-error)', margin: 0 }}>Sign Out</p>
                <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0 }}>Clear session &amp; return to login</p>
              </div>
            </div>
          </Card>
        </section>

      </main>
    </div>
  );
}
