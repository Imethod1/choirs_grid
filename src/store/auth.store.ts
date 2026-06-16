import { create } from 'zustand';
import type { User, Choir, ChoirMember } from '@/types/database.types';
import { authService } from '@/services';

interface AuthState {
  user: User | null;
  choir: Choir | null;
  choirMember: ChoirMember | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setChoir: (choir: Choir | null) => void;
  setChoirMember: (member: ChoirMember | null) => void;
  login: (phone: string, password: string) => Promise<void>;
  register: (phone: string, password: string, fullName: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  hasRole: (role: ChoirMember['role']) => boolean;
  hasAnyRole: (roles: ChoirMember['role'][]) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  choir: null,
  choirMember: null,
  isAuthenticated: false,
  isLoading: true, // Start loading until session check completes

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setChoir: (choir) => set({ choir }),
  setChoirMember: (choirMember) => set({ choirMember }),

  login: async (phone, password) => {
    set({ isLoading: true });
    try {
      const result = await authService.signInWithPhone(phone, password);
      set({
        user: result.user,
        choir: result.choir,
        choirMember: result.choirMember,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (phone, password, fullName) => {
    set({ isLoading: true });
    try {
      await authService.signUp(phone, password, fullName);
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  verifyOtp: async (phone, otp) => {
    set({ isLoading: true });
    try {
      const result = await authService.verifyOtp(phone, otp);
      set({
        user: result.user,
        choir: result.choir,
        choirMember: result.choirMember,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    await authService.signOut();
    set({
      user: null,
      choir: null,
      choirMember: null,
      isAuthenticated: false,
    });
  },

  checkSession: async () => {
    set({ isLoading: true });
    try {
      const result = await authService.getSession();
      if (result) {
        set({
          user: result.user,
          choir: result.choir,
          choirMember: result.choirMember,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  hasRole: (role) => {
    const { choirMember } = get();
    return choirMember?.role === role;
  },

  hasAnyRole: (roles) => {
    const { choirMember } = get();
    return roles.includes(choirMember?.role as ChoirMember['role']);
  },
}));
