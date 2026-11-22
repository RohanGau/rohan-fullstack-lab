import { useNavigate, useSearch } from '@tanstack/react-router';
import { useCallback, useMemo } from 'react';
import { RequirePermission } from '../access/permissions';
import { SECTIONS } from '../access/sections';
import { contactsConfig, contactsListSearch } from './contacts';
import type { ListState } from './listState';
import { ResourceList } from './ResourceList';

export function ContactsScreen() {
  const search = useSearch({ from: SECTIONS.contacts.path });
  const navigate = useNavigate({ from: SECTIONS.contacts.path });
  const state = useMemo(() => contactsListSearch.toState(search), [search]);
  const onStateChange = useCallback(
    (next: ListState) => void navigate({ search: contactsListSearch.toSearch(next) }),
    [navigate]
  );

  return (
    <RequirePermission anyOf={SECTIONS.contacts.anyOf}>
      <ResourceList config={contactsConfig} state={state} onStateChange={onStateChange} />
    </RequirePermission>
  );
}
