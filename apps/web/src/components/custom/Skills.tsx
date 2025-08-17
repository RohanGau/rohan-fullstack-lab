import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { getSimpleIconSlug } from '@/lib/utils';
import * as simpleIcons from 'simple-icons';
import { SkillsProps } from '@/types/profile';
import Link from 'next/link';
import { useEffectiveTheme } from '@/hooks/useEffectiveTheme';

function getIconForName(name: string): { path: string; hex: string } | undefined {
  const slug = getSimpleIconSlug(name);
  const key = 'si' + slug.charAt(0).toUpperCase() + slug.slice(1);
  return (simpleIcons as any)[key] as { path: string; hex: string } | undefined;
}

export function SkillsSection({ skills, fullStack, gridCols, isProfile }: SkillsProps) {
  const theme = useEffectiveTheme();
  const isDark = theme === 'dark';

  if (!skills || skills.length === 0) return null;

  const base = gridCols?.base || 1;
  const sm = gridCols?.sm || 2;
  const md = gridCols?.md || 3;
  const lg = gridCols?.lg || md;

  const gridClass = `grid grid-cols-${base} sm:grid-cols-${sm} md:grid-cols-${md} lg:grid-cols-${lg} gap-4`;

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-6">Top Skills</h2>
      <div className={gridClass}>
        {skills.map((skill) => {
          const icon = getIconForName(skill.name);
          const isGithub = skill.name.trim().toLowerCase() === 'github';
          const darkColor = isGithub ? '#ffffff' : icon ? `#${icon.hex}` : undefined;

          return (
            <Card key={skill.name} className="shadow-sm">
              <CardHeader className="flex items-center gap-3 pb-2">
                {icon &&
                  (isDark ? (
                    <span
                      className="shrink-0 text-[var(--brand)]"
                      style={{ ['--brand' as any]: darkColor }}
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5" role="img" aria-hidden="true">
                        <path d={icon.path} fill="currentColor" />
                      </svg>
                    </span>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5 shrink-0"
                      role="img"
                      aria-hidden="true"
                    >
                      <path d={icon.path} fill={`#${icon.hex}`} />
                    </svg>
                  ))}
                <CardTitle className="text-base font-medium">{skill.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Rating</span>
                  <span>{skill.rating}/10</span>
                </div>
                <Progress value={(skill.rating / 10) * 100} />
                <div className="text-xs text-muted-foreground">
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
              <p>Curious about my engineering principles, tech journey, and domain expertise?</p>
              <Link
                href="/about"
                className="inline-block px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition"
              >
                Read More About Me →
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
