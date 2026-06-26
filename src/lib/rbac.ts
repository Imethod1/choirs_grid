// src/lib/rbac.ts
//
// Centralized Role-Based Access Control configuration.
//
// Single source of truth for which roles may access which routes/features.
// Both the route guards (RoleRoute) and the navigation shell (Sidebar/BottomNav)
// read from here so UI visibility and route enforcement can never drift apart.
//
// NOTE: This is the *frontend* enforcement layer (defense-in-depth / UX).
// The authoritative security boundary remains Postgres RLS + Edge Function
// checks server-side. Never rely on this alone.

import type { MemberRole } from '@/types/database.types'

/** Roles allowed to manage members, events, polls, announcements. */
export const LEADERSHIP_ROLES: MemberRole[] = [
  'super_admin',
  'choir_leader',
  'assistant_leader',
]

/** Roles allowed to view/manage finance. */
export const FINANCE_ROLES: MemberRole[] = [
  'super_admin',
  'choir_leader',
  'treasurer',
]

/** Roles allowed to upload/manage music. */
export const MUSIC_ROLES: MemberRole[] = [
  'super_admin',
  'choir_leader',
  'music_teacher',
]

/** Roles allowed to view member contact details (phone/email). */
export const PII_ROLES: MemberRole[] = [
  'super_admin',
  'choir_leader',
  'assistant_leader',
  'secretary',
]

/** Roles allowed to manage documents / governance. */
export const GOVERNANCE_ROLES: MemberRole[] = [
  'super_admin',
  'choir_leader',
  'assistant_leader',
  'secretary',
]

/** Roles allowed to view analytics/reports. */
export const REPORTS_ROLES: MemberRole[] = [
  'super_admin',
  'choir_leader',
  'assistant_leader',
  'treasurer',
]

/**
 * Route → allowed roles map.
 * A route absent from this map is considered open to any authenticated member.
 * Keys are the path segments used in App.tsx <Route>.
 */
export const ROUTE_ROLES: Record<string, MemberRole[]> = {
  finance: FINANCE_ROLES,
  reports: REPORTS_ROLES,
  documents: GOVERNANCE_ROLES,
}

const ALL_ROLES: MemberRole[] = [
  'super_admin',
  'choir_leader',
  'assistant_leader',
  'secretary',
  'treasurer',
  'music_teacher',
  'member',
]

/** Type guard: is the given string a recognized member role? */
export function isValidRole(role: unknown): role is MemberRole {
  return typeof role === 'string' && (ALL_ROLES as string[]).includes(role)
}

/** Returns true if `role` is one of `allowed`. Unknown/empty role → false. */
export function roleAllowed(
  role: string | null | undefined,
  allowed: MemberRole[]
): boolean {
  if (!isValidRole(role)) return false
  return allowed.includes(role)
}
