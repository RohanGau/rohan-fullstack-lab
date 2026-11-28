import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { getSimpleIconByName } from '@/lib/simpleIcons';
import { SkillsProps } from '@/types/profile';
import Link from 'next/link';
import { cn } from '@/lib/utils';

function getIconForName(name: string): { path: string; hex: string } | undefined {
  return getSimpleIconByName(name);
}

const BASE_COLS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
};
const SM_COLS: Record<number, string> = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
};
const MD_COLS: Record<number, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
};
const LG_COLS: Record<number, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
};

export function SkillsSection({ skills, fullStack, gridCols, isProfile }: SkillsProps) {
  if (!skills || skills.length === 0) return null;

  const base = gridCols?.base ?? 2;
  const sm = gridCols?.sm ?? 2;
  const md = gridCols?.md ?? 3;
  const lg = gridCols?.lg ?? md;

  const gridClass = cn(
    'grid gap-2 sm:gap-4',
    BASE_COLS[base] ?? 'grid-cols-2',
    SM_COLS[sm] ?? 'sm:grid-cols-2',
    MD_COLS[md] ?? 'md:grid-cols-3',
    LG_COLS[lg] ?? 'lg:grid-cols-3'
  );

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-6">Top Skills</h2>
      <div className={gridClass}>
        {skills.map((skill) => {
          const icon = getIconForName(skill.name);
          const isGithub = skill.name.trim().toLowerCase() === 'github';
          const lightColor = icon ? `#${icon.hex}` : undefined;
          const darkColor = isGithub ? '#ffffff' : lightColor;

          return (
            <Card key={skill.name} className="shadow-sm">
              <CardHeader className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 pb-1 sm:pb-2">
                {icon && (
                  <span
                    className="shrink-0 text-[var(--brand-light)] dark:text-[var(--brand-dark)]"
                    style={
                      {
                        '--brand-light': lightColor,
                        '--brand-dark': darkColor,
                      } as React.CSSProperties
                    }
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4 sm:h-5 sm:w-5"
                      role="img"
                      aria-hidden="true"
                    >
                      <path d={icon.path} fill="currentColor" />
                    </svg>
                  </span>
                )}
                <CardTitle className="text-sm sm:text-base font-medium">{skill.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3 px-3 sm:px-4 pb-3 sm:pb-4 pt-0">
                <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
                  <span>Rating</span>
                  <span>{skill.rating}/10</span>
                </div>
                <Progress
                  value={(skill.rating / 10) * 100}
                  className="h-1.5 sm:h-2"
                  aria-label={`${skill.name} rating ${skill.rating} out of 10`}
                />
                <div className="text-[10px] sm:text-xs text-muted-foreground">
                  {skill.yearsOfExperience} year{skill.yearsOfExperience > 1 ? 's' : ''} experience
                </div>
              </CardContent>
            </Card>
          );
        })}

        {isProfile && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Want to know more?</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-3">
              <Link
                href="/about"
                className="inline-block px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition"
              >
                Read About Me →
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {fullStack && (
        <details className="mt-8 mb-6">
          <summary className="cursor-pointer text-2xl font-semibold mb-2 text-muted-foreground">
            View my full stack & dev tools
          </summary>
          <div className="flex flex-wrap gap-2 mt-2">
            {fullStack.map((tool) => (
              <Badge key={tool} variant="secondary">
                {tool}
              </Badge>
            ))}
          </div>
        </details>
      )}
    </section>
  );
}
