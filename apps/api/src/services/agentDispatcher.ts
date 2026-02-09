import mongoose from 'mongoose';
import { z } from 'zod';
import { BLOG_STATUS, BLOG_STATUS_VALUES, MCP_TOOL_NAMES } from '@fullstack-lab/constants';
import type { AgentToolName } from '@fullstack-lab/types';
import Blog from '../models/Blog';
import { buildBlogQuery, normalizeBlogBody } from '../utils/blog';

const listRecentInputSchema = z
  .object({
    limit: z.number().int().min(1).max(100).optional(),
    status: z.enum(BLOG_STATUS_VALUES).optional(),
    search: z.string().max(200).optional(),
    tag: z.string().max(80).optional(),
  })
  .strict();

const createDraftInputSchema = z
  .object({
    title: z.string().min(3).max(180),
    content: z.string().min(10),
    author: z.string().min(1),
    summary: z.string().max(500).optional(),
    slug: z
      .string()
      .regex(/^[a-z0-9-]+$/)
      .optional(),
    tags: z.array(z.string().min(1)).optional(),
    links: z
      .array(
        z.object({
          url: z.string().url(),
          label: z.string().max(80).optional(),
          kind: z.enum(['repo', 'ref', 'demo', 'other']).optional(),
        })
      )
      .optional(),
    coverImageUrl: z.string().url().optional(),
    readingTime: z.number().int().min(1).max(120).optional(),
    isFeatured: z.boolean().optional(),
  })
  .strict();

const getByIdOrSlugInputSchema = z
  .object({
    id: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
    status: z.enum(BLOG_STATUS_VALUES).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    const provided = Number(Boolean(value.id)) + Number(Boolean(value.slug));
    if (provided !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Provide exactly one of id or slug',
      });
    }
  });

const updateDraftInputSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(3).max(180).optional(),
    slug: z
      .string()
      .regex(/^[a-z0-9-]+$/)
      .optional(),
    content: z.string().min(10).optional(),
    summary: z.string().max(500).optional(),
    author: z.string().min(1).optional(),
    tags: z.array(z.string().min(1)).optional(),
    links: z
      .array(
        z.object({
          url: z.string().url(),
          label: z.string().max(80).optional(),
          kind: z.enum(['repo', 'ref', 'demo', 'other']).optional(),
        })
      )
      .optional(),
    coverImageUrl: z.string().url().optional(),
    readingTime: z.number().int().min(1).max(120).optional(),
    isFeatured: z.boolean().optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    const hasPatch =
      value.title !== undefined ||
      value.slug !== undefined ||
      value.content !== undefined ||
      value.summary !== undefined ||
      value.author !== undefined ||
      value.tags !== undefined ||
      value.links !== undefined ||
      value.coverImageUrl !== undefined ||
      value.readingTime !== undefined ||
      value.isFeatured !== undefined;

    if (!hasPatch) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least one draft field must be provided for update',
      });
    }
  });

const deleteDraftInputSchema = z
  .object({
    id: z.string().min(1),
  })
  .strict();

const publishInputSchema = z
  .object({
    id: z.string().min(1),
    publishedAt: z.string().datetime().optional(),
  })
  .strict();

function assertObjectId(id: string): void {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid blog id');
  }
}

function assertDraftStatus(blog: { status?: string }, operation: 'update' | 'delete'): void {
  if (blog.status === BLOG_STATUS.DRAFT) return;
  throw new Error(
    `Only draft blogs can be ${operation}d via this tool. Current status=${String(blog.status ?? 'unknown')}`
  );
}

function toPublicBlogShape(blog: any) {
  return {
    id: String(blog.id ?? blog._id),
    title: blog.title,
    slug: blog.slug,
    summary: blog.summary,
    author: blog.author,
    tags: blog.tags ?? [],
    links: blog.links ?? [],
    coverImageUrl: blog.coverImageUrl,
    readingTime: blog.readingTime,
    isFeatured: blog.isFeatured,
    status: blog.status,
    publishedAt: blog.publishedAt,
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt,
  };
}

