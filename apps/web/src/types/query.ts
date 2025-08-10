export type SortOrder = 'ASC' | 'DESC';
export type SortTuple<F extends string> = [F, SortOrder];

export type BaseQueryRequired<F extends string> = {
  page: number;
  perPage: number;
  sort: SortTuple<F>;
};