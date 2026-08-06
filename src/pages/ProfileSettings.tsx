import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, User, GraduationCap, Hash, LogOut, CheckCircle, AlertCircle, Download, Trash2, ShieldAlert, Sparkles, Key, Lock } from 'lucide-react';
import { getAlias, getAuth, clearAuth, apiFetch, isLoggedIn, getUserName, getRole } from '../utils/auth';

const DEPARTMENTS = [
  'CSE', 'AI&DS', 'AI&ML', 'EEE', 'IT', 'CSBS', 'ECE', 'MECH', 'CIVIL'
];

const YEARS = [1, 2, 3, 4, 5, 6];

export default function ProfileSettings() {
  const navigate = useNavigate();
  const auth = getAuth();
  const loggedIn = isLoggedIn();

  const [userAlias, setUserAlias] = useState(getAlias() || 'User');
  const [department, setDepartment] = useState('CSE');
  const [year, setYear] = useState(1);
  const [realName, setRealName] = useState('');
  const [phone, setPhone] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!loggedIn) return;
    const role = getRole();
    if (role === 'student') {
      apiFetch('/api/auth/profile').then(async res => {
        if (res.ok) {
          const data = await res.json();
          if (data.anonymous_alias) setUserAlias(data.anonymous_alias);
          if (data.department) setDepartment(data.department);
          if (data.year) setYear(data.year);
        }
      }).catch(console.warn);
    } else {
      const name = getUserName();
      if (name) setUserAlias(name);
    }
  }, [loggedIn]);

  async function handleSave() {
    if (!loggedIn) {
      setStatus({ ok: false, msg: 'You must be logged in to save settings.' });
      return;
    }
    if (!userAlias.trim()) {
      setStatus({ ok: false, msg: 'Alias cannot be empty.' });
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
    } catch (err: any) {
      setStatus({ ok: false, msg: err.message || 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    clearAuth();
    navigate('/login');
  }

  async function handleExportData() {
    if (!loggedIn) return;
    setExporting(true);
    try {
      const res = await apiFetch('/api/privacy/export');
      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mindbridge_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        alert("Failed to export data.");
      }
    } catch (e) {
      alert("Error exporting data.");
    } finally {
      setExporting(false);
    }
  }

  async function handleDeleteAccount() {
    if (!loggedIn) return;
    const confirm1 = window.confirm("WARNING: This will permanently delete your account, all chat history, journal entries, and mood logs. This action CANNOT be undone.");
    if (!confirm1) return;
    
    const confirm2 = window.prompt("To confirm deletion, type 'DELETE' below:");
    if (confirm2 !== 'DELETE') return;
    
    setDeleting(true);
    try {
      const res = await apiFetch('/api/privacy/account', { method: 'DELETE' });
      if (res.ok) {
        handleLogout();
      } else {
        alert("Failed to delete account.");
      }
    } catch (e) {
      alert("Error deleting account.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex items-center justify-between gap-4 bg-surface-container/60 p-4 sm:p-5 rounded-2xl border border-border-structural/80 backdrop-blur-xl shadow-md">
        <div className="flex items-center gap-3.5">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2.5 rounded-xl bg-surface-container-high/70 hover:bg-surface-container-highest text-on-surface-variant hover:text-white border border-border-structural/60 transition-colors active:scale-95 flex items-center justify-center shrink-0 shadow-sm"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Profile &amp; Security Settings</span>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md text-[10px] uppercase font-mono font-extrabold bg-interactive-primary/20 text-secondary-fixed border border-interactive-primary/30">Zero-Knowledge</span>
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant font-medium mt-0.5">
              Manage your anonymous alias, academic credentials, and zero-trust data controls.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left column (7 cols on Desktop) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* ── Anonymous Identity ── */}
          <section className="space-y-3">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-2">
              <Shield size={14} className="text-interactive-primary" />
              <span>Your Anonymous Identity</span>
            </label>
            
            <div className="glass-panel p-6 rounded-3xl border border-interactive-primary/40 text-center space-y-4 shadow-xl relative overflow-hidden bg-gradient-to-br from-indigo-950/40 via-surface-container-lowest to-surface-container-low">
              <div className="absolute top-0 right-0 w-48 h-48 bg-interactive-primary/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-secondary-fixed block">
                Secure Pseudonymous Alias
              </span>
              
              <div className="relative max-w-sm mx-auto">
                <input
                  className="w-full text-center text-xl sm:text-2xl font-heading font-black py-3 px-4 rounded-2xl bg-black/40 border border-interactive-primary text-white focus:outline-none focus:ring-2 focus:ring-secondary-fixed tracking-wide shadow-inner"
                  value={userAlias}
                  onChange={e => setUserAlias(e.target.value)}
                  placeholder="e.g. BlueFalcon"
                />
              </div>

              <p className="text-xs text-on-surface-variant max-w-md mx-auto leading-relaxed">
                This alias permanently masks your real identity across all chat sessions, CBT tools, and campus support forums. Counselors and peers only ever see this name.
              </p>
            </div>
          </section>

          {/* ── Demographic Details ── */}
          <section className="space-y-3">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-2">
              <User size={14} className="text-secondary-fixed" />
              <span>Academic &amp; Demographic Preferences</span>
            </label>

            <div className="glass-panel p-6 rounded-3xl border border-border-structural space-y-5 shadow-xl">
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Demographic metrics allow AI models to calibrate academic stress baselines by engineering cohort and year of study.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {/* Department */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <GraduationCap size={14} className="text-interactive-primary" />
                    <span>Department</span>
                  </label>
                  <select
                    className="w-full bg-surface-container-highest border border-border-structural rounded-xl py-3 px-3.5 text-sm text-white font-semibold focus:outline-none focus:ring-2 focus:ring-interactive-primary"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                  >
                    {DEPARTMENTS.map(d => <option key={d} value={d} className="bg-surface-container-lowest text-white">{d}</option>)}
                  </select>
                </div>

                {/* Year */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Hash size={14} className="text-secondary-fixed" />
                    <span>Year of Study</span>
                  </label>
                  <select
                    className="w-full bg-surface-container-highest border border-border-structural rounded-xl py-3 px-3.5 text-sm text-white font-semibold focus:outline-none focus:ring-2 focus:ring-interactive-primary"
                    value={year}
                    onChange={e => setYear(Number(e.target.value))}
                  >
                    {YEARS.map(y => <option key={y} value={y} className="bg-surface-container-lowest text-white">Year {y}</option>)}
                  </select>
                </div>
              </div>

              {/* Status Toast */}
              {status && (
                <div className={`p-4 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center gap-3 animate-fade-in ${
                  status.ok 
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' 
                    : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                }`}>
                  {status.ok ? <CheckCircle size={18} className="text-emerald-400 shrink-0" /> : <AlertCircle size={18} className="text-rose-400 shrink-0" />}
                  <span>{status.msg}</span>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-interactive-primary to-secondary text-white font-heading font-extrabold text-sm tracking-wide hover:brightness-110 shadow-lg shadow-interactive-primary/30 active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? 'Saving Profile...' : 'Save Preferences'}
                </button>
              </div>
            </div>
          </section>

          {/* ── Confidential Emergency Contacts ── */}
          <section className="space-y-3">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <ShieldAlert size={14} className="text-amber-400" />
              <span>Confidential Emergency Vault (Optional)</span>
            </label>

            <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-950/10 to-surface-container-lowest space-y-4 shadow-xl">
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Your real legal name and contact phone number remain under military-grade encryption in the database vault. They are NEVER visible to counselors during therapy sessions—only accessible to authorized institute directors during active Crisis SOS medical emergencies.
              </p>

              <div className="space-y-3 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white">Full Legal Name (Encrypted)</label>
                  <input
                    type="text"
                    className="w-full bg-surface-container-highest border border-border-structural rounded-xl py-3 px-4 text-sm text-white placeholder-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    value={realName}
                    onChange={e => setRealName(e.target.value)}
                    placeholder="e.g. Scholar Legal Name"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white">Emergency Mobile Number (Encrypted)</label>
                  <input
                    type="tel"
                    className="w-full bg-surface-container-highest border border-border-structural rounded-xl py-3 px-4 text-sm text-white placeholder-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="e.g. +91 9876543210"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right column (5 cols on Desktop) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Account Badge */}
          {auth && (
            <div className="glass-panel p-5 rounded-3xl border border-border-structural flex items-center justify-between shadow-lg">
              <div>
                <span className="text-xs font-mono font-bold text-on-surface-variant uppercase tracking-wider block">Student Token ID</span>
                <span className="text-lg font-heading font-black text-white mt-0.5 inline-block">#{auth.student_id || 'ANON-VIT'}</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-extrabold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Active Vault</span>
              </span>
            </div>
          )}

          {/* Privacy Architecture Notice */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-surface-container via-panel-high to-indigo-950/40 border border-border-structural shadow-xl space-y-3">
            <div className="flex items-center gap-2.5 text-white font-heading font-extrabold text-sm">
              <Lock className="text-interactive-primary" size={18} />
              <span>Zero-Identity Architecture</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              MindBridge implements end-to-end token pseudonymization. Your real student credentials or email addresses are never retained in cleartext within conversational logs or sentiment inference vectors.
            </p>
          </div>

          {/* Data & Privacy Controls */}
          <section className="space-y-3">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-2">
              <Key size={14} className="text-outline" />
              <span>Data &amp; Privacy Governance</span>
            </label>

            <div className="glass-panel p-6 rounded-3xl border border-border-structural space-y-5 shadow-xl">
              <div className="space-y-2.5">
                <h4 className="font-heading font-bold text-sm text-white flex items-center justify-between">
                  <span>Export Personal Vault</span>
                  <span className="text-[10px] font-mono text-secondary-fixed bg-secondary/15 px-2 py-0.5 rounded border border-secondary/30">JSON</span>
                </h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Download a complete portable archive of all your encrypted sleep biometrics, mood entries, and reflection journals.
                </p>
                <button 
                  onClick={handleExportData} 
                  disabled={exporting}
                  className="w-full py-3 px-4 rounded-xl bg-surface-container-highest hover:bg-surface-container text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 border border-border-structural active:scale-98"
                >
                  <Download size={15} className="text-secondary-fixed" /> 
                  <span>{exporting ? 'Generating JSON Archive...' : 'Download Complete Data Vault'}</span>
                </button>
              </div>

              <div className="border-t border-border-structural/60 pt-4 space-y-2.5">
                <h4 className="font-heading font-bold text-sm text-rose-400 flex items-center gap-1.5">
                  <Trash2 size={16} />
                  <span>Permanent Account Erasure</span>
                </h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Irreversibly delete your pseudonymous profile token, mood logs, and AI conversation memory from active database replicas.
                </p>
                <button 
                  onClick={handleDeleteAccount} 
                  disabled={deleting}
                  className="w-full py-3 px-4 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 font-heading font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-98 shadow-md shadow-rose-500/10"
                >
                  <Trash2 size={15} /> 
                  <span>{deleting ? 'Erasing Account Records...' : 'Erase All Account Data'}</span>
                </button>
              </div>
            </div>
          </section>

          {/* Sign Out Action */}
          <button 
            onClick={handleLogout}
            className="w-full p-4 rounded-2xl bg-surface-container hover:bg-rose-500/10 border border-border-structural hover:border-rose-500/40 text-on-surface hover:text-rose-400 font-heading font-extrabold text-sm transition-all flex items-center justify-center gap-3 shadow-md active:scale-98 group"
          >
            <LogOut size={18} className="text-error group-hover:animate-bounce" />
            <span>End Secure Session &amp; Sign Out</span>
          </button>

        </div>
      </div>
    </div>
  );
}
