import { API_PATHS } from '@fullstack-lab/constants';
import type { IContactDto, Jsonified } from '@fullstack-lab/types';
import { http, HttpResponse } from 'msw';
import { API_URL, server } from './server';

/** A contact as the API sends it: dates are text. */
export type ContactRow = Jsonified<IContactDto>;

/** `count` messages, newest first, one day apart. */
export function makeContacts(count: number): ContactRow[] {
  return Array.from({ length: count }, (_, i) => {
    const sent = new Date(Date.UTC(2025, 2, 30, 12, 0, 0) - i * 24 * 3600 * 1000).toISOString();
    return {
      id: `contact-${i}`,
      name: `Sender ${String(i).padStart(2, '0')}`,
      email: `sender${i}@example.com`,
      message: `Message number ${i}`,
      createdAt: sent,
      updatedAt: sent,
    };
  });
}

type Seen = { params: URLSearchParams; authorization: string | null };

/**
 * The API's contacts endpoints over HTTP: list with JSON `range`, `sort` and `filter`
 * (exact-match filters on name and email, as the real API allows) and delete.
 */
export function fakeContactsApi(
  initial: ContactRow[],
  auth?: { acceptsAccessToken(token: string): boolean }
) {
  let rows = [...initial];
  const listRequests: Seen[] = [];
  const deleteRequests: { id: string; authorization: string | null }[] = [];
  let omitTotal = false;
  let listFailure: { status: number; remaining: number } | null = null;
  let deleteFailure: { status: number; remaining: number } | null = null;

  const rejectsToken = (request: Request) =>
    auth !== undefined &&
    !auth.acceptsAccessToken(request.headers.get('authorization')?.replace(/^Bearer /, '') ?? '');

  server.use(
    http.get(`${API_URL}${API_PATHS.CONTACT}`, ({ request }) => {
      if (rejectsToken(request))
        return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
      const url = new URL(request.url);
      listRequests.push({
        params: url.searchParams,
        authorization: request.headers.get('authorization'),
      });
      if (listFailure && listFailure.remaining > 0) {
        listFailure.remaining -= 1;
        return HttpResponse.json({ error: 'FETCH_FAILED' }, { status: listFailure.status });
      }
      const [from, to] = JSON.parse(url.searchParams.get('range') ?? '[0,9]') as [number, number];
      const [field, order] = JSON.parse(url.searchParams.get('sort') ?? '["createdAt","DESC"]') as [
        keyof ContactRow,
        'ASC' | 'DESC',
      ];
      const filter = JSON.parse(url.searchParams.get('filter') ?? '{}') as Partial<ContactRow>;

      // Like the real API: only these fields can be filtered or sorted on; the rest is ignored.
      const allowedFilter = ['name', 'email', 'subject', 'message'];
      const allowedSort = ['createdAt', 'updatedAt', 'name', 'email'];
      const sortField = allowedSort.includes(field) ? field : 'createdAt';
      const matching = rows
        .filter((row) =>
          Object.entries(filter).every(
            ([k, v]) => !allowedFilter.includes(k) || row[k as keyof ContactRow] === v
          )
        )
        .sort(
          (a, b) =>
            String(a[sortField as keyof ContactRow]).localeCompare(
              String(b[sortField as keyof ContactRow])
            ) * (order === 'ASC' ? 1 : -1)
        );
      return HttpResponse.json(matching.slice(from, to + 1), {
        headers: omitTotal ? {} : { 'X-Total-Count': String(matching.length) },
      });
    }),
    http.delete(`${API_URL}${API_PATHS.CONTACT}/:id`, ({ request, params }) => {
      if (rejectsToken(request))
        return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
      deleteRequests.push({
        id: String(params.id),
        authorization: request.headers.get('authorization'),
      });
      if (deleteFailure && deleteFailure.remaining > 0) {
        deleteFailure.remaining -= 1;
        return HttpResponse.json({ error: 'DELETE_FAILED' }, { status: deleteFailure.status });
      }
      if (!rows.some((row) => row.id === params.id)) {
        return HttpResponse.json({ error: 'Contact not found' }, { status: 404 });
      }
      rows = rows.filter((row) => row.id !== params.id);
      return new HttpResponse(null, { status: 204 });
    })
  );

  return {
    listRequests,
    deleteRequests,
    /** The most recent list request's parsed parameters. */
    lastList() {
      const last = listRequests[listRequests.length - 1];
      if (!last) throw new Error('No list request was made');
      return {
        range: JSON.parse(last.params.get('range') ?? 'null') as [number, number],
        sort: JSON.parse(last.params.get('sort') ?? 'null') as [string, string],
        filter: JSON.parse(last.params.get('filter') ?? 'null') as Record<string, string>,
        authorization: last.authorization,
      };
    },
    /** Answer lists without X-Total-Count (e.g. a proxy that drops it). */
    omitTotalHeader() {
      omitTotal = true;
    },
    failNextList(status: number, times = 1) {
      listFailure = { status, remaining: times };
    },
    failNextDelete(status: number, times = 1) {
      deleteFailure = { status, remaining: times };
    },
  };
}
