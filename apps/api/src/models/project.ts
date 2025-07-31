import { Schema, model, Document } from 'mongoose';

export interface ProjectDocument extends Document {
  title: string;
  description: string;
  company?: string;
  role?: string;
  techStack: string[];
  features?: string[];
  link?: string;
  year?: number;
  thumbnailUrl?: string;
  type?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<ProjectDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    company: { type: String },
    role: { type: String },
    techStack: [{ type: String }],
    features: [{ type: String }],
    link: { type: String },
    year: { type: Number },
    thumbnailUrl: { type: String },
    type: { type: String },
  },
  { timestamps: true }
);

export default model<ProjectDocument>('Project', ProjectSchema);
