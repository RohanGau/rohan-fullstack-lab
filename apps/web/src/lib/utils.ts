import { BlogsQueryRequired } from "@/types/blog";
import { IProjectDto } from "@fullstack-lab/types";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { keyFromQuery, makeQueryStringFromFilter } from "./query";
import { ProjectsQueryRequired } from "@/types/project";

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

export function makeBlogQueryString(q: BlogsQueryRequired) {
  return makeQueryStringFromFilter(q, () => {
    const filter: Record<string, any> = {};
    if (q.search?.trim()) filter.q = q.search.trim();
    if (q.tags?.length) filter.tags = q.tags;
    if (typeof q.isFeatured === 'boolean') filter.isFeatured = q.isFeatured;
    if (q.status) filter.status = q.status;
    if (q.author?.trim()) filter.author = q.author.trim();
    return filter;
  });
}

export function blogKeyFromQuery(q: BlogsQueryRequired) {
  return keyFromQuery('blogs', {
    p: q.page, pp: q.perPage, s: q.sort,
    q: q.search ?? '', t: q.tags ?? [],
    f: q.isFeatured ?? null, st: q.status ?? 'published',
    a: q.author ?? '',
  });
}

export function makeProjectQueryString(q: ProjectsQueryRequired) {
  return makeQueryStringFromFilter(q, () => {
    const filter: Record<string, any> = {};
    if (q.search?.trim()) filter.q = q.search.trim();
    if (q.types?.length) filter.types = q.types;
    if (typeof q.isFeatured === 'boolean') filter.isFeatured = q.isFeatured;
    if (q.company?.trim()) filter.company = q.company.trim();
    if (q.role?.trim()) filter.role = q.role.trim();
    if (typeof q.year === 'number') filter.year = q.year;
    if (q.yearFrom != null) filter.yearFrom = q.yearFrom;
    if (q.yearTo != null) filter.yearTo = q.yearTo;
    return filter;
  });
}

export function projectKeyFromQuery(q: ProjectsQueryRequired) {
  return keyFromQuery('projects', {
    p: q.page, pp: q.perPage, s: q.sort,
    q: q.search ?? '',
    ty: q.types ?? [],
    f: q.isFeatured ?? null,
    c: q.company ?? '',
    r: q.role ?? '',
    y: q.year ?? null,
    yf: q.yearFrom ?? null,
    yt: q.yearTo ?? null,
  });
}

export const isMongoId = (s: string) => /^[a-f\d]{24}$/i.test(s);

export function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

