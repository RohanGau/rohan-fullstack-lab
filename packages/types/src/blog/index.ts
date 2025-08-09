export type BlogStatus = 'draft' | 'published' | 'archived';

export interface BlogLink {
  url: string;
  label?: string;
  kind?: 'repo' | 'ref' | 'demo' | 'other';
}

export interface IBlogBase {
  title: string;
  slug: string; 
  content: string;
  summary?: string;
  author: string;
  tags: string[];
  links: BlogLink[];
  coverImageUrl?: string;
  readingTime?: number;
  isFeatured?: boolean;
  status: BlogStatus;
  publishedAt?: Date;
}

export interface IBlogDb extends IBlogBase {
  createdAt: Date;
  updatedAt: Date;
}

export interface IBlogDto extends IBlogBase {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}