import { Schema, model, Document } from 'mongoose';
import { IProjectDb } from '@fullstack-lab/types';

export interface ProjectDocument extends IProjectDb, Document {}

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
