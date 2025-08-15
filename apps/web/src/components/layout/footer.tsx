'use client';

import Link from 'next/link';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CONTACTS } from '@/lib/constant';
import { useProfileStore } from '@/lib/store';
import { SocialLinks } from '../custom/SocialLinks';
import { MapPin } from 'lucide-react';
import { FooterMap } from '../custom/FooterMap';

export function Footer() {
  const { profile } = useProfileStore();
  const user = profile?.[0];
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t bg-muted/20">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">Rohan Kumar</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Senior Software Engineer. Building clean, scalable web experiences.
            </p>
            {user?.location && (
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                <span>{user.location}</span>
              </div>
            )}
            <div className="mt-4">
              <SocialLinks user={{ ...user, ...CONTACTS }} ariaLabel="Social links" />
            </div>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-2 text-sm place-items-center">
            <Link href="/blog" className="hover:underline focus-visible:underline">
              Blog
            </Link>
            <Link href="/project" className="hover:underline focus-visible:underline">
              Project
            </Link>
            <Link href="/about" className="hover:underline focus-visible:underline">
              About
            </Link>
            <Link href="/contact" className="hover:underline focus-visible:underline">
              Contact
            </Link>
            <Link href="/rss.xml" className="hover:underline focus-visible:underline">
              RSS
            </Link>
            <Link href="/sitemap.xml" className="hover:underline focus-visible:underline">
              Sitemap
            </Link>
          </nav>

          <div className="flex items-start justify-start md:justify-end">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <ArrowUp className="mr-2 h-4 w-4" />
              Back to top
            </Button>
          </div>
        </div>
      </div>

      <FooterMap location={user?.location} zoom={13} />
      <Separator className="opacity-50" />

      <div className="mx-auto max-w-5xl px-4 py-6 text-center text-xs text-muted-foreground">
        <p>© {year} Rohan Kumar. All rights reserved.</p>
        <p className="mt-1">
          Built with{' '}
          <Link
            href="https://nextjs.org"
            className="font-medium underline-offset-4 hover:underline"
          >
            Next.js
          </Link>
          ,{' '}
          <Link
            href="https://tailwindcss.com"
            className="font-medium underline-offset-4 hover:underline"
          >
            Tailwind CSS
          </Link>
          , and{' '}
          <Link
            href="https://ui.shadcn.com"
            className="font-medium underline-offset-4 hover:underline"
          >
            shadcn/ui
          </Link>
          .
        </p>
      </div>
    </footer>
  );
}
