import { Response } from 'express';

export type SortDir = 'ASC' | 'DESC';

export function parseJSON<T>(value: unknown, fallback: T): T {
  if (typeof value !== 'string') return fallback;
  try { return JSON.parse(value) as T; } catch { return fallback; }
}

export function parseListParams(query: Record<string, unknown>) {
  const filter = parseJSON<Record<string, any>>(query.filter, {});
  const range  = parseJSON<[number, number]>(query.range, [0, 9]);
  const sort   = parseJSON<[string, SortDir]>(query.sort, ['createdAt', 'DESC']);

  const limit = Math.max(0, range[1] - range[0] + 1);
  const skip  = Math.max(0, range[0]);

  return { filter, range, sort, limit, skip };
}

export function setListHeaders(res: Response, skip: number, count: number, total: number) {
  const end = count ? skip + count - 1 : skip;
  res.set('Access-Control-Expose-Headers', 'X-Total-Count, Content-Range');
  res.set('X-Total-Count', total.toString());
  res.set('Content-Range', `items ${skip}-${end}/${total}`);
}
