import { randomUUID } from 'node:crypto';
import type {
  BlogStatus,
  IMcpCreateBlogDraftInput,
  IMcpCreateBlogDraftResult,
  IMcpDeleteDraftBlogInput,
  IMcpDeleteDraftBlogResult,
  IMcpGetBlogByIdOrSlugInput,
  IMcpGetBlogByIdOrSlugResult,
  IMcpListRecentBlogsInput,
  IMcpListRecentBlogsResult,
  IMcpPublishBlogInput,
  IMcpPublishBlogResult,
  IMcpUpdateDraftBlogInput,
  IMcpUpdateDraftBlogResult,
} from '../contracts.js';
import type { McpServerConfig } from '../config.js';
import { ApiHttpClient } from '../lib/apiHttpClient.js';
import {
  ensureDraftForMutation,
  ensureMaxLimit,
  normalizeBlogDto,
  parseTotalCount,
  toApiMeta,
} from './helpers.js';

export class BlogApiClient {
  private readonly http: ApiHttpClient;

  constructor(config: McpServerConfig) {
    this.http = new ApiHttpClient(config);
  }

  async createBlogDraft(input: IMcpCreateBlogDraftInput): Promise<IMcpCreateBlogDraftResult> {
    const idempotencyKey = `mcp-blog-create-${randomUUID()}`;
    const payload = {
      ...input,
      tags: input.tags ?? [],
      links: input.links ?? [],
      status: 'draft' as const,
    };

    const { data, headers } = await this.http.requestJson<IMcpCreateBlogDraftResult['blog']>(
      '/blogs',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      { idempotencyKey }
    );

    return {
      blog: normalizeBlogDto(data),
      meta: toApiMeta(headers, idempotencyKey),
    };
  }

  async getBlogByIdOrSlug(input: IMcpGetBlogByIdOrSlugInput): Promise<IMcpGetBlogByIdOrSlugResult> {
    if (input.id?.trim()) {
      const id = input.id.trim();
      const { data, headers } = await this.http.requestJson<IMcpGetBlogByIdOrSlugResult['blog']>(
        `/blogs/${encodeURIComponent(id)}`,
        {
          method: 'GET',
        }
      );

      return {
        blog: normalizeBlogDto(data),
        lookup: 'id',
        meta: toApiMeta(headers),
      };
    }

    const slug = input.slug?.trim();
    if (!slug) {
      throw new Error('Provide either id or slug to retrieve a blog.');
    }

    const filter: {
      slug: string;
      status?: BlogStatus;
    } = { slug };

    if (input.status) {
      filter.status = input.status;
    }

    const query = new URLSearchParams({
      range: JSON.stringify([0, 0]),
      sort: JSON.stringify(['updatedAt', 'DESC']),
      filter: JSON.stringify(filter),
    });

    const { data, headers } = await this.http.requestJson<IMcpGetBlogByIdOrSlugResult['blog'][]>(
      `/blogs?${query.toString()}`,
      {
        method: 'GET',
      }
    );

    const blog = data[0];
    if (!blog) {
      throw new Error(`Blog not found for slug "${slug}".`);
    }

    return {
      blog: normalizeBlogDto(blog),
      lookup: 'slug',
      meta: toApiMeta(headers),
    };
  }

  async updateDraftBlog(input: IMcpUpdateDraftBlogInput): Promise<IMcpUpdateDraftBlogResult> {
    const existing = await this.getBlogByIdOrSlug({ id: input.id });
    ensureDraftForMutation(existing.blog, 'update');

    const rawPayload = {
      title: input.title,
      slug: input.slug,
      content: input.content,
      summary: input.summary,
      author: input.author,
      tags: input.tags,
      links: input.links,
      coverImageUrl: input.coverImageUrl,
      readingTime: input.readingTime,
      isFeatured: input.isFeatured,
    };

    const payload = Object.fromEntries(
      Object.entries(rawPayload).filter(([, value]) => value !== undefined)
    );

    if (Object.keys(payload).length === 0) {
      throw new Error('At least one draft field must be provided for update.');
    }

    const idempotencyKey = `mcp-blog-update-${input.id}-${randomUUID()}`;
    const { data, headers } = await this.http.requestJson<IMcpUpdateDraftBlogResult['blog']>(
      `/blogs/${encodeURIComponent(input.id)}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
      { idempotencyKey }
    );

    return {
      blog: normalizeBlogDto(data),
      meta: toApiMeta(headers, idempotencyKey),
    };
  }

  async deleteDraftBlog(input: IMcpDeleteDraftBlogInput): Promise<IMcpDeleteDraftBlogResult> {
    const existing = await this.getBlogByIdOrSlug({ id: input.id });
    ensureDraftForMutation(existing.blog, 'delete');

    const idempotencyKey = `mcp-blog-delete-${input.id}-${randomUUID()}`;
    const { headers } = await this.http.requestJson<string>(
      `/blogs/${encodeURIComponent(input.id)}`,
      {
        method: 'DELETE',
      },
      { idempotencyKey }
    );

    return {
      id: input.id,
      deleted: true,
      meta: toApiMeta(headers, idempotencyKey),
    };
  }

  async publishBlog(input: IMcpPublishBlogInput): Promise<IMcpPublishBlogResult> {
    const idempotencyKey = `mcp-blog-publish-${input.id}-${randomUUID()}`;
    const payload = {
      status: 'published',
      publishedAt: input.publishedAt || new Date().toISOString(),
    };

    const { data, headers } = await this.http.requestJson<IMcpPublishBlogResult['blog']>(
      `/blogs/${encodeURIComponent(input.id)}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
      { idempotencyKey }
    );

    return {
      blog: normalizeBlogDto(data),
      meta: toApiMeta(headers, idempotencyKey),
    };
  }

  async listRecentBlogs(input: IMcpListRecentBlogsInput): Promise<IMcpListRecentBlogsResult> {
    const limit = ensureMaxLimit(input.limit);
    const rangeEnd = Math.max(0, limit - 1);

    const filter: {
      status?: BlogStatus;
      q?: string;
      tags?: string[];
    } = {};

    if (input.status) {
      filter.status = input.status;
    }
    if (input.search?.trim()) {
      filter.q = input.search.trim();
    }
    if (input.tag?.trim()) {
      filter.tags = [input.tag.trim().toLowerCase()];
    }

    const query = new URLSearchParams({
      range: JSON.stringify([0, rangeEnd]),
      sort: JSON.stringify(['publishedAt', 'DESC']),
      filter: JSON.stringify(filter),
    });

    const { data, headers } = await this.http.requestJson<IMcpListRecentBlogsResult['blogs']>(
      `/blogs?${query.toString()}`,
      {
        method: 'GET',
      }
    );

    return {
      blogs: data.map((blog) => normalizeBlogDto(blog)),
      total: parseTotalCount(headers.get('X-Total-Count')),
      meta: toApiMeta(headers),
    };
  }
}
