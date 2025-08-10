import { ProjectsQueryRequired } from '@/types/project';
import { BlogsQueryRequired  } from './blog';

export type SortOrder = 'ASC' | 'DESC';
export type SortTuple<F extends string> = [F, SortOrder];

export type BaseQueryRequired<F extends string> = {
  page: number;
  perPage: number;
  sort: SortTuple<F>;
};


export type BlogFilter = {
  q?: string;
  tags?: string[];
  isFeatured?: boolean;
  status?: BlogsQueryRequired['status'];
  author?: string;
};

export type ProjectFilter = {
  q?: string;
  types?: ProjectsQueryRequired['types'];
  isFeatured?: boolean;
  company?: string;
  role?: string;
  year?: number;
  yearFrom?: number | null | undefined;
  yearTo?: number | null | undefined;
};
