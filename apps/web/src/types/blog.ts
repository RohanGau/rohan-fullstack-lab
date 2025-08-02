import { IBlogDto } from "@fullstack-lab/types";

export interface BlogState {
  blogs: IBlogDto[] | null;
  featureBlogs: IBlogDto[] | null;
  blogDetails: Record<string, IBlogDto>;
  setBlogs: (blogs: IBlogDto[]) => void;
  setFeatureBlogs: (blogs: IBlogDto[]) => void;
  setBlogDetail: (blog: IBlogDto) => void;
}