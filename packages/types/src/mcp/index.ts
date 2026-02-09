import type { BlogLink, BlogStatus, IBlogDto } from '../blog';

export interface IMcpApiMeta {
  requestId?: string;
  idempotencyKey?: string;
  idempotencyStatus?: string;
}

export interface IMcpCreateBlogDraftInput {
  title: string;
  content: string;
  author: string;
  summary?: string;
  slug?: string;
  tags?: string[];
  links?: BlogLink[];
  coverImageUrl?: string;
  readingTime?: number;
  isFeatured?: boolean;
}

export interface IMcpCreateBlogDraftResult {
  meta: IMcpApiMeta;
  blog: IBlogDto;
}

export interface IMcpGetBlogByIdOrSlugInput {
  id?: string;
  slug?: string;
  status?: BlogStatus;
}

export interface IMcpGetBlogByIdOrSlugResult {
  meta: IMcpApiMeta;
  lookup: 'id' | 'slug';
  blog: IBlogDto;
}

export interface IMcpUpdateDraftBlogInput {
  id: string;
  title?: string;
  slug?: string;
  content?: string;
  summary?: string;
  author?: string;
  tags?: string[];
  links?: BlogLink[];
  coverImageUrl?: string;
  readingTime?: number;
  isFeatured?: boolean;
}

export interface IMcpUpdateDraftBlogResult {
  meta: IMcpApiMeta;
  blog: IBlogDto;
}

export interface IMcpDeleteDraftBlogInput {
  id: string;
}

export interface IMcpDeleteDraftBlogResult {
  meta: IMcpApiMeta;
  id: string;
  deleted: true;
}

export interface IMcpPublishBlogInput {
  id: string;
  publishedAt?: string;
}

export interface IMcpPublishBlogResult {
  meta: IMcpApiMeta;
  blog: IBlogDto;
}

export interface IMcpListRecentBlogsInput {
  limit?: number;
  status?: BlogStatus;
  search?: string;
  tag?: string;
}

export interface IMcpListRecentBlogsResult {
  meta: IMcpApiMeta;
  total: number;
  blogs: IBlogDto[];
}
