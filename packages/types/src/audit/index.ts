export type AuditMutationMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface IAuditActor {
  id: string;
  role?: 'admin' | 'editor' | 'user';
  email?: string;
  username?: string;
}

export interface IAuditLogDb {
  requestId?: string;
  method: AuditMutationMethod;
  path: string;
  resource: string;
  resourceId?: string;
  statusCode: number;
  durationMs: number;
  ip?: string;
  userAgent?: string;
  actor: IAuditActor;
  changedFields: string[];
  queryKeys: string[];
  idempotencyKey?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
