import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getSimpleIconSlug(skillName: string): string {
  const customSlugs: Record<string, string> = {
    'Next.js': 'nextdotjs',
    'Node.js': 'nodedotjs',
    'Express.js': 'express',
    'Vue.js': 'vuedotjs',
    'Nuxt.js': 'nuxtdotjs',
    'Deno.js': 'denodotjs',
    'RxJS': 'rxjs',
  };

  const normalized = skillName.trim();

  if (customSlugs[normalized]) {
    return customSlugs[normalized];
  }

  return normalized
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/\./g, 'dot');
}
