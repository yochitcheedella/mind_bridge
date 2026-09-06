import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield, Mail, Lock, Eye, EyeOff, Building2,
  HeartHandshake, AlertCircle, LifeBuoy, ArrowRight, CheckCircle2
} from 'lucide-react';
import { setAuth, API_URL, getHomeRoute } from '../utils/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [roleHint, setRoleHint] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRoleHint(null);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Authentication failed. Please check your credentials.');
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

      // Role determined after authentication
      navigate(getHomeRoute(data.role));
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: demoEmail.trim(),
          password: demoPass,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Authentication failed.');
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

  // ── Unified Vishnu College Login Screen ───────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0b0d14] text-white flex flex-col items-center justify-center relative overflow-hidden px-4 py-8">
      {/* Background ambient lighting */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[550px] h-[550px] bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[420px] relative z-10 space-y-6 animate-fade-in">
        {/* Main Card */}
        <div className="bg-surface/80 backdrop-blur-2xl p-7 sm:p-9 rounded-3xl border border-white/10 shadow-2xl shadow-black/60 relative overflow-hidden">
          {/* Subtle Institutional Brand Header */}
          <div className="flex flex-col items-center text-center mb-7">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500/20 to-teal-500/15 border border-indigo-500/40 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20 p-1">
              <img src="/logo.png" alt="Vishnu Wellness Centre" className="w-full h-full object-cover rounded-full drop-shadow-md" />
            </div>
            
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight font-heading leading-tight">
              VISHNU WELLNESS CENTRE
            </h1>
            <p className="text-indigo-300/90 font-medium text-xs sm:text-sm mt-1">
              Empowering Minds. Inspiring Lives.
            </p>
            <div className="inline-flex items-center gap-1.5 mt-2.5 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-[11px] font-mono">
              <Building2 size={11} className="text-indigo-400" />
              <span>Sri Vishnu Educational Society</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* College Email / ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/80 uppercase tracking-wider pl-1">
                College Email / ID
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. 21pa1a05xx@vishnu.edu.in"
                  className="w-full bg-[#131722] border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/20 transition-all font-sans"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/80 uppercase tracking-wider pl-1">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#131722] border border-white/10 rounded-xl pl-10 pr-10 py-3.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/20 transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end pt-1">
              <Link
                to="/forgot-password"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-rose-300 text-xs bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 animate-shake">
                <AlertCircle size={15} className="shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-teal-500 hover:from-indigo-500 hover:to-teal-400 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 mt-2 group"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Vishnu Identity...</span>
                </>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* ── Fast Demo Role Switcher for Testing & Evaluation ── */}
          <div className="mt-5 pt-4 border-t border-white/10 space-y-2">
            <p className="text-[10px] font-mono uppercase font-bold text-white/50 tracking-wider text-center">
              ⚡ Instant 1-Click Demo Credentials
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => quickLogin('student@vishnu.edu.in', 'Student@VIT2024')}
                className="px-2 py-2 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold transition-all flex flex-col items-center gap-0.5 active:scale-95"
              >
                <span className="text-base">🎓</span>
                <span>Student</span>
              </button>
              <button
                type="button"
                onClick={() => quickLogin('ram.sir@vishnu.edu.in', 'Psych@VIT2024')}
                className="px-2 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold transition-all flex flex-col items-center gap-0.5 active:scale-95"
              >
                <span className="text-base">🧠</span>
                <span>Counselor</span>
              </button>
              <button
                type="button"
                onClick={() => quickLogin('admin@vishnu.edu.in', 'Admin@VIT2024')}
                className="px-2 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-[11px] font-semibold transition-all flex flex-col items-center gap-0.5 active:scale-95"
              >
                <span className="text-base">🏛️</span>
                <span>Admin</span>
              </button>
            </div>
          </div>

          {/* New student register */}
          <div className="mt-5 text-center pt-2">
            <Link
              to="/register"
              className="text-xs text-white/60 hover:text-white transition-colors"
            >
              New student? <span className="text-indigo-400 font-semibold underline underline-offset-4">Create anonymous account</span>
            </Link>
          </div>

          {/* Institutional Security Notice */}
          <div className="mt-6 pt-4 border-t border-white/5 text-center">
            <p className="text-[11px] text-white/40 flex items-center justify-center gap-1.5">
              <span>🔒 Single unified access · Role-determined privacy</span>
            </p>
          </div>
        </div>

        {/* ── 3. Prominent Crisis / Emergency Support Entrypoint ── */}
        <div className="bg-gradient-to-r from-rose-950/40 via-surface/80 to-amber-950/30 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-rose-500/30 shadow-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0">
              <LifeBuoy className="text-rose-400" size={20} />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white">Need immediate help?</h3>
              <p className="text-[11px] text-rose-200/70">24/7 Vishnu Campus Crisis & SOS Support</p>
            </div>
          </div>

          <Link
            to="/student/emergency"
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-rose-600/30 shrink-0 flex items-center gap-1.5"
          >
            <span>Crisis Support</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
