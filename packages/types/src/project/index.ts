export type ProjectType =
  | 'web'
  | 'mobile'
  | 'api'
  | 'cli'
  | 'tool'
  | 'library'
  | 'backend'
  | 'frontend'
  | 'desktop';

export type ProjectLinkKind = 'live' | 'repo' | 'docs' | 'demo' | 'design' | 'other';

export interface ProjectLink {
  url: string;
  label?: string;
  kind?: ProjectLinkKind;
}
export interface IProjectBase {
  title: string;
  description: string;
  company?: string;
  role?: string;
  techStack: string[];
  features?: string[];
  links: ProjectLink[];
  year?: number;
  thumbnailUrl?: string;
  types: ProjectType[];
}
export interface IProjectDb extends IProjectBase {
  _id?: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface IProjectDto extends IProjectBase {
  id: string;
  createdAt: string;
  updatedAt: string;
}
