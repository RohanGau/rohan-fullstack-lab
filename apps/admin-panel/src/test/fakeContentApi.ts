import { API_PATHS, BLOG_STATUS, SLOT_STATUS } from '@fullstack-lab/constants';
import type { IBlogDto, IProfileDto, IProjectDto, ISlotDto, Jsonified } from '@fullstack-lab/types';
import { http, HttpResponse } from 'msw';
import { API_URL, server } from './server';

export type BlogDtoRow = Jsonified<IBlogDto>;
export type ProfileDtoRow = Jsonified<IProfileDto>;
export type ProjectDtoRow = Jsonified<IProjectDto>;
export type SlotDtoRow = Jsonified<ISlotDto>;

export function makeBlogs(): BlogDtoRow[] {
  return [
    {
      id: 'blog-1',
      title: 'Designing Clean Monorepos',
      slug: 'designing-clean-monorepos',
      summary: 'Architectural lessons across workspace packages',
      content: 'Full article body about monorepos and shared contracts.',
      tags: ['architecture', 'typescript'],
      links: [{ url: 'https://example.com/repo', label: 'Source', kind: 'repo' }],
      author: 'Rohan Kumar',
      status: BLOG_STATUS.PUBLISHED,
      isFeatured: true,
      readingTime: 6,
      createdAt: '2026-01-10T10:00:00.000Z',
      updatedAt: '2026-01-15T10:00:00.000Z',
    },
    {
      id: 'blog-2',
      title: 'Edge Caching Draft',
      slug: 'edge-caching-draft',
      summary: 'Notes on stale-while-revalidate headers',
      content: 'Draft notes on CDN behavior.',
      tags: ['cdn'],
      links: [],
      author: 'Ada Lovelace',
      status: BLOG_STATUS.DRAFT,
      isFeatured: false,
      createdAt: '2026-01-05T10:00:00.000Z',
      updatedAt: '2026-01-05T10:00:00.000Z',
    },
  ];
}

