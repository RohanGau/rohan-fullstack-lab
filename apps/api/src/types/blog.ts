export interface IBlog {
  title: string;
  content: string;
  author: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}
