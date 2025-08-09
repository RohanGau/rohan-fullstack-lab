import { create } from 'zustand';
import { BlogStore } from '@/types/blog';

export const useBlogStore = create<BlogStore>((set) => ({
  listCache: {},
  detailsById: {},
  detailsBySlug: {},
  setListCache: (key, payload) => set((s) => ({ listCache: { ...s.listCache, [key]: payload } })),
  setDetailById: (id, blog) => set((s) => ({ detailsById: { ...s.detailsById, [id]: blog } })),
  setDetailBySlug: (slug, blog) => set((s) => ({ detailsBySlug: { ...s.detailsBySlug, [slug]: blog } })),
}));
