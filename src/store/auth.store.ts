// src/store/auth.store.ts

import { create } from 'zustand'
import type { User, Choir, ChoirMember } from '@/types/database.types'
import { authService } from '@/services'

interface AuthState {
  user: User | null
  choir: Choir | null
  choirMember: ChoirMember | null
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  setUser: (user: User | null) => void
  setChoir: (choir: Choir | null) => void
  setChoirMember: (member: ChoirMember | null) => void
  login: (phone: string, password: string) => Promise<void>
  register: (phone: string, password: string, fullName: string) => Promise<void>
  verifyOtp: (phone: string, otp: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  hasRole: (role: ChoirMember['role']) => boolean
  hasAnyRole: (roles: ChoirMember['role'][]) => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  choir: null,
  choirMember: null,
  isAuthenticated: false,
  isLoading: true, // true until checkSession resolves on app boot

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setChoir: (choir) => set({ choir }),
  setChoirMember: (choirMember) => set({ choirMember }),

  // ── Login ─────────────────────────────────────────────────────────────────
  login: async (phone, password) => {
    set({ isLoading: true })
    try {
      const result = await authService.signInWithPhone(phone, password)
      set({
        user:            result.user,
        choir:           result.choir,
        choirMember:     result.choirMember,
        isAuthenticated: true,
        isLoading:       false,
      })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  // ── Register ──────────────────────────────────────────────────────────────
  // Creates auth user + triggers SMS OTP via Africa's Talking
  // Does NOT set isAuthenticated — user must verify OTP first
  register: async (phone, password, fullName) => {
    set({ isLoading: true })
    try {
      await authService.signUp(phone, password, fullName)
      set({ isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  // ── Verify OTP ────────────────────────────────────────────────────────────
  // password is required: after OTP passes, we sign in with password
  // to obtain a real Supabase session
  verifyOtp: async (phone, otp, password) => {
    set({ isLoading: true })
    try {
      const result = await authService.verifyOtp(phone, otp, password)
      set({
        user:            result.user,
        choir:           result.choir,
        choirMember:     result.choirMember,
        isAuthenticated: true,
        isLoading:       false,
      })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  // ── Logout ────────────────────────────────────────────────────────────────
  logout: async () => {
    await authService.signOut()
    set({
      user:            null,
      choir:           null,
      choirMember:     null,
      isAuthenticated: false,
    })
  },

  // ── Check Session ─────────────────────────────────────────────────────────
  // Called on app boot — restores session if Supabase token still valid
  checkSession: async () => {
    set({ isLoading: true })
    try {
      const result = await authService.getSession()
      if (result) {
        set({
          user:            result.user,
          choir:           result.choir,
          choirMember:     result.choirMember,
          isAuthenticated: true,
          isLoading:       false,
        })
      } else {
        set({ isLoading: false })
      }
    } catch {
      set({ isLoading: false })
    }
  },

  // ── Role Helpers ──────────────────────────────────────────────────────────
  hasRole: (role) => {
    const { choirMember } = get()
    return choirMember?.role === role
  },

  hasAnyRole: (roles) => {
    const { choirMember } = get()
    return roles.includes(choirMember?.role as ChoirMember['role'])
  },
}))
