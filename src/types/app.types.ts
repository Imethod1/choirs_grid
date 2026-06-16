// App-level derived types
import type { User, Choir, ChoirMember, Event, AttendanceRecord } from './database.types';

// Joined types for UI
export interface MemberWithUser extends ChoirMember {
  user: User;
}

export interface EventWithAttendance extends Event {
  attendance_records?: AttendanceRecord[];
  attendance_count?: {
    present: number;
    absent: number;
    late: number;
    excused: number;
    total: number;
  };
}

export interface AttendanceSheet {
  event: Event;
  members: Array<{
    member: MemberWithUser;
    record: AttendanceRecord | null;
  }>;
}

// Auth context
export interface AuthState {
  user: User | null;
  choirMember: ChoirMember | null;
  choir: Choir | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Navigation
export interface NavItem {
  key: string;
  labelKey: string;
  icon: string;
  path: string;
  roles?: ChoirMember['role'][];
  badge?: number;
}

// Finance summary
export interface FinanceSummary {
  totalContributions: number;
  totalExpenses: number;
  balance: number;
  currency: string;
  period: {
    start: string;
    end: string;
  };
  contributionsByCategory: Record<string, number>;
  expensesByCategory: Record<string, number>;
}

// Dashboard stats
export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  upcomingEvents: Event[];
  recentContributions: number;
  attendanceRate: number;
}

// Toast notification
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}
