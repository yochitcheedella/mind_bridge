/**
 * MindBridge Auth Utilities
 * Manages the lightweight JWT auth state stored in localStorage.
 * The real student identity is never stored here — only the anonymous alias and token.
 */

export interface AuthState {
  access_token: string;
  anonymous_alias: string;
  student_id: number;
  primary_color?: string;
}

const AUTH_KEY = 'mindbridge_auth';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
