import { Schema, model, HydratedDocument } from 'mongoose';
import { IBlogDb, BlogLink } from '@fullstack-lab/types';

export type BlogDocument = HydratedDocument<IBlogDb>;

const urlRegex =
  /^(https?:\/\/)([\w\-]+(\.[\w\-]+)+)(:[0-9]{2,5})?(\/[^\s]*)?$/i;

const LinkSchema = new Schema<BlogLink>(
  {
    url: { type: String, required: true, trim: true, lowercase: true, match: urlRegex },
    label: { type: String, trim: true, maxlength: 80 },
    kind: {
      type: String,
      trim: true,
      lowercase: true,
      enum: ['repo', 'ref', 'demo', 'other'],
      default: 'other',
    },
  },
  { _id: false }
);

const BlogSchema = new Schema<IBlogDb>(
  {
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 180 },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    content: { type: String, required: true, trim: true, minlength: 10 },
    summary: { type: String, trim: true, maxlength: 500 },
    author: { type: String, required: true, trim: true },
    tags: {
      type: [String],
      default: [],
      set: (arr: string[]) =>
        Array.from(new Set((arr ?? []).map(s => s.trim().toLowerCase()).filter(Boolean))),
    },
    links: { type: [LinkSchema], default: [] },
    coverImageUrl: { type: String, trim: true, match: urlRegex },
    readingTime: { type: Number, min: 1, max: 120 },
    isFeatured: { type: Boolean, default: false },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', index: true },
    publishedAt: { type: Date, index: true },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

BlogSchema.index({ title: 'text', content: 'text', tags: 'text' });
BlogSchema.index({ isFeatured: 1, publishedAt: -1 });

BlogSchema.pre('validate', function (next) {
  const doc = this as any;
  if (!doc.slug && doc.title) {
    doc.slug = String(doc.title)
      .trim()
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  if (doc.isModified('status') && doc.status === 'published' && !doc.publishedAt) {
    doc.publishedAt = new Date();
  }
  next();
});

export default model<IBlogDb>('Blog', BlogSchema);
