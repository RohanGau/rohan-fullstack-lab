import type { Model, FilterQuery, Document } from 'mongoose';

export type BuildQuery<T> = (raw: Record<string, any>) => FilterQuery<T>;
type Transform<T>  = (doc: any) => any;

export type ListOptions<T> = {
  ns: string;
  model: Model<T>;
  buildQuery: BuildQuery<T>;
  transform?: Transform<T>;
  allowedSort?: string[];
  ttlSeconds?: number;
};

export type ByIdOptions<T> = {
  ns: string;
  model: Model<T>;
  transform?: Transform<T>;
  ttlSeconds?: number;
};

export type WriteOptions<T> = {
  ns: string;
  model: Model<T>;
  allowedFields?: string[];
  normalize: (body: any) => any;
  afterCreate?: (doc: Document<unknown, {}, T> & T) => Promise<void>;
  afterUpdate?: (doc: Document<unknown, {}, T> & T) => Promise<void>;
  afterDelete?: (doc: Document<unknown, {}, T> & T) => Promise<void>;
};