export function makeProjects(): ProjectDtoRow[] {
  return [
    {
      id: 'proj-1',
      title: 'Telemetry Dashboard',
      description: 'Real-time service health inspector built with React and Fastify.',
      types: ['web', 'api'],
      techStack: ['React', 'TypeScript', 'MongoDB'],
      company: 'Lab Corp',
      role: 'Lead Engineer',
      year: 2026,
      isFeatured: true,
      features: ['Live health checks', 'Zero-downtime deploys'],
      links: [{ url: 'https://demo.example.com', label: 'Live Demo', kind: 'demo' }],
      createdAt: '2026-01-02T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    },
  ];
}

export function makeProfiles(): ProfileDtoRow[] {
  return [
    {
      id: 'prof-1',
      name: 'Rohan Kumar',
      email: 'rohan@example.com',
      title: 'Staff Fullstack Engineer',
      yearsOfExperience: 9,
      location: 'Bengaluru',
      bio: 'Building resilient distributed systems and polished UIs.',
      skills: [{ name: 'TypeScript', rating: 9, yearsOfExperience: 7 }],
      topSkills: ['TypeScript', 'React'],
      allTechStack: ['TypeScript', 'React', 'Node.js'],
      impact: ['Cut bundle size by 30%'],
      architectureAreas: [{ title: 'Platform', topics: ['SSO', 'Monorepos'] }],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-20T00:00:00.000Z',
    },
  ];
}

export function makeSlots(): SlotDtoRow[] {
  return [
    {
      id: 'slot-1',
      name: 'Grace Hopper',
      email: 'grace@example.com',
      date: '2026-05-01T14:00:00.000Z',
      duration: 30,
      status: SLOT_STATUS.BOOKED,
      message: 'Architecture review call',
      createdAt: '2026-01-10T09:00:00.000Z',
      updatedAt: '2026-01-10T09:00:00.000Z',
    },
    {
      id: 'slot-2',
      name: 'Linus Torvalds',
      email: 'linus@example.com',
      date: '2026-05-02T16:00:00.000Z',
      duration: 60,
      status: SLOT_STATUS.CANCELLED,
      message: 'Rescheduling for next week',
      createdAt: '2026-01-11T09:00:00.000Z',
      updatedAt: '2026-01-11T09:00:00.000Z',
    },
  ];
}

function bearerToken(request: Request): string | null {
  const header = request.headers.get('authorization');
  return header?.startsWith('Bearer ') ? header.slice(7) : null;
}

export function fakeContentApi(
  auth?: { acceptsAccessToken(token: string): boolean },
  seed?: {
    blogs?: BlogDtoRow[];
    projects?: ProjectDtoRow[];
    profiles?: ProfileDtoRow[];
    slots?: SlotDtoRow[];
    existingAssetKeys?: string[];
  }
) {
  let blogs = (seed?.blogs ?? makeBlogs()).map((b) => ({ ...b }));
  let projects = (seed?.projects ?? makeProjects()).map((p) => ({ ...p }));
  let profiles = (seed?.profiles ?? makeProfiles()).map((p) => ({ ...p }));
  let slots = (seed?.slots ?? makeSlots()).map((s) => ({ ...s }));
  const r2Keys = new Set<string>(seed?.existingAssetKeys ?? ['uploads/2026/02/existing.png']);
  let failNextBlogCreate: { msg: string; error: { field: string; message: string }[] } | null =
    null;
  let failNextR2Put = false;
  let counter = 50;

  function authorize(request: Request): Response | null {
    if (!auth) return null;
    const token = bearerToken(request);
    if (!token || !auth.acceptsAccessToken(token)) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return null;
  }

  server.use(
    // ---- HEALTH ----
    http.get(`${API_URL}/health`, () =>
      HttpResponse.json({
        status: 'healthy',
        timestamp: '2026-11-27T00:00:00.000Z',
        uptime: 3665,
        checks: {
          mongodb: { status: 'up', latency: 4 },
          redis: { status: 'up', latency: 2 },
        },
        system: {
          memory: {
            heapUsed: '128 MB',
            heapTotal: '512 MB',
            rss: '200 MB',
          },
        },
      })
    ),

    // ---- BLOGS ----
    http.get(`${API_URL}${API_PATHS.BLOGS}`, ({ request }) => {
      const denied = authorize(request);
      if (denied) return denied;
      const url = new URL(request.url);
      const filter = JSON.parse(url.searchParams.get('filter') ?? '{}') as Record<string, unknown>;
      const matching = blogs.filter((row) => {
        if (typeof filter.status === 'string' && row.status !== filter.status) return false;
        if (typeof filter.isFeatured === 'boolean' && row.isFeatured !== filter.isFeatured) {
          return false;
        }
        if (
          typeof filter.q === 'string' &&
          !row.title.toLowerCase().includes(filter.q.toLowerCase())
        ) {
          return false;
        }
        return true;
      });
      return HttpResponse.json(matching, {
        headers: { 'X-Total-Count': String(matching.length) },
      });
    }),
    http.post(`${API_URL}${API_PATHS.BLOGS}`, async ({ request }) => {
      const denied = authorize(request);
      if (denied) return denied;
      if (failNextBlogCreate) {
        const err = failNextBlogCreate;
        failNextBlogCreate = null;
        return HttpResponse.json(err, { status: 400 });
      }
      const body = (await request.json()) as Partial<BlogDtoRow>;
      counter += 1;
      const now = new Date().toISOString();
      const created: BlogDtoRow = {
        id: `blog-${counter}`,
        title: body.title ?? '',
        slug: body.slug ?? 'generated-slug',
        summary: body.summary,
        content: body.content ?? '',
        tags: body.tags ?? [],
        links: body.links ?? [],
        author: body.author ?? '',
        status: body.status ?? BLOG_STATUS.DRAFT,
        isFeatured: Boolean(body.isFeatured),
        readingTime: body.readingTime,
        coverImageUrl: body.coverImageUrl,
        publishedAt: body.publishedAt,
        createdAt: now,
        updatedAt: now,
      };
      blogs = [created, ...blogs];
      return HttpResponse.json(created, { status: 201 });
    }),
    http.put(`${API_URL}${API_PATHS.BLOGS}/:id`, async ({ request, params }) => {
      const denied = authorize(request);
      if (denied) return denied;
      const idx = blogs.findIndex((b) => b.id === params.id);
      if (idx === -1) return HttpResponse.json({ message: 'Blog not found' }, { status: 404 });
      const body = (await request.json()) as Partial<BlogDtoRow>;
      const updated = { ...blogs[idx]!, ...body, updatedAt: new Date().toISOString() };
      blogs[idx] = updated;
      return HttpResponse.json(updated);
    }),
    http.delete(`${API_URL}${API_PATHS.BLOGS}/:id`, ({ request, params }) => {
      const denied = authorize(request);
      if (denied) return denied;
      blogs = blogs.filter((b) => b.id !== params.id);
      return HttpResponse.json({ message: 'Deleted' });
    }),

    // ---- PROJECTS ----
    http.get(`${API_URL}${API_PATHS.PROJECTS}`, ({ request }) => {
      const denied = authorize(request);
      if (denied) return denied;
      const url = new URL(request.url);
      const filter = JSON.parse(url.searchParams.get('filter') ?? '{}') as Record<string, unknown>;
      const matching = projects.filter((row) => {
        if (typeof filter.isFeatured === 'boolean' && row.isFeatured !== filter.isFeatured) {
          return false;
        }
        return true;
      });
      return HttpResponse.json(matching, {
        headers: { 'X-Total-Count': String(matching.length) },
      });
    }),
    http.post(`${API_URL}${API_PATHS.PROJECTS}`, async ({ request }) => {
      const denied = authorize(request);
      if (denied) return denied;
      const body = (await request.json()) as Partial<ProjectDtoRow>;
      counter += 1;
      const now = new Date().toISOString();
      const created: ProjectDtoRow = {
        id: `proj-${counter}`,
        title: body.title ?? '',
        description: body.description ?? '',
        types: body.types ?? [],
        techStack: body.techStack ?? [],
        company: body.company,
        role: body.role,
        year: body.year,
        thumbnailUrl: body.thumbnailUrl,
        isFeatured: Boolean(body.isFeatured),
        features: body.features ?? [],
        links: body.links ?? [],
        createdAt: now,
        updatedAt: now,
      };
      projects = [created, ...projects];
      return HttpResponse.json(created, { status: 201 });
    }),
    http.put(`${API_URL}${API_PATHS.PROJECTS}/:id`, async ({ request, params }) => {
      const denied = authorize(request);
      if (denied) return denied;
      const idx = projects.findIndex((p) => p.id === params.id);
      if (idx === -1) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
      const body = (await request.json()) as Partial<ProjectDtoRow>;
      const updated = { ...projects[idx]!, ...body, updatedAt: new Date().toISOString() };
      projects[idx] = updated;
      return HttpResponse.json(updated);
    }),
    http.delete(`${API_URL}${API_PATHS.PROJECTS}/:id`, ({ request, params }) => {
      const denied = authorize(request);
      if (denied) return denied;
      projects = projects.filter((p) => p.id !== params.id);
      return HttpResponse.json({ message: 'Deleted' });
    }),

    // ---- PROFILES ----
    http.get(`${API_URL}${API_PATHS.PROFILES}`, ({ request }) => {
      const denied = authorize(request);
      if (denied) return denied;
      return HttpResponse.json(profiles, {
        headers: { 'X-Total-Count': String(profiles.length) },
      });
    }),
    http.post(`${API_URL}${API_PATHS.PROFILES}`, async ({ request }) => {
      const denied = authorize(request);
      if (denied) return denied;
      const body = (await request.json()) as Partial<ProfileDtoRow>;
      counter += 1;
      const now = new Date().toISOString();
      const created: ProfileDtoRow = {
        id: `prof-${counter}`,
        name: body.name ?? '',
        email: body.email ?? '',
        title: body.title ?? '',
        yearsOfExperience: body.yearsOfExperience ?? 0,
        skills: body.skills ?? [],
        topSkills: body.topSkills ?? [],
        allTechStack: body.allTechStack ?? [],
        impact: body.impact ?? [],
        architectureAreas: body.architectureAreas ?? [],
        createdAt: now,
        updatedAt: now,
      };
      profiles = [created, ...profiles];
      // Matches API profileController.createProfile response contract: { data: result }
      return HttpResponse.json({ data: created }, { status: 201 });
    }),
    http.put(`${API_URL}${API_PATHS.PROFILES}/:id`, async ({ request, params }) => {
      const denied = authorize(request);
      if (denied) return denied;
      const idx = profiles.findIndex((p) => p.id === params.id);
      if (idx === -1) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
      const body = (await request.json()) as Partial<ProfileDtoRow>;
      const updated = { ...profiles[idx]!, ...body, updatedAt: new Date().toISOString() };
      profiles[idx] = updated;
      return HttpResponse.json(updated);
    }),
    http.delete(`${API_URL}${API_PATHS.PROFILES}/:id`, ({ request, params }) => {
      const denied = authorize(request);
      if (denied) return denied;
      profiles = profiles.filter((p) => p.id !== params.id);
      return HttpResponse.json({ message: 'Deleted' });
    }),

    // ---- SLOTS ----
    http.get(`${API_URL}${API_PATHS.SLOTS}`, ({ request }) => {
      const denied = authorize(request);
      if (denied) return denied;
      const url = new URL(request.url);
      const filter = JSON.parse(url.searchParams.get('filter') ?? '{}') as Record<string, unknown>;
      const matching = slots.filter((row) => {
        if (typeof filter.status === 'string' && row.status !== filter.status) return false;
        if (typeof filter.email === 'string' && row.email !== filter.email) return false;
        return true;
      });
      return HttpResponse.json(matching, {
        headers: { 'X-Total-Count': String(matching.length) },
      });
    }),
    http.put(`${API_URL}${API_PATHS.SLOTS}/:id`, async ({ request, params }) => {
      const denied = authorize(request);
      if (denied) return denied;
      const idx = slots.findIndex((s) => s.id === params.id);
      if (idx === -1) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
      const body = (await request.json()) as Partial<SlotDtoRow>;
      const updated = { ...slots[idx]!, ...body, updatedAt: new Date().toISOString() };
      slots[idx] = updated;
      return HttpResponse.json(updated);
    }),
    http.delete(`${API_URL}${API_PATHS.SLOTS}/:id`, ({ request, params }) => {
      const denied = authorize(request);
      if (denied) return denied;
      slots = slots.filter((s) => s.id !== params.id);
      return HttpResponse.json({ message: 'Deleted' });
    }),

    // ---- UPLOADS (R2 PRESIGN + PUT + DELETE) ----
    http.post(`${API_URL}${API_PATHS.UPLOADS}/generate-upload-url`, async ({ request }) => {
      const denied = authorize(request);
      if (denied) return denied;
      const body = (await request.json()) as { filename: string; contentType: string };
      counter += 1;
      const key = `uploads/2026/11/${counter}-${body.filename}`;
      r2Keys.add(key);
      return HttpResponse.json({
        uploadUrl: `/r2-mock/${key}`,
        key,
        cdnUrl: `https://cdn.example.com/${key}`,
      });
    }),
    http.put('/r2-mock/*', () => {
      if (failNextR2Put) {
        failNextR2Put = false;
        return new HttpResponse(null, { status: 500, statusText: 'R2 Write Error' });
      }
      return new HttpResponse(null, { status: 200 });
    }),
    http.delete(`${API_URL}${API_PATHS.UPLOADS}`, async ({ request }) => {
      const denied = authorize(request);
      if (denied) return denied;
      const body = (await request.json()) as { key?: string };
      if (!body.key || !r2Keys.has(body.key)) {
        return HttpResponse.json({ message: 'Object not found in bucket' }, { status: 404 });
      }
      r2Keys.delete(body.key);
      return new HttpResponse(null, { status: 204 });
    })
  );

  return {
    failNextBlogCreate: (msg: string, error: { field: string; message: string }[]) => {
      failNextBlogCreate = { msg, error };
    },
    failNextR2Put: () => {
      failNextR2Put = true;
    },
    hasAssetKey: (key: string) => r2Keys.has(key),
  };
}
