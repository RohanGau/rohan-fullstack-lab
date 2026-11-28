import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useCallback, useMemo, useState, lazy, Suspense } from 'react';
import { RequirePermission } from '../access/permissions';
import { SECTIONS } from '../access/sections';
import type { ListState } from './listState';
import { ResourceList } from './ResourceList';
import { slotsConfig, slotsListSearch, type SlotRow } from './slots';

const SlotFormDialog = lazy(() =>
  import('./SlotFormDialog').then((m) => ({ default: m.SlotFormDialog }))
);

export function SlotsScreen() {
  const search = useSearch({ from: SECTIONS.slots.path });
  const navigate = useNavigate({ from: SECTIONS.slots.path });
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<SlotRow | null>(null);

  const state = useMemo(() => slotsListSearch.toState(search), [search]);
  const onStateChange = useCallback(
    (next: ListState) => void navigate({ search: slotsListSearch.toSearch(next) }),
    [navigate]
  );

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: [slotsConfig.endpoint] });
  }, [queryClient]);

  return (
    <RequirePermission anyOf={SECTIONS.slots.anyOf}>
      <ResourceList
        config={slotsConfig}
        state={state}
        onStateChange={onStateChange}
        onEdit={setEditing}
      />

      {editing && (
        <Suspense fallback={null}>
          <SlotFormDialog slot={editing} onClose={() => setEditing(null)} onSuccess={invalidate} />
        </Suspense>
      )}
    </RequirePermission>
  );
}
