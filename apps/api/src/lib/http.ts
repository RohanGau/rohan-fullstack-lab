import { Response } from 'express';

export type SortDir = 'ASC' | 'DESC';

export function parseJSON<T>(value: unknown, fallback: T): T {
  if (typeof value !== 'string') return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function parseListParams(query: Record<string, unknown>) {
  const filter = parseJSON<Record<string, any>>(query.filter, {});

  // Support both react-admin style query params:
  // - range/sort/filter as JSON strings
  // - _start/_end/_sort/_order legacy style
  const hasLegacyRange =
    query.range === undefined && (query._start !== undefined || query._end !== undefined);
  const legacyStart = Math.max(0, Number(query._start ?? 0) || 0);
  const legacyEndExclusive = Math.max(legacyStart + 1, Number(query._end ?? 10) || 10);

  const range = hasLegacyRange
    ? ([legacyStart, legacyEndExclusive - 1] as [number, number])
    : parseJSON<[number, number]>(query.range, [0, 9]);

  const hasLegacySort =
    query.sort === undefined && (query._sort !== undefined || query._order !== undefined);
  const legacySortField =
    typeof query._sort === 'string' && query._sort.trim() ? query._sort : 'createdAt';
  const legacySortOrder: SortDir =
    String(query._order ?? 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const sort = hasLegacySort
    ? ([legacySortField, legacySortOrder] as [string, SortDir])
    : parseJSON<[string, SortDir]>(query.sort, ['createdAt', 'DESC']);

  const limit = Math.max(0, range[1] - range[0] + 1);
  const skip = Math.max(0, range[0]);

  return { filter, range, sort, limit, skip };
}

export function setListHeaders(res: Response, skip: number, count: number, total: number) {
  const end = count ? skip + count - 1 : skip;
  res.set('Access-Control-Expose-Headers', 'X-Total-Count, Content-Range');
  res.set('X-Total-Count', total.toString());
  res.set('Content-Range', `items ${skip}-${end}/${total}`);
}
