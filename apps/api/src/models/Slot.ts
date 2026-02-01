import { Schema, model, HydratedDocument } from 'mongoose';
import { ISlotDb } from '@fullstack-lab/types';

export type SlotDocument = HydratedDocument<ISlotDb>;

const SlotSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    message: { type: String, trim: true },
    date: { type: Date, required: true }, // Slot start datetime
    duration: { type: Number, default: 30, min: 15, max: 120 }, // in minutes
    status: { type: String, enum: ['booked', 'cancelled'], default: 'booked' },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
    strict: true,
  }
);
SlotSchema.index({ date: 1 });

export default model('Slot', SlotSchema);
