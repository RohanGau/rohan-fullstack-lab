import { Schema, model, HydratedDocument } from 'mongoose';

export interface IRoleDb {
  name: string;
  /** Protected roles may only be changed or granted by a Super Admin. */
  isProtected: boolean;
  permissions: string[];
}

export type RoleDocument = HydratedDocument<IRoleDb>;

const RoleSchema = new Schema<IRoleDb>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    isProtected: { type: Boolean, default: false },
    permissions: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default model<IRoleDb>('Role', RoleSchema);
