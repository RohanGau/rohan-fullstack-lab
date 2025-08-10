'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const BackToBlogButton = ({ className }: { className?: string }) => {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/blog');
    }
  };

  return (
    <Button variant="outline" onClick={handleBack} className={className}>
      <ArrowLeft className="mr-2 h-4 w-4" />
      Back
    </Button>
  );
};
