import React from 'react';
import { cn } from '@/utils/cn';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  status?: 'online' | 'offline' | 'busy';
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, name, size = 'md', showStatus = false, status = 'offline', ...props }, ref) => {
    const sizes = {
      xs: 'h-6 w-6 text-[10px]',
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-12 w-12 text-base',
      xl: 'h-16 w-16 text-lg',
    };

    const statusSizes = {
      xs: 'h-1.5 w-1.5',
      sm: 'h-2 w-2',
      md: 'h-2.5 w-2.5',
      lg: 'h-3 w-3',
      xl: 'h-4 w-4',
    };

    const statusColors = {
      online: 'bg-[var(--color-success)]',
      offline: 'bg-[var(--text-subtle)]',
      busy: 'bg-[var(--color-error)]',
    };

    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    // M3-derived avatar colors from the palette
    const getColorFromName = (name: string) => {
      const colors = [
        'bg-[var(--action-primary)] text-[var(--on-primary)]',
        'bg-[var(--cta-accent)] text-[var(--on-accent)]',
        'bg-[var(--secondary)] text-[var(--on-secondary)]',
        'bg-[var(--m3-primary-50)] text-white',
        'bg-[var(--m3-tertiary-40)] text-white',
        'bg-[var(--m3-secondary-30)] text-white',
      ];
      const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return colors[index % colors.length];
    };

    return (
      <div ref={ref} className={cn('relative inline-flex', className)} {...props}>
        {src ? (
          <img
            src={src}
            alt={name}
            className={cn('rounded-full object-cover', sizes[size])}
          />
        ) : (
          <div
            className={cn(
              'rounded-full flex items-center justify-center font-semibold',
              sizes[size],
              getColorFromName(name)
            )}
          >
            {initials}
          </div>
        )}
        {showStatus && (
          <span
            className={cn(
              'absolute bottom-0 right-0 rounded-full border-2 border-[var(--bg-surface)]',
              statusSizes[size],
              statusColors[status]
            )}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

interface AvatarGroupProps {
  users: Array<{ name: string; src?: string | null }>;
  max?: number;
  size?: AvatarProps['size'];
}

const AvatarGroup: React.FC<AvatarGroupProps> = ({ users, max = 4, size = 'sm' }) => {
  const displayUsers = users.slice(0, max);
  const remainingCount = users.length - max;

  return (
    <div className="flex -space-x-2">
      {displayUsers.map((user, index) => (
        <Avatar
          key={index}
          name={user.name}
          src={user.src}
          size={size}
          className="ring-2 ring-[var(--bg-surface)]"
        />
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            'rounded-full flex items-center justify-center font-medium bg-[var(--bg-hover)] text-[var(--text-muted)] ring-2 ring-[var(--bg-surface)]',
            size === 'xs' && 'h-6 w-6 text-[10px]',
            size === 'sm' && 'h-8 w-8 text-xs',
            size === 'md' && 'h-10 w-10 text-sm'
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

export { Avatar, AvatarGroup };
export type { AvatarProps, AvatarGroupProps };
