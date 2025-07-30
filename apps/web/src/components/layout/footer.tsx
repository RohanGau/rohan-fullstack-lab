'use client';

import Link from 'next/link';
import { SocialLinks } from '../custom/SocialLinks';
import { CONTACTS } from '@/lib/constant';
import { useProfileStore } from '@/lib/store';

export function Footer() {
const { profile } = useProfileStore();
const user = profile?.[0];
  return (
    <footer className="border-t mt-12 pt-8 pb-6 text-sm text-muted-foreground">
      <div className="max-w-6xl mx-auto px-4 space-y-4 text-center">
        <SocialLinks user={{
            ...user,
            ...CONTACTS
        }} />

        <nav className="flex flex-wrap justify-center gap-6">
          <Link href="/blog" className="hover:underline">Blog</Link>
          <Link href="/projects" className="hover:underline">Projects</Link>
          <Link href="/about" className="hover:underline">About</Link>
          <Link href="/contact" className="hover:underline">Contact</Link>
        </nav>

        <p className="text-xs">© {new Date().getFullYear()} Rohan Kumar. All rights reserved.</p>

        <p className="text-xs">
          Built with <strong>Next.js</strong>, <strong>Tailwind CSS</strong>, and <strong>Shadcn UI</strong>.
        </p>
      </div>
    </footer>
  );
}