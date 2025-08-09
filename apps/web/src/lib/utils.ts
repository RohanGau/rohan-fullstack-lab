import { BlogsQuery, BlogsQueryRequired } from "@/types/blog";
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

export function makeQueryString(q: BlogsQueryRequired) {
  const { page, perPage, sort, ...rest } = q;
  const params = new URLSearchParams({
    range: JSON.stringify([(page-1)*perPage, page*perPage-1]),
    sort: JSON.stringify(sort),
  });
  const filter: Record<string, any> = {};
  if (rest.search?.trim()) filter.q = rest.search.trim();
  if (rest.tags?.length)    filter.tags = rest.tags;
  if (typeof rest.isFeatured === 'boolean') filter.isFeatured = rest.isFeatured;
  if (rest.status)          filter.status = rest.status;
  if (rest.author?.trim())  filter.author = rest.author.trim();
  if (Object.keys(filter).length) params.set('filter', JSON.stringify(filter));
  return params.toString();
}

export function keyFromQuery(q: BlogsQueryRequired) {
  // stable cache key for Zustand (avoid collisions across pages/filters)
  return JSON.stringify({
    p: q.page ?? 1,
    pp: q.perPage ?? 9,
    s: q.sort ?? ['publishedAt','DESC'],
    q: q.search ?? '',
    t: q.tags ?? [],
    f: q.isFeatured ?? null,
    st: q.status ?? 'published',
    a: q.author ?? '',
  });
}

export const isMongoId = (s: string) => /^[a-f\d]{24}$/i.test(s);
