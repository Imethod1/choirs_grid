/**
 * Security Utilities
 * 
 * Client-side security helpers for the Choir App.
 * Server-side enforcement happens via Supabase RLS + Edge Functions.
 */

// ── Finance session timeout (5 minutes) ────────────────
const FINANCE_TIMEOUT_MS = 5 * 60 * 1000;
let financeTimer: ReturnType<typeof setTimeout> | null = null;
let financeLastActivity: number = Date.now();

export function startFinanceSession(onExpire: () => void): void {
  financeLastActivity = Date.now();
  resetFinanceTimer(onExpire);
}

export function resetFinanceTimer(onExpire: () => void): void {
  if (financeTimer) clearTimeout(financeTimer);
  financeLastActivity = Date.now();
  financeTimer = setTimeout(() => {
    onExpire();
  }, FINANCE_TIMEOUT_MS);
}

export function getFinanceTimeRemaining(): number {
  const elapsed = Date.now() - financeLastActivity;
  return Math.max(0, FINANCE_TIMEOUT_MS - elapsed);
}

export function clearFinanceSession(): void {
  if (financeTimer) {
    clearTimeout(financeTimer);
    financeTimer = null;
  }
}

// ── Account lockout (client-side tracking) ─────────────
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes

interface LockoutState {
  attempts: number;
  lockedUntil: number | null;
}

const LOCKOUT_KEY = 'choir-app-lockout';

export function getLockoutState(): LockoutState {
  try {
    const raw = localStorage.getItem(LOCKOUT_KEY);
    return raw ? JSON.parse(raw) : { attempts: 0, lockedUntil: null };
  } catch {
    return { attempts: 0, lockedUntil: null };
  }
}

export function isAccountLocked(): boolean {
  const state = getLockoutState();
  if (!state.lockedUntil) return false;
  if (Date.now() >= state.lockedUntil) {
    // Lockout expired — reset
    clearLockout();
    return false;
  }
  return true;
}

export function recordFailedAttempt(): boolean {
  const state = getLockoutState();
  state.attempts++;
  
  if (state.attempts >= MAX_FAILED_ATTEMPTS) {
    state.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    localStorage.setItem(LOCKOUT_KEY, JSON.stringify(state));
    return true; // Account is now locked
  }
  
  localStorage.setItem(LOCKOUT_KEY, JSON.stringify(state));
  return false;
}

export function clearLockout(): void {
  localStorage.removeItem(LOCKOUT_KEY);
}

// ── Content filter (for messages) ──────────────────────
// NOTE: Do NOT use /g flag on module-level RegExp — the global flag retains
// lastIndex state between .test() calls, causing intermittent false negatives.
function getSensitivePatterns(): RegExp[] {
  return [
    /\+?255\d{9}/,              // Tanzanian phone numbers
    /\b\d{4,6}\b/,               // OTP-like codes (4-6 digits)
    /TZS\s?\d+/i,                // Currency amounts
    /\d{1,3}(,\d{3})+/,          // Formatted numbers like 1,000,000
  ];
}

export function containsSensitiveContent(text: string): boolean {
  return getSensitivePatterns().some((pattern) => pattern.test(text));
}

// ── Audit helpers ──────────────────────────────────────
export function getDeviceFingerprint(): string {
  const { userAgent, language, hardwareConcurrency } = navigator;
  const screen = `${window.screen.width}x${window.screen.height}`;
  const raw = `${userAgent}|${language}|${hardwareConcurrency}|${screen}`;
  
  // Simple hash — not cryptographic, just for fingerprinting
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}
