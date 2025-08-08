import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiClient';
import { API } from '@/lib/constant';
import { IProjectDto } from '@fullstack-lab/types';
import { useProjectStore } from '@/lib/store/projectStore';

export function useFeaturedProjects() {
  const { featureProjects, setFeatureProjects } = useProjectStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!featureProjects) {
      setLoading(true);
      const queryParams = new URLSearchParams({
        sort: JSON.stringify(['createdAt', 'DESC']),
        range: JSON.stringify([0, 2]),
      });

      apiFetch<IProjectDto[]>(`${API.PROJECTS}?${queryParams.toString()}`)
        .then((data) => {
          setFeatureProjects(data);
          setError(null);
        })
        .catch((err) => {
          console.error(err);
          setError(err.msg || 'Failed to fetch featured projects');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [featureProjects, setFeatureProjects]);

  return { featureProjects, loading, error };
}
