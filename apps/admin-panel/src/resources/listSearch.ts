import type { ResourceConfig } from './ResourceList';
import { defaultListState, type ListState } from './listState';

/** Far beyond any real list, but stops a hostile address from asking for absurd ranges. */
export const MAX_PAGE = 10_000;
/** Longer than any real name or email, so longer text in an address is ignored. */
export const MAX_FILTER_LENGTH = 200;

/** A list's state as it appears in the address (`?page=2&sort=name&name=Ada`). */
export type ListSearch = {
  page?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  [filterField: string]: string | number | undefined;
};

/**
 * Turns a resource's declaration into the three things its route needs: what to accept
 * from the address, the state that implies, and the shortest address for a state.
 * Anything the config does not declare is ignored, whatever the address says.
 */
export function createListSearch<Row extends { id: string }>(config: ResourceConfig<Row>) {
  const sortable = config.columns.filter((column) => column.sortable).map((column) => column.field);
  const filterFields = config.filters.map((filter) => filter.field);
  const base = defaultListState(config.defaultSort);

  function validate(search: Record<string, unknown>): ListSearch {
    const page = Number(search.page);
    const result: ListSearch = {};
    if (Number.isInteger(page) && page > 1 && page <= MAX_PAGE) result.page = page;
    if (typeof search.sort === 'string' && sortable.includes(search.sort as never)) {
      result.sort = search.sort;
    }
    if (search.order === 'asc' || search.order === 'desc') result.order = search.order;
    for (const field of filterFields) {
      const value = search[field];
      if (typeof value === 'string' && value && value.length <= MAX_FILTER_LENGTH) {
        result[field] = value;
      }
    }
    return result;
  }

  return {
    validate,

    /**
     * The router can hand over parameters it merged from elsewhere without running our
     * validation, so the state is always built from a validated copy.
     */
    toState(search: ListSearch): ListState {
      const checked = validate(search);
      const filters: Record<string, string> = {};
      for (const field of filterFields) {
        const value = checked[field];
        if (typeof value === 'string') filters[field] = value;
      }
      return {
        page: checked.page ?? base.page,
        sort: checked.sort ?? base.sort,
        order: checked.order ?? base.order,
        filters,
      };
    },

    toSearch(state: ListState): ListSearch {
      return {
        ...(state.page > 1 ? { page: state.page } : {}),
        ...(state.sort !== base.sort ? { sort: state.sort } : {}),
        ...(state.order !== base.order ? { order: state.order } : {}),
        ...state.filters,
      };
    },
  };
}
