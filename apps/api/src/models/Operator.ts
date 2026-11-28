import { Schema, model, HydratedDocument, Types } from 'mongoose';

export interface IOperatorDb {
  email: string;
  /** Bound on the first successful Google sign-in. */
  googleSub?: string;
  roles: Types.ObjectId[];
  active: boolean;
  /** The Operator created from configuration; cannot be demoted or deactivated. */
  isBootstrap: boolean;
}

export type OperatorDocument = HydratedDocument<IOperatorDb>;

const OperatorSchema = new Schema<IOperatorDb>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    googleSub: { type: String, unique: true, sparse: true },
    roles: [{ type: Schema.Types.ObjectId, ref: 'Role' }],
    active: { type: Boolean, default: true },
    isBootstrap: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model<IOperatorDb>('Operator', OperatorSchema);
