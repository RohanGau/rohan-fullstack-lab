'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BackToProjectsButton({ className }: { className?: string }) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/project');
    }
  };

  return (
    <Button type="button" variant="outline" onClick={handleBack} className={className}>
      <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
      Back
    </Button>
  );
}
