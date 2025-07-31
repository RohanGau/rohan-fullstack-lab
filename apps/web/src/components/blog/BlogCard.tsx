'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { format } from 'date-fns';
import { Blog } from '@/types/blog';

export function BlogCard({ blog }: { blog: Blog }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>{blog.title}</CardTitle>
        <p className="text-sm text-muted-foreground">By {blog.author} · {format(new Date(blog.createdAt), 'PPP')}</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-3">
          {(blog.tags || []).map((tag: string) => (
            <span key={tag} className="text-xs bg-muted px-2 py-1 rounded">{tag}</span>
          ))}
        </div>
        <Link
          href={`/blog/${blog.id}`}
          className="text-primary text-sm hover:underline"
        >
          Read More →
        </Link>
      </CardContent>
    </Card>
  );
}
