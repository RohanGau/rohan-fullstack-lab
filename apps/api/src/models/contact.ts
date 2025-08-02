import mongoose, { Schema, Document } from 'mongoose';
import { IContactDb } from '@fullstack-lab/types';

export interface ContactDocument extends IContactDb, Document {}

const ContactSchema = new Schema<ContactDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    message: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ContactDocument>('Contact', ContactSchema);
