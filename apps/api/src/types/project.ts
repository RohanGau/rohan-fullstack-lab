export interface IProject {
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
