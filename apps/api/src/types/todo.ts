import { Document } from 'mongoose';

export interface ITodo extends Document {
  title: String;
  description?: String;
  createdAt: Date;
  updatedAt: Date;
}
