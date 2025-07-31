import { create } from 'zustand';
import { BlogState } from '@/types/blog';

export const useBlogStore = create<BlogState>((set) => ({
  blogs: null,
  featureBlogs: null,
  blogDetails: {},
  setBlogs: (blogs) => set({ blogs }),
  setFeatureBlogs: (featureBlogs) => set({ featureBlogs }),
  setBlogDetail: (blog) =>
    set((state) => ({
      blogDetails: {
        ...state.blogDetails,
        [blog.id]: blog,
      },
    })),
}));
