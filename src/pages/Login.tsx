import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield, Mail, Lock, Eye, EyeOff, ChevronLeft,
  GraduationCap, Brain, ShieldCheck, Building2,
} from 'lucide-react';
import { setAuth, API_URL, getHomeRoute, type UserRole } from '../utils/auth';

type Role = UserRole | null;

const ROLE_CONFIG = {
  student: {
    label: 'Student Portal',
    subtitle: 'AI companion, mood tracking & counseling',
    icon: GraduationCap,
    color: 'text-emerald-400',
    border: 'hover:border-emerald-500/50',
    bg: 'bg-emerald-500/10 group-hover:bg-emerald-500/20',
    btnClass: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/20 text-white',
    placeholder: 'VIT College Email',
    demoEmail: 'student@vishnu.edu.in',
    demoPassword: 'Student@VIT2024',
  },
  psychologist: {
    label: 'Psychologist Portal',
    subtitle: 'Risk queue, cases & appointment calendar',
    icon: Brain,
    color: 'text-indigo-400',
    border: 'hover:border-indigo-500/50',
    bg: 'bg-indigo-500/10 group-hover:bg-indigo-500/20',
    btnClass: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/20 text-white',
    placeholder: 'Psychologist Email',
    demoEmail: 'ram.sir@vishnu.edu.in',
    demoPassword: 'Psych@VIT2024',
  },
  admin: {
    label: 'Admin Portal',
    subtitle: 'Campus analytics & staff management',
    icon: ShieldCheck,
    color: 'text-purple-400',
    border: 'hover:border-purple-500/50',
    bg: 'bg-purple-500/10 group-hover:bg-purple-500/20',
    btnClass: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-purple-500/20 text-white',
    placeholder: 'Admin Email',
    demoEmail: 'admin@vishnu.edu.in',
    demoPassword: 'Admin@VIT2024',
  },
} as const;

