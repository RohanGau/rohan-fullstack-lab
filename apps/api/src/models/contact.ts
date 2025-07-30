import mongoose, { Schema, Document } from 'mongoose';

export interface ContactDocument extends Document {
  name: string;
  email: string;
  message: string;
  createdAt: Date;
}

const ContactSchema = new Schema<ContactDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    message: { type: String, required: true, trim: true },
  },
  {
    timestamps: true, // Adds createdAt + updatedAt
  }
);

export default mongoose.model<ContactDocument>('Contact', ContactSchema);
