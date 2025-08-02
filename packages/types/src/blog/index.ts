export interface IBlog {
  id: string;
  title: string;
  content: string;
  author: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IBlogBase {
  title: string;
  content: string;
  author: string;
  tags?: string[];
}

export interface IBlogDb extends IBlogBase {
  createdAt: Date;
  updatedAt: Date;
}

export interface IBlogDto extends IBlogBase {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}