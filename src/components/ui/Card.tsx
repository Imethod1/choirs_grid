import React from 'react';
import { cn } from '@/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outline' | 'bento';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', hoverable = false, children, ...props }, ref) => {
    const variants = {
      default: 'bg-[var(--bg-surface)] border border-[var(--border-light)] shadow-[var(--shadow-sm)]',
      elevated: 'bg-[var(--bg-surface)] border border-[var(--border-light)] shadow-[var(--shadow-md)]',
      outline: 'bg-[var(--bg-surface)] border border-[var(--border-light)]',
      // Bento tile: subtle elevated surface with a soft tinted top edge for a premium feel.
      bento:
        'bg-[var(--bg-elevated)] border border-[var(--border-light)] shadow-[var(--shadow-sm)] ' +
        'relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-1 ' +
        'before:bg-gradient-to-r before:from-[var(--action-primary)] before:to-[var(--palm-leaf,var(--green-400))]',
    };

    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-4 sm:p-5',
      lg: 'p-5 sm:p-6',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-[var(--radius-lg)] transition-theme',
          variants[variant],
          paddings[padding],
          hoverable &&
            'transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card Header
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, subtitle, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-start justify-between gap-4 mb-4', className)}
        {...props}
      >
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-main)]">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-0.5 text-sm text-[var(--text-muted)]">{subtitle}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

export { Card, CardHeader };
export type { CardProps, CardHeaderProps };
