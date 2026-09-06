/**
 * MindBridge AI — Auth Utilities (VIT-only, 3 roles)
 * Manages JWT auth state in localStorage.
 * Real student identity is NEVER stored here — only alias, token, and role.
 */

export type UserRole = 'student' | 'psychologist' | 'admin';

export interface AuthState {
  access_token: string;
  role: UserRole;
  // Student fields
  anonymous_alias?: string;
  student_id?: number;
  // Psychologist fields
  psychologist_id?: number;
  name?: string;
  specialization?: string;
  // Admin fields
  admin_id?: number;
  // Shared
  institution?: string;
  primary_color?: string;
}

const AUTH_KEY = 'mindbridge_auth';
const API_BASE = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace('localhost', '127.0.0.1');

export const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace('localhost', '127.0.0.1');

export function getWsBaseUrl(): string {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL.replace('localhost', '127.0.0.1');
  }
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
      .replace('http://', 'ws://')
      .replace('https://', 'wss://')
      .replace('localhost', '127.0.0.1');
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  if (window.location.port === '5173' || window.location.port === '3000') {
    return `${protocol}//127.0.0.1:8000`;
  }
  return `${protocol}//${window.location.host}`;
}

export function getAuth(): AuthState | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAuth(state: AuthState): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(state));
  if (state.primary_color) {
    applyPrimaryColor(state.primary_color);
  }
}

export function applyPrimaryColor(color: string): void {
  document.documentElement.style.setProperty('--color-primary', color);
}

export function clearAuth(): void {
  localStorage.removeItem(AUTH_KEY);
  document.documentElement.style.removeProperty('--color-primary');
}

export function isLoggedIn(): boolean {
  return getAuth() !== null;
}

export function getRole(): UserRole | null {
  return getAuth()?.role ?? null;
}

export function isStudent(): boolean {
  return getRole() === 'student';
}

export function isPsychologist(): boolean {
  return getRole() === 'psychologist';
}

export function isAdmin(): boolean {
  return getRole() === 'admin';
}

export function getAuthHeaders(): Record<string, string> {
  const auth = getAuth();
  if (!auth) return { 'Content-Type': 'application/json' };
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${auth.access_token}`,
  };
}

export function getAlias(): string {
  return getAuth()?.anonymous_alias ?? 'Anonymous';
}

export function getStudentId(): number | null {
  return getAuth()?.student_id ?? null;
}

export function getUserName(): string {
  const auth = getAuth();
  if (!auth) return 'User';
  if (auth.role === 'student') return auth.anonymous_alias ?? 'Student';
  return auth.name ?? 'User';
}

/** Convenience wrapper for authenticated fetch calls */
export async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers ?? {}),
    },
  });
  return res;
}

/** Role-based redirect helper — returns the correct home route for a given role */
export function getHomeRoute(role: UserRole): string {
  switch (role) {
    case 'psychologist': return '/psychologist/dashboard';
    case 'admin':        return '/admin/dashboard';
    default:             return '/student/home';
  }
}
