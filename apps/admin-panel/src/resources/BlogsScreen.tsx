import { PERMISSIONS } from '@fullstack-lab/constants';
import { Button } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useCallback, useMemo, useState, lazy, Suspense } from 'react';
import { Can, RequirePermission } from '../access/permissions';
import { SECTIONS } from '../access/sections';
import { blogsConfig, blogsListSearch, type BlogRow } from './blogs';
import type { ListState } from './listState';
import { ResourceList } from './ResourceList';

const BlogFormDialog = lazy(() =>
  import('./BlogFormDialog').then((m) => ({ default: m.BlogFormDialog }))
);

export function BlogsScreen() {
  const search = useSearch({ from: SECTIONS.blogs.path });
  const navigate = useNavigate({ from: SECTIONS.blogs.path });
  const queryClient = useQueryClient();

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<BlogRow | null>(null);

  const state = useMemo(() => blogsListSearch.toState(search), [search]);
  const onStateChange = useCallback(
    (next: ListState) => void navigate({ search: blogsListSearch.toSearch(next) }),
    [navigate]
  );

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: [blogsConfig.endpoint] });
  }, [queryClient]);

  return (
    <RequirePermission anyOf={SECTIONS.blogs.anyOf}>
      <ResourceList
        config={blogsConfig}
        state={state}
        onStateChange={onStateChange}
        onEdit={setEditing}
        headerActions={
          <Can anyOf={PERMISSIONS.BLOG_CREATE}>
            <Button variant="contained" onClick={() => setCreateOpen(true)}>
              New blog post
            </Button>
          </Can>
        }
      />

      {(createOpen || Boolean(editing)) && (
        <Suspense fallback={null}>
          <BlogFormDialog
            open
            blog={editing}
            onClose={() => {
              setCreateOpen(false);
              setEditing(null);
            }}
            onSuccess={invalidate}
          />
        </Suspense>
      )}
    </RequirePermission>
  );
}
