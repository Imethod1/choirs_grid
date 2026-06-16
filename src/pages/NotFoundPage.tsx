import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-8">
        <span className="text-[120px] font-bold text-[var(--border-light)] leading-none select-none">
          404
        </span>
      </div>
      <h1 className="text-2xl font-bold text-[var(--text-main)] mb-2">
        {t('errors.not_found')}
      </h1>
      <p className="text-[var(--text-muted)] max-w-sm mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link to="/">
          <Button variant="primary" icon={<Home className="h-4 w-4" />}>
            {t('nav.dashboard')}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
