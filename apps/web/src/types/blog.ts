export interface Blog {
  id: string; // or _id if your API returns MongoDB-style IDs
  title: string;
  content: string; // markdown content
  author: string;
  tags: string[];
  createdAt: string; // ISO date string
  updatedAt: string;
}