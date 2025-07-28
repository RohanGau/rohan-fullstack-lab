import { Schema, model, Document } from 'mongoose';
import { IBlog } from '../types/blog.js';

export interface BlogDocument extends IBlog, Document {}

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
