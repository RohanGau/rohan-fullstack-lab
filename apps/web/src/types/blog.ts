import { IBlogDto } from '@fullstack-lab/types';

export type ListCacheItem = { data: IBlogDto[]; total: number };

export type BlogStore = {
  listCache: Record<string, ListCacheItem>;
  detailsById: Record<string, IBlogDto>;
  detailsBySlug: Record<string, IBlogDto>;
  setListCache: (key: string, payload: ListCacheItem) => void;
  setDetailById: (id: string, blog: IBlogDto) => void;
  setDetailBySlug: (slug: string, blog: IBlogDto) => void;
};

export type BlogSortField = 'publishedAt' | 'createdAt' | 'updatedAt' | 'title';

export type BlogsQuery = {
  page?: number;
  perPage?: number;
  search?: string;
  tags?: string[];
  isFeatured?: boolean;
  status?: 'draft' | 'published' | 'archived';
  author?: string;
  sort?: [BlogSortField, 'ASC' | 'DESC'];
};

export type BlogsQueryRequired = Required<Pick<BlogsQuery, 'page' | 'perPage' | 'sort'>> &
  Omit<BlogsQuery, 'page' | 'perPage' | 'sort'>;

export type RouteParams = { id: string | string[] };
export interface BlogDetailPageProps {
  params: Promise<RouteParams>;
}
