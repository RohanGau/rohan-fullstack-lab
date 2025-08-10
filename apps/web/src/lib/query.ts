import { BaseQueryRequired } from "@/types/query";

export function makeQueryStringFromFilter<F extends string>(
  q: BaseQueryRequired<F>,
  buildFilter: () => Record<string, any> | undefined
) {
  const { page, perPage, sort } = q;
  const params = new URLSearchParams({
    range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
    sort: JSON.stringify(sort),
  });
  const filter = buildFilter();
  if (filter && Object.keys(filter).length) {
    params.set('filter', JSON.stringify(filter));
  }
  return params.toString();
}

export function keyFromQuery<PickShape extends object>(
  ns: 'blogs' | 'projects',
  picked: PickShape
) {
  return `${ns}:${JSON.stringify(picked)}`;
}
