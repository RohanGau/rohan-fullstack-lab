'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const BackToBlogButton = ({ className }: { className?: string }) => {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      onClick={() => router.push('/blog')}
      className={className}
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      Back to Blogs
    </Button>
  );
};
