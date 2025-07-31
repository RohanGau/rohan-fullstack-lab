import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiClient';
import { API } from '@/lib/constant';
import { useBlogStore } from '@/lib/store/blogStore';
import { Blog } from '@/types/blog';

export function useBlogDetail(id: string) {
  const { blogDetails, setBlogDetail } = useBlogStore();
  const cachedBlog = blogDetails[id];
  const [blog, setBlog] = useState<Blog | null>(cachedBlog || null);
  const [loading, setLoading] = useState(!cachedBlog);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cachedBlog) {
      apiFetch<Blog>(`${API.BLOGS}/${id}`)
        .then((data) => {
          setBlog(data);
          setBlogDetail(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [id, cachedBlog, setBlogDetail]);

  return { blog, loading, error };
}
