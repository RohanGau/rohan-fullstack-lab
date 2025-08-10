'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { isActive } from '@/lib/utils';
import { navItems } from '@/lib/constant';
import Image from 'next/image';

export function Header() {
  const pathname = usePathname();

  return (
    <>
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:z-[100] focus:left-4 focus:top-4 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Rohan Kumar — Home"
          >
            <Image
              src="https://pub-92ca52f522664b02af9bc8a7906e3013.r2.dev/uploads/2025/08/10/mylogo-7c0bc3bd.png?cb=1754842683033"
              alt="Rohan Kumar logo"
              width={180}
              height={40}
              priority
              className="h-8 w-auto md:h-10"
            />
            <span className="sr-only">Rohan Kumar</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {navItems.map(({ label, href }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative rounded-full px-3 py-2 text-sm font-medium outline-none transition-colors',
                    active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <span
                    className={cn(
                      'pointer-events-none absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full transition',
                      active
                        ? 'bg-primary opacity-100'
                        : 'bg-primary/70 opacity-0 group-hover:opacity-100'
                    )}
                  />
                  {label}
                </Link>
              );
            })}
            <Button asChild className="ml-2 rounded-full">
              <Link href="/contact">Contact</Link>
            </Button>
          </nav>

          {/* Mobile */}
          <div className="flex items-center gap-2 md:hidden">
            <Button asChild size="sm" className="rounded-full">
              <Link href="/contact">Contact</Link>
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                <SheetHeader>
                  <SheetTitle className="text-left">Navigation</SheetTitle>
                </SheetHeader>
                <div className="mt-4 flex flex-col gap-1">
                  {[...navItems, { label: 'Contact', href: '/contact' }].map(({ label, href }) => {
                    const active = isActive(pathname, href);
                    return (
                      <Link
                        key={href}
                        href={href}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'rounded-lg px-3 py-2 text-base outline-none transition-colors',
                          active
                            ? 'bg-muted text-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        {label}
                      </Link>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}
