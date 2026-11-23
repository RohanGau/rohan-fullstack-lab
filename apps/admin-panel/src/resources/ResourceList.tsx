import type { Permission } from '@fullstack-lab/constants';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import ViewIcon from '@mui/icons-material/VisibilityOutlined';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import {
  DataGrid,
  GridActionsCellItem,
  type GridColDef,
  type GridSortModel,
  type GridRenderCellParams,
  type GridValidRowModel,
} from '@mui/x-data-grid';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useId, useMemo, useState, type ReactNode } from 'react';
import { useCan } from '../access/permissions';
import { ForbiddenError, describeApiError } from '../auth/authApi';
import { useAuth } from '../auth/AuthProvider';
import { useNotice } from '../shell/notice';
import styles from '../routes/Page.module.scss';
import { ConfirmDialog } from './ConfirmDialog';
import {
  PAGE_SIZE,
  defaultListState,
  pageCount,
  toListParams,
  type ListState,
  type SortSpec,
} from './listState';

declare module '@mui/x-data-grid' {
  interface NoRowsOverlayPropsOverrides {
    message?: string;
  }
}

export interface ResourceColumn<Row extends GridValidRowModel = GridValidRowModel> {
  field: keyof Row & string;
  header: string;
  sortable?: boolean;
  flex?: number;
  minWidth?: number;
  format?: (value: Row[keyof Row & string]) => string;
  renderCell?: (params: GridRenderCellParams<Row>) => ReactNode;
}

/**
 * What a resource declares; ResourceList does the rest (paging, sorting, filtering on the
 * server, states, view and delete with confirmation, Permission gating).
 */
export interface ResourceConfig<Row extends { id: string } & GridValidRowModel> {
  title: string;
  /** "message": used in labels like "Delete message from …" and in empty states. */
  noun: { singular: string; plural: string };
  endpoint: string;
  columns: ResourceColumn<Row>[];
  /** Exact-match filters the API supports. */
  filters: { field: keyof Row & string; label: string }[];
  defaultSort: SortSpec & { field: keyof Row & string };
  /** "message from Ada": names a row for assistive technology and dialogs. */
  describeRow: (row: Row) => string;
  /** Full detail of one row, in a dialog. */
  renderDetail?: (row: Row) => ReactNode;
  /** Holders of this Permission see a delete action. */
  deletePermission?: Permission | readonly Permission[];
  /** Custom row actions rendered into the Actions column. */
  customActions?: (row: Row) => ReactNode[];
  actionsWidth?: number;
}

// The grid measures its own size, which jsdom cannot do, so tests render every row.
const VIRTUALIZE = import.meta.env.MODE !== 'test';

