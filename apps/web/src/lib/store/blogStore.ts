import { create } from 'zustand';
import { Blog } from '@/types/blog';

interface BlogState {
  blogs: Blog[] | null;
  blogDetails: Record<string, Blog>; // Cache by blog ID
  setBlogs: (blogs: Blog[]) => void;
  setBlogDetail: (blog: Blog) => void;
}

export const useBlogStore = create<BlogState>((set) => ({
  blogs: null,
  blogDetails: {},
  setBlogs: (blogs) => set({ blogs }),
  setBlogDetail: (blog) =>
    set((state) => ({
      blogDetails: {
        ...state.blogDetails,
        [blog.id]: blog,
      },
    })),
}));
