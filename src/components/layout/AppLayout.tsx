import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Shield, Home, Sparkles, Brain, Wind, Activity, Edit3, 
  Calendar, Users, Moon, AlertTriangle, Settings, LogOut, 
  Menu, X, Bell, UserCheck, PieChart, FileText, ChevronRight
} from 'lucide-react';
import { getAuth, clearAuth, getAlias, getUserName, getRole, type UserRole } from '../../utils/auth';

interface NavItem {
  path: string;
  icon: string | React.ReactNode;
  label: string;
  badge?: string;
  isSpecial?: boolean;
}

const STUDENT_NAV: NavItem[] = [
  { path: '/student/home', icon: 'home', label: 'Dashboard' },
  { path: '/student/chat', icon: 'smart_toy', label: 'AI Therapy Guide', badge: 'PRO' },
  { path: '/student/cbt-reframing', icon: 'psychology', label: 'CBT Thought Studio', badge: 'NEW' },
  { path: '/student/breathwork', icon: 'air', label: 'Calm Canopy' },
  { path: '/student/assessments', icon: 'assignment', label: 'Clinical Scales' },
  { path: '/student/journal', icon: 'edit_note', label: 'Encrypted Journal' },
  { path: '/student/appointments', icon: 'event', label: 'Counselor Sessions' },
  { path: '/student/community', icon: 'groups', label: 'Campus Circles' },
  { path: '/student/wellness', icon: 'self_improvement', label: 'Wellness Exercises' },
  { path: '/student/sleep', icon: 'bedtime', label: 'Sleep & Mood Tracker' },
  { path: '/student/emergency', icon: 'emergency', label: 'Crisis SOS & Helplines', isSpecial: true },
];

const PSYCHOLOGIST_NAV: NavItem[] = [
  { path: '/psychologist/dashboard', icon: 'dashboard', label: 'Triage & Risk Radar', badge: 'LIVE' },
  { path: '/psychologist/patients', icon: 'groups', label: 'Patient Roster' },
  { path: '/psychologist/soap-notes', icon: 'clinical_notes', label: 'SOAP Notes EHR', badge: 'EHR' },
  { path: '/psychologist/calendar', icon: 'calendar_month', label: 'Session Schedule' },
  { path: '/psychologist/profile', icon: 'settings', label: 'Counselor Profile' },
];

