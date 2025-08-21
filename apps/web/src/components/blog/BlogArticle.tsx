import { Separator } from '@/components/ui/separator';
import { BackToBlogButton } from '@/components/blog/BackToBlogButton';
import { MarkdownRenderer } from '@/components/blog/MarkdownRenderer';
import type { IBlogDto } from '@fullstack-lab/types';
import { BlogCover } from './ BlogCover';
import { BlogHeader } from './BlogHeader';
import { BlogLinks } from './BlogLinks';

function BlogArticle({ blog }: { blog: IBlogDto }) {
  return (
    <article className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      <BackToBlogButton className="mb-2 text-muted-foreground" />

      <BlogCover title={blog.title} coverImageUrl={blog.coverImageUrl} />

      <BlogHeader blog={blog} />

      {blog.summary ? (
        <>
          <Separator />
          <p className="text-base text-muted-foreground">{blog.summary}</p>
        </>
      ) : null}

      <Separator />
      <MarkdownRenderer markdown={blog.content} />

      {blog.links?.length ? (
        <>
          <Separator />
          <BlogLinks links={blog.links} />
        </>
      ) : null}
    </article>
  );
}

export default BlogArticle;
