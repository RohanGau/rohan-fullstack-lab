import { Schema, model, HydratedDocument } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUserDb } from '@fullstack-lab/types';

export type UserDocument = HydratedDocument<IUserDb>;

const UserSchema = new Schema<IUserDb>({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['admin', 'editor', 'user'], default: 'user' },
});

UserSchema.pre('save', async function(next) {
  const user = this as UserDocument;
  if (!user.isModified('password')) return next();
  user.password = await bcrypt.hash(user.password, 10);
  next();
});

UserSchema.methods.comparePassword = function(candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export default model<IUserDb>('User', UserSchema);
