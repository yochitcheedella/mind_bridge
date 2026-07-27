import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, Eye, EyeOff, ChevronRight, Sparkles, Check } from 'lucide-react';
import { setAuth } from '../utils/auth';

const DEPARTMENTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Chemical', 'Biotechnology', 'Physics', 'Mathematics', 'Management', 'Medicine', 'Other'];

export default function Register() {
  const [step, setStep] = useState<'form' | 'reveal'>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [department, setDepartment] = useState('Computer Science');
  const [year, setYear] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [alias, setAlias] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, department, year }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.detail || 'Registration failed');
      }
      const data = await res.json();
      setAuth({ access_token: data.access_token, anonymous_alias: data.anonymous_alias, student_id: data.student_id });
      setAlias(data.anonymous_alias);
      setStep('reveal');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden px-4">
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-primary/12 rounded-full blur-3xl animate-float-slow" />
      <div className="absolute -bottom-48 -left-32 w-[450px] h-[450px] bg-purple-900/15 rounded-full blur-3xl animate-float-med" />

      <div className="w-full max-w-[440px] relative animate-fade-in">
        {/* Brand */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/15 border border-primary/25 mb-4">
            <Shield className="text-primary" size={26} />
          </div>
          <h1 className="text-2xl font-heading font-bold">
            Join Mind<span className="text-primary">Bridge</span>
          </h1>
          <p className="text-text-muted text-sm mt-1.5">Your identity stays anonymous, always.</p>
        </div>

        {step === 'form' ? (
          <div className="glass-panel p-8 shadow-2xl shadow-black/40">
            <h2 className="font-heading text-xl font-bold mb-1">Create your account</h2>
            <p className="text-text-muted text-sm mb-6">We'll generate a private anonymous identity for you.</p>

            <form onSubmit={handleRegister} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">College Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@college.edu"
                    className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-text placeholder-text-muted focus:outline-none focus:border-primary/60 focus:bg-surface-bright transition-all" />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input type={showPassword ? 'text' : 'password'} required value={password}
                    onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters"
                    className="w-full bg-surface border border-border rounded-xl pl-10 pr-10 py-3 text-sm text-text placeholder-text-muted focus:outline-none focus:border-primary/60 focus:bg-surface-bright transition-all" />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Department + Year */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">Department</label>
                  <select value={department} onChange={e => setDepartment(e.target.value)}
                    className="w-full bg-surface border border-border rounded-xl px-3 py-3 text-sm text-text focus:outline-none focus:border-primary/60 transition-all">
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">Year</label>
                  <select value={year} onChange={e => setYear(Number(e.target.value))}
                    className="w-full bg-surface border border-border rounded-xl px-3 py-3 text-sm text-text focus:outline-none focus:border-primary/60 transition-all">
                    {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                </div>
              </div>

              {error && (
                <div className="text-error text-sm bg-error/8 border border-error/20 rounded-lg px-4 py-3">{error}</div>
              )}

              <button type="submit" disabled={loading}
                className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 mt-2 shadow-lg shadow-primary/20">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
                ) : (
                  <><Sparkles size={16} /><span>Generate My Anonymous Identity</span></>
                )}
              </button>
            </form>

            <div className="mt-5 pt-5 border-t border-border text-center">
              <p className="text-sm text-text-muted">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:text-primary-hover font-semibold transition-colors">Sign in →</Link>
              </p>
            </div>
          </div>
        ) : (
          /* Step 2: Anonymous Identity Reveal */
          <div className="glass-panel p-8 shadow-2xl shadow-black/40 animate-scale-in text-center">
            <div className="w-16 h-16 bg-success/15 border border-success/30 rounded-full flex items-center justify-center mx-auto mb-5">
              <Check size={28} className="text-success" />
            </div>
            <h2 className="font-heading text-2xl font-bold mb-2">You're in! 🎉</h2>
            <p className="text-text-muted text-sm mb-7">
              Your anonymous identity has been created. This is how you'll be known throughout the platform — no one can link this to you.
            </p>

            {/* Alias Card */}
            <div className="bg-primary/10 border border-primary/25 rounded-2xl p-6 mb-6">
              <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-2">Your Anonymous Identity</p>
              <p className="font-heading text-2xl font-bold text-primary tracking-wide">{alias}</p>
              <p className="text-xs text-text-muted mt-3 leading-relaxed">
                Psychologists and institution staff will only ever see this name — never your real identity.
              </p>
            </div>

            {/* Privacy bullets */}
            <div className="space-y-2.5 text-left mb-7">
              {[
                'Your email is never shown to anyone',
                'Counselors only see your anonymous ID',
                'Identity revealed only in verified emergencies',
                'All conversations are encrypted end-to-end',
              ].map(pt => (
                <div key={pt} className="flex items-start gap-2.5 text-sm text-text-muted">
                  <Check size={14} className="text-success shrink-0 mt-0.5" />
                  {pt}
                </div>
              ))}
            </div>

            <button onClick={() => navigate('/')}
              className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
              Enter Dashboard <ChevronRight size={16} />
            </button>
          </div>
        )}

        <p className="text-xs text-text-muted text-center mt-4 flex items-center justify-center gap-1.5">
          <Shield size={10} className="text-primary" />
          Privacy-first. GDPR & FERPA aligned.
        </p>
      </div>
    </div>
  );
}
