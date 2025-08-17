import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import type { Model } from 'mongoose';
import logger from '../utils/logger';
import { cache } from './cache';
import { ListOptions, ByIdOptions, WriteOptions } from '../types/controller';
import { parseListParams, setListHeaders } from './http';

export function makeListHandler<T>(opts: ListOptions<T>) {
  const {
    ns, model, buildQuery, transform = defaultTransform, allowedSort = ['createdAt', 'updatedAt', 'year', 'title'],
    ttlSeconds = cache.DEFAULT_TTL,
  } = opts;

  return async function list(req: Request, res: Response) {
    try {
      const { filter, range, sort, limit, skip } = parseListParams(req.query as any);
      const sortField = allowedSort.includes(sort[0]) ? sort[0] : 'createdAt';
      const sortOrder = sort[1] === 'DESC' ? -1 : 1;

      const mongoFilter = buildQuery(filter);

      // cache key
      const version = await cache.getVersionNS(ns);
      const key = cache.keyForListNS(ns, version, { filter, range, sort });

      // try cache
      const cached = await cache.get<{ data: any[]; total: number }>(key);
      if (cached) {
        setListHeaders(res, skip, cached.data.length, cached.total);
        return res.status(200).json(cached.data);
      }

      // DB
      const total = await model.countDocuments(mongoFilter);
      const docs  = await model.find(mongoFilter)
        .sort({ [sortField]: sortOrder })
        .skip(skip).limit(limit)
        .lean({ virtuals: true });

      const data = docs.map(transform);

      await cache.set(key, { data, total }, ttlSeconds);

      setListHeaders(res, skip, data.length, total);
      res.status(200).json(data);
    } catch (err) {
      logger.error({ err }, '❌ list handler failed');
      res.status(500).json({ error: 'FETCH_FAILED' });
    }
  };
}

export function makeGetByIdHandler<T>(opts: ByIdOptions<T>) {
  const { ns, model, transform = defaultTransform, ttlSeconds = cache.DEFAULT_TTL } = opts;

  return async function getById(req: Request, res: Response) {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'INVALID_ID' });
    }
    try {
      const version = await cache.getVersionNS(ns);
      const key = cache.keyForIdNS(ns, version, id);

      const cached = await cache.get<any>(key);
      if (cached) return res.status(200).json(cached);

      const found = await model.findById(id);
      if (!found) return res.status(404).json({ error: 'NOT_FOUND' });

      const obj = transform(found.toJSON());
      await cache.set(key, obj, ttlSeconds);
      res.status(200).json(obj);
    } catch (err) {
      logger.error({ err }, '❌ getById handler failed');
      res.status(500).json({ error: 'FETCH_FAILED' });
    }
  };
}

export function makeCreateHandler<T>(opts: WriteOptions<T>) {
  const { ns, model, normalize, afterCreate } = opts;

  return async function create(req: Request, res: Response) {
    try {
      const normalized = normalize(req.validatedBody);
      const doc = new model(normalized);
      const result = await doc.save();

      if (typeof afterCreate === 'function') {
        try { await afterCreate(result as any); } catch (e) {}
      }

      await cache.bumpVersionNS(ns);

      res.status(201).json(result.toJSON());
    } catch (err) {
      logger.error({ err }, '❌ create handler failed');
      res.status(500).json({ error: 'CREATE_FAILED' });
    }
  };
}

export function makeUpdateHandler<T>(opts: WriteOptions<T>) {
  const { ns, model, allowedFields = [], normalize, afterUpdate } = opts;

  return async function update(req: Request, res: Response) {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'INVALID_ID' });
    }
    try {
      for (const k of ['createdAt', 'updatedAt', '__v', 'id', '_id']) delete (req.body ?? {})[k];
      req.validatedBody = req.validatedBody ?? req.body;

      const normalized = normalize(req.validatedBody);
      const update: Record<string, any> = {};
      for (const k of allowedFields) if (normalized[k] !== undefined) update[k] = normalized[k];

      const updated = await model.findByIdAndUpdate(
        id,
        { $set: update },
        { new: true, runValidators: true, strict: 'throw' }
      );
      if (!updated) return res.status(404).json({ error: 'NOT_FOUND' });

      if (typeof afterUpdate === 'function') {
        try { await afterUpdate(updated); } catch (e) { /* log but don’t crash */ }
      }

      await cache.bumpVersionNS(ns);

      res.status(200).json(updated.toJSON());
    } catch (err) {
      logger.error({ err }, '❌ update handler failed');
      res.status(500).json({ error: 'UPDATE_FAILED' });
    }
  };
}

export function makeDeleteHandler<T>(opts: { ns: string; model: Model<T>; afterDelete?: (doc: T) => Promise<void> }) {
  const { ns, model, afterDelete } = opts;

  return async function remove(req: Request, res: Response) {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'INVALID_ID' });
    }
    try {
      const deleted = await model.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: 'NOT_FOUND' });

      if (typeof afterDelete === 'function') {
        try { await afterDelete(deleted); } catch (e) { /* log but don’t crash */ }
      }

      await cache.bumpVersionNS(ns);

      res.status(204).send();
    } catch (err) {
      logger.error({ err }, '❌ delete handler failed');
      res.status(500).json({ error: 'DELETE_FAILED' });
    }
  };
}

function defaultTransform(doc: any) {
  const id = String(doc.id ?? doc._id);
  const { _id, __v, ...rest } = doc;
  return { id, ...rest };
}
