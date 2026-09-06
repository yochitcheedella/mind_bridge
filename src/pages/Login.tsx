import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  Shield, Mail, Lock, Eye, EyeOff, Building2,
  HeartHandshake, AlertCircle, LifeBuoy, ArrowRight, CheckCircle2,
  UserCheck, UserX, RefreshCw
} from 'lucide-react';
import {
  setAuth,
  getAuth,
  isLoggedIn,
  getSavedProfile,
  clearSavedProfile,
  type SavedProfile,
  API_URL,
  getHomeRoute
} from '../utils/auth';

export default function Login() {
  const [searchParams] = useSearchParams();
  const isExplicitLogout = searchParams.get('logout') === 'true';
  const navigate = useNavigate();

  const [savedProfile, setSavedProfileState] = useState<SavedProfile | null>(() => getSavedProfile());
  const [showDirectForm, setShowDirectForm] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-redirect if already logged in and not coming from explicit logout
  useEffect(() => {
    const auth = getAuth();
    if (auth && !isExplicitLogout) {
      navigate(getHomeRoute(auth.role), { replace: true });
    }
  }, [navigate, isExplicitLogout]);

  // Pre-fill email from saved profile if available
  useEffect(() => {
    if (savedProfile?.email) {
      setEmail(savedProfile.email);
    }
  }, [savedProfile]);

  const handleContinueAsSaved = async () => {
    const currentAuth = getAuth();
    if (currentAuth) {
      navigate(getHomeRoute(currentAuth.role));
      return;
    }
    // If no active token, switch to credentials form with email prefilled
    setShowDirectForm(true);
  };

  const handleForgetProfile = () => {
    clearSavedProfile();
    setSavedProfileState(null);
    setShowDirectForm(true);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const cleanEmail = email.trim();
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
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
      }, cleanEmail);

      navigate(getHomeRoute(data.role));
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const displayName = savedProfile?.anonymous_alias || savedProfile?.name || 'MindBridge User';
  const roleBadge = savedProfile?.role ? savedProfile.role.toUpperCase() : 'STUDENT';

  return (
    <div className="min-h-screen bg-[#080b11] text-white flex flex-col items-center justify-center relative overflow-hidden px-4 py-8">
      {/* Dynamic ambient lighting */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[550px] h-[550px] bg-teal-500/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[420px] relative z-10 space-y-6">
        {/* Main Card */}
        <div className="bg-[#111624]/90 backdrop-blur-2xl p-7 sm:p-9 rounded-3xl border border-white/10 shadow-2xl shadow-black/80 relative overflow-hidden">
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 via-teal-500/10 to-indigo-600/30 border border-indigo-500/30 flex items-center justify-center mb-3 shadow-lg shadow-indigo-500/20 p-2.5">
              <img src="/logo.svg" alt="MindBridge AI" className="w-full h-full object-contain" />
            </div>
            
            <h1 className="text-2xl font-black text-white tracking-tight font-heading">
              MindBridge AI
            </h1>
            <p className="text-indigo-300/80 font-medium text-xs mt-1">
              Private, Empathetic Student Mental Health
            </p>
          </div>

          {/* ── INSTAGRAM-STYLE RETURNING USER CARD ── */}
          {savedProfile && !showDirectForm ? (
            <div className="space-y-6 animate-fade-in">
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 text-center flex flex-col items-center relative group">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-teal-400 p-[2px] shadow-lg shadow-indigo-500/25 mb-3">
                  <div className="w-full h-full rounded-full bg-[#131826] flex items-center justify-center">
                    <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-teal-200">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[10px] font-semibold tracking-wider mb-1.5">
                  <UserCheck size={12} />
                  <span>{roleBadge}</span>
                </div>

                <h2 className="text-base font-bold text-white tracking-tight">
                  {displayName}
                </h2>
                {savedProfile.email && (
                  <p className="text-xs text-white/40 mt-0.5 font-mono truncate max-w-[240px]">
                    {savedProfile.email}
                  </p>
                )}
              </div>

              {/* Continue 1-Tap Button */}
              <button
                type="button"
                onClick={handleContinueAsSaved}
                className="w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-teal-500 hover:from-indigo-500 hover:to-teal-400 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 group text-sm"
              >
                <span>Continue as {displayName.split(' ')[0]}</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Switch Account */}
              <div className="flex flex-col items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDirectForm(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw size={13} />
                  <span>Switch or log into another account</span>
                </button>

                <button
                  type="button"
                  onClick={handleForgetProfile}
                  className="text-[11px] text-white/30 hover:text-rose-400 transition-colors"
                >
                  Remove account from this device
                </button>
              </div>
            </div>
          ) : (
            /* ── STANDARD LOGIN FORM ── */
            <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/80 uppercase tracking-wider pl-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. student@college.edu"
                    className="w-full bg-[#0d111a] border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/20 transition-all font-sans"
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
                    className="w-full bg-[#0d111a] border border-white/10 rounded-xl pl-10 pr-10 py-3.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/20 transition-all font-sans"
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
              <div className="flex justify-between items-center pt-1">
                {savedProfile && (
                  <button
                    type="button"
                    onClick={() => setShowDirectForm(false)}
                    className="text-xs text-white/50 hover:text-white transition-colors"
                  >
                    ← Back to saved
                  </button>
                )}
                <Link
                  to="/forgot-password"
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors ml-auto"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 text-rose-300 text-xs bg-rose-500/10 border border-rose-500/30 rounded-xl p-3">
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
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>

              {/* New student register */}
              <div className="mt-5 text-center pt-2">
                <Link
                  to="/register"
                  className="text-xs text-white/60 hover:text-white transition-colors"
                >
                  New student? <span className="text-indigo-400 font-semibold underline underline-offset-4">Create anonymous account</span>
                </Link>
              </div>
            </form>
          )}

          {/* Institutional Security Notice */}
          <div className="mt-6 pt-4 border-t border-white/5 text-center">
            <p className="text-[11px] text-white/40 flex items-center justify-center gap-1.5">
              <span>🔒 Zero-Knowledge Privacy · End-to-End Anonymity</span>
            </p>
          </div>
        </div>

        {/* ── Prominent Crisis / Emergency Support Entrypoint ── */}
        <div className="bg-gradient-to-r from-rose-950/40 via-[#111624]/90 to-amber-950/30 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-rose-500/30 shadow-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0">
              <LifeBuoy className="text-rose-400" size={20} />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white">Need immediate help?</h3>
              <p className="text-[11px] text-rose-200/70">24/7 Crisis Response & Emergency Hotline</p>
            </div>
          </div>

          <Link
            to="/student/emergency"
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-rose-600/30 shrink-0 flex items-center gap-1.5"
          >
            <span>Emergency</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
