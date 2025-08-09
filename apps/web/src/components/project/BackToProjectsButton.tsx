'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function BackToProjectsButton({ className }: { className?: string }) {
  const router = useRouter();
  return (
    <div className={className}>
      <Button variant="ghost" onClick={() => router.back()} className="mr-2">← Back</Button>
      <Button variant="link" asChild>
        <Link href="/projects">All Projects</Link>
      </Button>
    </div>
  );
}
