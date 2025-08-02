export interface IProjectBase {
  title: string;
  description: string;
  company?: string;
  role?: string;
  techStack: string[];
  features?: string[];
  link?: string;
  year?: number;
  thumbnailUrl?: string;
  type?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProjectDb extends IProjectBase {
  createdAt: Date;
  updatedAt: Date;
}

export interface IProjectDto extends IProjectBase {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}   