import { Schema, model, HydratedDocument } from 'mongoose';
import { IProjectDb } from '@fullstack-lab/types';

export type ProjectDocument = HydratedDocument<IProjectDb>;

const urlRegex =
  /^(https?:\/\/)([\w\-]+(\.[\w\-]+)+)(:[0-9]{2,5})?(\/[^\s]*)?$/i;

const LinkSchema = new Schema(
  {
    url: { type: String, required: true, trim: true, lowercase: true, match: urlRegex },
    label: { type: String, trim: true },
    kind: {
      type: String,
      trim: true,
      lowercase: true,
      enum: ['live', 'repo', 'docs', 'demo', 'design', 'other'],
      default: 'other',
    },
  },
  { _id: false }
);

const allowedTypes = ['web', 'mobile', 'api', 'cli', 'tool', 'library', 'backend', 'frontend', 'desktop'] as const;

// …imports

const ProjectSchema = new Schema<IProjectDb>(
  {
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 140 },
    description: { type: String, required: true, trim: true, minlength: 10 },
    company: { type: String, trim: true, lowercase: true },
    role: { type: String, trim: true, lowercase: true },
    techStack: { type: [String], default: [], set: (a: string[]) =>
      Array.from(new Set((a ?? []).map(s => s.trim()).filter(Boolean))) },
    features: { type: [String], default: [], set: (a: string[]) =>
      Array.from(new Set((a ?? []).map(s => s.trim()).filter(Boolean))) },
    links: { type: [LinkSchema], default: [] },
    year: { type: Number, min: 1990, max: new Date().getFullYear() + 1 },
    thumbnailUrl: { type: String, trim: true, match: urlRegex },
    types: { type: [String], default: [], enum: allowedTypes, set: (a: string[]) =>
      Array.from(new Set((a ?? []).map(s => s.trim().toLowerCase()).filter(Boolean))) },
    isFeatured: { type: Boolean, default: false, index: true }, // 👈 NEW
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id?.toString();
        delete ret._id; delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// indexes useful for filters
ProjectSchema.index({ title: 'text', description: 'text', techStack: 'text' });
ProjectSchema.index({ 'links.kind': 1 });
ProjectSchema.index({ types: 1, year: -1 });
ProjectSchema.index({ isFeatured: 1, createdAt: -1 });

export default model<IProjectDb>('Project', ProjectSchema);
