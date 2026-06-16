import React from 'react';
import { cn } from '@/utils/cn';
import { Button } from './Button';
import { 
  Users, Calendar, Music, FileText, MessageSquare, 
  DollarSign, CheckSquare, Search 
} from 'lucide-react';

interface EmptyStateProps {
  icon?: 'members' | 'events' | 'music' | 'documents' | 'messages' | 'finance' | 'attendance' | 'search';
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'search',
  title,
  description,
  action,
  className,
}) => {
  const icons = {
    members: Users,
    events: Calendar,
    music: Music,
    documents: FileText,
    messages: MessageSquare,
    finance: DollarSign,
    attendance: CheckSquare,
    search: Search,
  };

  const Icon = icons[icon];

  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-[var(--primary-container)] rounded-full scale-150 opacity-30" />
        <div className="relative flex items-center justify-center h-16 w-16 rounded-full bg-[var(--primary-container)]">
          <Icon className="h-8 w-8 text-[var(--on-primary-container)]" />
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-[var(--text-main)] mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-sm text-[var(--text-muted)] max-w-xs mb-6">
          {description}
        </p>
      )}
      
      {action && (
        <Button onClick={action.onClick} variant="primary" size="md">
          {action.label}
        </Button>
      )}
    </div>
  );
};

export { EmptyState };
export type { EmptyStateProps };
