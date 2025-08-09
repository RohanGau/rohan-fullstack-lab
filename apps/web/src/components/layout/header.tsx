'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Blog", href: "/blog" },
  { label: "Project", href: "/project" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b py-4 sticky top-0 z-50 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex items-center justify-between px-4">
        <Link href="/" className="font-bold text-lg">
          Rohan Kumar
        </Link>
        <nav className="flex gap-4 text-sm">
          {navItems.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "transition-colors hover:text-primary",
                pathname === href ? "text-primary font-medium" : "text-muted-foreground"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