async function executeListRecent(rawInput: unknown) {
  const input = listRecentInputSchema.parse(rawInput ?? {});
  const limit = input.limit ?? 20;

  const filter: Record<string, unknown> = {};
  if (input.status) filter.status = input.status;
  if (input.search?.trim()) filter.q = input.search.trim();
  if (input.tag?.trim()) filter.tags = [input.tag.trim().toLowerCase()];

  const mongoFilter = buildBlogQuery(filter);
  const [total, blogs] = await Promise.all([
    Blog.countDocuments(mongoFilter),
    Blog.find(mongoFilter).sort({ publishedAt: -1 }).limit(limit).lean({ virtuals: true }),
  ]);

  return {
    total,
    blogs: blogs.map((blog) => toPublicBlogShape(blog)),
  };
}

async function executeCreateDraft(rawInput: unknown) {
  const input = createDraftInputSchema.parse(rawInput ?? {});
  const payload = normalizeBlogBody({
    ...input,
    status: BLOG_STATUS.DRAFT,
  });

  const created = await new Blog(payload).save();
  return toPublicBlogShape(created.toJSON());
}

async function executeGetByIdOrSlug(rawInput: unknown) {
  const input = getByIdOrSlugInputSchema.parse(rawInput ?? {});

  if (input.id) {
    assertObjectId(input.id);
    const found = await Blog.findById(input.id);
    if (!found) throw new Error('Blog not found');
    return toPublicBlogShape(found.toJSON());
  }

  const filter: Record<string, unknown> = { slug: input.slug!.trim().toLowerCase() };
  if (input.status) filter.status = input.status;

  const found = await Blog.findOne(filter);
  if (!found) throw new Error('Blog not found');
  return toPublicBlogShape(found.toJSON());
}

async function executeUpdateDraft(rawInput: unknown) {
  const input = updateDraftInputSchema.parse(rawInput ?? {});
  assertObjectId(input.id);

  const existing = await Blog.findById(input.id);
  if (!existing) throw new Error('Blog not found');
  assertDraftStatus(existing, 'update');

  const normalized = normalizeBlogBody(input);
  const mutableFields = [
    'title',
    'slug',
    'content',
    'summary',
    'author',
    'tags',
    'links',
    'coverImageUrl',
    'readingTime',
    'isFeatured',
  ] as const;

  const updatePayload: Record<string, unknown> = {};
  for (const field of mutableFields) {
    if (normalized[field] !== undefined) {
      updatePayload[field] = normalized[field];
    }
  }

  const updated = await Blog.findByIdAndUpdate(input.id, { $set: updatePayload }, { new: true });
  if (!updated) throw new Error('Blog not found after update');

  return toPublicBlogShape(updated.toJSON());
}

async function executeDeleteDraft(rawInput: unknown) {
  const input = deleteDraftInputSchema.parse(rawInput ?? {});
  assertObjectId(input.id);

  const existing = await Blog.findById(input.id);
  if (!existing) throw new Error('Blog not found');
  assertDraftStatus(existing, 'delete');

  await Blog.findByIdAndDelete(input.id);
  return {
    id: input.id,
    deleted: true,
  };
}

async function executePublishBlog(rawInput: unknown) {
  const input = publishInputSchema.parse(rawInput ?? {});
  assertObjectId(input.id);

  const updated = await Blog.findByIdAndUpdate(
    input.id,
    {
      $set: {
        status: BLOG_STATUS.PUBLISHED,
        publishedAt: input.publishedAt ? new Date(input.publishedAt) : new Date(),
      },
    },
    { new: true }
  );

  if (!updated) throw new Error('Blog not found');
  return toPublicBlogShape(updated.toJSON());
}

export async function executeAgentTool(
  toolName: AgentToolName,
  rawInput: unknown
): Promise<unknown> {
  switch (toolName) {
    case MCP_TOOL_NAMES.BLOGS_LIST_RECENT:
      return executeListRecent(rawInput);
    case MCP_TOOL_NAMES.BLOGS_CREATE_DRAFT:
      return executeCreateDraft(rawInput);
    case MCP_TOOL_NAMES.BLOGS_GET_BY_ID_OR_SLUG:
      return executeGetByIdOrSlug(rawInput);
    case MCP_TOOL_NAMES.BLOGS_UPDATE_DRAFT:
      return executeUpdateDraft(rawInput);
    case MCP_TOOL_NAMES.BLOGS_DELETE_DRAFT:
      return executeDeleteDraft(rawInput);
    case MCP_TOOL_NAMES.BLOGS_PUBLISH_BLOG:
      return executePublishBlog(rawInput);
    default:
      throw new Error(`Unsupported tool: ${toolName}`);
  }
}
