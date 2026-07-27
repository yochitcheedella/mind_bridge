import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, Eye, EyeOff, ChevronRight } from 'lucide-react';
import { setAuth } from '../utils/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.detail || 'Login failed');
      }
      const data = await res.json();
      setAuth({ access_token: data.access_token, anonymous_alias: data.anonymous_alias, student_id: data.student_id });
      
      // Request Push Notification Permission
      try {
        const { requestFirebaseNotificationPermission } = await import('../utils/firebase');
        const token = await requestFirebaseNotificationPermission();
        if (token) {
          await fetch('http://localhost:8000/api/auth/fcm-token', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${data.access_token}`
            },
            body: JSON.stringify({ token }),
          });
        }
      } catch (fcmErr) {
        console.warn("FCM setup failed:", fcmErr);
      }

      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden px-4">
      {/* Animated gradient orbs */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-primary/15 rounded-full blur-3xl animate-float-slow" />
      <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] bg-purple-900/20 rounded-full blur-3xl animate-float-med" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-950/20 rounded-full blur-3xl animate-pulse-slow" />

      <div className="w-full max-w-[420px] relative animate-fade-in">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/15 border border-primary/25 mb-5 shadow-lg shadow-primary/10">
            <Shield className="text-primary" size={26} />
          </div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">
            Mind<span className="text-primary">Bridge</span>{' '}
            <span className="text-primary/80">AI</span>
          </h1>
          <p className="text-text-muted text-sm mt-2 font-medium">
            "No Student Should Suffer in Silence."
          </p>
        </div>

        {/* Card */}
        <div className="glass-panel p-8 shadow-2xl shadow-black/40">
          <h2 className="font-heading text-xl font-bold mb-1">Welcome back</h2>
          <p className="text-text-muted text-sm mb-6">Sign in to your anonymous session</p>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                College Email
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@college.edu"
                  className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-text placeholder-text-muted focus:outline-none focus:border-primary/60 focus:bg-surface-bright transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'} required value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  className="w-full bg-surface border border-border rounded-xl pl-10 pr-10 py-3 text-sm text-text placeholder-text-muted focus:outline-none focus:border-primary/60 focus:bg-surface-bright transition-all"
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-error text-sm bg-error/8 border border-error/20 rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 shadow-lg shadow-primary/20">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
              ) : (
                <><span>Sign In Anonymously</span><ChevronRight size={16} /></>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-border text-center">
            <p className="text-sm text-text-muted">
              New student?{' '}
              <Link to="/register" className="text-primary hover:text-primary-hover font-semibold transition-colors">
                Create anonymous account →
              </Link>
            </p>
          </div>

          {/* Dev Quick Access */}
          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-xs text-text-muted text-center mb-2 uppercase tracking-wider">Dev Quick Access</p>
            <div className="flex gap-2">
              <Link to="/" className="flex-1 text-center text-xs py-1.5 rounded-lg bg-surface hover:bg-surface-bright text-text-muted hover:text-text transition-all border border-border">
                Student
              </Link>
              <Link to="/clinical" className="flex-1 text-center text-xs py-1.5 rounded-lg bg-surface hover:bg-surface-bright text-text-muted hover:text-text transition-all border border-border">
                Clinical
              </Link>
              <Link to="/admin" className="flex-1 text-center text-xs py-1.5 rounded-lg bg-surface hover:bg-surface-bright text-text-muted hover:text-text transition-all border border-border">
                Admin
              </Link>
            </div>
          </div>
        </div>

        <p className="text-xs text-text-muted text-center mt-4 flex items-center justify-center gap-1.5">
          <Lock size={10} />
          Your identity is always protected. AES-256 encrypted.
        </p>
      </div>
    </div>
  );
}
