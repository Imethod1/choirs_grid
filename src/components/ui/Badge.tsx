import React from 'react';
import { cn } from '@/utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'accent';
  size?: 'sm' | 'md';
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const variants = {
      default: 'bg-[var(--bg-hover)] text-[var(--text-muted)]',
      success: 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
      warning: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
      error: 'bg-[var(--color-error-bg)] text-[var(--color-error)]',
      info: 'bg-[var(--color-info-bg)] text-[var(--color-info)]',
      accent: 'bg-[var(--primary-container)] text-[var(--on-primary-container)]',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-xs',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-medium rounded-full transition-theme',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

interface StatusBadgeProps {
  status: 'active' | 'probation' | 'inactive' | 'alumni' | 'guest' | 'present' | 'absent' | 'late' | 'excused';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config: Record<string, { variant: BadgeProps['variant']; label: string }> = {
    active: { variant: 'success', label: 'Active' },
    probation: { variant: 'warning', label: 'Probation' },
    inactive: { variant: 'default', label: 'Inactive' },
    alumni: { variant: 'info', label: 'Alumni' },
    guest: { variant: 'accent', label: 'Guest' },
    present: { variant: 'success', label: 'Present' },
    absent: { variant: 'error', label: 'Absent' },
    late: { variant: 'warning', label: 'Late' },
    excused: { variant: 'info', label: 'Excused' },
  };

  const { variant, label } = config[status] || config.active;

  return <Badge variant={variant}>{label}</Badge>;
};

export { Badge, StatusBadge };
export type { BadgeProps, StatusBadgeProps };
