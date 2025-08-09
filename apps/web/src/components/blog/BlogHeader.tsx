'use client';

import type { IBlogDto } from '@fullstack-lab/types';
import { BlogMeta } from './BlogMeta';
import { BlogTags } from './BlogTags';

export function BlogHeader({ blog }: { blog: IBlogDto }) {
  return (
    <header className="space-y-3">
      <h1 className="text-3xl font-bold leading-tight">{blog.title}</h1>
      <BlogMeta blog={blog} />
      <BlogTags tags={blog.tags} />
    </header>
  );
}
