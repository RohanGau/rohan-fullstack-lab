import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiClient';
import { API } from '@/lib/constant';
import { IBlogDto } from '@fullstack-lab/types';
import { useBlogStore } from '@/lib/store/blogStore';

export function useFeaturedBlogs() {
  const { featureBlogs, setFeatureBlogs } = useBlogStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!featureBlogs) {
      setLoading(true);
      const queryParams = new URLSearchParams({
        sort: JSON.stringify(['createdAt', 'DESC']),
        range: JSON.stringify([0, 2]),
      });
      apiFetch<IBlogDto[]>(`${API.BLOGS}?${queryParams.toString()}`)
        .then((data) => {
          setFeatureBlogs(data);
          setError(null);
        })
        .catch((err) => {
          console.error(err);
          setError(err.msg || 'Failed to fetch featured blogs');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [featureBlogs, setFeatureBlogs]);

  return { featureBlogs, loading, error };
}