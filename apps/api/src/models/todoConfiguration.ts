import mongoose, { Schema } from 'mongoose';
import { ITodo } from '../types/todo';

const todoFormConfigurationSchema: Schema = new Schema<ITodo>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ITodo>('Todo', todoFormConfigurationSchema);
