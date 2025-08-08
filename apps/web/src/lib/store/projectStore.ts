import { create } from 'zustand';
import { ProjectState } from '@/types/project';
import { IProjectDto } from '@fullstack-lab/types';

export const useProjectStore = create<ProjectState>((set) => ({
  projects: null,
  featureProjects: null,
  projectDetails: {},
  
  setProjects: (projects: IProjectDto[]) => set({ projects }),

  setFeatureProjects: (featureProjects: IProjectDto[]) =>
    set({ featureProjects }),

  setProjectDetail: (project: IProjectDto) =>
    set((state) => ({
      projectDetails: {
        ...state.projectDetails,
        [project.id]: project,
      },
    })),
}));