export function ResourceList<Row extends { id: string } & GridValidRowModel>({
  config,
  state,
  onStateChange,
  headerActions,
  customActions,
}: {
  config: ResourceConfig<Row>;
  state: ListState;
  onStateChange: (next: ListState) => void;
  headerActions?: ReactNode;
  customActions?: (row: Row) => ReactNode[];
}) {
  const { authorizedFetch } = useAuth();
  const { showNotice } = useNotice();
  const can = useCan();
  const queryClient = useQueryClient();
  const [viewing, setViewing] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);

  const list = useQuery({
    queryKey: [config.endpoint, state],
    queryFn: async () => {
      const response = await authorizedFetch(`${config.endpoint}?${toListParams(state)}`);
      if (!response.ok) throw new Error(`List failed (${response.status})`);
      const rows = (await response.json()) as Row[];
      // Without a usable total (a proxy dropped the header) say at least what we can see.
      const header = Number(response.headers.get('X-Total-Count'));
      const total =
        Number.isFinite(header) && response.headers.has('X-Total-Count')
          ? header
          : (state.page - 1) * PAGE_SIZE + rows.length;
      return { rows, total };
    },
    placeholderData: keepPreviousData,
  });

  const remove = useMutation({
    mutationFn: async (row: Row) => {
      const response = await authorizedFetch(`${config.endpoint}/${row.id}`, { method: 'DELETE' });
      if (!response.ok && response.status !== 404)
        throw new Error(`Delete failed (${response.status})`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [config.endpoint] }),
    onError: (error) => {
      // A 403 is already explained by the panel-wide notice.
      if (!(error instanceof ForbiddenError)) showNotice(describeApiError(error));
    },
    onSettled: () => setDeleting(null),
  });

  // Deleting the last row of the last page leaves nothing to show: step back a page.
  const total = list.data?.total ?? 0;
  const rows = list.data?.rows;
  useEffect(() => {
    if (!list.isFetching && rows?.length === 0 && state.page > pageCount(total)) {
      onStateChange({ ...state, page: pageCount(total) });
    }
  }, [list.isFetching, rows, total, state, onStateChange]);

  const canDelete = config.deletePermission ? can(config.deletePermission) : false;
  const hasFilters = Object.keys(state.filters).length > 0;
  const effectiveCustomActions = customActions ?? config.customActions;
  const hasActions = Boolean(config.renderDetail || canDelete || effectiveCustomActions);

  const columns = useMemo<GridColDef<Row>[]>(
    () => [
      ...config.columns.map(
        (column): GridColDef<Row> => ({
          field: column.field,
          headerName: column.header,
          sortable: column.sortable ?? false,
          flex: column.flex ?? 1,
          minWidth: column.minWidth ?? 120,
          valueFormatter: column.format ? (value) => column.format?.(value) : undefined,
          renderCell: column.renderCell ? (params) => column.renderCell!(params) : undefined,
        })
      ),
      ...(hasActions
        ? [
            {
              field: 'actions',
              type: 'actions',
              headerName: 'Actions',
              width: config.actionsWidth ?? 110,
              getActions: ({ row }) => [
                ...(effectiveCustomActions ? effectiveCustomActions(row) : []),
                ...(config.renderDetail
                  ? [
                      <GridActionsCellItem
                        key="view"
                        icon={<ViewIcon />}
                        label={`View ${config.describeRow(row)}`}
                        onClick={() => setViewing(row)}
                      />,
                    ]
                  : []),
                ...(canDelete
                  ? [
                      <GridActionsCellItem
                        key="delete"
                        icon={<DeleteIcon />}
                        label={`Delete ${config.describeRow(row)}`}
                        onClick={() => setDeleting(row)}
                      />,
                    ]
                  : []),
              ],
            } as GridColDef<Row>,
          ]
        : []),
    ],
    [config, canDelete, hasActions, effectiveCustomActions]
  );

  // The grid resets to page 1 whenever it is handed a different sort model, so these must be stable.
  const sortModel = useMemo<GridSortModel>(
    () => [{ field: state.sort, sort: state.order }],
    [state.sort, state.order]
  );
  const paginationModel = useMemo(
    () => ({ page: state.page - 1, pageSize: PAGE_SIZE }),
    [state.page]
  );

  function changeSort(model: GridSortModel) {
    const next = model[0];
    // Clearing the sort falls back to the resource's default.
    onStateChange({
      ...state,
      page: 1,
      sort: next?.field ?? config.defaultSort.field,
      order: next?.sort ?? config.defaultSort.order,
    });
  }

  return (
    <section className={styles.wide}>
      <div className={styles.headerRow}>
        <Typography variant="h4" component="h1">
          {config.title}
        </Typography>
        {headerActions}
      </div>
      <FilterForm config={config} state={state} onApply={onStateChange} />

      {list.isError && !list.data ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void list.refetch()}>
              Try again
            </Button>
          }
        >
          Could not load {config.noun.plural}.
        </Alert>
      ) : (
        <DataGrid
          aria-label={config.title}
          rows={rows ?? []}
          columns={columns}
          rowCount={total}
          loading={list.isFetching}
          paginationMode="server"
          sortingMode="server"
          disableColumnFilter
          disableColumnMenu
          disableRowSelectionOnClick
          disableVirtualization={!VIRTUALIZE}
          autoHeight
          pageSizeOptions={[PAGE_SIZE]}
          paginationModel={paginationModel}
          onPaginationModelChange={(model) => {
            if (model.page + 1 !== state.page) onStateChange({ ...state, page: model.page + 1 });
          }}
          sortModel={sortModel}
          onSortModelChange={changeSort}
          slots={{ noRowsOverlay: NoRows }}
          slotProps={{
            noRowsOverlay: {
              message: hasFilters
                ? `No ${config.noun.plural} match these filters.`
                : `No ${config.noun.plural} yet.`,
            },
          }}
        />
      )}

      {viewing && config.renderDetail && (
        <DetailDialog
          title={`${capitalise(config.describeRow(viewing))}`}
          onClose={() => setViewing(null)}
        >
          {config.renderDetail(viewing)}
        </DetailDialog>
      )}
      {deleting && (
        <ConfirmDialog
          title={`Delete this ${config.noun.singular}?`}
          confirmLabel="Delete"
          busy={remove.isPending}
          onCancel={() => setDeleting(null)}
          onConfirm={() => remove.mutate(deleting)}
        >
          This permanently deletes the {config.describeRow(deleting)}. It cannot be undone.
        </ConfirmDialog>
      )}
    </section>
  );
}

function FilterForm<Row extends { id: string }>({
  config,
  state,
  onApply,
}: {
  config: ResourceConfig<Row>;
  state: ListState;
  onApply: (next: ListState) => void;
}) {
  const [draft, setDraft] = useState<Record<string, string>>(state.filters);
  // The address can change under us (back button, shared link): follow it, but only when the
  // filters really differ, so typing is never overwritten by an unrelated re-render.
  const applied = JSON.stringify(state.filters);
  useEffect(() => setDraft(JSON.parse(applied) as Record<string, string>), [applied]);

  return (
    <form
      className={styles.filters}
      onSubmit={(event) => {
        event.preventDefault();
        const filters = Object.fromEntries(
          Object.entries(draft)
            .map(([field, value]) => [field, value.trim()] as const)
            .filter(([, value]) => value !== '')
        );
        onApply({ ...state, page: 1, filters });
      }}
    >
      {config.filters.map((filter) => (
        <TextField
          key={filter.field}
          size="small"
          label={`${filter.label} (exact match)`}
          value={draft[filter.field] ?? ''}
          onChange={(event) => setDraft({ ...draft, [filter.field]: event.target.value })}
        />
      ))}
      <Button type="submit" variant="outlined">
        Apply filters
      </Button>
      <Button
        type="button"
        onClick={() => {
          setDraft({});
          onApply({
            ...defaultListState(config.defaultSort),
            sort: state.sort,
            order: state.order,
          });
        }}
      >
        Clear filters
      </Button>
    </form>
  );
}

function DetailDialog({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const titleId = useId();
  return (
    <Dialog open onClose={onClose} aria-labelledby={titleId} fullWidth maxWidth="sm">
      <DialogTitle id={titleId}>{title}</DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

function NoRows({ message }: { message?: string }) {
  return <div className={styles.empty}>{message}</div>;
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
