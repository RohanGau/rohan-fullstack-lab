export const PAGE_SIZE = 25;

export interface SortSpec {
  field: string;
  order: 'asc' | 'desc';
}

export type FilterValueType = 'string' | 'boolean' | 'number';

/** What the Operator chose on a list: kept in the address so back, reload and shared links work. */
export interface ListState {
  /** 1-based. */
  page: number;
  sort: string;
  order: 'asc' | 'desc';
  /** Active filters by field. Empty values are never kept. */
  filters: Record<string, string>;
}

export function defaultListState(defaultSort: SortSpec): ListState {
  return { page: 1, sort: defaultSort.field, order: defaultSort.order, filters: {} };
}

function coerceFilterValue(value: string, type: FilterValueType = 'string'): unknown {
  if (type === 'boolean') return value === 'true';
  if (type === 'number') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : value;
  }
  return value;
}

/** The API's list parameters: JSON `range`, `sort` and `filter`. */
export function toListParams(
  state: ListState,
  valueTypes: Record<string, FilterValueType> = {}
): string {
  const from = (state.page - 1) * PAGE_SIZE;
  const serializedFilters: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(state.filters)) {
    serializedFilters[key] = coerceFilterValue(value, valueTypes[key]);
  }
  const params = new URLSearchParams({
    range: JSON.stringify([from, from + PAGE_SIZE - 1]),
    sort: JSON.stringify([state.sort, state.order === 'asc' ? 'ASC' : 'DESC']),
    filter: JSON.stringify(serializedFilters),
  });
  return params.toString();
}

export function pageCount(total: number): number {
  return Math.max(1, Math.ceil(total / PAGE_SIZE));
}
