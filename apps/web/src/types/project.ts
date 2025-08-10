import { IProjectDto } from '@fullstack-lab/types';

export type ListEntry = { data: IProjectDto[]; total: number; ts: number };
export type ProjectStore = {
  listCache: Record<string, ListEntry>;
  detailById: Record<string, IProjectDto>;
  setListCache: (key: string, payload: { data: IProjectDto[]; total: number }) => void;
  setDetailById: (id: string, proj: IProjectDto) => void;
  prune: (maxAgeMs?: number) => void;
  clearAll: () => void;
};

export type ProjectSortField = 'createdAt' | 'updatedAt' | 'year' | 'title';

export type ProjectsQuery = {
  page?: number;
  perPage?: number;
  search?: string;
  types?: string[];
  isFeatured?: boolean;
  company?: string;
  role?: string;
  year?: number;
  yearFrom?: number;
  yearTo?: number;
  sort?: [ProjectSortField, 'ASC' | 'DESC'];
};

export type ProjectsQueryRequired = Required<Pick<ProjectsQuery, 'page' | 'perPage' | 'sort'>> &
  Omit<ProjectsQuery, 'page' | 'perPage' | 'sort'>;
