import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiClient';
import { API } from '@/lib/constant';
import { useBlogStore } from '@/lib/store/blogStore';
import { Blog } from '@/types/blog';

export function useBlogs() {
  const { blogs, setBlogs } = useBlogStore();
  const [loading, setLoading] = useState(!blogs);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!blogs) {
      apiFetch<Blog[]>(API.BLOGS)
        .then((data) => {
          setBlogs(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [blogs, setBlogs]);

  return { blogs, loading, error };
}
