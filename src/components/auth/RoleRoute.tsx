// src/components/auth/RoleRoute.tsx
//
// Role-aware route guard. Wrap any element that requires specific roles.
// Assumes it is rendered *inside* an authenticated context (i.e. nested
// under ProtectedRoute), so the user is already known.
//
//   <RoleRoute allow={FINANCE_ROLES}><FinancePage /></RoleRoute>
//
// On role mismatch it shows a toast and redirects to the dashboard,
// guaranteeing no dead-end / blank screen.

import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { MemberRole } from '@/types/database.types'
import { useAuthStore } from '@/store/auth.store'
import { roleAllowed } from '@/lib/rbac'
import { useToast } from '@/components/ui/Toast'

interface RoleRouteProps {
  allow: MemberRole[]
  /** Where to send users who lack the role. Defaults to dashboard. */
  redirectTo?: string
  children: React.ReactNode
}

export const RoleRoute: React.FC<RoleRouteProps> = ({
  allow,
  redirectTo = '/',
  children,
}) => {
  const { t } = useTranslation()
  const toast = useToast()
  const location = useLocation()
  const choirMember = useAuthStore((s) => s.choirMember)
  const isLoading = useAuthStore((s) => s.isLoading)

  const permitted = roleAllowed(choirMember?.role, allow)

  // Toast only once when an actual denial occurs (not while session loads).
  useEffect(() => {
    if (!isLoading && choirMember && !permitted) {
      toast.error(
        t('errors.no_permission', {
          defaultValue: 'You do not have permission to view that page.',
        })
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, permitted, location.pathname])

  // While the session/profile is still resolving, render nothing to avoid
  // a flash of denied → allowed. ProtectedRoute already shows the spinner.
  if (isLoading || !choirMember) return null

  if (!permitted) {
    return <Navigate to={redirectTo} replace state={{ deniedFrom: location.pathname }} />
  }

  return <>{children}</>
}
