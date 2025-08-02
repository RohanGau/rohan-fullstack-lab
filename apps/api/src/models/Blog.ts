import { Schema, model, Document } from 'mongoose';
import { IBlogDb } from '@fullstack-lab/types';

export interface BlogDocument extends IBlogDb, Document {}

const BlogSchema = new Schema<BlogDocument>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
    tags: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

export default model<BlogDocument>('Blog', BlogSchema);
