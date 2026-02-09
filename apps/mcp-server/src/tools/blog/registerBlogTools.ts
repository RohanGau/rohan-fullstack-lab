import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { BlogApiClient } from '../../apiClient.js';
import { MCP_TOOL_NAMES } from '../../contracts.js';
import { toolFailure, toolSuccess } from '../toolResponse.js';
import {
  createDraftInputShape,
  deleteDraftInputShape,
  getByIdOrSlugInputShape,
  listRecentInputShape,
  publishInputShape,
  updateDraftInputShape,
} from './schemas.js';

function ensureSingleLookupKey(input: { id?: string; slug?: string }): void {
  const provided = Number(Boolean(input.id?.trim())) + Number(Boolean(input.slug?.trim()));
  if (provided !== 1) {
    throw new Error('Provide exactly one lookup key: id or slug.');
  }
}

function ensureUpdatePatch(input: {
  title?: string;
  slug?: string;
  content?: string;
  summary?: string;
  author?: string;
  tags?: string[];
  links?: unknown[];
  coverImageUrl?: string;
  readingTime?: number;
  isFeatured?: boolean;
}): void {
  const hasPatchField =
    input.title !== undefined ||
    input.slug !== undefined ||
    input.content !== undefined ||
    input.summary !== undefined ||
    input.author !== undefined ||
    input.tags !== undefined ||
    input.links !== undefined ||
    input.coverImageUrl !== undefined ||
    input.readingTime !== undefined ||
    input.isFeatured !== undefined;

  if (!hasPatchField) {
    throw new Error('At least one draft field must be provided for update.');
  }
}

export interface RegisterBlogToolsOptions {
  api: BlogApiClient;
  allowBlogPublish: boolean;
}

export function registerBlogTools(server: McpServer, options: RegisterBlogToolsOptions): void {
  const { api, allowBlogPublish } = options;

  server.tool(
    MCP_TOOL_NAMES.BLOGS_CREATE_DRAFT,
    'Create a draft blog post in the API using server-side token auth.',
    createDraftInputShape,
    async (input, _extra) => {
      try {
        const result = await api.createBlogDraft(input);
        return toolSuccess(
          `Draft blog created.\n- id: ${result.blog.id}\n- slug: ${result.blog.slug}\n- status: ${result.blog.status}\n- requestId: ${result.meta.requestId ?? 'n/a'}\n- idempotency: ${result.meta.idempotencyStatus ?? 'n/a'}`
        );
      } catch (error) {
        return toolFailure('Failed to create draft blog', error);
      }
    }
  );

  server.tool(
    MCP_TOOL_NAMES.BLOGS_LIST_RECENT,
    'List recent blog posts for review, filtered by optional status/search/tag.',
    listRecentInputShape,
    async (input, _extra) => {
      try {
        const result = await api.listRecentBlogs(input);
        const preview = result.blogs
          .map((blog) => `- ${blog.id} | ${blog.status} | ${blog.title}`)
          .join('\n');

        return toolSuccess(
          `Fetched ${result.blogs.length} blogs (total=${result.total}).\n${preview || '- no results'}`
        );
      } catch (error) {
        return toolFailure('Failed to list blogs', error);
      }
    }
  );

  server.tool(
    MCP_TOOL_NAMES.BLOGS_GET_BY_ID_OR_SLUG,
    'Get one blog by id or slug for inspection and review workflows.',
    getByIdOrSlugInputShape,
    async (input, _extra) => {
      try {
        ensureSingleLookupKey(input);
        const result = await api.getBlogByIdOrSlug(input);
        return toolSuccess(
          `Blog loaded.\n- lookup: ${result.lookup}\n- id: ${result.blog.id}\n- slug: ${result.blog.slug}\n- status: ${result.blog.status}\n- title: ${result.blog.title}\n- requestId: ${result.meta.requestId ?? 'n/a'}`
        );
      } catch (error) {
        return toolFailure('Failed to get blog', error);
      }
    }
  );

  server.tool(
    MCP_TOOL_NAMES.BLOGS_UPDATE_DRAFT,
    'Update an existing draft blog. Non-draft blogs are rejected.',
    updateDraftInputShape,
    async (input, _extra) => {
      try {
        ensureUpdatePatch(input);
        const result = await api.updateDraftBlog(input);
        return toolSuccess(
          `Draft blog updated.\n- id: ${result.blog.id}\n- slug: ${result.blog.slug}\n- status: ${result.blog.status}\n- requestId: ${result.meta.requestId ?? 'n/a'}\n- idempotency: ${result.meta.idempotencyStatus ?? 'n/a'}`
        );
      } catch (error) {
        return toolFailure('Failed to update draft blog', error);
      }
    }
  );

  server.tool(
    MCP_TOOL_NAMES.BLOGS_DELETE_DRAFT,
    'Delete an existing draft blog by id. Non-draft blogs are rejected.',
    deleteDraftInputShape,
    async (input, _extra) => {
      try {
        const result = await api.deleteDraftBlog(input);
        return toolSuccess(
          `Draft blog deleted.\n- id: ${result.id}\n- deleted: ${result.deleted}\n- requestId: ${result.meta.requestId ?? 'n/a'}\n- idempotency: ${result.meta.idempotencyStatus ?? 'n/a'}`
        );
      } catch (error) {
        return toolFailure('Failed to delete draft blog', error);
      }
    }
  );

  server.tool(
    MCP_TOOL_NAMES.BLOGS_PUBLISH_BLOG,
    'Publish an existing blog by id. Disabled unless MCP_ALLOW_BLOG_PUBLISH=true.',
    publishInputShape,
    async (input, _extra) => {
      if (!allowBlogPublish) {
        return toolFailure(
          'Failed to publish blog',
          'Blog publish is disabled. Set MCP_ALLOW_BLOG_PUBLISH=true to enable this tool.'
        );
      }

      try {
        const result = await api.publishBlog(input);
        return toolSuccess(
          `Blog published.\n- id: ${result.blog.id}\n- slug: ${result.blog.slug}\n- status: ${result.blog.status}\n- publishedAt: ${String(result.blog.publishedAt ?? '')}\n- requestId: ${result.meta.requestId ?? 'n/a'}`
        );
      } catch (error) {
        return toolFailure('Failed to publish blog', error);
      }
    }
  );
}
