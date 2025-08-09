'use client';
import { useProjects } from './useProjects';

export function useFeaturedProjects(limit = 3) {
  const {
    data, loading, error, query, setQuery, refetch,
  } = useProjects({
    page: 1,
    perPage: limit,
    isFeatured: true,
    status: 'published',
    sort: ['publishedAt','DESC'],
  });

  return {
    featureBlogs: data,
    loading,
    error,
    refetch,
    query,
    setQuery,
  };
}
