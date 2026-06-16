import React from 'react';
import { cn } from '@/utils/cn';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center gap-2 font-medium rounded-[var(--radius-md)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed touch-feedback active:scale-[0.98]';

    const variants = {
      primary:
        'bg-[var(--action-primary)] text-white hover:bg-[var(--action-hover)] focus:ring-[var(--action-primary)]',
      secondary:
        'bg-[var(--cta-accent)] text-white hover:bg-[var(--cta-accent-hover)] focus:ring-[var(--cta-accent)]',
      outline:
        'border-2 border-[var(--action-primary)] text-[var(--action-primary)] hover:bg-[var(--bg-hover)] focus:ring-[var(--action-primary)]',
      ghost:
        'text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-main)] focus:ring-[var(--border-primary)]',
      danger:
        'bg-[var(--color-error)] text-white hover:opacity-90 focus:ring-[var(--color-error)]',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm min-h-[36px]',
      md: 'px-4 py-2.5 text-sm min-h-[var(--touch-target)]',
      lg: 'px-6 py-3 text-base min-h-[52px]',
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          icon && iconPosition === 'left' && icon
        )}
        {children}
        {!loading && icon && iconPosition === 'right' && icon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };
