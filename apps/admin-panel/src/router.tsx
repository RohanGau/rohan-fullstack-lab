import type { ComponentType } from 'react';
import {
  createRootRoute,
  createRoute,
  createRouter,
  lazyRouteComponent,
} from '@tanstack/react-router';
import type { RouterHistory } from '@tanstack/react-router';
import { RequirePermission } from './access/permissions';
import { SECTIONS, type Section } from './access/sections';
import { SignInPage } from './auth/SignInPage';
import { blogsListSearch } from './resources/blogs';
import { contactsListSearch } from './resources/contacts';
import type { ListSearch } from './resources/listSearch';
import { operatorsListSearch } from './resources/operators';
import { profilesListSearch } from './resources/profiles';
import { projectsListSearch } from './resources/projects';
import { rolesListSearch } from './resources/roles';
import { slotsListSearch } from './resources/slots';
import { Account } from './routes/Account';
import { Home } from './routes/Home';
import { NotFound } from './routes/NotFound';
import { RootLayout } from './routes/RootLayout';

const rootRoute = createRootRoute({ component: RootLayout, notFoundComponent: NotFound });
const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: Home });
const accountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/account',
  component: Account,
});
const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sign-in',
  validateSearch: (search: Record<string, unknown>): { redirect?: string } =>
    typeof search.redirect === 'string' ? { redirect: search.redirect } : {},
  component: function SignInRoute() {
    const { redirect } = signInRoute.useSearch();
    return <SignInPage redirect={redirect} />;
  },
});

/** Gates navigation by Permission before fetching the lazy screen chunk. */
function protectedLazyRoute<P extends string, K extends string, M extends Record<K, ComponentType>>(
  section: Section & { path: P },
  importer: () => Promise<M>,
  exportName: K,
  validateSearch?: (search: Record<string, unknown>) => ListSearch
) {
  const LazyScreen = lazyRouteComponent(importer, exportName) as ComponentType;
  return createRoute({
    getParentRoute: () => rootRoute,
    path: section.path,
    validateSearch,
    component: function ProtectedSection() {
      return (
        <RequirePermission anyOf={section.anyOf}>
          <LazyScreen />
        </RequirePermission>
      );
    },
  });
}

// Each screen is lazy-loaded so entry JavaScript stays small.
const blogsRoute = protectedLazyRoute(
  SECTIONS.blogs,
  () => import('./resources/BlogsScreen'),
  'BlogsScreen',
  blogsListSearch.validate
);
const projectsRoute = protectedLazyRoute(
  SECTIONS.projects,
  () => import('./resources/ProjectsScreen'),
  'ProjectsScreen',
  projectsListSearch.validate
);
const profilesRoute = protectedLazyRoute(
  SECTIONS.profiles,
  () => import('./resources/ProfilesScreen'),
  'ProfilesScreen',
  profilesListSearch.validate
);
const assetsRoute = protectedLazyRoute(
  SECTIONS.assets,
  () => import('./resources/AssetsScreen'),
  'AssetsScreen'
);
const contactsRoute = protectedLazyRoute(
  SECTIONS.contacts,
  () => import('./resources/ContactsScreen'),
  'ContactsScreen',
  contactsListSearch.validate
);
const slotsRoute = protectedLazyRoute(
  SECTIONS.slots,
  () => import('./resources/SlotsScreen'),
  'SlotsScreen',
  slotsListSearch.validate
);
const operatorsRoute = protectedLazyRoute(
  SECTIONS.operators,
  () => import('./resources/OperatorsScreen'),
  'OperatorsScreen',
  operatorsListSearch.validate
);
const rolesRoute = protectedLazyRoute(
  SECTIONS.roles,
  () => import('./resources/RolesScreen'),
  'RolesScreen',
  rolesListSearch.validate
);

const routeTree = rootRoute.addChildren([
  homeRoute,
  accountRoute,
  signInRoute,
  blogsRoute,
  projectsRoute,
  profilesRoute,
  assetsRoute,
  contactsRoute,
  slotsRoute,
  operatorsRoute,
  rolesRoute,
]);

export function createAppRouter(history?: RouterHistory) {
  return createRouter({ routeTree, basepath: '/admin', history });
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>;
  }
}