export default function Login() {
  const [showSplash, setShowSplash] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: selectedRole }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Authentication failed');
      }

      const data = await res.json();

      setAuth({
        access_token: data.access_token,
        role: data.role,
        anonymous_alias: data.anonymous_alias,
        student_id: data.student_id,
        psychologist_id: data.psychologist_id,
        admin_id: data.admin_id,
        name: data.name,
        specialization: data.specialization,
        institution: data.institution,
        primary_color: data.primary_color,
      });

      navigate(getHomeRoute(data.role));
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Splash Screen ────────────────────────────────────────────────────────────
  if (showSplash) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="z-10 flex flex-col items-center">
          <div className="w-28 h-28 rounded-3xl bg-surface border-2 border-indigo-500/30 shadow-2xl shadow-indigo-500/20 flex items-center justify-center mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/10" />
            <Shield className="text-indigo-400 relative z-10" size={52} />
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-white mb-2">
            Mind<span className="text-indigo-400">Bridge</span>
          </h1>
          <p className="text-indigo-300/80 font-medium tracking-wide text-sm mt-1">
            Vishnu Institute of Technology
          </p>
          <div className="flex items-center gap-2 mt-4 text-text-muted text-xs">
            <Building2 size={12} />
            <span>AI-Powered Student Mental Health Platform</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Role Selection ───────────────────────────────────────────────────────────
  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden px-4">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] bg-purple-500/8 rounded-full blur-3xl" />

        <div className="w-full max-w-[400px] z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-surface border border-indigo-500/30 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/10">
              <Shield className="text-indigo-400" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-white">MindBridge AI</h1>
            <p className="text-text-muted text-sm mt-1">Vishnu Institute of Technology</p>
            <p className="text-indigo-300/60 text-xs mt-3 font-medium">Select your portal to continue</p>
          </div>

          {/* Role Cards */}
          <div className="space-y-3">
            {(['student', 'psychologist', 'admin'] as UserRole[]).map((role) => {
              const cfg = ROLE_CONFIG[role];
              const Icon = cfg.icon;
              return (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`w-full p-4 bg-surface/60 backdrop-blur-md rounded-2xl border border-border ${cfg.border} hover:bg-surface transition-all flex items-center gap-4 group`}
                >
                  <div className={`w-12 h-12 rounded-xl ${cfg.bg} flex items-center justify-center transition-colors`}>
                    <Icon className={cfg.color} size={22} />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-semibold text-white text-sm">{cfg.label}</h3>
                    <p className="text-xs text-text-muted mt-0.5">{cfg.subtitle}</p>
                  </div>
                  <ChevronLeft size={16} className="text-text-muted rotate-180 group-hover:translate-x-1 transition-transform" />
                </button>
              );
            })}
          </div>

          <p className="text-center text-xs text-text-muted mt-6 opacity-60">
            🔒 All data encrypted · Student identity protected
          </p>
        </div>
      </div>
    );
  }

  // ── Login Form ───────────────────────────────────────────────────────────────
  const cfg = ROLE_CONFIG[selectedRole];
  const Icon = cfg.icon;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden px-4">
      <div className={`absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full blur-3xl
        ${selectedRole === 'student' ? 'bg-indigo-500/10' :
          selectedRole === 'psychologist' ? 'bg-blue-500/10' : 'bg-purple-500/10'}`}
      />

      <div className="w-full max-w-[380px] relative z-10">
        {/* Back button */}
        <button
          onClick={() => { setSelectedRole(null); setError(''); setEmail(''); setPassword(''); }}
          className="mb-6 flex items-center gap-2 text-text-muted hover:text-white transition-colors text-sm"
        >
          <ChevronLeft size={16} /> Back to portals
        </button>

        <div className="bg-surface/80 backdrop-blur-xl p-8 rounded-3xl border border-border/50 shadow-2xl shadow-black/40">
          {/* Header */}
          <div className="flex flex-col items-center mb-6">
            <div className={`w-14 h-14 rounded-2xl ${cfg.bg.split(' ')[0]} flex items-center justify-center mb-3 border border-border/30`}>
              <Icon className={cfg.color} size={26} />
            </div>
            <h1 className="text-xl font-bold text-white capitalize">{cfg.label}</h1>
            <p className="text-text-muted text-xs mt-1">Vishnu Institute of Technology</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Quick Demo Credentials Pill for Mobile Testing */}
            <div className="flex items-center justify-between bg-surface-container/80 p-3 rounded-2xl border border-border-structural text-xs backdrop-blur-md shadow-inner">
              <span className="text-on-surface-variant font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Quick Demo Login</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setEmail(cfg.demoEmail);
                  setPassword(cfg.demoPassword);
                  setError('');
                }}
                className="px-3 py-1.5 bg-surface-container-highest hover:bg-surface-bright text-white font-mono font-extrabold rounded-xl border border-border-structural/80 transition-all active:scale-95 text-[11px] shadow-sm hover:shadow flex items-center gap-1"
              >
                <span>⚡ Fill Credentials</span>
              </button>
            </div>

            {/* Email */}
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={cfg.placeholder}
                className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-text placeholder-text-muted focus:outline-none focus:border-indigo-500/60 transition-all"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type={showPassword ? 'text' : 'password'}
                required value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-background border border-border rounded-xl pl-10 pr-10 py-3 text-sm text-text placeholder-text-muted focus:outline-none focus:border-indigo-500/60 transition-all"
              />
              <button type="button" onClick={() => setShowPassword(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors">
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Forgot password (students only) */}
            {selectedRole === 'student' && (
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
                  Forgot Password?
                </Link>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-center">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              className={`w-full text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 mt-2 shadow-lg ${cfg.btnClass}`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Register link for students */}
          {selectedRole === 'student' && (
            <div className="mt-5 text-center">
              <Link to="/register" className="text-sm text-text-muted hover:text-white transition-colors">
                New student? <span className="text-indigo-400 font-medium">Create account</span>
              </Link>
            </div>
          )}

          {/* Info note for psychologists/admins */}
          {selectedRole !== 'student' && (
            <p className="mt-5 text-center text-xs text-text-muted opacity-60">
              Account credentials are provided by VIT administration.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
