import { HydratedDocument, Schema, model } from 'mongoose';
import { MUTATION_HTTP_METHODS } from '@fullstack-lab/constants';
import { IAuditLogDb, IAuditActor } from '@fullstack-lab/types';

export type AuditLogDocument = HydratedDocument<IAuditLogDb>;

const AuditActorSchema = new Schema<IAuditActor>(
  {
    id: { type: String, required: true, trim: true },
    role: {
      type: String,
      trim: true,
      enum: ['admin', 'editor', 'user'],
    },
    email: { type: String, trim: true, lowercase: true },
    username: { type: String, trim: true },
  },
  {
    _id: false,
    strict: true,
  }
);

const AuditLogSchema = new Schema<IAuditLogDb>(
  {
    requestId: { type: String, trim: true, index: true },
    method: {
      type: String,
      required: true,
      enum: [...MUTATION_HTTP_METHODS],
      index: true,
    },
    path: { type: String, required: true, trim: true, index: true },
    resource: { type: String, required: true, trim: true, index: true },
    resourceId: { type: String, trim: true, index: true },
    statusCode: { type: Number, required: true, min: 100, max: 599, index: true },
    durationMs: { type: Number, required: true, min: 0 },
    ip: { type: String, trim: true },
    userAgent: { type: String, trim: true },
    actor: { type: AuditActorSchema, required: true },
    changedFields: { type: [String], default: [] },
    queryKeys: { type: [String], default: [] },
    idempotencyKey: { type: String, trim: true },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ 'actor.id': 1, createdAt: -1 });
AuditLogSchema.index({ resource: 1, resourceId: 1, createdAt: -1 });

export default model<IAuditLogDb>('AuditLog', AuditLogSchema);
