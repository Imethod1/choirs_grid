import React from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, icon, iconPosition = 'left', id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--text-main)] mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-[var(--radius-md)] border bg-[var(--bg-surface)] px-4 py-2.5 text-sm min-h-[var(--touch-target)]',
              'text-[var(--text-main)]',
              'placeholder:text-[var(--text-subtle)]',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              error
                ? 'border-[var(--color-error)] focus:ring-[var(--color-error)]/30 animate-shake'
                : 'border-[var(--border-light)] focus:border-[var(--action-primary)] focus:ring-[var(--action-primary)]/30',
              'disabled:bg-[var(--bg-hover)] disabled:cursor-not-allowed',
              icon && iconPosition === 'left' && 'pl-10',
              icon && iconPosition === 'right' && 'pr-10',
              className
            )}
            {...props}
          />
          {icon && iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]">
              {icon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-[var(--color-error)]">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-xs text-[var(--text-muted)]">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
export type { InputProps };
