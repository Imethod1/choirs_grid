/**
 * Service Factory
 * 
 * Returns mock or real service implementation based on VITE_USE_MOCK_SERVICES env var.
 * In development: mock services with simulated delays and typed mock data.
 * In production:  real Supabase-backed services.
 * 
 * Usage:
 *   import { getService } from '@/lib/service-factory'
 *   import * as real from '@/services/auth.service'
 *   import * as mock from '@/services/mock/auth.mock'
 *   export const authService = getService(real, mock)
 */

const USE_MOCK = import.meta.env.VITE_USE_MOCK_SERVICES === 'true';

export function getService<T>(real: T, mock: T): T {
  return USE_MOCK ? mock : real;
}

export function isMockMode(): boolean {
  return USE_MOCK;
}
