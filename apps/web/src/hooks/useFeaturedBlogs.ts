import { useBlogs } from './useBlogs';

export function useFeaturedBlogs(limit = 3) {
  const { data, loading, error, query, setQuery, refetch } = useBlogs({
    page: 1,
    perPage: limit,
    isFeatured: true,
    status: 'published',
    sort: ['publishedAt', 'DESC'],
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
