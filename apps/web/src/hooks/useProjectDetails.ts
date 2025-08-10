import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/apiClient';
import { API } from '@/lib/constant';
import type { IProjectDto } from '@fullstack-lab/types';
import { useProjectStore } from '@/lib/store/projectStore';
import { isMongoId } from '@/lib/utils';

export function useProjectDetail(param: string) {
  const { detailById, setDetailById } = useProjectStore();

  const id = isMongoId(param) ? param : undefined;
  const cached = id ? detailById[id] : null;

  const [project, setProject] = useState<IProjectDto | null>(cached ?? null);
  const [loading, setLoading] = useState(!cached && !!id);
  const [error, setError] = useState<string | null>(null);

  // Prevent re-trying same id after a definitive failure
  const triedRef = useRef<{ key: string; ok: boolean } | null>(null);

  // Reset local state when param/cache changes
  useEffect(() => {
    if (!param) {
      setProject(null);
      setLoading(false);
      setError('Invalid project identifier');
      triedRef.current = null;
      return;
    }
    if (!id) {
      setProject(null);
      setLoading(false);
      setError('Invalid project id');
      triedRef.current = null;
      return;
    }
    setProject(cached ?? null);
    setLoading(!cached);
    setError(null);
    triedRef.current = null;
  }, [param, id, cached]);

  useEffect(() => {
    if (!id) return;
    if (cached) return; // already have it
    if (triedRef.current?.key === id && !triedRef.current.ok) return; // known-bad id

    const controller = new AbortController();

    const run = async () => {
      setLoading(true);
      try {
        const item = await apiFetch<IProjectDto>(`${API.PROJECTS}/${id}`, {
          signal: controller.signal,
        });
        setProject(item);
        setDetailById(item.id, item);
        setError(null);
        triedRef.current = { key: id, ok: true };
      } catch (err: any) {
        if (err?.name === 'AbortError') return; // do nothing on abort
        setError(err?.message || err?.msg || 'Failed to fetch project');
        triedRef.current = { key: id, ok: false };
      } finally {
        setLoading(false);
      }
    };

    run();
    return () => controller.abort();
  }, [id, cached, setDetailById]);

  return { project, loading, error };
}
