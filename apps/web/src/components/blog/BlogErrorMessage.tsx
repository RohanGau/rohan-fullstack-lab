'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import clsx from 'clsx';

type BlogErrorMessageProps = {
  message?: string;
  showBack?: boolean;
  onRetry?: () => void;
  className?: string;
};

export function BlogErrorMessage({
  message = 'Something went wrong.',
  showBack = true,
  onRetry,
  className,
}: BlogErrorMessageProps) {
  const router = useRouter();

  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/blog');
    }
  };

  return (
    <div className={clsx('text-center py-20 space-y-6', className)}>
      <p className="text-red-500">{message}</p>

      <div className="flex items-center justify-center gap-3">
        {onRetry && (
          <Button variant="default" onClick={onRetry}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        )}
        {showBack && (
          <Button variant="outline" onClick={goBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        )}
      </div>
    </div>
  );
}
