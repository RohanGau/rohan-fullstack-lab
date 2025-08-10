import { useProjects } from './useProjects';

export function useFeaturedProjects(limit = 3) {
  const { data, loading, error } = useProjects({
    page: 1,
    perPage: limit,
    isFeatured: true,
    sort: ['createdAt', 'DESC'],
  });
  return { featureProjects: data, loading, error };
}