const ADMIN_NAV: NavItem[] = [
  { path: '/admin/dashboard', icon: 'pie_chart', label: 'Executive Analytics' },
  { path: '/admin/users', icon: 'manage_accounts', label: 'User Management' },
  { path: '/admin/reports', icon: 'analytics', label: 'Institutional Reports' },
  { path: '/admin/settings', icon: 'security', label: 'Platform Security' },
];

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();
  const role: UserRole = getRole() || 'student';

  let navItems: NavItem[] = STUDENT_NAV;
  if (role === 'psychologist' || location.pathname.startsWith('/psychologist')) {
    navItems = PSYCHOLOGIST_NAV;
  } else if (role === 'admin' || location.pathname.startsWith('/admin')) {
    navItems = ADMIN_NAV;
  }

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const displayName = auth?.role === 'student' ? getAlias() : getUserName();
  const roleColor = auth?.role === 'student' ? '#6366f1' : auth?.role === 'psychologist' ? '#3b82f6' : '#8b5cf6';

  return (
    <div className="min-h-screen bg-canvas-global flex text-on-surface overflow-x-hidden selection:bg-interactive-primary selection:text-white">
      {/* ── Mobile Responsive Navigation Drawer (Slide-Over) ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-fade-in">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
            onClick={() => setMobileMenuOpen(false)} 
          />
          <div className="relative w-80 max-w-[85vw] h-full bg-surface-container-lowest border-r border-border-structural/80 flex flex-col shadow-2xl z-10 animate-slide-right">
            {/* Drawer Header */}
            <div className="h-20 flex items-center justify-between px-6 border-b border-border-structural/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-interactive-primary to-secondary flex items-center justify-center shadow-lg shadow-interactive-primary/30">
                  <Shield className="text-on-primary" size={20} />
                </div>
                <div>
                  <span className="font-heading font-bold text-lg text-white tracking-tight">Mind<span className="text-secondary-fixed">Bridge</span></span>
                  <span className="block text-[10px] uppercase font-mono tracking-widest text-secondary-fixed/80 font-semibold">VIT Platform</span>
                </div>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)} 
                className="text-on-surface-variant hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            {/* Profile Info */}
            <div className="p-4 m-4 rounded-xl bg-surface-container/80 border border-border-structural/60 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-interactive-primary/20 border-2 border-interactive-primary flex items-center justify-center text-primary font-bold text-sm">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden flex-1">
                <div className="font-heading font-bold text-sm text-white truncate">{displayName}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse"></span>
                  <span className="text-[11px] font-mono capitalize text-on-surface-variant">{role} Account</span>
                </div>
              </div>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-1.5 hide-scrollbar">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                      isActive
                        ? 'bg-gradient-to-r from-interactive-primary/90 to-interactive-primary/60 text-white font-bold shadow-lg shadow-interactive-primary/25 border border-interactive-primary/50'
                        : item.isSpecial
                        ? 'bg-error-container/20 text-error hover:bg-error-container/40 border border-error/30 font-semibold'
                        : 'text-on-surface-variant hover:text-white hover:bg-surface-container-high/60'
                    }`}
                  >
                    <span 
                      className={`material-symbols-outlined text-xl ${
                        isActive ? 'text-white' : item.isSpecial ? 'text-error animate-pulse' : 'text-outline'
                      }`}
                      style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      {item.icon}
                    </span>
                    <span className="text-sm font-medium flex-1 tracking-wide">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold tracking-wider uppercase bg-secondary/20 text-secondary-fixed border border-secondary/40 shadow-sm">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile PWA & Capacitor compatibility badge */}
            <div className="mx-4 my-2 p-3 rounded-2xl bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-teal-500/10 border border-indigo-500/30 text-xs text-on-surface-variant space-y-1.5 shadow-inner">
              <div className="flex items-center gap-2 font-mono font-extrabold uppercase tracking-wide text-emerald-400 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span>Mobile PWA &amp; Capacitor Ready</span>
              </div>
              <p className="text-[11px] leading-relaxed text-indigo-200/80">
                Optimized touch UI with offline SW cache &amp; encrypted institutional storage.
              </p>
            </div>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-border-structural/80">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors duration-200 font-semibold"
              >
                <LogOut size={20} />
                <span>End Secure Session</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Widescreen Desktop Glassmorphism Sidebar ── */}
      <aside 
        className={`hidden md:flex flex-col fixed top-0 left-0 bottom-0 z-50 transition-all duration-300 glass-sidebar shadow-2xl shadow-black/60 ${
          isCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-border-structural/80">
          {!isCollapsed ? (
            <Link to={auth?.role === 'psychologist' ? '/psychologist/dashboard' : '/student/home'} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-interactive-primary to-secondary flex items-center justify-center shadow-lg shadow-interactive-primary/30">
                <Shield className="text-on-primary" size={20} />
              </div>
              <div>
                <span className="font-heading font-bold text-lg text-white tracking-tight">Mind<span className="text-secondary-fixed">Bridge</span></span>
                <span className="block text-[10px] uppercase font-mono tracking-widest text-secondary-fixed/80 font-semibold">VIT Platform</span>
              </div>
            </Link>
          ) : (
            <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-tr from-interactive-primary to-secondary flex items-center justify-center shadow-lg">
              <Shield className="text-on-primary" size={20} />
            </div>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="text-on-surface-variant hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
            title="Toggle Sidebar"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isCollapsed ? 'menu_open' : 'menu'}
            </span>
          </button>
        </div>

        {/* User Profile Thumbnail */}
        {!isCollapsed && (
          <div className="p-4 m-4 rounded-xl bg-surface-container/80 border border-border-structural/60 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-interactive-primary/20 border-2 border-interactive-primary flex items-center justify-center text-primary font-bold text-sm">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden flex-1">
              <div className="font-heading font-bold text-sm text-white truncate">{displayName}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse"></span>
                <span className="text-[11px] font-mono capitalize text-on-surface-variant">{role} Account</span>
              </div>
            </div>
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 hide-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center gap-4 px-3.5 py-3 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-interactive-primary/90 to-interactive-primary/60 text-white font-bold shadow-lg shadow-interactive-primary/25 border border-interactive-primary/50'
                    : item.isSpecial
                    ? 'bg-error-container/20 text-error hover:bg-error-container/40 border border-error/30 font-semibold'
                    : 'text-on-surface-variant hover:text-white hover:bg-surface-container-high/60'
                }`}
              >
                <span 
                  className={`material-symbols-outlined transition-transform duration-200 group-hover:scale-110 text-xl ${
                    isActive ? 'text-white' : item.isSpecial ? 'text-error animate-pulse' : 'text-outline group-hover:text-secondary-fixed'
                  }`}
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                
                {!isCollapsed && (
                  <span className="text-sm font-medium flex-1 tracking-wide">{item.label}</span>
                )}

                {!isCollapsed && item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold tracking-wider uppercase bg-secondary/20 text-secondary-fixed border border-secondary/40 shadow-sm">
                    {item.badge}
                  </span>
                )}

                {/* Left glowing strip on active item */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-secondary-fixed rounded-r-full shadow-[0_0_8px_#50d8e9]"></span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-border-structural/80">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3.5 py-3 rounded-xl text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors duration-200 font-semibold`}
            title="Disconnect & Lock"
          >
            <LogOut size={20} />
            {!isCollapsed && <span>End Secure Session</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Canvas Widescreen Wrapper ── */}
      <main className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
        isCollapsed ? 'md:pl-20' : 'md:pl-72'
      }`}>
        {/* Top Header Bar (Desktop & Mobile) */}
        <header className="sticky top-0 z-40 bg-surface-container-lowest/80 backdrop-blur-xl border-b border-border-structural/60 px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="md:hidden flex items-center gap-2.5">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-1.5 rounded-xl text-on-surface-variant hover:text-white hover:bg-white/10 transition-colors border border-border-structural/40 active:scale-95"
                aria-label="Open navigation menu"
              >
                <Menu size={24} />
              </button>
              <Link to={auth?.role === 'psychologist' ? '/psychologist/dashboard' : '/student/home'} className="flex items-center gap-2">
                <Shield className="text-interactive-primary shrink-0" size={22} />
                <span className="font-heading font-bold text-base text-white">MindBridge</span>
              </Link>
            </div>
            <span className="hidden md:inline-flex px-3 py-1 rounded-full text-xs font-mono font-medium bg-surface-container-high text-on-surface-variant border border-border-structural">
              🔒 End-to-End Anonymity Protected • Vishnu Institute of Technology
            </span>
          </div>

          <div className="flex items-center gap-4">
            {role === 'student' && (
              <Link
                to="/student/emergency"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-red-600 to-rose-700 hover:brightness-110 text-white text-xs font-bold tracking-wider shadow-lg shadow-red-500/20 animate-pulse transition-all"
              >
                <AlertTriangle size={14} />
                <span>CRISIS SOS</span>
              </Link>
            )}

            <Link
              to={role === 'student' ? '/student/notifications' : '#'}
              className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-white transition-colors relative border border-border-structural"
            >
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-secondary-fixed"></span>
            </Link>

            <Link
              to={role === 'psychologist' ? '/psychologist/profile' : role === 'admin' ? '/admin/settings' : '/student/profile'}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high border border-border-structural transition-colors duration-200"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-interactive-primary shadow-[0_0_6px_#5e6bff]"></span>
              <span className="text-xs font-bold text-white max-w-[120px] truncate">{displayName}</span>
            </Link>
          </div>
        </header>

        {/* Responsive Widescreen Content Container */}
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 md:pb-12">
          {children}
        </div>
      </main>
    </div>
  );
};
