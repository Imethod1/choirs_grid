import React from 'react';
import { cn } from '@/utils/cn';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'text', width, height, style, ...props }, ref) => {
    const variants = {
      text: 'rounded-md h-4',
      circular: 'rounded-full',
      rectangular: 'rounded-[var(--radius-md)]',
    };

    return (
      <div
        ref={ref}
        className={cn('skeleton', variants[variant], className)}
        style={{
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height,
          ...style,
        }}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Pre-composed skeleton patterns
const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-[var(--bg-surface)] rounded-[var(--radius-lg)] p-4', className)}>
    <div className="flex items-center gap-3 mb-4">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex-1">
        <Skeleton width="60%" height={16} className="mb-2" />
        <Skeleton width="40%" height={12} />
      </div>
    </div>
    <Skeleton width="100%" height={12} className="mb-2" />
    <Skeleton width="80%" height={12} />
  </div>
);

const SkeletonList: React.FC<{ count?: number; className?: string }> = ({
  count = 3,
  className,
}) => (
  <div className={cn('space-y-3', className)}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3">
        <Skeleton variant="circular" width={44} height={44} />
        <div className="flex-1">
          <Skeleton width="50%" height={16} className="mb-2" />
          <Skeleton width="30%" height={12} />
        </div>
      </div>
    ))}
  </div>
);

const SkeletonTable: React.FC<{ rows?: number; cols?: number; className?: string }> = ({
  rows = 5,
  cols = 4,
  className,
}) => (
  <div className={cn('space-y-2', className)}>
    <div className="flex gap-4 p-3 border-b border-[var(--border-light)]">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} width={`${100 / cols}%`} height={14} />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, row) => (
      <div key={row} className="flex gap-4 p-3">
        {Array.from({ length: cols }).map((_, col) => (
          <Skeleton key={col} width={`${100 / cols}%`} height={16} />
        ))}
      </div>
    ))}
  </div>
);

export { Skeleton, SkeletonCard, SkeletonList, SkeletonTable };
export type { SkeletonProps };
