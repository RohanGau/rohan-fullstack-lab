import { BlogsQueryRequired } from '@/types/blog';
import { IProjectDto } from '@fullstack-lab/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { keyFromQuery, makeQueryStringFromFilter } from './query';
import { ProjectsQueryRequired } from '@/types/project';
import { BlogFilter, ProjectFilter } from '@/types/query';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getSimpleIconSlug(skillName: string): string {
  const customSlugs: Record<string, string> = {
    'Next.js': 'nextdotjs',
    'Node.js': 'nodedotjs',
    'Express.js': 'express',
    'Vue.js': 'vuedotjs',
    'Nuxt.js': 'nuxtdotjs',
    'Deno.js': 'denodotjs',
    RxJS: 'rxjs',
  };

  const normalized = skillName.trim();

  if (customSlugs[normalized]) {
    return customSlugs[normalized];
  }

  return normalized.toLowerCase().replace(/\s+/g, '').replace(/\./g, 'dot');
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
  const byKind = (k: string) => links.find((l) => l.kind === k && l.url);
  return byKind('live') || byKind('repo') || links[0] || null;
}

export function makeBlogQueryString(q: BlogsQueryRequired) {
  return makeQueryStringFromFilter(q, () => {
    const filter: BlogFilter = {};
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
    p: q.page,
    pp: q.perPage,
    s: q.sort,
    q: q.search ?? '',
    t: q.tags ?? [],
    f: q.isFeatured ?? null,
    st: q.status ?? 'published',
    a: q.author ?? '',
  });
}

export function makeProjectQueryString(q: ProjectsQueryRequired) {
  return makeQueryStringFromFilter(q, () => {
    const filter: ProjectFilter = {};
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
    p: q.page,
    pp: q.perPage,
    s: q.sort,
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

export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err && 'message' in err && typeof (err as any).message === 'string') {
    return (err as { message: string }).message;
  }
  if (typeof err === 'object' && err && 'msg' in err && typeof (err as any).msg === 'string') {
    return (err as { msg: string }).msg;
  }
  return 'Failed to fetch blogs';
}

export function isAbort(err: unknown): boolean | null {
  return (
    (err instanceof Error && err.name === 'AbortError') ||
    (typeof err === 'object' && err && 'name' in err && (err as { name?: string }).name === 'AbortError')
  );
}

export const arrToCsv = (a?: string[]) => (a && a.length ? a.join(',') : '');
export const csvToArr = (s?: string | null) =>
  s
    ? s
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean)
    : [];

export function extractApiErrors(err: any): { fieldErrors: Record<string,string>; global: string } {
  const fe: Record<string,string> = {};
  const data = err?.response?.data ?? err;
  const arr = data?.error || data?.errors;
  if (Array.isArray(arr)) {
    arr.forEach((e: any) => {
      if (e?.field && e?.message) fe[e.field] = String(e.message);
    });
  }
  const msg = data?.msg || data?.message || err?.message || "Something went wrong";
  return { fieldErrors: fe, global: msg };
}