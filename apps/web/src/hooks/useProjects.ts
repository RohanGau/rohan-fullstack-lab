import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiClient';
import { API } from '@/lib/constant';
import { useProjectStore } from '@/lib/store/projectStore';
import { IProjectDto } from '@fullstack-lab/types';

export function useProjects() {
  const { projects, setProjects } = useProjectStore();
  const [loading, setLoading] = useState(!projects);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projects) {
      apiFetch<IProjectDto[]>(API.PROJECTS)
        .then((data) => {
          setProjects(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [projects, setProjects]);

  return { projects, loading, error };
}
