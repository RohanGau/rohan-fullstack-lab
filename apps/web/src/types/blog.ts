export interface Blog {
  id: string; // or _id if your API returns MongoDB-style IDs
  title: string;
  content: string; // markdown content
  author: string;
  tags: string[];
  createdAt: string; // ISO date string
  updatedAt: string;
}

export interface BlogState {
  blogs: Blog[] | null;
  featureBlogs: Blog[] | null;
  blogDetails: Record<string, Blog>;
  setBlogs: (blogs: Blog[]) => void;
  setFeatureBlogs: (blogs: Blog[]) => void;
  setBlogDetail: (blog: Blog) => void;
}