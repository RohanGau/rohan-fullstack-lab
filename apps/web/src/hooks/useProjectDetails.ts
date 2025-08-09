'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiClient';
import { API } from '@/lib/constant';
import { IProjectDto } from '@fullstack-lab/types';
import { useProjectStore } from '@/lib/store/projectStore';

export function useProjectDetail(id: string) {
  const { projectDetails, setProjectDetail } = useProjectStore();
  const cached = id ? projectDetails[id] : null;

  const [project, setProject] = useState<IProjectDto | null>(cached || null);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    if (cached) return;

    const controller = new AbortController();
    setLoading(true);

    apiFetch<IProjectDto>(`${API.PROJECTS}/${id}`, { signal: controller.signal })
      .then((data) => {
        setProject(data);
        setProjectDetail(data);
        setError(null);
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        setError(err?.message || 'Failed to fetch project');
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [id, cached, setProjectDetail]);

  return { project, loading, error };
}
