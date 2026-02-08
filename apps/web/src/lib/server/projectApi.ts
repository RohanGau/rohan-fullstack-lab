import type { IProjectDto } from '@fullstack-lab/types';
import { apiFetch, apiFetchWithMeta } from '../apiClient';
import { API } from '../constant';
import { makeProjectQueryString } from '../utils';
import type { ProjectsQuery, ProjectsQueryRequired } from '@/types/project';

function normalizeProjectQuery(input: ProjectsQuery = {}): ProjectsQueryRequired {
  const page = Number.isFinite(input.page) && (input.page as number) > 0 ? Number(input.page) : 1;
  const perPage =
    Number.isFinite(input.perPage) && (input.perPage as number) > 0 ? Number(input.perPage) : 9;
  const sort = (input.sort ?? ['createdAt', 'DESC']) as ProjectsQueryRequired['sort'];

  return {
    ...input,
    page,
    perPage,
    sort,
  };
}

export async function getProjectList(input: ProjectsQuery = {}): Promise<{
  query: ProjectsQueryRequired;
  data: IProjectDto[];
  total: number;
}> {
  const query = normalizeProjectQuery(input);
  const qs = makeProjectQueryString(query);

  const { data, total } = await apiFetchWithMeta<IProjectDto[]>(`${API.PROJECTS}?${qs}`);

  return { query, data, total };
}

export async function getProjectById(
  id: string,
  signal?: AbortSignal
): Promise<IProjectDto | null> {
  try {
    return await apiFetch<IProjectDto>(`${API.PROJECTS}/${id}`, { signal });
  } catch (error) {
    const status = (error as { status?: number })?.status;
    if (status === 400 || status === 404) return null;
    throw error;
  }
}
