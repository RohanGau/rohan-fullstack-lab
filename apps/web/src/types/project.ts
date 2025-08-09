import { IProjectDto } from "@fullstack-lab/types";

export interface ProjectState {
  projects: IProjectDto[] | null;
  featureProjects: IProjectDto[] | null;
  projectDetails: Record<string, IProjectDto>;
  setProjects: (projects: IProjectDto[]) => void;
  setFeatureProjects: (projects: IProjectDto[]) => void;
  setProjectDetail: (project: IProjectDto) => void;
}

export type ProjectsQuery = {
  page?: number;
  perPage?: number;
  search?: string;
  types?: string[]; 
  sort?: [string, 'ASC' | 'DESC'];
};