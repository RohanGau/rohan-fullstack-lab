import { IProjectDto } from "@fullstack-lab/types";
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

export function stripMarkdown(md: string) {
  return md
    .replace(/```[\s\S]*?```/g, '')      
    .replace(/`([^`]+)`/g, '$1')         
    .replace(/!\[[^\]]*]\([^)]+\)/g, '')
    .replace(/\[[^\]]+]\(([^)]+)\)/g, '$1')
    .replace(/[#>*_~-]+/g, '')
    .replace(/\n{2,}/g, ' ')
    .trim();
}

export function truncate(text: string, max = 180) {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max).trim()}…` : text;
}

export function pickPrimaryLink(project: IProjectDto) {
  const links = project.links || [];
  const byKind = (k: string) => links.find(l => l.kind === k && l.url);
  return byKind('live') || byKind('repo') || links[0] || null;
}