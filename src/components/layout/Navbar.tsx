import { Link, useLocation } from 'react-router-dom';

const STUDENT_NAV = [
  { path: '/student/home',         icon: 'home',          label: 'Home' },
  { path: '/student/appointments', icon: 'psychology',    label: 'Psychologists' },
  { path: '/student/chat',         icon: 'smart_toy',     label: 'Chat' },
  { path: '/student/journal',      icon: 'edit_note',     label: 'Journal' },
  { path: '/student/profile',      icon: 'person',        label: 'Profile' },
];

const PSYCHOLOGIST_NAV = [
  { path: '/psychologist/dashboard', icon: 'dashboard',      label: 'Triage' },
  { path: '/psychologist/patients',  icon: 'groups',         label: 'Patients' },
  { path: '/psychologist/soap-notes',icon: 'clinical_notes', label: 'EHR Notes' },
  { path: '/psychologist/calendar',  icon: 'calendar_month', label: 'Calendar' },
];

const ADMIN_NAV = [
  { path: '/admin/dashboard', icon: 'pie_chart',    label: 'Analytics' },
  { path: '/admin/users',     icon: 'groups',       label: 'Users' },
  { path: '/admin/reports',   icon: 'bar_chart',    label: 'Reports' },
  { path: '/admin/settings',  icon: 'settings',     label: 'Security' },
];

export function Navbar() {
  const location = useLocation();

  let navItems: typeof STUDENT_NAV = [];
  if (location.pathname.startsWith('/student')) {
    navItems = STUDENT_NAV;
  } else if (location.pathname.startsWith('/psychologist')) {
    navItems = PSYCHOLOGIST_NAV;
  } else if (location.pathname.startsWith('/admin')) {
    navItems = ADMIN_NAV;
  }

  if (navItems.length === 0) return null;

  return (
    <nav className="md:hidden fixed bottom-3 left-3 right-3 z-50 rounded-2xl flex justify-around items-center min-h-[4.25rem] py-2 px-1 bg-surface-container-lowest/95 backdrop-blur-2xl border border-border-structural/80 shadow-2xl shadow-black/90 neon-glow-primary">
      {navItems.map(({ path, icon, label, isAlert }: any) => {
        const isActive = location.pathname === path;
        return (
          <Link
            key={path}
            to={path}
            className={`
              flex flex-col items-center justify-center py-1.5 px-2 rounded-xl active:scale-90 transition-all duration-200 flex-1 relative max-w-[72px]
              ${isActive
                ? isAlert ? 'bg-gradient-to-t from-red-700 to-red-500 text-white font-bold shadow-lg shadow-red-500/40 border border-red-400/30' : 'bg-gradient-to-t from-interactive-primary/30 to-interactive-primary/10 text-secondary-fixed font-bold border border-interactive-primary/40 shadow-md shadow-interactive-primary/20'
                : isAlert ? 'text-error animate-pulse hover:bg-error-container/10' : 'text-outline hover:text-white hover:bg-white/5'
              }
            `}
          >
            <span 
              className={`material-symbols-outlined text-[22px] mb-0.5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} 
              style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
            >
              {icon}
            </span>
            <span className="text-[10px] tracking-tight font-semibold truncate max-w-full">
              {label}
            </span>
            {isActive && !isAlert && (
              <span className="absolute bottom-1 w-3 h-0.5 rounded-full bg-secondary-fixed shadow-[0_0_6px_#50d8e9]"></span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
