import { create } from 'zustand';
import type { IProjectDto } from '@fullstack-lab/types';

type ListPayload = { data: IProjectDto[]; total: number };

type ProjectStore = {
  listCache: Record<string, ListPayload>;
  detailById: Record<string, IProjectDto>;
  setListCache: (key: string, payload: ListPayload) => void;
  setDetailById: (id: string, proj: IProjectDto) => void;
  clearAll: () => void;
};

export const useProjectStore = create<ProjectStore>((set) => ({
  listCache: {},
  detailById: {},
  setListCache: (key, payload) => set((s) => ({ listCache: { ...s.listCache, [key]: payload } })),
  setDetailById: (id, proj) => set((s) => ({ detailById: { ...s.detailById, [id]: proj } })),
  clearAll: () => set({ listCache: {}, detailById: {} }),
}));
