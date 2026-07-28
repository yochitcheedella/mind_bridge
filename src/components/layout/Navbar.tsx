import { Link, useLocation } from 'react-router-dom';
import { Home, MessageSquare, Calendar, AlertTriangle, Users, Wind, CheckSquare, Bell } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard',            icon: Home,          label: 'Home' },
  { path: '/chat',        icon: MessageSquare, label: 'AI Chat' },
  { path: '/community',   icon: Users,         label: 'Community' },
  { path: '/habits',      icon: CheckSquare,   label: 'Habits' },
  { path: '/recovery-plan', icon: Wind,        label: 'Recovery' },
  { path: '/appointments',icon: Calendar,      label: 'Sessions' },
  { path: '/notifications',icon: Bell,          label: 'Alerts' },
  { path: '/emergency',   icon: AlertTriangle, label: 'SOS', isAlert: true },
];

export function Navbar() {
  const location = useLocation();

  // Hide navbar on auth pages, landing, onboarding and clinical/admin views
  const hiddenPaths = ['/login', '/register', '/onboarding', '/clinical', '/emergency', '/admin'];
  if (location.pathname === '/' || hiddenPaths.some(p => location.pathname.startsWith(p))) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface-dim/90 backdrop-blur-xl border-t border-border safe-area-pb">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map(({ path, icon: Icon, label, isAlert }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`
                flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 min-w-[56px]
                ${isAlert
                  ? 'text-error hover:bg-error/10'
                  : isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-text-muted hover:text-text hover:bg-surface-bright'
                }
              `}
            >
              <Icon
                size={isAlert ? 22 : 20}
                className={isAlert ? 'animate-pulse' : ''}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={`text-[10px] font-semibold tracking-wide ${isAlert ? 'text-error' : ''}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
