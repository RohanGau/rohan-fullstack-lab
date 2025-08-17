import { ErrorRequestHandler } from '../types/express/error';
import { Request, Response, NextFunction } from 'express';
import logger from './logger'; // Adjust the import path as needed
import { ERROR_MESSAGES } from './constant';
import { BuildQuery } from '../types/controller';

export const jsonErrorHandler: ErrorRequestHandler = (err, _, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ msg: ERROR_MESSAGES.INVALID_JSON });
  }
  next();
};

// eslint-disable-next-line no-unused-vars
export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error({ err }, 'Global error :');
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
  });
};

export function normalizeBody(body: any) {
  const out = { ...body };

  // Map single link -> links[]
  if (!out.links && out.link) {
    out.links = [{ url: out.link, kind: 'other' }];
    delete out.link;
  }

  // Map single type -> types[]
  if (!out.types && out.type) {
    out.types = [String(out.type).toLowerCase()];
    delete out.type;
  }

  // De-duplicate arrays where relevant
  if (Array.isArray(out.techStack)) {
    out.techStack = Array.from(new Set(out.techStack.map((s: string) => s.trim()).filter(Boolean)));
  }
  if (Array.isArray(out.features)) {
    out.features = Array.from(new Set(out.features.map((s: string) => s.trim()).filter(Boolean)));
  }
  if (Array.isArray(out.types)) {
    out.types = Array.from(new Set(out.types.map((s: string) => s.toLowerCase()).filter(Boolean)));
  }

  return out;
}

export function normalizeSlotBody(body: any) {
  const out = { ...body };

  if (typeof out.email === 'string') {
    out.email = out.email.trim().toLowerCase();
  }

  if (out.date) {
    out.date = new Date(out.date);
  }
  if ('duration' in out) {
    let duration = Number(out.duration);
    if (!duration || duration < 15 || duration > 120) duration = 30; // default
    out.duration = duration;
  }
  if (typeof out.message !== 'string') delete out.message;
  else out.message = out.message.trim();
  if (out.status !== 'cancelled') out.status = 'booked';

  return out;
}


export function safeJsonParse<T>(value: unknown, fallback: T): T {
  if (typeof value !== 'string') return fallback;
  try { return JSON.parse(value) as T; } catch { return fallback; }
}

export function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function buildProjectQuery(filter: any = {}) {
  const q: Record<string, any> = {};
  const f = filter || {};

  // keyword search
  if (typeof f.q === 'string' && f.q.trim()) {
    const rx = new RegExp(escapeRegex(f.q.trim()), 'i');
    q.$or = [
      { title: rx }, { description: rx }, { techStack: rx },
      { company: rx }, { role: rx }, { types: rx },
      { 'links.label': rx }, { 'links.kind': rx },
    ];
  }

  // types (array or single)
  if (f.types !== undefined) {
    const arr = Array.isArray(f.types) ? f.types : [f.types];
    const cleaned = arr.map((s: any) => String(s).toLowerCase()).filter(Boolean);
    if (cleaned.length) q.types = { $in: cleaned };
  }

  // featured
  if (f.isFeatured !== undefined) {
    const val = String(f.isFeatured).toLowerCase();
    q.isFeatured = val === 'true' || val === '1' || f.isFeatured === true;
  }

  // optional fuzzy filters
  if (f.company) q.company = new RegExp(escapeRegex(String(f.company)), 'i');
  if (f.role) q.role = new RegExp(escapeRegex(String(f.role)), 'i');

  // year / range
  if (typeof f.year === 'number') q.year = f.year;
  if (f.yearFrom || f.yearTo) {
    q.year = {};
    if (f.yearFrom) q.year.$gte = Number(f.yearFrom);
    if (f.yearTo) q.year.$lte = Number(f.yearTo);
  }

  return q;
}

export const buildSlotQuery: BuildQuery<any> = (raw) => {
  const query: Record<string, any> = {};

  // Filter by date range
  if (raw.date_gte || raw.date_lte) {
    query.date = {};
    if (raw.date_gte) query.date.$gte = new Date(raw.date_gte);
    if (raw.date_lte) query.date.$lte = new Date(raw.date_lte);
  }
  // Filter by email
  if (raw.email) query.email = raw.email;
  // Filter by status
  if (raw.status) query.status = raw.status;
  // Add any additional filters as needed
  return query;
};